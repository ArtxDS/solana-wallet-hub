import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
};

export function Input({
  id,
  label,
  error,
  hint,
  suffix,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          className={`h-12 w-full rounded-xl border bg-white/[0.035] px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted/55 focus:border-primary/70 focus:bg-primary/[0.035] focus:ring-2 focus:ring-primary/15 ${suffix ? "pr-20" : ""} ${error ? "border-danger/70 focus:border-danger" : "border-white/[0.1]"} ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {suffix ? <div className="absolute inset-y-0 right-3 flex items-center">{suffix}</div> : null}
      </div>
      {error ? <p className="flex items-center gap-1.5 text-xs font-medium text-danger" role="alert">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export type { InputProps };
