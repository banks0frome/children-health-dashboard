import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const MAX_CHARS = 5000;

export function PasteForm() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim()) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/form/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: "paste" }),
      });

      if (!res.ok) throw new Error("Extraction failed");

      const data = await res.json();
      navigate("/form/confirm", { state: { extracted: data, source: "paste" } });
    } catch {
      setError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Paste text</h1>
        <p className="text-sm text-on-surface-muted mt-1">
          Paste an email, event description, or just tell us what you need in your own words.
        </p>
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-2">
        <label htmlFor="paste-text" className="sr-only">
          Paste your text here
        </label>
        <textarea
          id="paste-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Paste an email, describe your event, or just tell us what you need..."
          className="w-full px-5 py-4 rounded-xl bg-surface-container-low text-on-surface text-sm min-h-[240px] resize-y placeholder:text-on-surface-muted/50 transition-colors focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
          aria-describedby="paste-char-count"
        />
        <div className="flex items-center justify-between">
          <p id="paste-char-count" className="text-xs text-on-surface-muted">
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-secondary font-medium text-center">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!text.trim() || processing}
        className="self-center flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 motion-safe:animate-spin" />
            Extracting...
          </>
        ) : (
          "Extract & Continue"
        )}
      </button>
    </div>
  );
}
