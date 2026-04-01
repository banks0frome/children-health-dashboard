import { useState } from "react";
import type { ActivityLogEntry } from "../lib/types";

interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

type ActionConfig = {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
};

function getActionConfig(action: string): ActionConfig {
  const configs: Record<string, ActionConfig> = {
    submitted: {
      color: "text-status-submitted",
      bgColor: "bg-stone-100",
      label: "Submitted",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
    classified: {
      color: "text-primary",
      bgColor: "bg-primary/10",
      label: "AI Classified",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      ),
    },
    approved: {
      color: "text-status-approved",
      bgColor: "bg-green-100",
      label: "Approved",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ),
    },
    denied: {
      color: "text-status-denied",
      bgColor: "bg-red-100",
      label: "Denied",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      ),
    },
    email_sent: {
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "Email Sent",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
    },
    in_review: {
      color: "text-status-in-review",
      bgColor: "bg-amber-100",
      label: "In Review",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
    note_added: {
      color: "text-on-surface-muted",
      bgColor: "bg-surface-container-highest",
      label: "Note Added",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      ),
    },
  };

  return configs[action] ?? {
    color: "text-on-surface-muted",
    bgColor: "bg-surface-container-highest",
    label: action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  };
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDetails(details: Record<string, unknown> | null): { key: string; value: string }[] {
  if (!details) return [];
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => ({
      key: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      value: String(v),
    }));
}

function ActivityEntry({ entry, isLast }: { entry: ActivityLogEntry; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const config = getActionConfig(entry.action);
  const detailPairs = formatDetails(entry.details);
  const hasDetails = detailPairs.length > 0;

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${config.bgColor} ${config.color}`}>
          {config.icon}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-surface-container-highest mt-1 min-h-[16px]" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-${isLast ? "0" : "4"} min-w-0`} style={{ paddingBottom: isLast ? 0 : "16px" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface leading-snug">
              {config.label}
              {entry.actor && (
                <span className="font-normal text-on-surface-muted"> by {entry.actor}</span>
              )}
            </p>
            <p className="text-xs text-on-surface-muted mt-0.5">{formatTimestamp(entry.created_at)}</p>
          </div>

          {hasDetails && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="shrink-0 text-xs text-on-surface-muted hover:text-on-surface cursor-pointer
                transition-colors flex items-center gap-0.5 mt-0.5"
            >
              Details
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Expandable details */}
        <div
          className="overflow-hidden transition-all duration-200"
          style={{ maxHeight: expanded ? "200px" : "0px", opacity: expanded ? 1 : 0 }}
        >
          <div className="mt-2 bg-surface-container-low rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
            {detailPairs.map(({ key, value }) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="text-on-surface-muted shrink-0 w-28">{key}:</span>
                <span className="text-on-surface flex-1">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-on-surface-muted italic py-2">No activity yet.</p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col">
      {sorted.map((entry, i) => (
        <ActivityEntry key={entry.id} entry={entry} isLast={i === sorted.length - 1} />
      ))}
    </div>
  );
}
