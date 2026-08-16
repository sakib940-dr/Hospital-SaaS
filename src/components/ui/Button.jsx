import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-primary-900 text-white hover:bg-primary-800",
  secondary: "border border-primary-200 bg-white text-primary-900 hover:bg-primary-50",
  accent: "bg-accent text-primary-900 hover:bg-accent-300",
  ghost: "bg-transparent text-primary-700 hover:bg-primary-50",
  danger: "bg-danger text-white hover:bg-danger-dark",
};

const sizes = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
