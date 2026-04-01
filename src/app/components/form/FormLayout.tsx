import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Heart, Globe, LayoutDashboard, Upload, ClipboardPaste, ListChecks, MessageCircle } from "lucide-react";

const navTabs = [
  { to: "/form", label: "Home", exact: true },
  { to: "/form/upload", label: "Upload", icon: Upload },
  { to: "/form/paste", label: "Paste", icon: ClipboardPaste },
  { to: "/form/guided", label: "Guided", icon: ListChecks },
  { to: "/form/chat", label: "Chat", icon: MessageCircle },
];

export function FormLayout() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const location = useLocation();

  const isActive = (tab: typeof navTabs[number]) =>
    tab.exact ? location.pathname === tab.to : location.pathname.startsWith(tab.to);

  // Show tab nav on all form pages except success
  const showTabs = location.pathname.startsWith("/form") && !location.pathname.includes("success");

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-full focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Top nav */}
      <header className="w-full bg-surface-container-low px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link to="/form" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface leading-tight">
                Children's Health
              </p>
              <p className="text-xs text-on-surface-muted">Community Resources</p>
            </div>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Admin link */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-muted hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Admin Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            {/* Language toggle */}
            <div className="flex items-center gap-1 bg-surface-container rounded-full p-1" role="radiogroup" aria-label="Language selection">
              <button
                type="button"
                role="radio"
                aria-checked={lang === "en"}
                onClick={() => setLang("en")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  lang === "en"
                    ? "bg-primary text-white"
                    : "text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                EN
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={lang === "es"}
                onClick={() => setLang("es")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  lang === "es"
                    ? "bg-primary text-white"
                    : "text-on-surface-muted hover:bg-surface-container-high"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                ES
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      {showTabs && (
        <nav className="w-full bg-surface-lowest px-6 py-2" aria-label="Form entry paths">
          <div className="max-w-3xl mx-auto flex items-center gap-1 overflow-x-auto">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? "bg-primary text-white"
                      : "text-on-surface-muted hover:bg-surface-container-high"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main content */}
      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        <Outlet context={{ lang }} />
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low px-6 py-4 mt-auto">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-on-surface-muted">
            Intermountain Children's Health &middot; Free community resources
          </p>
        </div>
      </footer>
    </div>
  );
}
