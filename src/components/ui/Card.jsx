export function Card({ children, className = "", ...props }) {
  return <div className={`rounded-xl border border-primary-100 bg-surface-raised shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md ${className}`} {...props}>{children}</div>;
}

const badgeVariants = {
  neutral: "bg-primary-50 text-primary-700",
  success: "bg-success-light text-success-dark",
  warning: "bg-warning-light text-warning-dark",
  danger: "bg-danger-light text-danger-dark",
  accent: "bg-accent-100 text-accent-800",
};

export function Badge({ children, variant = "neutral", className = "" }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeVariants[variant]} ${className}`}>{children}</span>;
}

export function StatCard({ label, value, icon: Icon, helper, className = "" }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-500">{label}</p>
          <p className="mt-2 text-3xl font-bold leading-none text-primary-900">{value ?? "—"}</p>
          {helper && <p className="mt-2 text-sm text-primary-500">{helper}</p>}
        </div>
        {Icon && <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><Icon className="size-5" aria-hidden="true" /></span>}
      </div>
    </Card>
  );
}
