import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, CalendarDays, ArrowLeft, ArrowRight, Send, Pencil } from "lucide-react";
import { StepProgress } from "../../components/form/StepProgress";
import { FormField } from "../../components/form/FormField";
import { MaterialSelector } from "../../components/form/MaterialSelector";
import {
  type FormData,
  type MaterialSelection,
  EMPTY_FORM,
  AUDIENCE_OPTIONS,
  TOPIC_OPTIONS,
  US_STATES,
} from "../../lib/formTypes";

// Step definitions per path
const MAILING_STEPS = ["Request Type", "Select Materials", "Shipping", "Timing & Notes", "Contact Info", "Review"];
const EVENT_STEPS = ["Request Type", "Support Type", "Details", "Event Info", "Audience", "Topics", "Location", "Contact Info", "Review"];

export function GuidedForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const path = form.requestType;
  const steps = path === "mailing" ? MAILING_STEPS : path === "event" ? EVENT_STEPS : ["Request Type"];
  const totalSteps = steps.length;

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  function validateCurrentStep(): boolean {
    const errs: Record<string, string> = {};

    if (path === "mailing") {
      if (step === 2) {
        const selCount = Object.values(form.materials).filter((v) => v.selected).length;
        if (selCount === 0) errs.materials = "Select at least one material";
      }
      if (step === 3) {
        if (!form.shippingState) errs.shippingState = "State is required";
        if (!form.shippingAddress1) errs.shippingAddress1 = "Address is required";
        if (!form.shippingCity) errs.shippingCity = "City is required";
        if (!form.shippingZip) errs.shippingZip = "ZIP code is required";
      }
      if (step === 5) {
        if (!form.firstName.trim()) errs.firstName = "First name is required";
        if (!form.lastName.trim()) errs.lastName = "Last name is required";
        if (!form.organization.trim()) errs.organization = "Organization is required";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
      }
    }

    if (path === "event") {
      if (step === 2) {
        if (!form.wantPresentation && !form.wantMaterials)
          errs.supportType = "Select at least one support type";
      }
      if (step === 3) {
        if (form.wantPresentation && !form.presentationFormat)
          errs.presentationFormat = "Select a format";
        if (form.wantMaterials) {
          const selCount = Object.values(form.materials).filter((v) => v.selected).length;
          if (selCount === 0) errs.materials = "Select at least one material";
        }
      }
      if (step === 4) {
        if (!form.eventDate) errs.eventDate = "Event date is required";
      }
      if (step === 5) {
        if (form.audienceTypes.length === 0) errs.audienceTypes = "Select at least one audience type";
      }
      if (step === 6) {
        if (form.topics.length === 0) errs.topics = "Select at least one topic";
      }
      if (step === 7) {
        if (form.presentationFormat === "in_person" || form.wantMaterials) {
          if (!form.eventAddress1) errs.eventAddress1 = "Address is required";
          if (!form.eventCity) errs.eventCity = "City is required";
          if (!form.eventState) errs.eventState = "State is required";
        }
        if (form.presentationFormat === "virtual") {
          if (!form.meetingLink) errs.meetingLink = "Meeting link is required";
        }
      }
      // Contact is step 8 for event
      if (step === totalSteps - 1) {
        if (!form.firstName.trim()) errs.firstName = "First name is required";
        if (!form.lastName.trim()) errs.lastName = "Last name is required";
        if (!form.organization.trim()) errs.organization = "Organization is required";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function goToStep(s: number) {
    setStep(s);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = buildPayload(form);
      await fetch("/api/form/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      navigate("/form/success", {
        state: { email: form.email, requestType: form.requestType },
      });
    } catch {
      setSubmitting(false);
    }
  }

  // Render current step
  function renderStep() {
    // Step 1: Request type (shared)
    if (step === 1) {
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-display font-bold text-on-surface">What do you need?</h2>
            <p className="text-sm text-on-surface-muted mt-1">Pick the option that best describes your request.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { update("requestType", "mailing"); setStep(2); }}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-colors cursor-pointer text-center min-h-[160px] justify-center ${
                form.requestType === "mailing"
                  ? "bg-primary-container text-white"
                  : "bg-surface-container-low hover:bg-surface-container-high"
              }`}
            >
              <Package className={`w-8 h-8 ${form.requestType === "mailing" ? "text-white" : "text-primary"}`} />
              <div>
                <p className={`text-sm font-semibold font-display ${form.requestType === "mailing" ? "text-white" : "text-on-surface"}`}>
                  Just send me materials
                </p>
                <p className={`text-xs mt-1 ${form.requestType === "mailing" ? "text-white/70" : "text-on-surface-muted"}`}>
                  We'll mail safety cards, clings, or workbooks to your address
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { update("requestType", "event"); setStep(2); }}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-colors cursor-pointer text-center min-h-[160px] justify-center ${
                form.requestType === "event"
                  ? "bg-primary-container text-white"
                  : "bg-surface-container-low hover:bg-surface-container-high"
              }`}
            >
              <CalendarDays className={`w-8 h-8 ${form.requestType === "event" ? "text-white" : "text-primary"}`} />
              <div>
                <p className={`text-sm font-semibold font-display ${form.requestType === "event" ? "text-white" : "text-on-surface"}`}>
                  Support at my event
                </p>
                <p className={`text-xs mt-1 ${form.requestType === "event" ? "text-white/70" : "text-on-surface-muted"}`}>
                  Request a presentation, materials table, or both at your event
                </p>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // ==================== MAILING PATH ====================
    if (path === "mailing") {
      if (step === 2) return renderMailingMaterials();
      if (step === 3) return renderShipping();
      if (step === 4) return renderTiming();
      if (step === 5) return renderContactInfo();
      if (step === 6) return renderReview();
    }

    // ==================== EVENT PATH ====================
    if (path === "event") {
      if (step === 2) return renderSupportType();
      if (step === 3) return renderEventDetails();
      if (step === 4) return renderEventInfo();
      if (step === 5) return renderAudience();
      if (step === 6) return renderTopics();
      if (step === 7) return renderLocation();
      if (step === 8) return renderContactInfo();
      if (step === 9) return renderReview();
    }

    return null;
  }

  // -- Mailing: Materials --
  function renderMailingMaterials() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Select materials</h2>
          <p className="text-sm text-on-surface-muted mt-1">Choose the safety materials you'd like us to send.</p>
        </div>
        {errors.materials && <p role="alert" className="text-sm text-secondary font-medium">{errors.materials}</p>}
        <MaterialSelector
          value={form.materials}
          onChange={(m: MaterialSelection) => update("materials", m)}
        />
      </div>
    );
  }

  // -- Mailing: Shipping --
  function renderShipping() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Shipping details</h2>
          <p className="text-sm text-on-surface-muted mt-1">Where should we send the materials?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="State"
            name="shippingState"
            type="select"
            required
            options={US_STATES.map((s) => ({ value: s, label: s }))}
            value={form.shippingState}
            onChange={(e) => update("shippingState", e.target.value)}
            error={errors.shippingState}
          />
          <FormField
            label="County"
            name="shippingCounty"
            value={form.shippingCounty}
            onChange={(e) => update("shippingCounty", (e.target as HTMLInputElement).value)}
          />
        </div>
        <FormField
          label="Street address"
          name="shippingAddress1"
          required
          value={form.shippingAddress1}
          onChange={(e) => update("shippingAddress1", (e.target as HTMLInputElement).value)}
          error={errors.shippingAddress1}
        />
        <FormField
          label="Address line 2"
          name="shippingAddress2"
          value={form.shippingAddress2}
          onChange={(e) => update("shippingAddress2", (e.target as HTMLInputElement).value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="City"
            name="shippingCity"
            required
            value={form.shippingCity}
            onChange={(e) => update("shippingCity", (e.target as HTMLInputElement).value)}
            error={errors.shippingCity}
          />
          <FormField
            label="ZIP code"
            name="shippingZip"
            required
            value={form.shippingZip}
            onChange={(e) => update("shippingZip", (e.target as HTMLInputElement).value)}
            error={errors.shippingZip}
          />
        </div>
      </div>
    );
  }

  // -- Mailing: Timing --
  function renderTiming() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Timing & notes</h2>
          <p className="text-sm text-on-surface-muted mt-1">Any deadline or special instructions?</p>
        </div>
        <FormField
          label="Preferred delivery date"
          name="preferredDate"
          type="date"
          value={form.preferredDate}
          onChange={(e) => update("preferredDate", (e.target as HTMLInputElement).value)}
          hint="Optional. We'll try to ship within 5 business days."
        />
        <FormField
          label="Notes or special requests"
          name="notes"
          type="textarea"
          value={form.notes}
          onChange={(e) => update("notes", (e.target as HTMLTextAreaElement).value)}
          placeholder="Any specific needs, event name, or additional context..."
        />
      </div>
    );
  }

  // -- Event: Support type --
  function renderSupportType() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">What kind of support?</h2>
          <p className="text-sm text-on-surface-muted mt-1">You can select one or both.</p>
        </div>
        {errors.supportType && <p role="alert" className="text-sm text-secondary font-medium">{errors.supportType}</p>}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer min-h-[56px]">
            <input
              type="checkbox"
              checked={form.wantPresentation}
              onChange={(e) => update("wantPresentation", e.target.checked)}
              className="w-5 h-5 rounded accent-primary cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-on-surface">Presentation or talk</p>
              <p className="text-xs text-on-surface-muted">A staff member will present at your event</p>
            </div>
          </label>
          <label className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer min-h-[56px]">
            <input
              type="checkbox"
              checked={form.wantMaterials}
              onChange={(e) => update("wantMaterials", e.target.checked)}
              className="w-5 h-5 rounded accent-primary cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-on-surface">Materials at the event</p>
              <p className="text-xs text-on-surface-muted">Safety cards, clings, or workbooks at your booth/table</p>
            </div>
          </label>
        </div>
      </div>
    );
  }

  // -- Event: Conditional details (format + materials) --
  function renderEventDetails() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Details</h2>
        </div>

        {form.wantPresentation && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-on-surface">Presentation format</p>
            {errors.presentationFormat && <p role="alert" className="text-sm text-secondary font-medium">{errors.presentationFormat}</p>}
            <div className="flex gap-3">
              {(["in_person", "virtual"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => update("presentationFormat", fmt)}
                  className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    form.presentationFormat === fmt
                      ? "bg-primary text-white"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {fmt === "in_person" ? "In-person" : "Virtual"}
                </button>
              ))}
            </div>
          </div>
        )}

        {form.wantMaterials && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-on-surface">Select materials for your event</p>
            {errors.materials && <p role="alert" className="text-sm text-secondary font-medium">{errors.materials}</p>}
            <MaterialSelector
              value={form.materials}
              onChange={(m: MaterialSelection) => update("materials", m)}
            />
          </div>
        )}
      </div>
    );
  }

  // -- Event: Info --
  function renderEventInfo() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Event information</h2>
        </div>
        <FormField
          label="Event date"
          name="eventDate"
          type="date"
          required
          value={form.eventDate}
          onChange={(e) => update("eventDate", (e.target as HTMLInputElement).value)}
          error={errors.eventDate}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Start time"
            name="eventStartTime"
            type="time"
            value={form.eventStartTime}
            onChange={(e) => update("eventStartTime", (e.target as HTMLInputElement).value)}
          />
          <FormField
            label="End time"
            name="eventEndTime"
            type="time"
            value={form.eventEndTime}
            onChange={(e) => update("eventEndTime", (e.target as HTMLInputElement).value)}
          />
        </div>
        <FormField
          label="Estimated attendance"
          name="estimatedAttendance"
          type="number"
          value={form.estimatedAttendance}
          onChange={(e) => update("estimatedAttendance", (e.target as HTMLInputElement).value)}
          placeholder="e.g. 50"
        />
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={form.requesterAttending}
            onChange={(e) => update("requesterAttending", e.target.checked)}
            className="w-5 h-5 rounded accent-primary cursor-pointer"
          />
          <span className="text-sm text-on-surface">I will be attending the event</span>
        </label>
      </div>
    );
  }

  // -- Event: Audience --
  function renderAudience() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Who's your audience?</h2>
          <p className="text-sm text-on-surface-muted mt-1">Select all that apply.</p>
        </div>
        {errors.audienceTypes && <p role="alert" className="text-sm text-secondary font-medium">{errors.audienceTypes}</p>}
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_OPTIONS.map((opt) => {
            const isSelected = form.audienceTypes.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  update(
                    "audienceTypes",
                    isSelected
                      ? form.audienceTypes.filter((a) => a !== opt)
                      : [...form.audienceTypes, opt]
                  );
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // -- Event: Topics --
  function renderTopics() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">What topics?</h2>
          <p className="text-sm text-on-surface-muted mt-1">Select all relevant topics.</p>
        </div>
        {errors.topics && <p role="alert" className="text-sm text-secondary font-medium">{errors.topics}</p>}
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((opt) => {
            const isSelected = form.topics.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  update(
                    "topics",
                    isSelected
                      ? form.topics.filter((t) => t !== opt)
                      : [...form.topics, opt]
                  );
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // -- Event: Location --
  function renderLocation() {
    const needsPhysical = form.presentationFormat === "in_person" || form.wantMaterials;
    const needsVirtual = form.presentationFormat === "virtual";

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Location</h2>
        </div>

        {needsPhysical && (
          <>
            <FormField
              label="Street address"
              name="eventAddress1"
              required
              value={form.eventAddress1}
              onChange={(e) => update("eventAddress1", (e.target as HTMLInputElement).value)}
              error={errors.eventAddress1}
            />
            <FormField
              label="Address line 2"
              name="eventAddress2"
              value={form.eventAddress2}
              onChange={(e) => update("eventAddress2", (e.target as HTMLInputElement).value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                label="City"
                name="eventCity"
                required
                value={form.eventCity}
                onChange={(e) => update("eventCity", (e.target as HTMLInputElement).value)}
                error={errors.eventCity}
              />
              <FormField
                label="State"
                name="eventState"
                type="select"
                required
                options={US_STATES.map((s) => ({ value: s, label: s }))}
                value={form.eventState}
                onChange={(e) => update("eventState", e.target.value)}
                error={errors.eventState}
              />
              <FormField
                label="ZIP"
                name="eventZip"
                value={form.eventZip}
                onChange={(e) => update("eventZip", (e.target as HTMLInputElement).value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-on-surface">Indoor / Outdoor</p>
              <div className="flex gap-2">
                {(["indoor", "outdoor", "both"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("indoorOutdoor", opt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors cursor-pointer ${
                      form.indoorOutdoor === opt
                        ? "bg-primary text-white"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <FormField
              label="Parking instructions"
              name="parkingInstructions"
              type="textarea"
              value={form.parkingInstructions}
              onChange={(e) => update("parkingInstructions", (e.target as HTMLTextAreaElement).value)}
              placeholder="Where to park, any gate codes, etc."
            />
            <FormField
              label="Google Maps link"
              name="mapsLink"
              type="url"
              value={form.mapsLink}
              onChange={(e) => update("mapsLink", (e.target as HTMLInputElement).value)}
              placeholder="https://maps.google.com/..."
            />
          </>
        )}

        {needsVirtual && (
          <>
            <FormField
              label="Meeting link"
              name="meetingLink"
              type="url"
              required
              value={form.meetingLink}
              onChange={(e) => update("meetingLink", (e.target as HTMLInputElement).value)}
              error={errors.meetingLink}
              placeholder="https://zoom.us/j/..."
            />
            <FormField
              label="Platform"
              name="meetingPlatform"
              type="select"
              options={[
                { value: "zoom", label: "Zoom" },
                { value: "teams", label: "Microsoft Teams" },
                { value: "other", label: "Other" },
              ]}
              value={form.meetingPlatform}
              onChange={(e) => update("meetingPlatform", e.target.value as "zoom" | "teams" | "other")}
            />
          </>
        )}

        {!needsPhysical && !needsVirtual && (
          <p className="text-sm text-on-surface-muted">No location details needed for your selections.</p>
        )}
      </div>
    );
  }

  // -- Shared: Contact Info --
  function renderContactInfo() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Contact information</h2>
          <p className="text-sm text-on-surface-muted mt-1">How can we reach you?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="First name"
            name="firstName"
            required
            value={form.firstName}
            onChange={(e) => update("firstName", (e.target as HTMLInputElement).value)}
            error={errors.firstName}
          />
          <FormField
            label="Last name"
            name="lastName"
            required
            value={form.lastName}
            onChange={(e) => update("lastName", (e.target as HTMLInputElement).value)}
            error={errors.lastName}
          />
        </div>
        <FormField
          label="Organization"
          name="organization"
          required
          value={form.organization}
          onChange={(e) => update("organization", (e.target as HTMLInputElement).value)}
          error={errors.organization}
          placeholder="School, community center, clinic, etc."
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", (e.target as HTMLInputElement).value)}
          error={errors.email}
        />
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", (e.target as HTMLInputElement).value)}
          hint="Optional"
        />
      </div>
    );
  }

  // -- Shared: Review --
  function renderReview() {
    const selectedMaterials = Object.entries(form.materials)
      .filter(([, v]) => v.selected)
      .map(([k, v]) => ({ key: k, ...v }));

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Review your request</h2>
          <p className="text-sm text-on-surface-muted mt-1">Make sure everything looks correct before submitting.</p>
        </div>

        {/* Contact */}
        <ReviewSection title="Contact" onEdit={() => goToStep(path === "mailing" ? 5 : totalSteps - 1)}>
          <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
          <ReviewRow label="Organization" value={form.organization} />
          <ReviewRow label="Email" value={form.email} />
          {form.phone && <ReviewRow label="Phone" value={form.phone} />}
        </ReviewSection>

        {/* Request type */}
        <ReviewSection title="Request Type" onEdit={() => goToStep(1)}>
          <ReviewRow label="Type" value={form.requestType === "mailing" ? "Materials by mail" : "Event support"} />
        </ReviewSection>

        {/* Materials */}
        {selectedMaterials.length > 0 && (
          <ReviewSection title="Materials" onEdit={() => goToStep(2)}>
            {selectedMaterials.map((m) => (
              <ReviewRow key={m.key} label={m.key.replace(/_/g, " ")} value={m.key === "other" ? m.customText || "Custom" : `x${m.quantity}`} />
            ))}
          </ReviewSection>
        )}

        {/* Shipping (mailing) */}
        {path === "mailing" && (
          <ReviewSection title="Shipping" onEdit={() => goToStep(3)}>
            <ReviewRow label="Address" value={[form.shippingAddress1, form.shippingAddress2].filter(Boolean).join(", ")} />
            <ReviewRow label="City/State/ZIP" value={`${form.shippingCity}, ${form.shippingState} ${form.shippingZip}`} />
            {form.shippingCounty && <ReviewRow label="County" value={form.shippingCounty} />}
          </ReviewSection>
        )}

        {/* Event details */}
        {path === "event" && (
          <>
            <ReviewSection title="Event" onEdit={() => goToStep(4)}>
              <ReviewRow label="Date" value={form.eventDate} />
              {form.eventStartTime && <ReviewRow label="Time" value={`${form.eventStartTime} - ${form.eventEndTime}`} />}
              {form.estimatedAttendance && <ReviewRow label="Attendance" value={form.estimatedAttendance} />}
              <ReviewRow label="Attending" value={form.requesterAttending ? "Yes" : "No"} />
            </ReviewSection>

            {form.audienceTypes.length > 0 && (
              <ReviewSection title="Audience" onEdit={() => goToStep(5)}>
                <ReviewRow label="Types" value={form.audienceTypes.join(", ")} />
              </ReviewSection>
            )}

            {form.topics.length > 0 && (
              <ReviewSection title="Topics" onEdit={() => goToStep(6)}>
                <ReviewRow label="Topics" value={form.topics.join(", ")} />
              </ReviewSection>
            )}

            <ReviewSection title="Location" onEdit={() => goToStep(7)}>
              {form.presentationFormat === "virtual" ? (
                <>
                  <ReviewRow label="Platform" value={form.meetingPlatform || "Not specified"} />
                  <ReviewRow label="Link" value={form.meetingLink} />
                </>
              ) : (
                <>
                  <ReviewRow label="Address" value={[form.eventAddress1, form.eventAddress2].filter(Boolean).join(", ")} />
                  <ReviewRow label="City/State" value={`${form.eventCity}, ${form.eventState} ${form.eventZip}`} />
                  {form.indoorOutdoor && <ReviewRow label="Setting" value={form.indoorOutdoor} />}
                </>
              )}
            </ReviewSection>
          </>
        )}

        {form.notes && (
          <ReviewSection title="Notes" onEdit={() => goToStep(path === "mailing" ? 4 : 4)}>
            <p className="text-sm text-on-surface">{form.notes}</p>
          </ReviewSection>
        )}
      </div>
    );
  }

  const isReview = step === totalSteps;

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      {path && (
        <StepProgress currentStep={step} totalSteps={totalSteps} labels={steps} />
      )}

      {/* Step content */}
      <div aria-live="polite">{renderStep()}</div>

      {/* Navigation */}
      {step > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={back}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-on-surface-muted hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {isReview ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// -- Helper components --

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold text-on-surface">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-container transition-colors cursor-pointer"
          aria-label={`Edit ${title}`}
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-on-surface-muted min-w-[100px] shrink-0">{label}</span>
      <span className="text-on-surface">{value || "—"}</span>
    </div>
  );
}

function buildPayload(form: FormData) {
  const materials = Object.entries(form.materials)
    .filter(([, v]) => v.selected)
    .map(([key, v]) => ({ key, quantity: v.quantity, customText: v.customText }));

  return {
    submission_method: "form",
    request_type: form.requestType,
    first_name: form.firstName,
    last_name: form.lastName,
    organization: form.organization,
    email: form.email,
    phone: form.phone || null,
    notes: form.notes || null,
    materials,
    shipping: form.requestType === "mailing" ? {
      address_line1: form.shippingAddress1,
      address_line2: form.shippingAddress2 || null,
      city: form.shippingCity,
      state: form.shippingState,
      zip: form.shippingZip,
      county: form.shippingCounty || null,
    } : null,
    event_details: form.requestType === "event" ? {
      event_date: form.eventDate,
      start_time: form.eventStartTime || null,
      end_time: form.eventEndTime || null,
      estimated_attendance: form.estimatedAttendance ? parseInt(form.estimatedAttendance) : null,
      audience_type: form.audienceTypes,
      topics: form.topics,
      is_virtual: form.presentationFormat === "virtual",
      requester_attending: form.requesterAttending,
      want_presentation: form.wantPresentation,
      want_materials: form.wantMaterials,
    } : null,
    location: form.requestType === "event" && (form.presentationFormat === "in_person" || form.wantMaterials) ? {
      address_line1: form.eventAddress1,
      address_line2: form.eventAddress2 || null,
      city: form.eventCity,
      state: form.eventState,
      zip: form.eventZip || null,
      indoor_outdoor: form.indoorOutdoor || null,
      parking_instructions: form.parkingInstructions || null,
    } : null,
    virtual_details: form.presentationFormat === "virtual" ? {
      meeting_link: form.meetingLink,
      platform: form.meetingPlatform || null,
    } : null,
  };
}
