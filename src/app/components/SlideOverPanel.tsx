import { useState, useEffect, useRef } from "react";
import type { Submission, SubmissionStatus } from "../lib/types";
import { api } from "../lib/api";
import { AIInsights } from "./AIInsights";
import { RequestDetails } from "./RequestDetails";
import { ActivityLog } from "./ActivityLog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; bg: string; text: string }> = {
  submitted:  { label: "Submitted",  bg: "bg-stone-100",   text: "text-status-submitted"  },
  in_review:  { label: "In Review",  bg: "bg-amber-100",   text: "text-status-in-review"  },
  approved:   { label: "Approved",   bg: "bg-green-100",   text: "text-status-approved"   },
  denied:     { label: "Denied",     bg: "bg-red-100",     text: "text-status-denied"     },
  fulfilled:  { label: "Fulfilled",  bg: "bg-primary/10",  text: "text-status-fulfilled"  },
};

const METHOD_CONFIG = {
  form:   { label: "Form",   icon: "📋" },
  upload: { label: "Upload", icon: "📎" },
  paste:  { label: "Paste",  icon: "📄" },
  chat:   { label: "Chat",   icon: "💬" },
};

const TYPE_CONFIG = {
  mailing: { label: "Mailing",   bg: "bg-blue-100",   text: "text-type-mailing" },
  event:   { label: "Event",     bg: "bg-green-100",  text: "text-type-event"   },
  both:    { label: "Both",      bg: "bg-violet-100", text: "text-type-both"    },
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
        bg-on-surface text-surface-lowest text-sm font-medium
        px-5 py-3 rounded-full flex items-center gap-2.5
        animate-in fade-in slide-in-from-bottom-3 duration-300"
      style={{ boxShadow: "var(--shadow-float)" }}
    >
      <svg className="w-4 h-4 text-status-approved shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
      {message}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider px-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-5 w-48 bg-surface-container-highest rounded-full" />
      <div className="h-4 w-32 bg-surface-container-highest rounded-full" />
      <div className="h-24 bg-surface-container-highest rounded-xl mt-2" />
      <div className="h-4 w-40 bg-surface-container-highest rounded-full" />
      <div className="h-4 w-56 bg-surface-container-highest rounded-full" />
      <div className="h-4 w-36 bg-surface-container-highest rounded-full" />
    </div>
  );
}

// ─── Staff Popover ───────────────────────────────────────────────────────────

interface StaffPopoverProps {
  submissionId: string;
  onClose: () => void;
}

function StaffPopover({ submissionId, onClose }: StaffPopoverProps) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{ name: string; role: string; matchReasons: string[] } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getStaffRecommendation(submissionId)
      .then(res => {
        const rec = res as Record<string, unknown>;
        if (rec.name && rec.role) {
          setStaff({
            name: String(rec.name),
            role: String(rec.role),
            matchReasons: Array.isArray(rec.match_reasons)
              ? rec.match_reasons.map(String)
              : Array.isArray(rec.matchReasons)
                ? (rec.matchReasons as unknown[]).map(String)
                : [],
          });
        }
      })
      .catch(() => {
        setStaff(null);
      })
      .finally(() => setLoading(false));
  }, [submissionId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-72 bg-surface-lowest rounded-xl p-4 z-50"
      style={{ boxShadow: "var(--shadow-float)" }}
    >
      {loading && (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-4 w-32 bg-surface-container-highest rounded-full" />
          <div className="h-3 w-24 bg-surface-container-highest rounded-full" />
        </div>
      )}
      {!loading && staff && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-secondary">
                {staff.name.split(" ").map(p => p[0] ?? "").slice(0, 2).join("").toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{staff.name}</p>
              <p className="text-xs text-on-surface-muted">{staff.role}</p>
            </div>
          </div>
          {staff.matchReasons.length > 0 && (
            <ul className="flex flex-col gap-1 mt-1">
              {staff.matchReasons.map((r, i) => (
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
      )}
      {!loading && !staff && (
        <p className="text-sm text-on-surface-muted">No staff recommendation available.</p>
      )}
    </div>
  );
}

// ─── Original Submission Collapsible ─────────────────────────────────────────

function OriginalSubmission({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(false);

  const raw = {
    "Request ID": submission.id,
    "Status": submission.status,
    "Method": submission.submission_method,
    "Type": submission.request_type,
    "Submitted": formatDate(submission.created_at),
    "Organization": submission.organization ?? "—",
    "Contact": `${submission.first_name} ${submission.last_name}`,
    "Email": submission.email,
    "Phone": submission.phone ?? "—",
    "Notes": submission.notes ?? "—",
  };

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3
          bg-surface-container-low hover:bg-surface-container-high
          transition-colors duration-150 cursor-pointer"
      >
        <span className="text-sm font-semibold text-on-surface font-display">Original Submission</span>
        <svg
          className={`w-4 h-4 text-on-surface-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: open ? "600px" : "0px" }}
      >
        <div className="bg-surface-lowest px-4 py-3 flex flex-col gap-0">
          {Object.entries(raw).map(([k, v]) => (
            <div key={k} className="flex gap-3 py-1.5">
              <span className="text-xs text-on-surface-muted w-28 shrink-0 pt-0.5">{k}</span>
              <span className="text-sm text-on-surface flex-1 break-words">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string | null;
  onAction?: () => void;
}

export function SlideOverPanel({ isOpen, onClose, submissionId, onAction }: SlideOverPanelProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>("submitted");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showDenyInput, setShowDenyInput] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [denyError, setDenyError] = useState(false);
  const [showStaffPopover, setShowStaffPopover] = useState(false);
  const denyRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch submission when submissionId changes
  useEffect(() => {
    if (!submissionId) {
      setSubmission(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setShowDenyInput(false);
    setDenyReason("");
    setDenyError(false);
    setShowStaffPopover(false);
    api.getSubmission(submissionId)
      .then(res => {
        if (!cancelled) {
          setSubmission(res.submission);
          setStatus(res.submission.status);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load submission");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [submissionId]);

  // Auto-move to in_review after 20s if status is "submitted"
  useEffect(() => {
    if (reviewTimerRef.current) {
      clearTimeout(reviewTimerRef.current);
      reviewTimerRef.current = null;
    }

    if (isOpen && submissionId && status === "submitted") {
      reviewTimerRef.current = setTimeout(() => {
        fetch(`/api/submissions/${submissionId}/mark-reviewed`, { method: "POST" })
          .then(res => {
            if (res.ok) {
              setStatus("in_review");
              setSubmission(prev => prev ? { ...prev, status: "in_review" } : prev);
            }
          })
          .catch(() => { /* silently fail */ });
      }, 20_000);
    }

    return () => {
      if (reviewTimerRef.current) {
        clearTimeout(reviewTimerRef.current);
        reviewTimerRef.current = null;
      }
    };
  }, [isOpen, submissionId, status]);

  // Focus trap / scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Focus deny textarea when it appears
  useEffect(() => {
    if (showDenyInput && denyRef.current) {
      denyRef.current.focus();
    }
  }, [showDenyInput]);

  const handleApprove = async () => {
    if (!submissionId) return;
    try {
      const res = await api.approveSubmission(submissionId);
      setStatus(res.submission.status);
      setSubmission(res.submission);
      setShowDenyInput(false);
      setDenyReason("");
      setDenyError(false);
      setToast(`Request ${submissionId} approved successfully`);
      onAction?.();
    } catch {
      setToast(`Failed to approve — please try again`);
    }
  };

  const handleDenyClick = () => {
    setShowDenyInput(s => !s);
    setDenyError(false);
  };

  const handleDenySubmit = async () => {
    if (!denyReason.trim()) {
      setDenyError(true);
      denyRef.current?.focus();
      return;
    }
    if (!submissionId) return;
    try {
      const res = await api.denySubmission(submissionId, denyReason.trim());
      setStatus(res.submission.status);
      setSubmission(res.submission);
      setShowDenyInput(false);
      setDenyReason("");
      setToast(`Request ${submissionId} denied`);
      onAction?.();
    } catch {
      setToast(`Failed to deny — please try again`);
    }
  };

  const handleHold = async () => {
    if (!submissionId) return;
    try {
      const res = await api.updateSubmission(submissionId, { status: "in_review" });
      setStatus(res.submission.status);
      setSubmission(res.submission);
      setShowDenyInput(false);
      setToast(`Request ${submissionId} placed on hold for review`);
      onAction?.();
    } catch {
      setToast(`Failed to update status — please try again`);
    }
  };

  const statusCfg = STATUS_CONFIG[status];
  const methodCfg = submission ? METHOD_CONFIG[submission.submission_method] : null;
  const typeCfg = submission ? TYPE_CONFIG[submission.request_type] : null;

  // Action button style helpers
  function approveClasses() {
    if (status === "approved") return "bg-green-100 text-status-approved cursor-default";
    return "bg-surface-container-high text-on-surface hover:bg-green-50 hover:text-status-approved active:scale-95";
  }

  function denyClasses() {
    if (status === "denied") return "bg-red-100 text-status-denied cursor-default";
    if (showDenyInput) return "bg-status-denied/10 text-status-denied";
    return "bg-surface-container-high text-on-surface hover:bg-red-50 hover:text-status-denied";
  }

  function holdClasses() {
    if (status === "in_review") return "bg-amber-100 text-status-in-review cursor-default";
    return "bg-surface-container-high text-on-surface hover:bg-amber-50 hover:text-status-in-review";
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(23, 8, 92, 0.2)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Submission ${submissionId ?? ""} details`}
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-surface"
        style={{
          width: "50vw",
          minWidth: "480px",
          maxWidth: "720px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: isOpen ? "var(--shadow-float)" : "none",
        }}
      >
        {/* ── Header ── */}
        <div className="shrink-0 px-6 pt-5 pb-4 bg-surface-lowest flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            {/* ID + badges */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {loading ? (
                <div className="h-5 w-32 bg-surface-container-highest rounded-full animate-pulse" />
              ) : submission ? (
                <>
                  <span className="text-base font-bold font-display text-on-surface shrink-0">
                    {submission.id}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                  {typeCfg && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${typeCfg.bg} ${typeCfg.text}`}>
                      {typeCfg.label}
                    </span>
                  )}
                  {methodCfg && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0
                      bg-surface-container-highest text-on-surface-muted">
                      {methodCfg.label}
                    </span>
                  )}
                </>
              ) : null}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                text-on-surface-muted hover:text-on-surface hover:bg-surface-container-high
                transition-colors duration-150 cursor-pointer"
              aria-label="Close panel"
              title="Close panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Requester + timestamp */}
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-surface-container-highest animate-pulse shrink-0" />
              <div className="h-4 w-48 bg-surface-container-highest rounded-full animate-pulse" />
            </div>
          ) : submission ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-secondary">
                    {submission.first_name[0]}{submission.last_name[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {submission.first_name} {submission.last_name}
                    {submission.organization && (
                      <span className="text-on-surface-muted font-normal"> · {submission.organization}</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="ml-auto text-xs text-on-surface-muted shrink-0">
                {formatDate(submission.created_at)}
              </span>
            </div>
          ) : null}
        </div>

        {/* ── Sticky Action Bar ── */}
        <div className="shrink-0 px-6 py-3 bg-surface flex flex-col gap-3"
          style={{ boxShadow: "0 1px 0 0 var(--color-outline)20" }}>
          <div className="flex items-center gap-2">
            {/* Approve */}
            <button
              onClick={handleApprove}
              disabled={!submission || status === "approved"}
              title="Click to finalize approval; button will update to green."
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                transition-all duration-200 cursor-pointer ${approveClasses()}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {status === "approved" ? "Approved" : "Approve"}
            </button>

            {/* Deny */}
            <button
              onClick={handleDenyClick}
              disabled={!submission || status === "denied"}
              title="Click to finalize denial; button will update to red."
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                transition-all duration-200 cursor-pointer ${denyClasses()}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              {status === "denied" ? "Denied" : "Deny"}
            </button>

            {/* Hold */}
            <button
              onClick={handleHold}
              disabled={!submission || status === "in_review"}
              title="Click to place on hold; button will update to yellow."
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                transition-all duration-200 cursor-pointer ${holdClasses()}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
              {status === "in_review" ? "On Hold" : "Hold"}
            </button>

            {/* Assign staff */}
            <div className="ml-auto relative">
              <button
                onClick={() => setShowStaffPopover(s => !s)}
                title="Assign available staff members to the selected event."
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                  bg-primary/10 text-primary hover:bg-primary/20
                  transition-all duration-200 cursor-pointer active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
                Assign Staff
              </button>
              {showStaffPopover && submissionId && (
                <StaffPopover
                  submissionId={submissionId}
                  onClose={() => setShowStaffPopover(false)}
                />
              )}
            </div>
          </div>

          {/* Deny reason input — inline reveal */}
          <div
            className="overflow-hidden transition-all duration-250"
            style={{ maxHeight: showDenyInput ? "120px" : "0px", opacity: showDenyInput ? 1 : 0 }}
          >
            <div className="flex flex-col gap-2 pt-1">
              <textarea
                ref={denyRef}
                value={denyReason}
                onChange={e => { setDenyReason(e.target.value); setDenyError(false); }}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDenySubmit(); }}
                placeholder="Enter denial reason (required)…"
                rows={2}
                className={`w-full rounded-xl px-3 py-2 text-sm text-on-surface
                  bg-surface-container-low focus:outline-none focus:ring-2
                  transition-all resize-none
                  ${denyError ? "ring-2 ring-status-denied" : "focus:ring-primary/30"}`}
              />
              <div className="flex items-center justify-between">
                {denyError && (
                  <span className="text-xs text-status-denied">A denial reason is required.</span>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => { setShowDenyInput(false); setDenyReason(""); setDenyError(false); }}
                    className="text-sm text-on-surface-muted hover:text-on-surface cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDenySubmit}
                    className="text-sm font-semibold text-status-denied hover:opacity-80 cursor-pointer transition-opacity"
                  >
                    Confirm Deny
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {loading && <PanelSkeleton />}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-status-denied" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-sm text-on-surface-muted">{error}</p>
            </div>
          )}

          {!loading && !error && submission && (
            <>
              {/* AI Summary */}
              <PanelSection title="AI Summary">
                <AIInsights submissionId={submission.id} classification={submission.ai_classification} />
              </PanelSection>

              {/* Request Details */}
              <PanelSection title="Request Details">
                <RequestDetails submission={submission} />
              </PanelSection>

              {/* Activity Log */}
              <PanelSection title="Activity Log">
                <ActivityLog entries={submission.activity_log ?? []} />
              </PanelSection>

              {/* Original Submission */}
              <PanelSection title="Raw Data">
                <OriginalSubmission submission={submission} />
              </PanelSection>

              {/* Bottom padding for scrollbar clearance */}
              <div className="h-4" />
            </>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
