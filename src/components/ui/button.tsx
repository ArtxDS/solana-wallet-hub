import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[0_0_24px_rgba(153,69,255,0.22)] hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(153,69,255,0.34)]",
  secondary:
    "bg-white/[0.06] text-secondary hover:bg-white/[0.1] hover:text-white",
  outline:
    "border border-white/[0.1] bg-transparent text-secondary hover:border-primary/50 hover:bg-primary/[0.06] hover:text-white",
  ghost: "bg-transparent text-muted hover:bg-white/[0.06] hover:text-white",
  icon: "bg-transparent text-muted hover:bg-white/[0.07] hover:text-white",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export type { ButtonProps };
