import { Hono } from "hono";
import type { Bindings } from "../index";

const app = new Hono<{ Bindings: Bindings }>();

// ── Shared helpers ──────────────────────────────────────────────────────────

const MATERIAL_CATALOG = [
  "car_seat_cards",
  "spot_tot_cards",
  "spot_tot_clings",
  "atv_cards",
  "window_falls_cards",
  "window_falls_clings",
  "firearm_cards",
  "helmet_cards",
  "water_safety_cards",
  "water_watcher_card",
  "pedestrian_cards",
  "ew_cards",
  "ew_magnets",
  "ew_workbooks",
  "vaping_cards",
] as const;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens = 2048
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
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
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
  const stripped = text
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  return JSON.parse(stripped);
}

// ── POST /submit — Full submission insert ───────────────────────────────────

interface MaterialItem {
  material_key: string;
  material_name: string;
  quantity: number;
  category?: string;
}

interface FormSubmission {
  submission_method: "upload" | "paste" | "form" | "chat";
  request_type: "mailing" | "event" | "both";
  language: "en" | "es";
  raw_input?: string;

  first_name: string;
  last_name: string;
  organization?: string;
  email: string;
  phone?: string;
  notes?: string;

  event?: {
    event_name?: string;
    event_date?: string;
    start_time?: string;
    end_time?: string;
    estimated_attendance?: number;
    audience_type?: string[];
    topics?: string[];
    is_virtual?: boolean;
    requester_attending?: boolean;
    wants_presentation?: boolean;
    wants_materials_at_event?: boolean;
  };

  location?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
    indoor_outdoor?: "indoor" | "outdoor" | "both";
    parking_instructions?: string;
  };

  virtual_details?: {
    meeting_link?: string;
    platform?: "zoom" | "teams" | "other";
  };

  materials?: MaterialItem[];

  shipping?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
  };
}

app.post("/submit", async (c) => {
  let body: FormSubmission;
  try {
    body = await c.req.json<FormSubmission>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  // Validate required fields
  if (!body.first_name || !body.last_name || !body.email) {
    return c.json(
      { error: "Missing required fields: first_name, last_name, email" },
      400
    );
  }

  const submissionId = crypto.randomUUID();
  const db = c.env.DB;

  try {
    // Build a batch of statements for atomic insert
    const stmts: D1PreparedStatement[] = [];

    // 1. submissions
    stmts.push(
      db
        .prepare(
          `INSERT INTO submissions
           (id, submission_method, request_type, first_name, last_name, organization, email, phone, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        )
        .bind(
          submissionId,
          body.submission_method || "form",
          body.request_type || "event",
          body.first_name,
          body.last_name,
          body.organization ?? null,
          body.email,
          body.phone ?? null,
          body.notes ?? null
        )
    );

    // 2. event_details
    if (body.event && (body.request_type === "event" || body.request_type === "both")) {
      const e = body.event;
      stmts.push(
        db
          .prepare(
            `INSERT INTO event_details
             (id, submission_id, event_name, event_date, start_time, end_time, estimated_attendance, audience_type, topics, is_virtual, requester_attending, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(
            crypto.randomUUID(),
            submissionId,
            e.event_name ?? null,
            e.event_date ?? null,
            e.start_time ?? null,
            e.end_time ?? null,
            e.estimated_attendance ?? null,
            e.audience_type ? JSON.stringify(e.audience_type) : null,
            e.topics ? JSON.stringify(e.topics) : null,
            e.is_virtual ? 1 : 0,
            e.requester_attending !== false ? 1 : 0
          )
      );
    }

    // 3. location (in-person events)
    if (body.location) {
      const loc = body.location;
      stmts.push(
        db
          .prepare(
            `INSERT INTO location
             (id, submission_id, address_line1, address_line2, city, state, zip, county, indoor_outdoor, parking_instructions, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(
            crypto.randomUUID(),
            submissionId,
            loc.address_line1 ?? null,
            loc.address_line2 ?? null,
            loc.city ?? null,
            loc.state ?? "UT",
            loc.zip ?? null,
            loc.county ?? null,
            loc.indoor_outdoor ?? null,
            loc.parking_instructions ?? null
          )
      );
    }

    // 4. virtual_details
    if (body.virtual_details) {
      const v = body.virtual_details;
      stmts.push(
        db
          .prepare(
            `INSERT INTO virtual_details
             (id, submission_id, meeting_link, platform, created_at)
             VALUES (?, ?, ?, ?, datetime('now'))`
          )
          .bind(
            crypto.randomUUID(),
            submissionId,
            v.meeting_link ?? null,
            v.platform ?? null
          )
      );
    }

    // 5. materials_requested
    if (body.materials && body.materials.length > 0) {
      for (const mat of body.materials) {
        stmts.push(
          db
            .prepare(
              `INSERT INTO materials_requested
               (id, submission_id, material_key, material_name, quantity, category, created_at)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
            )
            .bind(
              crypto.randomUUID(),
              submissionId,
              mat.material_key,
              mat.material_name,
              mat.quantity || 1,
              mat.category ?? null
            )
        );
      }
    }

    // 6. shipping
    if (body.shipping && (body.request_type === "mailing" || body.request_type === "both")) {
      const s = body.shipping;
      stmts.push(
        db
          .prepare(
            `INSERT INTO shipping
             (id, submission_id, address_line1, address_line2, city, state, zip, county, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(
            crypto.randomUUID(),
            submissionId,
            s.address_line1 ?? null,
            s.address_line2 ?? null,
            s.city ?? null,
            s.state ?? "UT",
            s.zip ?? null,
            s.county ?? null
          )
      );
    }

    // 7. activity_log — "submitted"
    stmts.push(
      db
        .prepare(
          `INSERT INTO activity_log
           (id, submission_id, action, actor, details, created_at)
           VALUES (?, ?, 'submitted', 'public_form', ?, datetime('now'))`
        )
        .bind(
          crypto.randomUUID(),
          submissionId,
          JSON.stringify({
            method: body.submission_method || "form",
            language: body.language || "en",
          })
        )
    );

    // Execute all inserts atomically
    await db.batch(stmts);

    return c.json({ success: true, submission_id: submissionId }, 201);
  } catch (err) {
    console.error("Form submission error:", err);
    return c.json(
      { error: "Failed to save submission", details: String(err) },
      500
    );
  }
});

// ── POST /extract — AI extraction from free text ────────────────────────────

app.post("/extract", async (c) => {
  let body: { text: string };
  try {
    body = await c.req.json<{ text: string }>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.text || body.text.trim().length === 0) {
    return c.json({ error: "Text field is required" }, 400);
  }

  const systemPrompt = `You are a data extraction assistant for Children's Health Community Request Forms. Extract structured information from free-text community health education requests.

Extract the following fields when present. Return ONLY valid JSON (no markdown, no explanation).

Schema:
{
  "request_type": "mailing" | "event" | "both",
  "first_name": string | null,
  "last_name": string | null,
  "organization": string | null,
  "email": string | null,
  "phone": string | null,
  "notes": string | null,
  "event": {
    "event_name": string | null,
    "event_date": string | null,  // ISO date YYYY-MM-DD
    "start_time": string | null,  // HH:MM format
    "end_time": string | null,
    "estimated_attendance": number | null,
    "audience_type": string[] | null,  // e.g. ["parents", "teens", "educators"]
    "topics": string[] | null,
    "is_virtual": boolean,
    "requester_attending": boolean
  } | null,
  "location": {
    "address_line1": string | null,
    "address_line2": string | null,
    "city": string | null,
    "state": string | null,
    "zip": string | null,
    "county": string | null,
    "indoor_outdoor": "indoor" | "outdoor" | "both" | null,
    "parking_instructions": string | null
  } | null,
  "virtual_details": {
    "meeting_link": string | null,
    "platform": "zoom" | "teams" | "other" | null
  } | null,
  "materials": [
    {
      "material_key": string,
      "material_name": string,
      "quantity": number
    }
  ] | null,
  "shipping": {
    "address_line1": string | null,
    "address_line2": string | null,
    "city": string | null,
    "state": string | null,
    "zip": string | null,
    "county": string | null
  } | null,
  "confidence": number  // 0-100, your confidence in the extraction
}

Material catalog keys for mapping natural language to keys:
- car_seat_cards: Car seat safety cards
- spot_tot_cards: Spot the Tot cards (driveway/parking lot safety)
- spot_tot_clings: Spot the Tot window clings
- atv_cards: ATV safety cards
- window_falls_cards: Window falls prevention cards
- window_falls_clings: Window falls prevention clings
- firearm_cards: Firearm safety cards
- helmet_cards: Helmet safety cards
- water_safety_cards: Water safety cards
- water_watcher_card: Water Watcher tag cards
- pedestrian_cards: Pedestrian safety cards
- ew_cards: Every Week Counts cards (safe sleep)
- ew_magnets: Every Week Counts magnets
- ew_workbooks: Every Week Counts workbooks
- vaping_cards: Vaping prevention cards

Map any mentioned materials to the closest catalog key. If quantity is not mentioned, default to 1. Set null for any fields you cannot determine.`;

  try {
    const response = await callClaude(
      c.env.CLAUDE_API_KEY,
      systemPrompt,
      [{ role: "user", content: body.text }],
      2048
    );
    const extracted = parseJsonResponse(response);
    return c.json({ extracted });
  } catch (err) {
    console.error("Extraction error:", err);
    return c.json(
      { error: "AI extraction failed", details: String(err) },
      500
    );
  }
});

// ── POST /chat — Conversational intake ──────────────────────────────────────

app.post("/chat", async (c) => {
  let body: { message: string; history?: ChatMessage[] };
  try {
    body = await c.req.json<{ message: string; history?: ChatMessage[] }>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.message || body.message.trim().length === 0) {
    return c.json({ error: "Message field is required" }, 400);
  }

  const systemPrompt = `You are a friendly Community Health assistant for Primary Children's Hospital. You help community members request health education materials and event support through a conversational intake process.

Your goal is to collect all needed information to complete a community health request form. Track which fields have been collected and ask for missing required fields one at a time.

Required fields:
- request_type: Are they requesting materials to be mailed, event support, or both?
- first_name and last_name
- email address
- If event: event_name, event_date, estimated_attendance
- If mailing or both: at least one material item and a shipping address

Optional but helpful:
- organization, phone
- event details: start_time, end_time, audience_type, topics, is_virtual, location
- specific materials and quantities

Material catalog (map natural language mentions to these keys):
- car_seat_cards: Car seat safety
- spot_tot_cards / spot_tot_clings: Spot the Tot (driveway safety)
- atv_cards: ATV safety
- window_falls_cards / window_falls_clings: Window falls prevention
- firearm_cards: Firearm safety
- helmet_cards: Helmet safety
- water_safety_cards: Water safety
- water_watcher_card: Water Watcher tags
- pedestrian_cards: Pedestrian safety
- ew_cards / ew_magnets / ew_workbooks: Every Week Counts (safe sleep)
- vaping_cards: Vaping prevention

Rules:
- Be warm, concise, and professional
- Ask one or two questions at a time, not a huge list
- When the user mentions materials, map them to catalog keys
- When all required fields are collected, set ready_to_review: true and summarize

You MUST always respond with valid JSON only (no markdown fences, no extra text):
{
  "message": "Your conversational response to the user",
  "extracted_data": {
    "request_type": string | null,
    "first_name": string | null,
    "last_name": string | null,
    "email": string | null,
    "phone": string | null,
    "organization": string | null,
    "event": { ... } | null,
    "location": { ... } | null,
    "materials": [ { "material_key": string, "material_name": string, "quantity": number } ] | null,
    "shipping": { ... } | null,
    "notes": string | null
  },
  "ready_to_review": boolean
}`;

  // Build message history for multi-turn
  const messages: ChatMessage[] = [];

  if (body.history && body.history.length > 0) {
    for (const msg of body.history) {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      });
    }
  }

  messages.push({ role: "user", content: body.message });

  try {
    const response = await callClaude(
      c.env.CLAUDE_API_KEY,
      systemPrompt,
      messages,
      2048
    );
    const parsed = parseJsonResponse(response) as {
      message: string;
      extracted_data: Record<string, unknown>;
      ready_to_review: boolean;
    };

    return c.json({
      message: parsed.message,
      extracted_data: parsed.extracted_data,
      ready_to_review: parsed.ready_to_review ?? false,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return c.json(
      { error: "Chat processing failed", details: String(err) },
      500
    );
  }
});

export default app;
