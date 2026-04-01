import { useState } from "react";
import type { Submission, SubmissionStatus } from "../lib/types";
import { formatDistanceToNow } from "../lib/dateUtils";
import { ArrowUpDown, ArrowUp, ArrowDown, ShieldCheck, ShieldAlert } from "lucide-react";

interface RequestTableProps {
  submissions: Submission[];
  onSelect: (id: string) => void;
}

type SortKey = "status" | "requester" | "type" | "event_date" | "location" | "materials" | "ai_score" | "submitted";
type SortDir = "asc" | "desc";

const statusConfig: Record<SubmissionStatus, { label: string; classes: string }> = {
  submitted: { label: "Submitted", classes: "bg-stone-100 text-stone-600" },
  in_review: { label: "In Review", classes: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", classes: "bg-green-100 text-green-700" },
  fulfilled: { label: "Fulfilled", classes: "bg-violet-100 text-violet-700" },
  denied: { label: "Denied", classes: "bg-red-100 text-red-700" },
};

const typeConfig: Record<string, { label: string; classes: string }> = {
  mailing: { label: "Mailing", classes: "bg-blue-100 text-blue-700" },
  event: { label: "Event", classes: "bg-green-100 text-green-700" },
  both: { label: "Both", classes: "bg-purple-100 text-purple-700" },
};

const STATUS_ORDER: SubmissionStatus[] = ["submitted", "in_review", "approved", "fulfilled", "denied"];

function sortSubmissions(subs: Submission[], key: SortKey, dir: SortDir): Submission[] {
  const sorted = [...subs].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "status":
        cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        break;
      case "requester":
        cmp = `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`);
        break;
      case "type":
        cmp = a.request_type.localeCompare(b.request_type);
        break;
      case "event_date": {
        const da = a.event_details?.event_date ?? (a as any).event_date ?? "";
        const db = b.event_details?.event_date ?? (b as any).event_date ?? "";
        cmp = da.localeCompare(db);
        break;
      }
      case "location": {
        const la = a.location?.city ?? (a as any).city ?? "";
        const lb = b.location?.city ?? (b as any).city ?? "";
        cmp = la.localeCompare(lb);
        break;
      }
      case "materials": {
        const ma = a.materials?.reduce((s, m) => s + m.quantity, 0) ?? (a as any).material_count ?? 0;
        const mb = b.materials?.reduce((s, m) => s + m.quantity, 0) ?? (b as any).material_count ?? 0;
        cmp = ma - mb;
        break;
      }
      case "ai_score": {
        const sa = a.ai_classification?.confidence_pct ?? -1;
        const sb = b.ai_classification?.confidence_pct ?? -1;
        cmp = sa - sb;
        break;
      }
      case "submitted":
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

interface HeaderCellProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}

function HeaderCell({ label, sortKey, currentKey, dir, onSort }: HeaderCellProps) {
  const isActive = sortKey === currentKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-4 py-3 text-left text-xs font-semibold text-on-surface-muted cursor-pointer select-none hover:text-on-surface transition-colors whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </div>
    </th>
  );
}

export function RequestTable({ submissions, onSelect }: RequestTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = sortSubmissions(submissions, sortKey, sortDir);

  return (
    <div className="rounded-xl overflow-hidden bg-surface-lowest" style={{ boxShadow: "var(--shadow-ambient)" }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low">
              <HeaderCell label="Status" sortKey="status" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="Requester" sortKey="requester" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="Type" sortKey="type" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="Event Date" sortKey="event_date" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="Location" sortKey="location" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="Materials" sortKey="materials" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="AI Score" sortKey="ai_score" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
              <HeaderCell label="Submitted" sortKey="submitted" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((sub, idx) => {
              const { label: statusLabel, classes: statusClasses } = statusConfig[sub.status];
              const { label: typeLabel, classes: typeClasses } = typeConfig[sub.request_type];
              const materialCount = sub.materials?.reduce((s, m) => s + m.quantity, 0) ?? (sub as any).material_count ?? 0;
              const aiPct = sub.ai_classification?.confidence_pct;
              const hasFlags = (sub.ai_classification?.risk_flags?.length ?? 0) > 0;
              const eventDate = sub.event_details?.event_date ?? (sub as any).event_date;
              const city = sub.location?.city ?? (sub as any).city;
              const state = sub.location?.state ?? (sub as any).state;

              return (
                <tr
                  key={sub.id}
                  onClick={() => onSelect(sub.id)}
                  className={[
                    "cursor-pointer transition-colors hover:bg-surface-dim",
                    idx % 2 === 0 ? "bg-surface-lowest" : "bg-surface-container-low",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-on-surface leading-tight">
                      {sub.first_name} {sub.last_name}
                    </p>
                    {sub.organization && (
                      <p className="text-xs text-on-surface-muted mt-0.5 truncate max-w-[180px]">
                        {sub.organization}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeClasses}`}>
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-muted whitespace-nowrap">
                    {eventDate
                      ? new Date(eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : <span className="text-on-surface-muted/50">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-muted">
                    {city && state ? `${city}, ${state}` : state || <span className="text-on-surface-muted/50">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-muted text-center">
                    {materialCount > 0 ? materialCount : <span className="text-on-surface-muted/50">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {aiPct !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        {hasFlags ? (
                          <ShieldAlert size={14} className="text-red-500 shrink-0" />
                        ) : (
                          <ShieldCheck size={14} className="text-green-600 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            aiPct >= 85 ? "text-green-700" : aiPct >= 65 ? "text-amber-700" : "text-red-700"
                          }`}
                        >
                          {aiPct}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-on-surface-muted/50 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-muted whitespace-nowrap">
                    {formatDistanceToNow(sub.created_at)}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-on-surface-muted">
                  No requests match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
