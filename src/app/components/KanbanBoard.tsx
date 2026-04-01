import type { Submission, SubmissionStatus } from "../lib/types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  submissions: Submission[];
  onSelect: (id: string) => void;
  onStatusChange: (submissionId: string, newStatus: SubmissionStatus) => void;
}

const STATUSES: SubmissionStatus[] = ["submitted", "in_review", "approved", "fulfilled", "denied"];

export function KanbanBoard({ submissions, onSelect, onStatusChange }: KanbanBoardProps) {
  function handleDrop(submissionId: string, newStatus: SubmissionStatus) {
    onStatusChange(submissionId, newStatus);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-0">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          submissions={submissions.filter((s) => s.status === status)}
          onSelect={onSelect}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
