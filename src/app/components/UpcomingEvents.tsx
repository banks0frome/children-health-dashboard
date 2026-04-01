import type { Submission } from "../lib/types";

interface UpcomingEventsProps {
  submissions: Submission[];
  onViewCalendar?: () => void;
  onSelectEvent?: (id: string) => void;
}

const STAFF_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#b80c5a",
  "#3400a5",
  "#dc2626",
];

function getStaffColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return STAFF_COLORS[Math.abs(hash) % STAFF_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function formatEventDate(dateStr: string): { dateLabel: string; dayOfWeek: string; isToday: boolean } {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  const isToday = eventDay.getTime() === today.getTime();
  const dayOfWeek = isToday
    ? "Today"
    : eventDate.toLocaleDateString("en-US", { weekday: "short" });
  const dateLabel = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return { dateLabel, dayOfWeek, isToday };
}

export function UpcomingEvents({ submissions, onViewCalendar, onSelectEvent }: UpcomingEventsProps) {
  return (
    <div
      className="bg-surface-lowest rounded-xl p-5 flex flex-col h-full"
      style={{ boxShadow: "var(--shadow-ambient)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-base text-on-surface">Upcoming Events</h2>
        <span className="text-xs text-on-surface-muted font-medium">Next 7 days</span>
      </div>

      <div className="flex flex-col gap-0 flex-1">
        {submissions.map((submission, idx) => {
          const eventDetails = submission.event_details;
          const location = submission.location;
          const staffName = `${submission.first_name} ${submission.last_name}`;
          const staffColor = getStaffColor(staffName);
          const initials = getInitials(staffName);
          const isLast = idx === submissions.length - 1;

          const eventName = eventDetails?.event_name ?? "Untitled Event";
          const attendees = eventDetails?.estimated_attendance ?? 0;
          const city = location?.city ?? "";
          const locationName = location?.address_line1 ?? submission.organization ?? "";

          const { dateLabel, dayOfWeek, isToday } = formatEventDate(eventDetails!.event_date!);
          const dayNum = dateLabel.split(" ")[1];

          return (
            <div
              key={submission.id}
              onClick={() => onSelectEvent?.(submission.id)}
              title={`View ${eventName} details`}
              className={`flex gap-3 py-3 cursor-pointer group ${!isLast ? "" : ""}`}
            >
              {/* Date pill + vertical line */}
              <div className="flex flex-col items-center shrink-0 w-12">
                <div
                  className={`rounded-xl px-2 py-1.5 text-center w-full ${
                    isToday ? "bg-primary text-white" : "bg-surface-container-high text-on-surface"
                  }`}
                >
                  <p
                    className={`text-xs font-bold leading-none mb-0.5 ${
                      isToday ? "text-white/80" : "text-on-surface-muted"
                    }`}
                  >
                    {dayOfWeek}
                  </p>
                  <p className="text-xs font-semibold leading-none">{dayNum}</p>
                </div>
                {!isLast && <div className="w-px flex-1 mt-1 bg-surface-container-high min-h-3" />}
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0 group-hover:bg-surface-dim rounded-xl px-2 -mx-2 transition-colors pb-1">
                <p className="text-sm font-semibold text-on-surface leading-tight mb-1 truncate">
                  {eventName}
                </p>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg
                    className="w-3 h-3 text-on-surface-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-xs text-on-surface-muted truncate">
                    {locationName}
                    {city ? `, ${city}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: staffColor, fontSize: "8px", fontWeight: 700 }}
                  >
                    {initials}
                  </div>
                  <span className="text-xs text-on-surface-muted">{staffName}</span>
                  {attendees > 0 && (
                    <>
                      <span className="text-on-surface-muted text-xs">·</span>
                      <span className="text-xs text-on-surface-muted">{attendees} attendees</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {submissions.length === 0 && (
          <p className="text-sm text-on-surface-muted text-center py-8">
            No upcoming events in the next 7 days.
          </p>
        )}
      </div>

      <div className="mt-3 pt-2">
        <button
          onClick={() => onViewCalendar?.()}
          title="View all approved event requests organized by date."
          className="text-sm font-semibold text-primary hover:text-primary-container cursor-pointer transition-colors flex items-center gap-1"
        >
          View full calendar
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
