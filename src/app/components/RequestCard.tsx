import type { Submission } from "../lib/types";
import { formatDistanceToNow } from "../lib/dateUtils";

interface RequestCardProps {
  submission: Submission;
  onSelect: (id: string) => void;
}

const typeColors: Record<string, string> = {
  mailing: "bg-blue-100 text-blue-700",
  event: "bg-green-100 text-green-700",
  both: "bg-purple-100 text-purple-700",
};

const typeLabels: Record<string, string> = {
  mailing: "Mailing",
  event: "Event",
  both: "Event + Mail",
};

function confidenceColor(pct: number | undefined): string {
  if (pct === undefined) return "bg-surface-container-high text-on-surface-muted";
  if (pct >= 85) return "bg-green-100 text-green-700";
  if (pct >= 65) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function confidenceLabel(pct: number | undefined): string {
  if (pct === undefined) return "No AI";
  return `${pct}% confidence`;
}

export function RequestCard({ submission, onSelect }: RequestCardProps) {
  const {
    id,
    first_name,
    last_name,
    organization,
    request_type,
    event_details,
    materials,
    ai_classification,
    created_at,
  } = submission;

  const materialCount = materials?.reduce((sum, m) => sum + m.quantity, 0) ?? 0;
  const eventDate = event_details?.event_date;
  const aiPct = ai_classification?.confidence_pct;
  const hasFlags = (ai_classification?.risk_flags?.length ?? 0) > 0;

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("submissionId", id);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(id)}
      className="bg-surface-lowest rounded-xl p-4 cursor-pointer hover:bg-surface-dim transition-colors duration-150 active:scale-[0.99] select-none"
      style={{ boxShadow: "var(--shadow-ambient)" }}
    >
      {/* Top row: type badge + flag */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColors[request_type]}`}
        >
          {typeLabels[request_type]}
        </span>
        {hasFlags && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            ⚑ Flagged
          </span>
        )}
      </div>

      {/* Name + org */}
      <p className="font-semibold text-on-surface text-sm leading-snug">
        {first_name} {last_name}
      </p>
      {organization && (
        <p className="text-xs text-on-surface-muted mt-0.5 truncate">{organization}</p>
      )}

      {/* Event date or mailing label */}
      <p className="text-xs text-on-surface-muted mt-2">
        {eventDate
          ? `Event: ${new Date(eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
          : "Mailing request"}
      </p>

      {/* Bottom row: AI chip + material count + time */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor(aiPct)}`}>
          {confidenceLabel(aiPct)}
        </span>
        <div className="flex items-center gap-2 text-xs text-on-surface-muted">
          {materialCount > 0 && <span>{materialCount} items</span>}
          <span>{formatDistanceToNow(created_at)}</span>
        </div>
      </div>
    </div>
  );
}
