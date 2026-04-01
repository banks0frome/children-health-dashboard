import { Hono } from "hono";
import type { Bindings } from "../index";
import { sendApprovalEmail, sendDenialEmail } from "../services/email";

const app = new Hono<{ Bindings: Bindings }>();

// List all submissions with optional filters
app.get("/", async (c) => {
  const status = c.req.query("status");
  const type = c.req.query("type");
  const search = c.req.query("search");

  let query = `
    SELECT s.*,
      ed.event_name, ed.event_date, ed.start_time, ed.end_time, ed.estimated_attendance,
      ed.audience_type, ed.topics,
      l.city, l.county, l.state,
      (SELECT COUNT(*) FROM materials_requested WHERE submission_id = s.id) as material_count
    FROM submissions s
    LEFT JOIN event_details ed ON ed.submission_id = s.id
    LEFT JOIN location l ON l.submission_id = s.id
  `;

  const conditions: string[] = [];
  const params: string[] = [];

  if (status) {
    conditions.push("s.status = ?");
    params.push(status);
  }
  if (type) {
    conditions.push("s.request_type = ?");
    params.push(type);
  }
  if (search) {
    conditions.push(
      "(s.first_name LIKE ? OR s.last_name LIKE ? OR s.organization LIKE ? OR ed.event_name LIKE ?)"
    );
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY s.created_at DESC";

  const stmt = c.env.DB.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

  const submissions = result.results.map((row: Record<string, unknown>) => {
    const {
      event_name, event_date, start_time, end_time, estimated_attendance,
      audience_type, topics,
      city, county, state,
      material_count,
      ...rest
    } = row;

    return {
      ...rest,
      ai_classification: rest.ai_classification
        ? JSON.parse(rest.ai_classification as string)
        : null,
      ai_approved: Boolean(rest.ai_approved),
      event_details: event_name != null
        ? {
            event_name,
            event_date,
            start_time,
            end_time,
            estimated_attendance,
            audience_type: audience_type ? JSON.parse(audience_type as string) : [],
            topics: topics ? JSON.parse(topics as string) : [],
          }
        : null,
      location: city != null || county != null || state != null
        ? { city, county, state }
        : null,
      material_count: Number(material_count ?? 0),
    };
  });

  return c.json({ submissions });
});

// Get single submission with all related data
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [sub, events, locs, mats, ships, virts, logs] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first(),
    c.env.DB.prepare("SELECT * FROM event_details WHERE submission_id = ?").bind(id).first(),
    c.env.DB.prepare("SELECT * FROM location WHERE submission_id = ?").bind(id).first(),
    c.env.DB.prepare("SELECT * FROM materials_requested WHERE submission_id = ?").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM shipping WHERE submission_id = ?").bind(id).first(),
    c.env.DB.prepare("SELECT * FROM virtual_details WHERE submission_id = ?").bind(id).first(),
    c.env.DB.prepare("SELECT * FROM activity_log WHERE submission_id = ? ORDER BY created_at ASC")
      .bind(id)
      .all(),
  ]);

  if (!sub) {
    return c.json({ error: "Submission not found" }, 404);
  }

  const submission = {
    ...sub,
    ai_classification: sub.ai_classification
      ? JSON.parse(sub.ai_classification as string)
      : null,
    ai_approved: Boolean(sub.ai_approved),
    event_details: events
      ? {
          ...events,
          audience_type: events.audience_type
            ? JSON.parse(events.audience_type as string)
            : [],
          topics: events.topics ? JSON.parse(events.topics as string) : [],
          is_virtual: Boolean(events.is_virtual),
          requester_attending: Boolean(events.requester_attending),
        }
      : null,
    location: locs ?? null,
    materials: mats.results.map((m: Record<string, unknown>) => ({
      ...m,
      has_digital: Boolean(m.has_digital),
    })),
    shipping: ships ?? null,
    virtual_details: virts ?? null,
    activity_log: logs.results.map((l: Record<string, unknown>) => ({
      ...l,
      details: l.details ? JSON.parse(l.details as string) : null,
    })),
  };

  return c.json({ submission });
});

// Update submission fields
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const allowedFields = [
    "status",
    "first_name",
    "last_name",
    "organization",
    "email",
    "phone",
    "notes",
    "request_type",
  ];

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of allowedFields) {
    if (field in body) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  if (updates.length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE submissions SET ${updates.join(", ")} WHERE id = ?`
  )
    .bind(...values)
    .run();

  const submission = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first();

  return c.json({ submission });
});

// Approve submission
app.post("/:id/approve", async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare(
    `UPDATE submissions SET status = 'approved', approved_by = 'Admin User', approved_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  )
    .bind(id)
    .run();

  // Log the approval
  const logId = `log-${Date.now()}`;
  await c.env.DB.prepare(
    `INSERT INTO activity_log (id, submission_id, action, actor, details, created_at) VALUES (?, ?, 'approved', 'Admin User', '{}', datetime('now'))`
  )
    .bind(logId, id)
    .run();

  const submission = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first();

  // Fetch digital materials for the submission and send approval email
  try {
    const mats = await c.env.DB.prepare(
      "SELECT material_name FROM materials_requested WHERE submission_id = ? AND has_digital = 1"
    )
      .bind(id)
      .all();
    const digitalMaterials = mats.results.map(
      (m: Record<string, unknown>) => String(m.material_name ?? "")
    );
    await sendApprovalEmail(c.env, submission as Record<string, unknown>, digitalMaterials);
  } catch (_err) {
    // Email failure must not block the response
  }

  return c.json({ submission });
});

// Deny submission
app.post("/:id/deny", async (c) => {
  const id = c.req.param("id");
  const { reason } = await c.req.json();

  if (!reason) {
    return c.json({ error: "Denial reason is required" }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE submissions SET status = 'denied', denial_reason = ?, updated_at = datetime('now') WHERE id = ?`
  )
    .bind(reason, id)
    .run();

  const logId = `log-${Date.now()}`;
  await c.env.DB.prepare(
    `INSERT INTO activity_log (id, submission_id, action, actor, details, created_at) VALUES (?, ?, 'denied', 'Admin User', ?, datetime('now'))`
  )
    .bind(logId, id, JSON.stringify({ reason }))
    .run();

  const submission = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first();

  // Send denial email; do not block response on failure
  try {
    await sendDenialEmail(c.env, submission as Record<string, unknown>, reason);
  } catch (_err) {
    // Email failure must not block the response
  }

  return c.json({ submission });
});

// Mark submission as reviewed (auto-move from submitted → in_review)
app.post("/:id/mark-reviewed", async (c) => {
  const id = c.req.param("id");

  const sub = await c.env.DB.prepare("SELECT status FROM submissions WHERE id = ?")
    .bind(id)
    .first<{ status: string }>();

  if (!sub) {
    return c.json({ error: "Submission not found" }, 404);
  }

  if (sub.status !== "submitted") {
    return c.json({ error: `Cannot mark as reviewed: current status is '${sub.status}'` }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE submissions SET status = 'in_review', updated_at = datetime('now') WHERE id = ?`
  )
    .bind(id)
    .run();

  const logId = `log-${Date.now()}`;
  await c.env.DB.prepare(
    `INSERT INTO activity_log (id, submission_id, action, actor, details, created_at) VALUES (?, ?, 'marked_reviewed', 'Admin User', '{}', datetime('now'))`
  )
    .bind(logId, id)
    .run();

  const submission = await c.env.DB.prepare("SELECT * FROM submissions WHERE id = ?")
    .bind(id)
    .first();

  return c.json({ submission });
});

export default app;
