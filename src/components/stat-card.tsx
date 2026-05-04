import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-paper-200 bg-paper-50 px-5 py-4",
        className,
      )}
    >
      <div className="font-mono text-xs uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-medium text-ink-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-ink-500">{hint}</div>
      )}
    </div>
  );
}
