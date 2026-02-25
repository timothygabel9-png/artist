"use client";

export function Row({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white/90">{title}</div>
        {subtitle ? (
          <div className="mt-1 truncate text-xs text-white/60">{subtitle}</div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  const cls =
    variant === "danger"
      ? "border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/15"
      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10";
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs transition ${cls}`}
    >
      {children}
    </button>
  );
}