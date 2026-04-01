import type { RequestType, Submission, SubmissionStatus } from "../lib/types";

export type FilterType = "all" | RequestType | "flagged";
export type StatusFilterType = "all" | SubmissionStatus;

interface FilterChipsProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
  submissions: Submission[];
}

interface ChipDef {
  id: FilterType;
  label: string;
}

const chips: ChipDef[] = [
  { id: "all", label: "All Types" },
  { id: "mailing", label: "Mailing" },
  { id: "both", label: "Both" },
  { id: "flagged", label: "Flagged" },
];

function getCount(id: FilterType, submissions: Submission[]): number {
  if (id === "all") return submissions.length;
  if (id === "flagged")
    return submissions.filter(
      (s) => s.ai_classification && s.ai_classification.risk_flags.length > 0
    ).length;
  return submissions.filter((s) => s.request_type === id).length;
}

export function FilterChips({ activeFilter, onChange, submissions }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map(({ id, label }) => {
        const isActive = activeFilter === id;
        const count = getCount(id, submissions);
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={`Filter by ${label}`}
            className={[
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer select-none",
              isActive
                ? "bg-primary-container text-white"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
            ].join(" ")}
          >
            {label}
            <span
              className={[
                "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold",
                isActive ? "bg-white/20 text-white" : "bg-surface-container-highest text-on-surface-muted",
              ].join(" ")}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Status Filter Chips ─────────────────────────────────────────────────────

interface StatusFilterChipsProps {
  activeFilter: StatusFilterType;
  onChange: (filter: StatusFilterType) => void;
  submissions: Submission[];
}

interface StatusChipDef {
  id: StatusFilterType;
  label: string;
}

const statusChips: StatusChipDef[] = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted" },
  { id: "in_review", label: "In Review" },
  { id: "approved", label: "Approved" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "denied", label: "Denied" },
];

function getStatusCount(id: StatusFilterType, submissions: Submission[]): number {
  if (id === "all") return submissions.length;
  return submissions.filter((s) => s.status === id).length;
}

export function StatusFilterChips({ activeFilter, onChange, submissions }: StatusFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {statusChips.map(({ id, label }) => {
        const isActive = activeFilter === id;
        const count = getStatusCount(id, submissions);
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer select-none",
              isActive
                ? "bg-on-surface text-surface-lowest"
                : "bg-surface-container-low text-on-surface-muted hover:bg-surface-container-high",
            ].join(" ")}
          >
            {label}
            <span
              className={[
                "inline-flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full text-[10px] font-semibold",
                isActive ? "bg-white/20 text-surface-lowest" : "bg-surface-container-highest text-on-surface-muted",
              ].join(" ")}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
