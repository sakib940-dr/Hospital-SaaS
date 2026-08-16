import { useId } from "react";

const controlClass = "w-full rounded-lg border border-primary-200 bg-white px-3 py-2.5 text-primary-900 placeholder:text-primary-400 transition hover:border-primary-300 disabled:cursor-not-allowed disabled:bg-primary-50 disabled:text-primary-400";

export function Field({ label, hint, error, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-semibold text-primary-700">{label}{required && <span className="text-danger"> *</span>}</span>}
      {children}
      {(hint || error) && <span className={`mt-1 block text-sm ${error ? "text-danger" : "text-primary-500"}`}>{error || hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return <select className={`${controlClass} ${className}`} {...props}>{children}</select>;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${controlClass} min-h-24 resize-y ${className}`} {...props} />;
}

export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-primary-700 ${className}`}>
      <input type="checkbox" className="size-4 rounded border-primary-300 accent-primary-900" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Toggle({ label, checked, onChange, ...props }) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex min-h-10 cursor-pointer items-center gap-3">
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={onChange} className="peer sr-only" {...props} />
      <span className="relative h-6 w-11 rounded-full bg-primary-200 transition peer-checked:bg-primary-700 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition peer-checked:after:translate-x-5" />
      {label && <span className="text-sm text-primary-700">{label}</span>}
    </label>
  );
}
