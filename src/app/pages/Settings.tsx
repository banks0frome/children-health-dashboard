import { useState } from "react";

// ─── Team Members ────────────────────────────────────────────────────────────

interface TeamMember {
  id: number;
  name: string;
  role: string;
  expertise: string[];
  available: boolean;
  email?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    role: "Community Education Director",
    expertise: ["Pediatric Health", "Curriculum Design", "Grant Writing"],
    available: true,
    email: "msantos@childrenshealth.org",
  },
  {
    id: 2,
    name: "James Okonkwo",
    role: "Outreach Coordinator",
    expertise: ["School Programs", "Rural Outreach", "Bilingual (Spanish)"],
    available: true,
    email: "jokonkwo@childrenshealth.org",
  },
  {
    id: 3,
    name: "Priya Mehta",
    role: "Health Educator",
    expertise: ["Nutrition", "Diabetes Prevention", "Workshop Facilitation"],
    available: false,
    email: "pmehta@childrenshealth.org",
  },
  {
    id: 4,
    name: "Tyler Reeves",
    role: "Logistics & Materials Specialist",
    expertise: ["Supply Chain", "Print Production", "Inventory Management"],
    available: true,
    email: "treeves@childrenshealth.org",
  },
  {
    id: 5,
    name: "Cassandra Lin",
    role: "Program Evaluator",
    expertise: ["Data Analysis", "Survey Design", "Community Research"],
    available: true,
    email: "clin@childrenshealth.org",
  },
];

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: available ? "#dcfce7" : "#f3f4f6",
        color: available ? "#15803d" : "#6b7280",
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: available ? "#16a34a" : "#9ca3af" }}
      />
      {available ? "Available" : "Unavailable"}
    </span>
  );
}

function ExpertiseTag({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: "#f0eafc", color: "#3400a5" }}
    >
      {label}
    </span>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div
      className="bg-surface-lowest rounded-xl p-5 flex items-start gap-4"
      style={{ boxShadow: "0 2px 8px rgba(23,8,92,0.05)" }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: "#4a00e2", color: "#ffffff" }}
      >
        {member.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span className="font-display font-bold text-sm" style={{ color: "#17085c" }}>
            {member.name}
          </span>
          <AvailabilityBadge available={member.available} />
        </div>
        <p className="text-xs mb-2" style={{ color: "#534878" }}>
          {member.role}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {member.expertise.map((tag) => (
            <ExpertiseTag key={tag} label={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Member Form ─────────────────────────────────────────────────────────

function AddMemberForm({ onSave, onCancel }: { onSave: (member: TeamMember) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    onSave({
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || "Team Member",
      expertise: [],
      available: true,
    });
  }

  return (
    <div
      className="bg-surface-lowest rounded-xl p-5"
      style={{ boxShadow: "0 2px 8px rgba(23,8,92,0.05)", border: "2px solid #f0eafc" }}
    >
      <h3 className="font-display font-bold text-sm mb-4" style={{ color: "#17085c" }}>
        Add New Member
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#534878" }}>
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: "#f6f1ff", color: "#17085c", border: "none", outline: "none" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#534878" }}>
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. jdoe@childrenshealth.org"
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: "#f6f1ff", color: "#17085c", border: "none", outline: "none" }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#534878" }}>
            Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Health Educator"
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: "#f6f1ff", color: "#17085c", border: "none", outline: "none" }}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#3400a5", color: "#ffffff" }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#f0eafc", color: "#534878" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Preferences ────────────────────────────────────────────────

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const NOTIFICATION_PREFS: NotificationPref[] = [
  {
    id: "new_submission",
    label: "New Submissions",
    description: "Get notified when a new request is submitted",
    defaultOn: true,
  },
  {
    id: "ai_flagged",
    label: "AI-Flagged Items",
    description: "Alert when AI marks a submission for human review",
    defaultOn: true,
  },
  {
    id: "overdue_review",
    label: "Overdue Reviews",
    description: "Daily digest for requests pending over 48 hours",
    defaultOn: true,
  },
  {
    id: "weekly_summary",
    label: "Weekly Summary",
    description: "Monday morning report with key metrics",
    defaultOn: false,
  },
  {
    id: "material_shortage",
    label: "Material Shortages",
    description: "Alert when requested materials are low in inventory",
    defaultOn: false,
  },
];

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
      style={{ backgroundColor: enabled ? "#3400a5" : "#d1d5db" }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
        style={{
          margin: "2px",
          transform: enabled ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

function NotificationRow({ pref }: { pref: NotificationPref }) {
  const [enabled, setEnabled] = useState(pref.defaultOn);

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium font-display" style={{ color: "#17085c" }}>
          {pref.label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#534878" }}>
          {pref.description}
        </p>
      </div>
      <Toggle enabled={enabled} onChange={setEnabled} />
    </div>
  );
}

// ─── Service Area ─────────────────────────────────────────────────────────────

interface County {
  name: string;
  state: string;
  active: boolean;
}

const INITIAL_COUNTIES: County[] = [
  { name: "Salt Lake", state: "UT", active: true },
  { name: "Utah", state: "UT", active: true },
  { name: "Davis", state: "UT", active: true },
  { name: "Weber", state: "UT", active: true },
  { name: "Washington", state: "UT", active: true },
  { name: "Cache", state: "UT", active: false },
  { name: "Iron", state: "UT", active: false },
  { name: "Tooele", state: "UT", active: false },
  { name: "Summit", state: "UT", active: true },
  { name: "Box Elder", state: "UT", active: false },
];

function CountyCheckbox({
  county,
  onChange,
}: {
  county: County;
  onChange: (active: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={county.active}
      onClick={() => onChange(!county.active)}
      className="flex items-center gap-3 cursor-pointer group py-2.5 w-full text-left"
    >
      <span
        className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
        style={{
          backgroundColor: county.active ? "#3400a5" : "transparent",
          border: `2px solid ${county.active ? "#3400a5" : "#c9c3d9"}`,
          transition: "background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        {county.active && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="text-sm" style={{ color: "#17085c" }}>
        {county.name} County
      </span>
      <span
        className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: "#f0eafc", color: "#534878" }}
      >
        {county.state}
      </span>
    </button>
  );
}

function ServiceAreaSection() {
  const [counties, setCounties] = useState<County[]>(INITIAL_COUNTIES);

  const activeCount = counties.filter((c) => c.active).length;

  function toggle(index: number, active: boolean) {
    setCounties((prev) => prev.map((c, i) => (i === index ? { ...c, active } : c)));
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-lg" style={{ color: "#17085c" }}>
            Service Area Configuration
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#534878" }}>
            {activeCount} of {counties.length} counties active
          </p>
        </div>
      </div>

      <div className="bg-surface-lowest rounded-xl px-5 divide-y divide-[#f0eafc]">
        {counties.map((county, i) => (
          <CountyCheckbox key={county.name} county={county} onChange={(val) => toggle(i, val)} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Settings() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [showAddForm, setShowAddForm] = useState(false);

  function handleAddMember(member: TeamMember) {
    setMembers((prev) => [...prev, member]);
    setShowAddForm(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: "#17085c" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#534878" }}>
          Manage your team, notifications, and service configuration
        </p>
      </div>

      {/* Team Members */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: "#17085c" }}>
              Team Members
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#534878" }}>
              {members.filter((m) => m.available).length} of {members.length} available
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#3400a5", color: "#ffffff" }}
          >
            Add Member
          </button>
        </div>

        <div className="space-y-3">
          {showAddForm && (
            <AddMemberForm onSave={handleAddMember} onCancel={() => setShowAddForm(false)} />
          )}
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* Notification Preferences */}
      <section>
        <div className="mb-4">
          <h2 className="font-display font-bold text-lg" style={{ color: "#17085c" }}>
            Notification Preferences
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#534878" }}>
            Control which alerts you receive for this dashboard
          </p>
        </div>

        <div
          className="bg-surface-lowest rounded-xl px-5"
          style={{ boxShadow: "0 2px 8px rgba(23,8,92,0.05)" }}
        >
          {NOTIFICATION_PREFS.map((pref, i) => (
            <div
              key={pref.id}
              style={
                i < NOTIFICATION_PREFS.length - 1
                  ? { borderBottom: "1px solid #f0eafc" }
                  : undefined
              }
            >
              <NotificationRow pref={pref} />
            </div>
          ))}
        </div>
      </section>

      {/* Service Area */}
      <ServiceAreaSection />
    </div>
  );
}
