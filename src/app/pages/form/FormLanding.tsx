import { useNavigate } from "react-router-dom";
import { Upload, ClipboardPaste, ListChecks, MessageCircle, ShieldCheck, Globe, Accessibility } from "lucide-react";

const entryPaths = [
  {
    to: "/form/upload",
    icon: Upload,
    title: "Upload a file",
    description: "Upload a flyer, email, or image",
  },
  {
    to: "/form/paste",
    icon: ClipboardPaste,
    title: "Paste text",
    description: "Copy-paste from an email or message",
  },
  {
    to: "/form/guided",
    icon: ListChecks,
    title: "Guided form",
    description: "Step-by-step, traditional form",
  },
  {
    to: "/form/chat",
    icon: MessageCircle,
    title: "Chat with AI",
    description: "Tell us what you need conversationally",
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Free resources" },
  { icon: Globe, label: "Bilingual (EN/ES)" },
  { icon: Accessibility, label: "ADA accessible" },
];

const categoryChips = [
  "Vehicle & Driveway",
  "Home Safety",
  "Active & Outdoor",
  "Emotional Wellbeing",
  "Prevention",
  "Custom Requests",
];

export function FormLanding() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Hero */}
      <div className="text-center flex flex-col gap-3 max-w-lg">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface">
          Invite us to your event
        </h1>
        <p className="text-base text-on-surface-muted">
          Request free safety materials or community health presentations for your organization, school, or event.
        </p>
      </div>

      {/* Entry path cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {entryPaths.map((path) => {
          const Icon = path.icon;
          return (
            <button
              key={path.to}
              type="button"
              onClick={() => navigate(path.to)}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer text-center min-h-[140px] justify-center"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface font-display">{path.title}</p>
                <p className="text-xs text-on-surface-muted mt-0.5">{path.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-on-surface-muted text-center -mt-4">
        Choose any path &mdash; they all lead to the same place
      </p>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {trustBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-sm text-on-surface-muted"
            >
              <Icon className="w-4 h-4 text-primary" />
              {badge.label}
            </div>
          );
        })}
      </div>

      {/* Materials preview */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-medium text-on-surface-muted uppercase tracking-wide">
          Available resource categories
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {categoryChips.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full bg-surface-container-highest text-xs font-medium text-on-surface"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/form/guided")}
          className="px-8 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors cursor-pointer"
        >
          Get started
        </button>
        <p className="text-xs text-on-surface-muted">
          Takes about 2 minutes. No account needed.
        </p>
      </div>
    </div>
  );
}
