import type { Submission, SubmissionStatus } from "../lib/types";
import { RequestCard } from "./RequestCard";

interface KanbanColumnProps {
  status: SubmissionStatus;
  submissions: Submission[];
  onSelect: (id: string) => void;
  onDrop: (submissionId: string, newStatus: SubmissionStatus) => void;
}

const statusConfig: Record<
  SubmissionStatus,
  { label: string; dotColor: string; headerBg: string; tooltip: string }
> = {
  submitted: {
    label: "Submitted",
    dotColor: "bg-status-submitted",
    headerBg: "bg-stone-100",
    tooltip: "New requests awaiting review",
  },
  in_review: {
    label: "In Review",
    dotColor: "bg-status-in-review",
    headerBg: "bg-amber-50",
    tooltip: "Requests automatically move here after being viewed for 15-30 seconds",
  },
  approved: {
    label: "Approved",
    dotColor: "bg-status-approved",
    headerBg: "bg-green-50",
    tooltip: "Approved requests pending fulfillment",
  },
  fulfilled: {
    label: "Fulfilled",
    dotColor: "bg-status-fulfilled",
    headerBg: "bg-violet-50",
    tooltip: "Completed requests",
  },
  denied: {
    label: "Denied",
    dotColor: "bg-status-denied",
    headerBg: "bg-red-50",
    tooltip: "Denied requests",
  },
};

export function KanbanColumn({ status, submissions, onSelect, onDrop }: KanbanColumnProps) {
  const { label, dotColor, headerBg, tooltip } = statusConfig[status];

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const submissionId = e.dataTransfer.getData("submissionId");
    if (submissionId) {
      onDrop(submissionId, status);
    }
  }

  return (
    <div
      className="flex flex-col min-w-[260px] w-[260px] shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${headerBg}`}
        title={tooltip}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="text-sm font-semibold text-on-surface font-display">{label}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-muted">
          {submissions.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1 min-h-[120px]">
        {submissions.map((sub) => (
          <RequestCard key={sub.id} submission={sub} onSelect={onSelect} />
        ))}
        {submissions.length === 0 && (
          <div className="flex items-center justify-center h-20 rounded-xl bg-surface-container-low text-xs text-on-surface-muted border-2 border-dashed border-outline/40" title="Drag and drop event requests across stages">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
