import { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export function InlineEdit({ value, onSave, placeholder = "—", multiline = false, className = "" }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleCommit = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed || value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleCommit();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const sharedProps = {
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: handleCommit,
      onKeyDown: handleKeyDown,
      className: `w-full bg-surface-container-highest rounded-lg px-2 py-1 text-sm text-on-surface
        focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${className}`,
    };

    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        {...sharedProps}
        rows={3}
        style={{ resize: "vertical" }}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        {...sharedProps}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      title="Click to edit"
      className={`cursor-pointer rounded px-1 -mx-1 py-0.5 text-sm text-on-surface
        hover:bg-surface-container-highest transition-colors duration-150
        group relative inline-flex items-center gap-1 ${className}`}
    >
      {value || <span className="text-on-surface-muted italic">{placeholder}</span>}
      <svg
        className="w-3 h-3 text-on-surface-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
      </svg>
    </span>
  );
}
