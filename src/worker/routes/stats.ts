import { Hono } from "hono";
import type { Bindings } from "../index";

const app = new Hono<{ Bindings: Bindings }>();

// Overview stats for home page
app.get("/overview", async (c) => {
  const [pending, eventsWeek, autoApproved, avgResponse] = await Promise.all([
    c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM submissions WHERE status IN ('submitted', 'in_review')"
    ).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM submissions s
       JOIN event_details ed ON ed.submission_id = s.id
       WHERE s.status = 'approved'
       AND ed.event_date >= date('now')
       AND ed.event_date <= date('now', '+7 days')`
    ).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM submissions
       WHERE ai_approved = 1
       AND approved_at >= date('now', 'start of day')`
    ).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT AVG(
        (julianday(COALESCE(approved_at, updated_at)) - julianday(created_at)) * 24
      ) as avg_hours
      FROM submissions
      WHERE status IN ('approved', 'denied')`
    ).first<{ avg_hours: number }>(),
  ]);

  return c.json({
    pending_review: pending?.count ?? 0,
    events_this_week: eventsWeek?.count ?? 0,
    auto_approved_today: autoApproved?.count ?? 0,
    avg_response_hours: Math.round((avgResponse?.avg_hours ?? 0) * 10) / 10,
  });
});

// Analytics data
app.get("/analytics", async (c) => {
  const range = parseInt(c.req.query("range") ?? "30");

  const rangeParam = `-${range} days`;

  const [volumeByDay, typeBreakdown, byCounty, topMaterials, topTopics, approvalRate, avgFulfillment, mostRequested] = await Promise.all([
    // Request volume over time (parameterized)
    c.env.DB.prepare(
      `SELECT date(created_at) as day, request_type, COUNT(*) as count
       FROM submissions
       WHERE created_at >= date('now', ?)
       GROUP BY day, request_type
       ORDER BY day`
    ).bind(rangeParam).all(),

    // Type breakdown
    c.env.DB.prepare(
      `SELECT request_type, COUNT(*) as count
       FROM submissions
       GROUP BY request_type`
    ).all(),

    // Geographic distribution
    c.env.DB.prepare(
      `SELECT l.county, COUNT(*) as count
       FROM location l
       JOIN submissions s ON s.id = l.submission_id
       GROUP BY l.county
       ORDER BY count DESC`
    ).all(),

    // Top materials
    c.env.DB.prepare(
      `SELECT material_name, SUM(quantity) as total_quantity, COUNT(*) as request_count
       FROM materials_requested
       GROUP BY material_key
       ORDER BY total_quantity DESC
       LIMIT 10`
    ).all(),

    // Topic popularity
    c.env.DB.prepare(
      `SELECT ed.topics
       FROM event_details ed
       JOIN submissions s ON s.id = ed.submission_id`
    ).all(),

    // Approval rate filtered by range
    c.env.DB.prepare(
      `SELECT
        COUNT(CASE WHEN status = 'approved' OR status = 'fulfilled' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as rate
       FROM submissions
       WHERE status IN ('approved', 'denied', 'fulfilled')
       AND created_at >= date('now', ?)`
    ).bind(rangeParam).first<{ rate: number }>(),

    // Average fulfillment time in hours filtered by range
    c.env.DB.prepare(
      `SELECT AVG(
        (julianday(COALESCE(approved_at, updated_at)) - julianday(created_at)) * 24
       ) as avg_hours
       FROM submissions
       WHERE status IN ('approved', 'denied', 'fulfilled')
       AND created_at >= date('now', ?)`
    ).bind(rangeParam).first<{ avg_hours: number }>(),

    // Most requested material filtered by range
    c.env.DB.prepare(
      `SELECT mr.material_name, SUM(mr.quantity) as total_quantity
       FROM materials_requested mr
       JOIN submissions s ON s.id = mr.submission_id
       WHERE s.created_at >= date('now', ?)
       GROUP BY mr.material_key
       ORDER BY total_quantity DESC
       LIMIT 1`
    ).bind(rangeParam).first<{ material_name: string; total_quantity: number }>(),
  ]);

  // Process topic counts
  const topicCounts: Record<string, number> = {};
  for (const row of topTopics.results) {
    if (row.topics) {
      const topics = JSON.parse(row.topics as string) as string[];
      for (const topic of topics) {
        topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
      }
    }
  }

  const topicsSorted = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  // Summary stats
  const totalRequests = typeBreakdown.results.reduce(
    (sum, r) => sum + (r.count as number),
    0
  );

  return c.json({
    summary: {
      total_requests: totalRequests,
      approval_rate: Math.round(approvalRate?.rate ?? 0),
      avg_fulfillment_time: Math.round((avgFulfillment?.avg_hours ?? 0) * 10) / 10,
      most_requested_material: mostRequested
        ? { name: mostRequested.material_name, quantity: mostRequested.total_quantity }
        : null,
    },
    volume_by_day: volumeByDay.results,
    type_breakdown: typeBreakdown.results,
    geographic: byCounty.results,
    top_materials: topMaterials.results,
    topic_popularity: topicsSorted,
  });
});

export default app;
