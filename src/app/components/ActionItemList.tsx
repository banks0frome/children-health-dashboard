import { useNavigate } from "react-router-dom";
import type { Submission } from "../lib/types";

interface ActionItemListProps {
  submissions: Submission[];
  onSelect?: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  mailing: "Mailing",
  event: "Event",
  both: "Event + Mail",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  mailing: { bg: "#2563eb18", text: "#2563eb" },
  event: { bg: "#16a34a18", text: "#16a34a" },
  both: { bg: "#7c3aed18", text: "#7c3aed" },
};

const AI_REC_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  auto_approve: {
    label: "Approve",
    bg: "#16a34a12",
    text: "#16a34a",
    dot: "#16a34a",
  },
  manual_review: {
    label: "Review",
    bg: "#d9770612",
    text: "#b45309",
    dot: "#d97706",
  },
  flag: {
    label: "Flag",
    bg: "#dc262612",
    text: "#dc2626",
    dot: "#dc2626",
  },
};

function getAiRecKey(submission: Submission): string {
  if (!submission.ai_classification) return "manual_review";
  if (submission.ai_classification.confidence_pct < 60) return "flag";
  return submission.ai_classification.approval_recommendation;
}

function formatSubmittedAt(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m ago`;
  }
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatEventDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActionItemList({ submissions, onSelect }: ActionItemListProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-surface-lowest rounded-xl p-5 flex flex-col gap-0"
      style={{ boxShadow: "var(--shadow-ambient)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h2 className="font-display font-bold text-base text-on-surface">Needs Your Attention</h2>
          <button
            onClick={() => navigate("/requests")}
            className="text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer"
            title="Click to go directly to the event request page for items needing immediate review."
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </button>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-white">
          {submissions.length} pending
        </span>
      </div>

      <div className="flex flex-col">
        {submissions.map((item, idx) => {
          const typeColor = TYPE_COLORS[item.request_type] ?? TYPE_COLORS.mailing;
          const recKey = getAiRecKey(item);
          const recConfig = AI_REC_CONFIG[recKey] ?? AI_REC_CONFIG.manual_review;
          const isLast = idx === submissions.length - 1;
          const requesterName = `${item.first_name} ${item.last_name}`;
          const eventDate = formatEventDate(item.event_details?.event_date);
          const confidence = item.ai_classification?.confidence_pct ?? null;

          return (
            <div
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              title={`Click to view ${requesterName}'s request`}
              className={`flex items-center gap-4 py-3.5 cursor-pointer group hover:bg-surface-dim rounded-xl px-3 -mx-3 transition-colors ${
                !isLast ? "border-b border-transparent" : ""
              }`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-xs font-bold text-on-surface-muted group-hover:bg-surface-container-highest transition-colors">
                {requesterName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-on-surface truncate">{requesterName}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                  >
                    {TYPE_LABELS[item.request_type] ?? item.request_type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-muted truncate">
                    {item.organization ?? item.email}
                  </span>
                  {eventDate && (
                    <>
                      <span className="text-on-surface-muted text-xs">·</span>
                      <span className="text-xs text-on-surface-muted shrink-0">{eventDate}</span>
                    </>
                  )}
                </div>
              </div>

              {/* AI recommendation chip */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: recConfig.bg, color: recConfig.text }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: recConfig.dot }}
                  />
                  AI: {recConfig.label}
                  {confidence !== null && (
                    <span className="opacity-70 font-normal">({confidence}%)</span>
                  )}
                </span>
                <span className="text-xs text-on-surface-muted">{formatSubmittedAt(item.created_at)}</span>
              </div>
            </div>
          );
        })}

        {submissions.length === 0 && (
          <p className="text-sm text-on-surface-muted text-center py-8">
            No pending submissions. You're all caught up!
          </p>
        )}
      </div>

      <div className="mt-3 pt-3">
        <button
          onClick={() => navigate("/requests")}
          title="View all pending requests"
          className="text-sm font-semibold text-primary hover:text-primary-container cursor-pointer transition-colors flex items-center gap-1"
        >
          View all in Requests
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
