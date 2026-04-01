import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import { api } from "../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = "7" | "30" | "90";

interface DailyDataPoint {
  date: string;
  mailing: number;
  event: number;
  both: number;
}

interface MaterialDataPoint {
  name: string;
  qty: number;
}

interface TopicDataPoint {
  topic: string;
  count: number;
  color: string;
}

interface CountyDataPoint {
  name: string;
  count: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsData {
  dailyData: DailyDataPoint[];
  materialsData: MaterialDataPoint[];
  topicsData: TopicDataPoint[];
  counties: CountyDataPoint[];
  pieData: PieDataPoint[];
  total: number;
  approvalRate: number;
  avgFulfillmentDays?: number;
  mostRequestedMaterial?: string;
  mostRequestedQty?: number;
}

// ─── Fallback Mock Data ───────────────────────────────────────────────────────

function generateDailyData(days: number): DailyDataPoint[] {
  const data = [];
  const now = new Date(2026, 2, 21);
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const base = 2 + Math.sin(i * 0.4) * 1.2 + (days - i) * 0.05;
    const mailing = Math.max(0, Math.round(base * 1.8 + Math.random() * 2));
    const event = Math.max(0, Math.round(base * 1.1 + Math.random() * 1.5));
    const both = Math.max(0, Math.round(base * 0.5 + Math.random() * 1));
    data.push({ date: label, mailing, event, both });
  }
  return data;
}

const FALLBACK_MATERIALS: MaterialDataPoint[] = [
  { name: "Car Seat Cards", qty: 245 },
  { name: "Safe Sleep Guides", qty: 198 },
  { name: "Immunization Handouts", qty: 167 },
  { name: "Poison Prevention", qty: 134 },
  { name: "Bike Helmet Info", qty: 112 },
  { name: "Water Safety Packs", qty: 98 },
  { name: "Fire Safety Sheets", qty: 76 },
  { name: "Choking Cards", qty: 54 },
];

const FALLBACK_TOPICS: TopicDataPoint[] = [
  { topic: "Car Seat Safety", count: 89, color: "#3400a5" },
  { topic: "Safe Sleep (SIDS)", count: 74, color: "#b80c5a" },
  { topic: "Immunization", count: 67, color: "#2563eb" },
  { topic: "Poisoning Prevention", count: 52, color: "#16a34a" },
  { topic: "Drowning Prevention", count: 41, color: "#7c3aed" },
  { topic: "Fall Prevention", count: 35, color: "#d97706" },
  { topic: "Fire & Burns", count: 28, color: "#dc2626" },
];

const FALLBACK_COUNTIES: CountyDataPoint[] = [
  { name: "Salt Lake", count: 23 },
  { name: "Utah", count: 12 },
  { name: "Davis", count: 7 },
  { name: "Weber", count: 3 },
  { name: "Summit", count: 2 },
];

const FALLBACK_PIE: PieDataPoint[] = [
  { name: "Mailing", value: 26, color: "#2563eb" },
  { name: "Event", value: 14, color: "#16a34a" },
  { name: "Both", value: 7, color: "#7c3aed" },
];

const TOPIC_COLORS = ["#3400a5", "#b80c5a", "#2563eb", "#16a34a", "#7c3aed", "#d97706", "#dc2626"];

function buildFallback(range: TimeRange): AnalyticsData {
  const dailyData = generateDailyData(Number(range));
  const total = dailyData.reduce((s, d) => s + d.mailing + d.event + d.both, 0);
  return {
    dailyData,
    materialsData: FALLBACK_MATERIALS,
    topicsData: FALLBACK_TOPICS,
    counties: FALLBACK_COUNTIES,
    pieData: FALLBACK_PIE,
    total,
    approvalRate: 89,
    avgFulfillmentDays: 3.2,
    mostRequestedMaterial: "Car Seat Cards",
    mostRequestedQty: 245,
  };
}

function buildFromApiResponse(raw: Record<string, unknown>): Partial<AnalyticsData> {
  const result: Partial<AnalyticsData> = {};

  // volume_by_day: [{date, mailing, event, both}] or [{date, count}]
  if (Array.isArray(raw.volume_by_day)) {
    result.dailyData = (raw.volume_by_day as Record<string, unknown>[]).map((d) => ({
      date: String(d.date ?? ""),
      mailing: Number(d.mailing ?? 0),
      event: Number(d.event ?? 0),
      both: Number(d.both ?? 0),
    }));
  }

  // type_breakdown: [{name, value}] or [{request_type, count}] or {mailing, event, both}
  if (Array.isArray(raw.type_breakdown)) {
    const typeColors: Record<string, string> = {
      Mailing: "#2563eb",
      Event: "#16a34a",
      Both: "#7c3aed",
      mailing: "#2563eb",
      event: "#16a34a",
      both: "#7c3aed",
    };
    result.pieData = (raw.type_breakdown as Record<string, unknown>[]).map((d) => {
      const rawName = String(d.name ?? d.type ?? d.request_type ?? "");
      const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      return {
        name,
        value: Number(d.value ?? d.count ?? 0),
        color: typeColors[rawName] ?? typeColors[name] ?? "#3400a5",
      };
    });
  } else if (raw.type_breakdown && typeof raw.type_breakdown === "object") {
    const tb = raw.type_breakdown as Record<string, number>;
    result.pieData = [
      { name: "Mailing", value: tb.mailing ?? 0, color: "#2563eb" },
      { name: "Event", value: tb.event ?? 0, color: "#16a34a" },
      { name: "Both", value: tb.both ?? 0, color: "#7c3aed" },
    ];
  }

  // geographic: [{name/county, count}]
  if (Array.isArray(raw.geographic)) {
    result.counties = (raw.geographic as Record<string, unknown>[]).map((d) => ({
      name: String(d.name ?? d.county ?? ""),
      count: Number(d.count ?? 0),
    }));
  }

  // top_materials: [{name/material_name, qty/quantity/total_quantity/count}]
  if (Array.isArray(raw.top_materials)) {
    result.materialsData = (raw.top_materials as Record<string, unknown>[]).map((d) => ({
      name: String(d.name ?? d.material_name ?? ""),
      qty: Number(d.qty ?? d.quantity ?? d.total_quantity ?? d.count ?? 0),
    }));
  }

  // topic_popularity: [{topic, count}]
  if (Array.isArray(raw.topic_popularity)) {
    result.topicsData = (raw.topic_popularity as Record<string, unknown>[]).map((d, i) => ({
      topic: String(d.topic ?? d.name ?? ""),
      count: Number(d.count ?? 0),
      color: TOPIC_COLORS[i % TOPIC_COLORS.length],
    }));
  }

  // summary: {total, approval_rate, avg_fulfillment_days, most_requested_material, most_requested_qty}
  if (raw.summary && typeof raw.summary === "object") {
    const s = raw.summary as Record<string, unknown>;
    if (s.total !== undefined) result.total = Number(s.total);
    if (s.approval_rate !== undefined) result.approvalRate = Number(s.approval_rate);
    if (s.avg_fulfillment_time !== undefined) result.avgFulfillmentDays = Math.round(Number(s.avg_fulfillment_time) / 24 * 10) / 10;
    if (s.avg_fulfillment_days !== undefined) result.avgFulfillmentDays = Number(s.avg_fulfillment_days);
    // most_requested_material can be an object {name, quantity} or a string
    if (s.most_requested_material && typeof s.most_requested_material === "object") {
      const mrm = s.most_requested_material as Record<string, unknown>;
      result.mostRequestedMaterial = String(mrm.name ?? "");
      result.mostRequestedQty = Number(mrm.quantity ?? 0);
    } else if (s.most_requested_material) {
      result.mostRequestedMaterial = String(s.most_requested_material);
    }
    if (s.most_requested_qty !== undefined) result.mostRequestedQty = Number(s.most_requested_qty);
  }

  return result;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(23,8,92,0.12)", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <p style={{ fontWeight: 700, color: "#17085c", marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#534878", marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ textTransform: "capitalize" }}>{p.dataKey}:</span>
          <span style={{ fontWeight: 600, color: "#17085c" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#ffffff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(23,8,92,0.12)", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <p style={{ fontWeight: 700, color: "#17085c", fontSize: 13, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 12, color: "#534878" }}>
        Quantity: <span style={{ fontWeight: 600, color: "#17085c" }}>{payload[0]?.value}</span>
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const total = d.payload?.total ?? 47;
  return (
    <div style={{ background: "#ffffff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(23,8,92,0.12)", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <p style={{ fontWeight: 700, color: "#17085c", fontSize: 13 }}>{d.name}</p>
      <p style={{ fontSize: 12, color: "#534878" }}>
        {d.value} requests ({Math.round((d.value / total) * 100)}%)
      </p>
    </div>
  );
}

// ─── AI Summary Panel ─────────────────────────────────────────────────────────

function AISummaryPanel({
  chartName,
  summary,
  loading,
  onClose,
}: {
  chartName: string;
  summary: string | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(23,8,92,0.15)", backdropFilter: "blur(2px)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "#ffffff",
          borderRadius: 20,
          padding: "28px 32px",
          maxWidth: 800,
          width: "92%",
          boxShadow: "0 20px 60px rgba(23,8,92,0.18)",
          fontFamily: "Be Vietnam Pro, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0eafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3400a5" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: "#17085c", fontSize: 15, margin: 0 }}>
              AI Insight: {chartName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#534878", padding: 4 }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {/* Left: Chart visualization placeholder */}
          <div style={{ flex: "1 1 50%", minWidth: 0, background: "#f6f1ff", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
            <div style={{ textAlign: "center" }}>
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#3400a5" strokeWidth={1.5} style={{ margin: "0 auto 8px", opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#3400a5" }}>{chartName}</p>
              <p style={{ fontSize: 11, color: "#534878", marginTop: 4 }}>Chart data visualized above</p>
            </div>
          </div>
          {/* Right: AI Summary */}
          <div style={{ flex: "1 1 50%", minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#534878", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>AI Analysis</p>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="animate-pulse" style={{ height: 14, borderRadius: 999, background: "#f0eafc", width: "90%" }} />
                <div className="animate-pulse" style={{ height: 14, borderRadius: 999, background: "#f0eafc", width: "75%" }} />
                <div className="animate-pulse" style={{ height: 14, borderRadius: 999, background: "#f0eafc", width: "85%" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <div className="animate-pulse" style={{ width: 16, height: 16, borderRadius: "50%", background: "#f0eafc" }} />
                  <span style={{ fontSize: 12, color: "#534878" }}>Analyzing data...</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#17085c", lineHeight: 1.8, margin: 0 }}>{summary}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  positive,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  positive?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 20px 40px rgba(23,8,92,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f0eafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#3400a5" }}>
          {icon}
        </div>
        {sub && (
          <span style={{ fontSize: 12, fontWeight: 600, color: positive ? "#16a34a" : "#dc2626", background: positive ? "#dcfce7" : "#fee2e2", borderRadius: 999, padding: "2px 8px" }}>
            {sub}
          </span>
        )}
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 800, color: "#17085c", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.1 }}>
          {value}
        </p>
        <p style={{ fontSize: 13, color: "#534878", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 20px 40px rgba(23,8,92,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f0eafc" }} className="animate-pulse" />
        <div style={{ width: 60, height: 20, borderRadius: 999, background: "#f0eafc" }} className="animate-pulse" />
      </div>
      <div style={{ width: 64, height: 32, borderRadius: 8, background: "#f0eafc", marginBottom: 6 }} className="animate-pulse" />
      <div style={{ width: 100, height: 14, borderRadius: 999, background: "#f0eafc" }} className="animate-pulse" />
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function Card({
  title,
  children,
  style,
  onClick,
  tooltip,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  tooltip?: string;
}) {
  return (
    <div
      onClick={onClick}
      title={tooltip}
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 20px 40px rgba(23,8,92,0.06)",
        cursor: onClick ? "pointer" : undefined,
        transition: "transform 0.15s ease",
        ...style,
      }}
      className={onClick ? "hover:scale-[1.01] transition-transform" : undefined}
    >
      <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, color: "#17085c", fontSize: 16, marginBottom: 20 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Tick Formatters ──────────────────────────────────────────────────────────

function xTickFormat(range: TimeRange) {
  return (val: string) => {
    if (range === "90") {
      const parts = val.split(" ");
      if (parts.length === 2 && (parts[1] === "1" || parts[1] === "10" || parts[1] === "20" || parts[1] === "28" || parts[1] === "31")) {
        return val;
      }
      return "";
    }
    if (range === "30") {
      const day = parseInt(val.split(" ")[1] || "0");
      return day % 5 === 1 ? val : "";
    }
    return val;
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Analytics() {
  const [range, setRange] = useState<TimeRange>("30");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(() => buildFallback("30"));
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getStatsAnalytics(range)
      .then((raw) => {
        const partial = buildFromApiResponse(raw);
        const fallback = buildFallback(range);
        setAnalyticsData({
          dailyData: partial.dailyData ?? fallback.dailyData,
          materialsData: partial.materialsData ?? fallback.materialsData,
          topicsData: partial.topicsData ?? fallback.topicsData,
          counties: partial.counties ?? fallback.counties,
          pieData: partial.pieData ?? fallback.pieData,
          total: partial.total ?? fallback.total,
          approvalRate: partial.approvalRate ?? fallback.approvalRate,
          avgFulfillmentDays: partial.avgFulfillmentDays ?? fallback.avgFulfillmentDays,
          mostRequestedMaterial: partial.mostRequestedMaterial ?? fallback.mostRequestedMaterial,
          mostRequestedQty: partial.mostRequestedQty ?? fallback.mostRequestedQty,
        });
      })
      .catch(() => {
        setAnalyticsData(buildFallback(range));
      })
      .finally(() => setLoading(false));
  }, [range]);

  const { dailyData, materialsData, topicsData, counties, pieData, total, approvalRate, avgFulfillmentDays, mostRequestedMaterial, mostRequestedQty } = analyticsData;
  const countyMax = counties[0]?.count ?? 1;
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const deltaLabels: Record<TimeRange, string> = { "7": "+8%", "30": "+12%", "90": "+21%" };

  const tickFormatter = useMemo(() => xTickFormat(range), [range]);

  function handleChartClick(chartName: string, data: unknown) {
    setSelectedChart(chartName);
    setAiSummary(null);
    setAiLoading(true);
    const dataStr = JSON.stringify(data);
    const prompt = `Briefly summarize the ${chartName} data in 2-3 sentences for a health department admin. Be specific about trends and notable values. Data: ${dataStr}`;
    api
      .chat(prompt)
      .then((res) => setAiSummary(res.response))
      .catch(() => setAiSummary("Unable to generate summary at this time. Please try again."))
      .finally(() => setAiLoading(false));
  }

  return (
    <div style={{ padding: "0" }}>
      {/* AI Summary Panel */}
      {selectedChart && (
        <AISummaryPanel
          chartName={selectedChart}
          summary={aiSummary}
          loading={aiLoading}
          onClose={() => setSelectedChart(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, padding: "28px 24px 0" }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "#17085c", lineHeight: 1.2 }}>
            Analytics
          </h1>
          <p style={{ color: "#534878", fontSize: 14, marginTop: 4 }}>
            Materials distribution performance overview
          </p>
        </div>

        {/* Time Range Selector */}
        <div style={{ display: "flex", gap: 4, background: "#f0eafc", borderRadius: 999, padding: "4px" }}>
          {(["7", "30", "90"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              title="Adjust the time frame to update KPIs like Approval Rate, Avg Fulfillment Time, and Most Requested."
              style={{
                padding: "7px 18px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "Be Vietnam Pro, sans-serif",
                cursor: "pointer",
                border: "none",
                transition: "all 0.15s ease",
                background: range === r ? "#3400a5" : "transparent",
                color: range === r ? "#ffffff" : "#534878",
              }}
            >
              {r === "7" ? "7 Days" : r === "30" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {loading ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Requests"
                value={total}
                sub={deltaLabels[range]}
                positive
                icon={
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                label="Approval Rate"
                value={`${approvalRate}%`}
                icon={
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Avg Fulfillment Time"
                value={avgFulfillmentDays !== undefined ? `${avgFulfillmentDays} days` : "3.2 days"}
                icon={
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Most Requested"
                value={mostRequestedMaterial ?? materialsData[0]?.name ?? "\u2014"}
                sub={mostRequestedQty !== undefined ? `${mostRequestedQty} units` : materialsData[0] ? `${materialsData[0].qty} units` : undefined}
                positive
                icon={
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                }
              />
            </>
          )}
        </div>

        {/* Row: Area Chart (full width) */}
        <Card title="Request Volume Over Time" style={{ marginBottom: 24 }} onClick={() => handleChartClick("Request Volume Over Time", dailyData)}>
          {loading ? (
            <div style={{ height: 280, background: "#f0eafc", borderRadius: 12 }} className="animate-pulse" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradMailing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradEvent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradBoth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eafc" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={tickFormatter} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<AreaTooltip />} />
                  <Area type="monotone" dataKey="mailing" stackId="1" stroke="#2563eb" strokeWidth={2} fill="url(#gradMailing)" name="mailing" />
                  <Area type="monotone" dataKey="event" stackId="1" stroke="#16a34a" strokeWidth={2} fill="url(#gradEvent)" name="event" />
                  <Area type="monotone" dataKey="both" stackId="1" stroke="#7c3aed" strokeWidth={2} fill="url(#gradBoth)" name="both" />
                </AreaChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: "flex", gap: 20, marginTop: 16, justifyContent: "center" }}>
                {[
                  { label: "Mailing", color: "#2563eb" },
                  { label: "Event", color: "#16a34a" },
                  { label: "Both", color: "#7c3aed" },
                ].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#534878" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: "inline-block" }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Row 2: Pie + Top Materials */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, marginBottom: 24 }}>
          {/* Donut / Pie */}
          <Card title="Request Type Breakdown" onClick={() => handleChartClick("Request Type Breakdown", pieData)}>
            {loading ? (
              <div style={{ height: 200, background: "#f0eafc", borderRadius: 12 }} className="animate-pulse" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={54} outerRadius={88} paddingAngle={3} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  {pieData.map((d) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: "inline-block" }} />
                        <span style={{ fontSize: 13, color: "#534878" }}>{d.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#17085c" }}>{d.value}</span>
                        <span style={{ fontSize: 11, color: "#534878" }}>({pieTotal > 0 ? Math.round((d.value / pieTotal) * 100) : 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Top Materials */}
          <Card title="Top Materials by Quantity" onClick={() => handleChartClick("Top Materials by Quantity", materialsData)}>
            {loading ? (
              <div style={{ height: 280, background: "#f0eafc", borderRadius: 12 }} className="animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={materialsData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} axisLine={false} tickLine={false} width={130} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eafc" horizontal={false} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="qty" fill="#3400a5" radius={[0, 6, 6, 0]}>
                    <LabelList dataKey="qty" position="right" style={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Row 3: Geographic + Topic Popularity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
          {/* Geographic Distribution — Treemap */}
          <Card title="Intermountain Facility Distribution" onClick={() => handleChartClick("Geographic Distribution", counties)}>
            {loading ? (
              <div style={{ height: 320, background: "#f0eafc", borderRadius: 12 }} className="animate-pulse" />
            ) : (
              <>
                {/* Treemap-style facility grid */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1fr 1fr", gap: 3, minHeight: 280 }}>
                  {/* Utah — largest block */}
                  <div style={{ gridRow: "1 / 3", background: "#3400a5", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Utah</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {[
                          { city: "Salt Lake City", facility: "Primary Children's Hospital", count: counties.find(c => c.name === "Salt Lake")?.count ?? 23 },
                          { city: "Murray", facility: "Intermountain Medical Center", count: Math.round((counties.find(c => c.name === "Salt Lake")?.count ?? 20) * 0.6) },
                          { city: "Provo", facility: "Utah Valley Hospital", count: counties.find(c => c.name === "Utah")?.count ?? 12 },
                          { city: "Lehi", facility: "Primary Children's Lehi", count: 4 },
                          { city: "Ogden", facility: "McKay-Dee Hospital", count: counties.find(c => c.name === "Weber")?.count ?? 3 },
                          { city: "Logan", facility: "Logan Regional", count: 2 },
                          { city: "St. George", facility: "St. George Regional", count: 3 },
                        ].map(f => (
                          <div key={f.city} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.9 }}>
                            <span>{f.facility}</span>
                            <span style={{ fontWeight: 700 }}>{f.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{counties.reduce((s, c) => s + c.count, 0)} req</p>
                  </div>
                  {/* Colorado */}
                  <div style={{ background: "#2563eb", borderRadius: 8, padding: 10, color: "#fff" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Colorado</p>
                    {["Saint Joseph (Denver)", "Lutheran Medical", "Good Samaritan", "St. Mary's"].map(f => (
                      <p key={f} style={{ fontSize: 9, opacity: 0.85, marginBottom: 2 }}>{f}</p>
                    ))}
                  </div>
                  {/* Idaho */}
                  <div style={{ background: "#16a34a", borderRadius: 8, padding: 10, color: "#fff" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Idaho</p>
                    <p style={{ fontSize: 9, opacity: 0.85 }}>Cassia Regional</p>
                  </div>
                  {/* Montana */}
                  <div style={{ background: "#d97706", borderRadius: 8, padding: 10, color: "#fff" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Montana</p>
                    <p style={{ fontSize: 9, opacity: 0.85 }}>St. Vincent</p>
                    <p style={{ fontSize: 9, opacity: 0.85 }}>St. James</p>
                  </div>
                  {/* Davis */}
                  <div style={{ background: "#7c3aed", borderRadius: 8, padding: 10, color: "#fff" }}>
                    <p style={{ fontSize: 11, fontWeight: 700 }}>Davis Co</p>
                    <p style={{ fontSize: 9, opacity: 0.85 }}>LDS Hospital</p>
                    <p style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{counties.find(c => c.name === "Davis")?.count ?? 7}</p>
                  </div>
                  {/* NV/WY/KS */}
                  <div style={{ background: "#b80c5a", borderRadius: 8, padding: 10, color: "#fff", gridColumn: "3 / 5" }}>
                    <p style={{ fontSize: 11, fontWeight: 700 }}>NV / WY / KS</p>
                    <p style={{ fontSize: 9, opacity: 0.85 }}>Select Health Networks</p>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Utah", color: "#3400a5" },
                    { label: "Colorado", color: "#2563eb" },
                    { label: "Idaho", color: "#16a34a" },
                    { label: "Montana", color: "#d97706" },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#534878" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: "inline-block" }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Topic Popularity */}
          <Card title="Topic Popularity" onClick={() => handleChartClick("Topic Popularity", topicsData)}>
            {loading ? (
              <div style={{ height: 260, background: "#f0eafc", borderRadius: 12 }} className="animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topicsData} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="topic" tick={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} axisLine={false} tickLine={false} width={140} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eafc" horizontal={false} />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ background: "#ffffff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(23,8,92,0.12)", fontFamily: "Be Vietnam Pro, sans-serif" }}>
                          <p style={{ fontWeight: 700, color: "#17085c", fontSize: 13, marginBottom: 4 }}>{label}</p>
                          <p style={{ fontSize: 12, color: "#534878" }}>
                            Requests: <span style={{ fontWeight: 600, color: "#17085c" }}>{payload[0]?.value}</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {topicsData.map((entry) => (
                      <Cell key={entry.topic} fill={entry.color} />
                    ))}
                    <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: "#534878", fontFamily: "Be Vietnam Pro, sans-serif" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
