import { LayoutGrid, Table2, CalendarDays } from "lucide-react";

export type ViewType = "kanban" | "table" | "calendar";

interface ViewToggleProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

const viewTitles: Record<ViewType, string> = {
  kanban: "Drag and drop view across stages",
  table: "Filter and sort columns including Event Date, Location, and Materials.",
  calendar: "View all approved event requests organized by date.",
};

const views: { id: ViewType; label: string; Icon: React.ElementType }[] = [
  { id: "kanban", label: "Kanban", Icon: LayoutGrid },
  { id: "table", label: "Table", Icon: Table2 },
  { id: "calendar", label: "Calendar", Icon: CalendarDays },
];

export function ViewToggle({ activeView, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-surface-container-high rounded-full p-1 gap-1">
      {views.map(({ id, label, Icon }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={viewTitles[id]}
            className={[
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer select-none",
              isActive
                ? "bg-primary text-white"
                : "text-on-surface-muted hover:text-on-surface hover:bg-surface-container-highest",
            ].join(" ")}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
