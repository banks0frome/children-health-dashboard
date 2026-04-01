import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { ActionItemList } from "../components/ActionItemList";
import { UpcomingEvents } from "../components/UpcomingEvents";
import { ChatBot } from "../components/ChatBot";
import { api } from "../lib/api";
import type { StatsOverview, Submission } from "../lib/types";

const STAT_ICONS = [
  // Pending Review
  (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  // Events This Week
  (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  ),
  // Auto-Approved Today
  (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
      />
    </svg>
  ),
  // Avg Response Time
  (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    </svg>
  ),
];

function buildStats(overview: StatsOverview) {
  return [
    {
      label: "Pending Review",
      value: overview.pending_review,
      accentColor: "#b80c5a",
      trend: { direction: "up" as const, label: "Needs attention" },
      icon: STAT_ICONS[0],
    },
    {
      label: "Events This Week",
      value: overview.events_this_week,
      accentColor: "#16a34a",
      trend: { direction: "neutral" as const, label: "This week" },
      icon: STAT_ICONS[1],
    },
    {
      label: "Auto-Approved Today",
      value: overview.auto_approved_today,
      accentColor: "#3400a5",
      trend: { direction: "neutral" as const, label: "Today" },
      icon: STAT_ICONS[2],
    },
    {
      label: "Avg Response Time",
      value: `${overview.avg_response_hours.toFixed(1)}h`,
      accentColor: "#d97706",
      trend: { direction: "down" as const, label: "Avg hours" },
      icon: STAT_ICONS[3],
    },
  ];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function filterUpcomingEvents(submissions: Submission[]): Submission[] {
  const now = new Date();
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return submissions
    .filter((s) => {
      const eventDate = s.event_details?.event_date;
      if (!eventDate) return false;
      const d = new Date(eventDate);
      return d >= now && d <= sevenDaysOut;
    })
    .sort((a, b) => {
      const da = new Date(a.event_details!.event_date!).getTime();
      const db = new Date(b.event_details!.event_date!).getTime();
      return da - db;
    });
}

function StatCardSkeleton() {
  return (
    <div className="bg-surface-lowest rounded-xl p-5 flex flex-col gap-4" style={{ boxShadow: "var(--shadow-ambient)" }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high animate-pulse" />
        <div className="w-20 h-4 rounded-full bg-surface-container-high animate-pulse" />
      </div>
      <div>
        <div className="w-16 h-8 rounded-lg bg-surface-container-high animate-pulse mb-1" />
        <div className="w-28 h-3 rounded-full bg-surface-container-high animate-pulse" />
      </div>
    </div>
  );
}

function ActionItemSkeleton() {
  return (
    <div className="bg-surface-lowest rounded-xl p-5" style={{ boxShadow: "var(--shadow-ambient)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-40 h-5 rounded-full bg-surface-container-high animate-pulse" />
        <div className="w-20 h-5 rounded-full bg-surface-container-high animate-pulse" />
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="w-9 h-9 rounded-full bg-surface-container-high animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="w-32 h-4 rounded-full bg-surface-container-high animate-pulse mb-2" />
              <div className="w-48 h-3 rounded-full bg-surface-container-high animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="w-20 h-5 rounded-full bg-surface-container-high animate-pulse" />
              <div className="w-12 h-3 rounded-full bg-surface-container-high animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingEventsSkeleton() {
  return (
    <div className="bg-surface-lowest rounded-xl p-5 h-full" style={{ boxShadow: "var(--shadow-ambient)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-36 h-5 rounded-full bg-surface-container-high animate-pulse" />
        <div className="w-16 h-3 rounded-full bg-surface-container-high animate-pulse" />
      </div>
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high animate-pulse shrink-0" />
            <div className="flex-1">
              <div className="w-36 h-4 rounded-full bg-surface-container-high animate-pulse mb-2" />
              <div className="w-28 h-3 rounded-full bg-surface-container-high animate-pulse mb-1.5" />
              <div className="w-24 h-3 rounded-full bg-surface-container-high animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const dateStr = getFormattedDate();

  const [statsOverview, setStatsOverview] = useState<StatsOverview | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [upcomingSubmissions, setUpcomingSubmissions] = useState<Submission[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    api
      .getStatsOverview()
      .then(setStatsOverview)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    Promise.all([
      api.listSubmissions({ status: "submitted" }),
      api.listSubmissions({ status: "approved" }),
    ])
      .then(([pendingRes, approvedRes]) => {
        setPendingSubmissions(pendingRes.submissions);
        setUpcomingSubmissions(filterUpcomingEvents(approvedRes.submissions));
      })
      .catch(console.error)
      .finally(() => setLoadingSubmissions(false));
  }, []);

  const stats = statsOverview ? buildStats(statsOverview) : null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface leading-tight">
            {greeting}, Admin
          </h1>
          <p className="text-sm text-on-surface-muted mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications button with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-colors cursor-pointer"
              title="View recent alerts and system updates."
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              Notifications
              <span className="w-5 h-5 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center leading-none">
                {loadingStats ? "…" : statsOverview?.pending_review ?? 0}
              </span>
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 top-full mt-2 w-80 bg-surface-lowest rounded-xl p-4 z-50 flex flex-col gap-2"
                style={{ boxShadow: "var(--shadow-ambient)" }}
              >
                <p className="text-xs font-bold text-on-surface-muted uppercase tracking-wide mb-1">
                  Recent Pending
                </p>
                {pendingSubmissions.length === 0 ? (
                  <p className="text-sm text-on-surface-muted py-2">No pending submissions.</p>
                ) : (
                  pendingSubmissions.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(`/requests?open=${s.id}`);
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-dim transition-colors cursor-pointer text-left w-full"
                    >
                      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-xs font-bold text-on-surface-muted">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {s.first_name} {s.last_name}
                        </p>
                        <p className="text-xs text-on-surface-muted truncate">
                          {s.organization ?? s.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
                {pendingSubmissions.length > 5 && (
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/requests");
                    }}
                    className="text-xs font-semibold text-primary mt-1 cursor-pointer hover:text-primary-container transition-colors"
                  >
                    View all {pendingSubmissions.length} pending
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/requests")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-container transition-colors cursor-pointer"
            title="Navigate to requests page."
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Request
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {loadingStats
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : stats?.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                accentColor={stat.accentColor}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* Left: 60% — Action items */}
        <div className="flex-[3] min-w-0">
          {loadingSubmissions ? (
            <ActionItemSkeleton />
          ) : (
            <ActionItemList
              submissions={pendingSubmissions}
              onSelect={(id) => navigate(`/requests?open=${id}`)}
            />
          )}
        </div>
        {/* Right: 40% — Upcoming events */}
        <div className="flex-[2] min-w-0">
          {loadingSubmissions ? (
            <UpcomingEventsSkeleton />
          ) : (
            <UpcomingEvents
              submissions={upcomingSubmissions}
              onViewCalendar={() => navigate("/requests?view=calendar")}
              onSelectEvent={(id) => navigate(`/requests?open=${id}`)}
            />
          )}
        </div>
      </div>

      {/* Bottom: AI Chatbot */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-display font-bold text-base text-on-surface">AI Assistant</h2>
          <span className="text-xs text-on-surface-muted font-medium px-2.5 py-0.5 rounded-full bg-surface-container-high" title="Chat with the database using semantic queries. Your session history is maintained across pages.">
            RAG-powered
          </span>
        </div>
        <ChatBot />
      </div>
    </div>
  );
}
