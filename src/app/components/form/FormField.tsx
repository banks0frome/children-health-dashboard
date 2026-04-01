import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children?: ReactNode;
}

type InputFieldProps = BaseProps & {
  type?: "text" | "email" | "tel" | "date" | "time" | "number" | "url";
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

type TextareaFieldProps = BaseProps & {
  type: "textarea";
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

type SelectFieldProps = BaseProps & {
  type: "select";
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, error, required, hint, children, ...rest } = props;
  const id = rest.id || rest.name || label.toLowerCase().replace(/\s+/g, "-");

  const baseClasses =
    "w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm transition-colors focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-muted/50";
  const errorClasses = error ? "ring-2 ring-secondary bg-secondary-container/10" : "";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-on-surface font-body">
        {label}
        {required && <span className="text-secondary ml-1" aria-hidden="true">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-on-surface-muted" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children ? (
        children
      ) : props.type === "textarea" ? (
        <textarea
          id={id}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined
          }
          className={`${baseClasses} ${errorClasses} min-h-[100px] resize-y`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : props.type === "select" ? (
        <select
          id={id}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined
          }
          className={`${baseClasses} ${errorClasses} appearance-none cursor-pointer`}
          {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
        >
          <option value="">Select...</option>
          {(props as SelectFieldProps).options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={(props as InputFieldProps).type || "text"}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined
          }
          className={`${baseClasses} ${errorClasses}`}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-secondary font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
