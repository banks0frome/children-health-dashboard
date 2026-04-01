import { Hono } from "hono";
import type { Bindings } from "../index";

const app = new Hono<{ Bindings: Bindings }>();

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };
  return data.content[0]?.text ?? "";
}

function parseJsonResponse(text: string): unknown {
  // Strip markdown code fences if present
  const stripped = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(stripped);
}

// Classify a submission
app.post("/classify", async (c) => {
  const { submission_id } = await c.req.json();

  const sub = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(submission_id)
    .first();
  if (!sub) return c.json({ error: "Not found" }, 404);

  const materials = await c.env.DB.prepare(
    "SELECT * FROM materials_requested WHERE submission_id = ?"
  )
    .bind(submission_id)
    .all();

  const event = await c.env.DB.prepare(
    "SELECT * FROM event_details WHERE submission_id = ?"
  )
    .bind(submission_id)
    .first();

  const location = await c.env.DB.prepare(
    "SELECT * FROM location WHERE submission_id = ?"
  )
    .bind(submission_id)
    .first();

  const systemPrompt = `You are a Children's Health Community Request classifier. Analyze incoming community health education requests and return a JSON classification.

Utah service area counties: Salt Lake, Davis, Utah, Weber, Wasatch, Summit, Tooele, Box Elder.

Return ONLY valid JSON with these fields:
- type_confidence (0-1): confidence in request type detection
- priority_score (1-10): urgency/importance
- risk_flags (string[]): any concerns
- fulfillment_recommendation ("mail" | "staff" | "both")
- approval_recommendation ("auto_approve" | "manual_review")
- confidence_pct (0-100): overall confidence
- reasoning (string): 1-2 sentence explanation`;

  const userMessage = `Classify this request:
Type: ${sub.request_type}
Requester: ${sub.first_name} ${sub.last_name}, ${sub.organization || "No org"}
Materials: ${materials.results.map((m: Record<string, unknown>) => `${m.material_name} (qty: ${m.quantity})`).join(", ")}
Event: ${event ? `${event.event_name} on ${event.event_date}, attendance: ${event.estimated_attendance}` : "No event"}
Location: ${location ? `${location.city}, ${location.county} County` : "No location"}`;

  try {
    const response = await callClaude(c.env.CLAUDE_API_KEY, systemPrompt, userMessage);
    const classification = parseJsonResponse(response);

    await c.env.DB.prepare(
      "UPDATE submissions SET ai_classification = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(JSON.stringify(classification), submission_id)
      .run();

    return c.json({ classification });
  } catch (e) {
    return c.json({ error: `Classification failed: ${e}` }, 500);
  }
});

// Get AI insights for a submission
app.post("/insights/:id", async (c) => {
  const id = c.req.param("id");

  const sub = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first();
  if (!sub) return c.json({ error: "Not found" }, 404);

  const event = await c.env.DB.prepare(
    "SELECT * FROM event_details WHERE submission_id = ?"
  )
    .bind(id)
    .first();

  const materials = await c.env.DB.prepare(
    "SELECT * FROM materials_requested WHERE submission_id = ?"
  )
    .bind(id)
    .all();

  // Get similar past requests
  const similar = await c.env.DB.prepare(
    `SELECT s.*, ed.event_name, ed.event_date
     FROM submissions s
     LEFT JOIN event_details ed ON ed.submission_id = s.id
     WHERE s.id != ? AND s.request_type = ?
     AND s.status IN ('approved', 'fulfilled', 'denied')
     ORDER BY s.created_at DESC LIMIT 5`
  )
    .bind(id, sub.request_type)
    .all();

  const systemPrompt = `You are a Children's Health admin assistant providing decision support. Analyze this community health request and provide insights.

Return ONLY valid JSON with:
- approval_recommendation: "approve" | "review" | "deny"
- confidence: number 0-100
- reasoning: string (2-3 sentences)
- risk_flags: {flag: string, severity: "low" | "medium" | "high", explanation: string}[]
- similar_requests: {name: string, outcome: string, relevance: string}[]
- suggested_actions: string[]`;

  const userMessage = `Analyze this request:
${JSON.stringify({ submission: sub, event, materials: materials.results }, null, 2)}

Similar past requests:
${JSON.stringify(similar.results, null, 2)}`;

  try {
    const response = await callClaude(c.env.CLAUDE_API_KEY, systemPrompt, userMessage);
    return c.json(parseJsonResponse(response));
  } catch (e) {
    return c.json({ error: `Insights failed: ${e}` }, 500);
  }
});

// Staff recommendation
app.post("/staff/:id", async (c) => {
  const id = c.req.param("id");

  const sub = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first();
  if (!sub) return c.json({ error: "Not found" }, 404);

  const event = await c.env.DB.prepare(
    "SELECT * FROM event_details WHERE submission_id = ?"
  )
    .bind(id)
    .first();

  const location = await c.env.DB.prepare(
    "SELECT * FROM location WHERE submission_id = ?"
  )
    .bind(id)
    .first();

  const staff = await c.env.DB.prepare("SELECT * FROM staff_members").all();

  const systemPrompt = `You are a staff assignment advisor for Children's Health community outreach.

Given an event request and available staff, rank the top 3 best-fit staff members.

Return ONLY valid JSON with:
- recommendations: {staff_id: string, staff_name: string, score: number, reasons: string[]}[]
- notes: string (any scheduling concerns)`;

  const userMessage = `Event request:
${JSON.stringify({ submission: sub, event, location }, null, 2)}

Available staff:
${JSON.stringify(staff.results, null, 2)}`;

  try {
    const response = await callClaude(c.env.CLAUDE_API_KEY, systemPrompt, userMessage);
    return c.json(parseJsonResponse(response));
  } catch (e) {
    return c.json({ error: `Staff recommendation failed: ${e}` }, 500);
  }
});

// RAG Chatbot
app.post("/chat", async (c) => {
  const { message } = await c.req.json();

  // Gather context from DB
  const [submissions, recentEvents, materialStats, statusCounts] = await Promise.all([
    c.env.DB.prepare(
      `SELECT s.*, ed.event_name, ed.event_date, l.city, l.county
       FROM submissions s
       LEFT JOIN event_details ed ON ed.submission_id = s.id
       LEFT JOIN location l ON l.submission_id = s.id
       ORDER BY s.created_at DESC LIMIT 20`
    ).all(),

    c.env.DB.prepare(
      `SELECT ed.event_name, ed.event_date, s.status, l.city, l.county
       FROM event_details ed
       JOIN submissions s ON s.id = ed.submission_id
       LEFT JOIN location l ON l.submission_id = s.id
       WHERE ed.event_date >= date('now')
       ORDER BY ed.event_date LIMIT 10`
    ).all(),

    c.env.DB.prepare(
      `SELECT material_name, SUM(quantity) as total, COUNT(*) as requests
       FROM materials_requested GROUP BY material_key ORDER BY total DESC`
    ).all(),

    c.env.DB.prepare(
      `SELECT status, COUNT(*) as count FROM submissions GROUP BY status`
    ).all(),
  ]);

  const systemPrompt = `You are a helpful assistant for Children's Health Community Request admin dashboard. Answer questions about requests, events, materials, and operations using the provided data.

Be concise and direct. Format numbers and dates clearly. If asked about data you don't have, say so.

Current date: ${new Date().toISOString().split("T")[0]}`;

  const context = `DATABASE CONTEXT:

Status counts: ${JSON.stringify(statusCounts.results)}

Recent submissions (last 20):
${JSON.stringify(submissions.results, null, 2)}

Upcoming events:
${JSON.stringify(recentEvents.results, null, 2)}

Material demand:
${JSON.stringify(materialStats.results, null, 2)}`;

  const userMessage = `${context}\n\nUser question: ${message}`;

  try {
    const response = await callClaude(c.env.CLAUDE_API_KEY, systemPrompt, userMessage);
    return c.json({ response });
  } catch (e) {
    return c.json({ error: `Chat failed: ${e}` }, 500);
  }
});

export default app;
