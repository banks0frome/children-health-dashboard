import { useState } from "react";
import type { Submission } from "../lib/types";
import { InlineEdit } from "./InlineEdit";
import { MaterialsTable } from "./MaterialsTable";

interface RequestDetailsProps {
  submission: Submission;
  onUpdate?: (updated: Partial<Submission>) => void;
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function Section({ title, defaultOpen = true, children, icon }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3
          bg-surface-container-low hover:bg-surface-container-high
          transition-colors duration-150 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-on-surface-muted w-4 h-4 flex items-center justify-center">
              {icon}
            </span>
          )}
          <span className="text-sm font-semibold text-on-surface font-display">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-on-surface-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: open ? "9999px" : "0px" }}
      >
        <div className="bg-surface-lowest px-4 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  editable?: boolean;
  onSave?: (v: string) => void;
  multiline?: boolean;
}

function FieldRow({ label, value, editable = false, onSave, multiline = false }: FieldRowProps) {
  return (
    <div className="flex gap-3 py-2">
      <span className="text-xs text-on-surface-muted w-32 shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">
        {editable && onSave ? (
          <InlineEdit value={value} onSave={onSave} multiline={multiline} />
        ) : (
          <span className="text-sm text-on-surface">{value || "—"}</span>
        )}
      </div>
    </div>
  );
}

export function RequestDetails({ submission, onUpdate }: RequestDetailsProps) {
  const [data, setData] = useState<Submission>(submission);

  const patch = <K extends keyof Submission>(key: K, val: Submission[K]) => {
    const updated = { ...data, [key]: val };
    setData(updated);
    onUpdate?.({ [key]: val });
  };

  const ed = data.event_details;
  const loc = data.location;
  const ship = data.shipping;

  const ContactIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  const EventIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );

  const MaterialIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );

  const LocationIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );

  const ShipIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M8.25 18.75 7.5 6H3.75" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Contact Info */}
      <Section title="Contact Info" defaultOpen={true} icon={ContactIcon}>
        <FieldRow
          label="Name"
          value={`${data.first_name} ${data.last_name}`}
          editable={true}
          onSave={v => {
            const [first, ...rest] = v.split(" ");
            patch("first_name", first);
            patch("last_name", rest.join(" "));
          }}
        />
        <FieldRow
          label="Organization"
          value={data.organization ?? ""}
          editable={true}
          onSave={v => patch("organization", v)}
        />
        <FieldRow
          label="Email"
          value={data.email}
          editable={true}
          onSave={v => patch("email", v)}
        />
        <FieldRow
          label="Phone"
          value={data.phone ?? ""}
          editable={true}
          onSave={v => patch("phone", v)}
        />
        {data.notes && (
          <FieldRow
            label="Notes"
            value={data.notes}
            editable={true}
            multiline={true}
            onSave={v => patch("notes", v)}
          />
        )}
      </Section>

      {/* Event Details */}
      {ed && (
        <Section title="Event Details" defaultOpen={true} icon={EventIcon}>
          <FieldRow label="Event Name" value={ed.event_name ?? ""} />
          <FieldRow
            label="Date"
            value={ed.event_date ? new Date(ed.event_date).toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric"
            }) : ""}
          />
          <FieldRow
            label="Time"
            value={ed.start_time && ed.end_time ? `${ed.start_time} – ${ed.end_time}` : ed.start_time ?? ""}
          />
          <FieldRow
            label="Attendance"
            value={ed.estimated_attendance ? `~${ed.estimated_attendance.toLocaleString()} people` : ""}
          />
          {ed.audience_type.length > 0 && (
            <div className="flex gap-3 py-2">
              <span className="text-xs text-on-surface-muted w-32 shrink-0 pt-1">Audience</span>
              <div className="flex flex-wrap gap-1.5">
                {ed.audience_type.map(a => (
                  <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-muted">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ed.topics.length > 0 && (
            <div className="flex gap-3 py-2">
              <span className="text-xs text-on-surface-muted w-32 shrink-0 pt-1">Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {ed.topics.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <FieldRow
            label="Format"
            value={ed.is_virtual ? "Virtual" : "In-Person"}
          />
          <FieldRow
            label="Requester Attending"
            value={ed.requester_attending ? "Yes" : "No"}
          />
        </Section>
      )}

      {/* Materials */}
      {data.materials && data.materials.length > 0 && (
        <Section title="Materials Requested" defaultOpen={true} icon={MaterialIcon}>
          <MaterialsTable
            materials={data.materials}
            onChange={mats => setData(d => ({ ...d, materials: mats }))}
          />
        </Section>
      )}

      {/* Location */}
      {loc && (
        <Section title="Event Location" defaultOpen={false} icon={LocationIcon}>
          <FieldRow label="Address" value={[loc.address_line1, loc.address_line2].filter(Boolean).join(", ")} />
          <FieldRow label="City / State" value={[loc.city, loc.state].filter(Boolean).join(", ")} />
          <FieldRow label="ZIP" value={loc.zip ?? ""} />
          <FieldRow label="County" value={loc.county ?? ""} />
          <FieldRow label="Indoor/Outdoor" value={loc.indoor_outdoor ?? ""} />
          {loc.parking_instructions && (
            <FieldRow label="Parking" value={loc.parking_instructions} />
          )}
        </Section>
      )}

      {/* Shipping */}
      {ship && (
        <Section title="Shipping Address" defaultOpen={false} icon={ShipIcon}>
          <FieldRow label="Address" value={[ship.address_line1, ship.address_line2].filter(Boolean).join(", ")} />
          <FieldRow label="City / State" value={[ship.city, ship.state].filter(Boolean).join(", ")} />
          <FieldRow label="ZIP" value={ship.zip ?? ""} />
          <FieldRow label="County" value={ship.county ?? ""} />
        </Section>
      )}
    </div>
  );
}
