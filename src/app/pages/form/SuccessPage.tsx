import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Plus } from "lucide-react";

export function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as { email?: string; requestType?: string } | undefined;

  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
      {/* Animated checkmark */}
      <div className="w-20 h-20 rounded-full bg-status-approved/10 flex items-center justify-center motion-safe:animate-[scale-in_0.4s_ease-out]">
        <CheckCircle className="w-12 h-12 text-status-approved" />
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-2xl font-display font-bold text-on-surface">
          Your request has been submitted!
        </h1>
        <p className="text-sm text-on-surface-muted">
          Our team will review your request and follow up shortly.
        </p>
      </div>

      {data?.email && (
        <div className="rounded-xl bg-surface-container-low px-6 py-4 max-w-sm w-full">
          <p className="text-sm text-on-surface-muted" aria-live="polite">
            You'll receive a confirmation email at{" "}
            <span className="font-semibold text-on-surface">{data.email}</span>
          </p>
        </div>
      )}

      {data?.requestType && (
        <div className="rounded-xl bg-surface-container-low px-6 py-4 max-w-sm w-full">
          <p className="text-xs text-on-surface-muted uppercase tracking-wide mb-1">Request type</p>
          <p className="text-sm font-medium text-on-surface capitalize">{data.requestType}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => navigate("/form")}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Submit another request
        </button>
        <button
          type="button"
          onClick={() => navigate("/form")}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-low text-on-surface-muted font-medium text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to home
        </button>
      </div>
    </div>
  );
}
