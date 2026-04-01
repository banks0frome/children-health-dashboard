import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { FormField } from "../../components/form/FormField";
import { MaterialSelector } from "../../components/form/MaterialSelector";
import type { MaterialSelection, ExtractedFormData } from "../../lib/formTypes";
import { US_STATES, AUDIENCE_OPTIONS, TOPIC_OPTIONS } from "../../lib/formTypes";

export function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { extracted?: ExtractedFormData; source?: string } | undefined;

  const extracted = state?.extracted || {};

  // Build initial material selection from extracted data
  const initialMaterials: MaterialSelection = {};
  if (extracted.materials) {
    for (const m of extracted.materials) {
      initialMaterials[m.key] = { selected: true, quantity: m.quantity || 25 };
    }
  }

  // Editable form state pre-filled from extraction
  const [requestType, setRequestType] = useState(extracted.requestType || "");
  const [firstName, setFirstName] = useState(extracted.firstName || "");
  const [lastName, setLastName] = useState(extracted.lastName || "");
  const [organization, setOrganization] = useState(extracted.organization || "");
  const [email, setEmail] = useState(extracted.email || "");
  const [phone, setPhone] = useState(extracted.phone || "");
  const [materials, setMaterials] = useState<MaterialSelection>(initialMaterials);
  const [eventDate, setEventDate] = useState(extracted.eventDate || "");
  const [estimatedAttendance, setEstimatedAttendance] = useState(extracted.estimatedAttendance || "");
  const [audienceTypes, setAudienceTypes] = useState<string[]>(extracted.audienceTypes || []);
  const [topics, setTopics] = useState<string[]>(extracted.topics || []);
  const [address, setAddress] = useState(extracted.address || "");
  const [city, setCity] = useState(extracted.city || "");
  const [addressState, setAddressState] = useState(extracted.state || "");
  const [zip, setZip] = useState(extracted.zip || "");
  const [notes, setNotes] = useState(extracted.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const confidence = extracted.confidence || {};

  function isLowConfidence(field: string) {
    return confidence[field] !== undefined && confidence[field] < 0.7;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Required";
    if (!lastName.trim()) errs.lastName = "Required";
    if (!organization.trim()) errs.organization = "Required";
    if (!email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);

    const materialsList = Object.entries(materials)
      .filter(([, v]) => v.selected)
      .map(([key, v]) => ({ key, quantity: v.quantity, customText: v.customText }));

    try {
      await fetch("/api/form/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_method: state?.source || "paste",
          request_type: requestType || "mailing",
          first_name: firstName,
          last_name: lastName,
          organization,
          email,
          phone: phone || null,
          notes: notes || null,
          materials: materialsList,
          event_details: requestType === "event" || requestType === "both" ? {
            event_date: eventDate || null,
            estimated_attendance: estimatedAttendance ? parseInt(estimatedAttendance) : null,
            audience_type: audienceTypes,
            topics,
          } : null,
          shipping: {
            address_line1: address || null,
            city: city || null,
            state: addressState || null,
            zip: zip || null,
          },
        }),
      });
      navigate("/form/success", { state: { email, requestType } });
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Review extracted details</h1>
        <p className="text-sm text-on-surface-muted mt-1">
          We extracted the information below. Please review and fill in anything we missed.
        </p>
      </div>

      {/* Request type */}
      <Section title="Request Type">
        <div className="flex gap-2">
          {(["mailing", "event", "both"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRequestType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors cursor-pointer ${
                requestType === t
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      {/* Event details (if applicable) */}
      {(requestType === "event" || requestType === "both") && (
        <Section title="Event Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ConfidenceWrapper low={isLowConfidence("eventDate")}>
              <FormField
                label="Event date"
                name="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate((e.target as HTMLInputElement).value)}
              />
            </ConfidenceWrapper>
            <ConfidenceWrapper low={isLowConfidence("estimatedAttendance")}>
              <FormField
                label="Estimated attendance"
                name="estimatedAttendance"
                type="number"
                value={estimatedAttendance}
                onChange={(e) => setEstimatedAttendance((e.target as HTMLInputElement).value)}
              />
            </ConfidenceWrapper>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-sm font-medium text-on-surface">Audience</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((opt) => {
                const selected = audienceTypes.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setAudienceTypes(selected ? audienceTypes.filter((a) => a !== opt) : [...audienceTypes, opt])
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      selected ? "bg-primary text-white" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-sm font-medium text-on-surface">Topics</p>
            <div className="flex flex-wrap gap-2">
              {TOPIC_OPTIONS.map((opt) => {
                const selected = topics.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setTopics(selected ? topics.filter((t) => t !== opt) : [...topics, opt])
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      selected ? "bg-primary text-white" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {/* Materials */}
      <Section title="Materials">
        <MaterialSelector value={materials} onChange={setMaterials} />
      </Section>

      {/* Address / Shipping */}
      <Section title="Address">
        <ConfidenceWrapper low={isLowConfidence("address")}>
          <FormField
            label="Street address"
            name="address"
            value={address}
            onChange={(e) => setAddress((e.target as HTMLInputElement).value)}
          />
        </ConfidenceWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <FormField
            label="City"
            name="city"
            value={city}
            onChange={(e) => setCity((e.target as HTMLInputElement).value)}
          />
          <FormField
            label="State"
            name="addressState"
            type="select"
            options={US_STATES.map((s) => ({ value: s, label: s }))}
            value={addressState}
            onChange={(e) => setAddressState(e.target.value)}
          />
          <FormField
            label="ZIP"
            name="zip"
            value={zip}
            onChange={(e) => setZip((e.target as HTMLInputElement).value)}
          />
        </div>
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <FormField
          label="Additional notes"
          name="notes"
          type="textarea"
          value={notes}
          onChange={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
        />
      </Section>

      {/* Contact info */}
      <Section title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ConfidenceWrapper low={isLowConfidence("firstName")}>
            <FormField
              label="First name"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
              error={errors.firstName}
            />
          </ConfidenceWrapper>
          <ConfidenceWrapper low={isLowConfidence("lastName")}>
            <FormField
              label="Last name"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
              error={errors.lastName}
            />
          </ConfidenceWrapper>
        </div>
        <ConfidenceWrapper low={isLowConfidence("organization")}>
          <FormField
            label="Organization"
            name="organization"
            required
            value={organization}
            onChange={(e) => setOrganization((e.target as HTMLInputElement).value)}
            error={errors.organization}
          />
        </ConfidenceWrapper>
        <ConfidenceWrapper low={isLowConfidence("email")}>
          <FormField
            label="Email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            error={errors.email}
          />
        </ConfidenceWrapper>
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
          hint="Optional"
        />
      </Section>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="self-center flex items-center gap-2 px-8 py-3 rounded-full bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-colors cursor-pointer disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 motion-safe:animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit request
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-display font-semibold text-on-surface">{title}</h2>
      {children}
    </div>
  );
}

function ConfidenceWrapper({ low, children }: { low: boolean; children: React.ReactNode }) {
  if (!low) return <>{children}</>;
  return (
    <div className="relative">
      <div className="rounded-xl ring-2 ring-status-in-review/50 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-status-in-review" />
          <span className="text-xs font-medium text-status-in-review">Please verify this field</span>
        </div>
        {children}
      </div>
    </div>
  );
}
