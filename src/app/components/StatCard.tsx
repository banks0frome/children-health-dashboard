import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  accentColor: string;
  icon: ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
}

export function StatCard({ label, value, accentColor, icon, trend }: StatCardProps) {
  const trendColor =
    trend?.direction === "up"
      ? "text-status-approved"
      : trend?.direction === "down"
        ? "text-status-denied"
        : "text-on-surface-muted";

  const trendIcon =
    trend?.direction === "up" ? (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
      </svg>
    ) : trend?.direction === "down" ? (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
      </svg>
    ) : null;

  return (
    <div className="bg-surface-lowest rounded-xl p-5 flex flex-col gap-4 cursor-default hover:bg-surface-dim transition-colors"
      style={{ boxShadow: "var(--shadow-ambient)" }}>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            {trendIcon}
            {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-on-surface leading-none mb-1">{value}</p>
        <p className="text-sm text-on-surface-muted font-medium">{label}</p>
      </div>
    </div>
  );
}
