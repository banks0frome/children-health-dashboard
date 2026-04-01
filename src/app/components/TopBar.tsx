import { useLocation, useNavigate } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/requests": "Requests",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function TopBar({ searchQuery, setSearchQuery }: TopBarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[pathname] ?? "Dashboard";

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/requests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-surface shrink-0">
      <h1 className="font-display text-xl font-bold text-on-surface">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            title="Search through event request metadata."
            className="w-64 pl-10 pr-4 py-2 bg-surface-container-high rounded-full text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer" aria-label="Notifications" title="View recent alerts and system updates.">
          <svg className="w-5 h-5 text-on-surface-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full" />
        </button>
      </div>
    </header>
  );
}
