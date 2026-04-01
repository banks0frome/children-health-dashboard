import { Hono } from "hono";
import { cors } from "hono/cors";
import submissions from "./routes/submissions";
import stats from "./routes/stats";
import ai from "./routes/ai";
import form from "./routes/form";

export type Bindings = {
  DB: D1Database;
  CLAUDE_API_KEY: string;
  RESEND_API_KEY: string;
};

const api = new Hono<{ Bindings: Bindings }>();

api.use("/api/*", cors());

api.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

api.route("/api/submissions", submissions);
api.route("/api/stats", stats);
api.route("/api/ai", ai);
api.route("/api/form", form);

export default api;
