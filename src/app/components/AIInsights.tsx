import { useState, useEffect } from "react";
import type { AIClassification } from "../lib/types";
import { api } from "../lib/api";

interface SimilarRequest {
  id: string;
  organization: string;
  eventName: string;
  outcome: "approved" | "denied";
  similarity: number;
  date: string;
}

interface StaffRecommendation {
  name: string;
  role: string;
  matchReasons: string[];
  avatarInitials: string;
}

interface AIInsightsProps {
  submissionId: string;
  classification: AIClassification | null;
  invalidateCache?: boolean;
}

// Module-level in-memory cache keyed by submissionId
const insightsCache = new Map<string, {
  staffRecommendation: StaffRecommendation | null;
  similarRequests: SimilarRequest[];
  aiAvailable: boolean;
}>();

function PulseRow() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      <div className="h-4 bg-surface-container-highest rounded-full w-3/4" />
      <div className="h-3 bg-surface-container-highest rounded-full w-1/2" />
      <div className="h-3 bg-surface-container-highest rounded-full w-5/6" />
    </div>
  );
}

function ConfidenceRing({ pct }: { pct: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-surface-container-highest)" strokeWidth="5" />
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-on-surface">{pct}%</span>
      </div>
    </div>
  );
}

function RiskFlag({ flag, level }: { flag: string; level: "amber" | "red" }) {
  const styles = level === "red"
    ? "bg-red-50 text-red-700"
    : "bg-amber-50 text-amber-700";

  const icon = level === "red" ? (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 0 1 1.743-1.342 48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664 19.5 19.5" />
    </svg>
  );

  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${styles}`}>
      {icon}
      <span>{flag}</span>
    </div>
  );
}

export function AIInsights({ submissionId, classification, invalidateCache }: AIInsightsProps) {
  const [loaded, setLoaded] = useState(false);
  const [staffRecommendation, setStaffRecommendation] = useState<StaffRecommendation | null>(null);
  const [similarRequests, setSimilarRequests] = useState<SimilarRequest[]>([]);
  const [aiAvailable, setAiAvailable] = useState(true);

  // Invalidate cache when parent signals
  useEffect(() => {
    if (invalidateCache && submissionId) {
      insightsCache.delete(submissionId);
    }
  }, [invalidateCache, submissionId]);

  useEffect(() => {
    if (!submissionId) return;
    let cancelled = false;

    // Check cache first
    const cached = insightsCache.get(submissionId);
    if (cached) {
      setStaffRecommendation(cached.staffRecommendation);
      setSimilarRequests(cached.similarRequests);
      setAiAvailable(cached.aiAvailable);
      setLoaded(true);
      return;
    }

    setLoaded(false);
    setStaffRecommendation(null);
    setSimilarRequests([]);
    setAiAvailable(true);

    const insightsPromise = api.getInsights(submissionId).catch(() => null);
    const staffPromise = api.getStaffRecommendation(submissionId).catch(() => null);

    Promise.all([insightsPromise, staffPromise]).then(([insightsRes, staffRes]) => {
      if (cancelled) return;

      let newAiAvailable = true;
      let newStaffRecommendation: StaffRecommendation | null = null;
      let newSimilarRequests: SimilarRequest[] = [];

      // If both failed, AI is unavailable — fall back to stored classification
      if (insightsRes === null && staffRes === null) {
        newAiAvailable = false;
      }

      // Parse staff recommendation if present
      if (staffRes && typeof staffRes === "object") {
        const rec = staffRes as Record<string, unknown>;
        if (rec.name && rec.role) {
          const initials = String(rec.name)
            .split(" ")
            .map(p => p[0] ?? "")
            .slice(0, 2)
            .join("")
            .toUpperCase();
          newStaffRecommendation = {
            name: String(rec.name),
            role: String(rec.role),
            matchReasons: Array.isArray(rec.match_reasons)
              ? rec.match_reasons.map(String)
              : Array.isArray(rec.matchReasons)
                ? (rec.matchReasons as unknown[]).map(String)
                : [],
            avatarInitials: initials,
          };
        }
      }

      // Parse similar requests if present
      if (insightsRes && typeof insightsRes === "object") {
        const ins = insightsRes as Record<string, unknown>;
        if (Array.isArray(ins.similar_requests)) {
          newSimilarRequests = ins.similar_requests.map((r: Record<string, unknown>) => ({
            id: String(r.id ?? r.name ?? `similar-${Math.random()}`),
            organization: String(r.organization ?? r.name ?? ""),
            eventName: String(r.event_name ?? r.eventName ?? r.name ?? "Similar Request"),
            outcome: (String(r.outcome ?? "approved").toLowerCase().includes("den") ? "denied" : "approved") as "approved" | "denied",
            similarity: Number(r.similarity ?? r.relevance ?? r.match ?? 75),
            date: String(r.date ?? ""),
          }));
        }
      }

      // Store in cache
      insightsCache.set(submissionId, {
        staffRecommendation: newStaffRecommendation,
        similarRequests: newSimilarRequests,
        aiAvailable: newAiAvailable,
      });

      setAiAvailable(newAiAvailable);
      setStaffRecommendation(newStaffRecommendation);
      setSimilarRequests(newSimilarRequests);
      setLoaded(true);
    });

    return () => { cancelled = true; };
  }, [submissionId]);

  const cls = classification;

  const recommendationLabel = cls?.approval_recommendation === "auto_approve"
    ? "Recommend Approval"
    : "Manual Review Required";

  const recommendationColor = cls?.approval_recommendation === "auto_approve"
    ? "text-status-approved"
    : "text-status-in-review";

  const riskFlags = cls?.risk_flags ?? [];
  const redFlags = riskFlags.filter(f =>
    f.toLowerCase().includes("duplicate") ||
    f.toLowerCase().includes("exceed") ||
    f.toLowerCase().includes("denied")
  );
  const amberFlags = riskFlags.filter(f => !redFlags.includes(f));

  const confidencePct = cls?.confidence_pct ?? 0;
  const showNoSimilar = loaded && confidencePct < 60 && similarRequests.length === 0;

  return (
    <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-4" title="View a pre-computed AI summary of the request details.">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-on-surface font-display">AI Summary</span>
        {!loaded && (
          <span className="ml-auto text-xs text-on-surface-muted animate-pulse">Analyzing…</span>
        )}
        {loaded && (
          <span className="ml-auto text-xs text-on-surface-muted">
            {aiAvailable ? "Updated just now" : "Using stored classification"}
          </span>
        )}
      </div>

      {!loaded ? (
        <div className="flex flex-col gap-5">
          <PulseRow />
          <PulseRow />
          <PulseRow />
        </div>
      ) : (
        <>
          {/* Approval Recommendation */}
          {cls && (
            <div className="flex items-start gap-4 bg-surface-lowest rounded-xl p-3">
              <ConfidenceRing pct={cls.confidence_pct} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold font-display ${recommendationColor}`}>
                  {recommendationLabel}
                </p>
                <p className="text-xs text-on-surface-muted mt-1 leading-relaxed">
                  {cls.reasoning}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-on-surface-muted">
                    Priority score:{" "}
                    <span className="font-semibold text-on-surface">{cls.priority_score}/10</span>
                  </span>
                  <span className="text-xs text-on-surface-muted">
                    Fulfillment:{" "}
                    <span className="font-semibold text-on-surface capitalize">{cls.fulfillment_recommendation}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {!cls && (
            <div className="bg-surface-lowest rounded-xl p-3 text-sm text-on-surface-muted italic">
              No AI classification available for this submission.
            </div>
          )}

          {/* Risk Flags */}
          {riskFlags.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider">Risk Flags</p>
              {redFlags.map((f, i) => <RiskFlag key={i} flag={f} level="red" />)}
              {amberFlags.map((f, i) => <RiskFlag key={i} flag={f} level="amber" />)}
            </div>
          )}

          {/* Staff Recommendation */}
          {staffRecommendation && (
            <div className="bg-surface-lowest rounded-xl p-3">
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-2">
                Suggested Staff
              </p>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-secondary">
                    {staffRecommendation.avatarInitials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{staffRecommendation.name}</p>
                  <p className="text-xs text-on-surface-muted">{staffRecommendation.role}</p>
                  {staffRecommendation.matchReasons.length > 0 && (
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {staffRecommendation.matchReasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-on-surface-muted">
                          <svg className="w-3 h-3 text-status-approved shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Similar Past Requests */}
          {similarRequests.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider" title="Displays similar past requests, or alerts if the match is under 60%.">
                Similar Past Requests
              </p>
              {similarRequests.map(req => (
                <div key={req.id} className="bg-surface-lowest rounded-xl px-3 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-on-surface truncate">{req.eventName}</p>
                    <p className="text-xs text-on-surface-muted">{req.organization} · {req.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-on-surface-muted">{req.similarity}% match</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      req.outcome === "approved"
                        ? "bg-green-100 text-status-approved"
                        : "bg-red-100 text-status-denied"
                    }`}>
                      {req.outcome === "approved" ? "Approved" : "Denied"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No similar requests fallback */}
          {showNoSimilar && (
            <div className="bg-surface-lowest rounded-xl p-3 text-sm text-on-surface-muted italic">
              No similar past requests found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
