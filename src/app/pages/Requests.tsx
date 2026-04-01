import { useState, useEffect, useCallback } from "react";
import type { Submission, SubmissionStatus } from "../lib/types";
import { api } from "../lib/api";
import { ViewToggle, type ViewType } from "../components/ViewToggle";
import { FilterChips, StatusFilterChips, type FilterType, type StatusFilterType } from "../components/FilterChips";
import { KanbanBoard } from "../components/KanbanBoard";
import { RequestTable } from "../components/RequestTable";
import { CalendarView } from "../components/CalendarView";
import { SlideOverPanel } from "../components/SlideOverPanel";

// ─── Page Component ───────────────────────────────────────────────────────────

interface RequestsProps {
  onSelectSubmission?: (id: string) => void;
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") ?? undefined,
    view: (params.get("view") as ViewType) ?? undefined,
    open: params.get("open") ?? undefined,
  };
}

export function Requests({ onSelectSubmission }: RequestsProps) {
  const urlParams = getUrlParams();

  const [activeView, setActiveView] = useState<ViewType>(
    urlParams.view && ["kanban", "table", "calendar"].includes(urlParams.view)
      ? urlParams.view
      : "kanban"
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilterType>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    urlParams.open ?? null
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = {};
    const searchParam = getUrlParams().search;
    if (searchParam) params.search = searchParam;

    return api.listSubmissions(Object.keys(params).length > 0 ? params : undefined)
      .then(res => {
        setSubmissions(res.submissions);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Failed to load submissions");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const refreshSubmissions = useCallback(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  function handleSelectSubmission(id: string) {
    setSelectedSubmissionId(id);
    onSelectSubmission?.(id);
  }

  function handleStatusChange(submissionId: string, newStatus: SubmissionStatus) {
    setSubmissions(prev =>
      prev.map(s => (s.id === submissionId ? { ...s, status: newStatus } : s))
    );
    api.updateSubmission(submissionId, { status: newStatus }).catch(() => {
      // Revert on failure
      fetchSubmissions();
    });
  }

  const filteredSubmissions = submissions.filter((s) => {
    // Type filter
    if (activeFilter === "flagged") {
      if ((s.ai_classification?.risk_flags?.length ?? 0) === 0) return false;
    } else if (activeFilter === "both") {
      if (s.request_type !== "both") return false;
    } else if (activeFilter !== "all") {
      if (s.request_type !== activeFilter) return false;
    }

    // Status filter
    if (activeStatusFilter !== "all") {
      if (s.status !== activeStatusFilter) return false;
    }

    // Date filter
    if (dateRange !== "all") {
      const now = new Date();
      const eventDate = s.event_details?.event_date;
      const createdDate = new Date(s.created_at);
      const compareDate = eventDate ? new Date(eventDate) : createdDate;

      if (dateRange === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (compareDate < today) return false;
      } else if (dateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (compareDate < weekAgo) return false;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (compareDate < monthAgo) return false;
      }
    }

    return true;
  });

  // Calendar only shows approved/fulfilled submissions
  const calendarSubmissions = filteredSubmissions.filter(
    s => s.status === "approved" || s.status === "fulfilled"
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 min-h-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="h-8 w-40 bg-surface-container-highest rounded-xl animate-pulse" />
            <div className="h-4 w-28 bg-surface-container-highest rounded-full animate-pulse mt-2" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-20 bg-surface-container-highest rounded-full animate-pulse" />
          ))}
        </div>
        <div className="flex-1 flex gap-4 min-h-0">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 flex flex-col gap-3">
              <div className="h-6 bg-surface-container-highest rounded-lg animate-pulse" />
              {[1, 2].map(j => (
                <div key={j} className="h-24 bg-surface-container-highest rounded-xl animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full gap-4 min-h-0">
        <div>
          <h1 className="text-2xl font-bold font-display text-on-surface">Requests</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-status-denied" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-sm text-on-surface-muted">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-primary hover:opacity-80 cursor-pointer transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-on-surface">Requests</h1>
          <p className="text-sm text-on-surface-muted mt-0.5">
            {submissions.length} total &middot; {filteredSubmissions.length} shown
          </p>
        </div>
        <ViewToggle activeView={activeView} onChange={setActiveView} />
      </div>

      {/* Filter chips */}
      <div className="flex flex-col gap-2">
        <FilterChips
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          submissions={submissions}
        />
        <StatusFilterChips
          activeFilter={activeStatusFilter}
          onChange={setActiveStatusFilter}
          submissions={submissions}
        />
        {/* Date range filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-on-surface-muted">Date:</span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setDateRange(id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                dateRange === id
                  ? "bg-primary text-white"
                  : "bg-surface-container-high text-on-surface-muted hover:bg-surface-container-highest"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active view */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === "kanban" && (
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <KanbanBoard
              submissions={filteredSubmissions}
              onSelect={handleSelectSubmission}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
        {activeView === "table" && (
          <div className="h-full overflow-y-auto">
            <RequestTable submissions={filteredSubmissions} onSelect={handleSelectSubmission} />
          </div>
        )}
        {activeView === "calendar" && (
          <div className="h-full overflow-y-auto">
            <CalendarView submissions={calendarSubmissions} onSelect={handleSelectSubmission} />
          </div>
        )}
      </div>

      {/* Slide-over detail panel */}
      <SlideOverPanel
        isOpen={selectedSubmissionId !== null}
        onClose={() => setSelectedSubmissionId(null)}
        submissionId={selectedSubmissionId}
        onAction={refreshSubmissions}
      />
    </div>
  );
}
