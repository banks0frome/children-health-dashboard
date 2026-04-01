import { useState } from "react";
import type { Submission } from "../lib/types";
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from "../lib/dateUtils";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";

interface CalendarViewProps {
  submissions: Submission[];
  onSelect: (id: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const typeColors: Record<string, string> = {
  mailing: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  event: "bg-green-100 text-green-700 hover:bg-green-200",
  both: "bg-purple-100 text-purple-700 hover:bg-purple-200",
};

export function CalendarView({ submissions, onSelect }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Map event submissions to their event date
  const eventSubmissions = submissions.filter(
    (s) => (s.request_type === "event" || s.request_type === "both") && s.event_details?.event_date
  );

  const mailingSubmissions = submissions.filter((s) => s.request_type === "mailing");

  function getSubmissionsForDay(day: number): Submission[] {
    const date = new Date(viewYear, viewMonth, day);
    return eventSubmissions.filter((s) => {
      const ed = new Date(s.event_details!.event_date!);
      return isSameDay(ed, date);
    });
  }

  // Build grid cells: leading empty + day cells
  const totalCells = firstDay + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="flex gap-4 h-full">
      {/* Main calendar */}
      <div className="flex-1 min-w-0 bg-surface-lowest rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-ambient)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low">
          <div>
            <h2 className="text-base font-semibold font-display text-on-surface">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <p className="text-xs text-on-surface-muted mt-0.5">Approved Events Calendar</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer text-on-surface-muted hover:text-on-surface"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
              className="px-3 py-1 text-xs font-medium rounded-full bg-surface-container-high hover:bg-primary hover:text-white transition-colors cursor-pointer text-on-surface-muted"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer text-on-surface-muted hover:text-on-surface"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-surface-container-low">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-on-surface-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${rows}, minmax(100px, 1fr))` }}>
          {Array.from({ length: rows * 7 }).map((_, idx) => {
            const dayNum = idx - firstDay + 1;
            const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
            const isToday =
              isValidDay &&
              dayNum === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const daySubs = isValidDay ? getSubmissionsForDay(dayNum) : [];

            return (
              <div
                key={idx}
                className={[
                  "min-h-[100px] p-2 transition-colors",
                  isValidDay ? "bg-surface-lowest" : "bg-surface-container-low/40",
                  idx % 14 >= 7 ? "" : "",
                ].join(" ")}
              >
                {isValidDay && (
                  <>
                    <div className="flex items-center justify-end mb-1.5">
                      <span
                        className={[
                          "w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full",
                          isToday
                            ? "bg-primary text-white ring-2 ring-primary ring-offset-1"
                            : "text-on-surface-muted hover:bg-surface-container-high",
                        ].join(" ")}
                      >
                        {dayNum}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {daySubs.slice(0, 3).map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => onSelect(sub.id)}
                          className={[
                            "w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors",
                            typeColors[sub.request_type],
                          ].join(" ")}
                          title={`${sub.first_name} ${sub.last_name} — ${sub.event_details?.event_name ?? "Event"}`}
                        >
                          {sub.first_name} {sub.last_name}
                        </button>
                      ))}
                      {daySubs.length > 3 && (
                        <span className="text-[10px] text-on-surface-muted px-1">
                          +{daySubs.length - 3} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mailing queue sidebar */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <div className="bg-surface-lowest rounded-xl p-4" style={{ boxShadow: "var(--shadow-ambient)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail size={14} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-display text-on-surface">Mailing Queue</h3>
              <p className="text-xs text-on-surface-muted">{mailingSubmissions.length} requests</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {mailingSubmissions.length === 0 && (
              <p className="text-xs text-on-surface-muted text-center py-4">No mailing requests</p>
            )}
            {mailingSubmissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className="w-full text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-dim transition-colors cursor-pointer"
              >
                <p className="text-xs font-semibold text-on-surface leading-tight">
                  {sub.first_name} {sub.last_name}
                </p>
                {sub.organization && (
                  <p className="text-[10px] text-on-surface-muted mt-0.5 truncate">{sub.organization}</p>
                )}
                <div className="flex items-center justify-between mt-1.5">
                  <span
                    className={[
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      sub.status === "submitted"
                        ? "bg-stone-100 text-stone-600"
                        : sub.status === "in_review"
                        ? "bg-amber-100 text-amber-700"
                        : sub.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : sub.status === "fulfilled"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-red-100 text-red-700",
                    ].join(" ")}
                  >
                    {sub.status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-on-surface-muted">
                    {sub.materials?.reduce((s, m) => s + m.quantity, 0) ?? 0} items
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-surface-lowest rounded-xl p-4" style={{ boxShadow: "var(--shadow-ambient)" }}>
          <h3 className="text-xs font-semibold text-on-surface-muted mb-2 uppercase tracking-wide">Legend</h3>
          <div className="flex flex-col gap-1.5">
            {[
              { type: "event", label: "Event" },
              { type: "both", label: "Event + Mail" },
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${typeColors[type].split(" ")[0]}`} />
                <span className="text-xs text-on-surface-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
