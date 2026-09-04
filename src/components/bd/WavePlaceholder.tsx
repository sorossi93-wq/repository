interface WavePlaceholderProps {
  title: string;
  description: string;
  icon: string;
  items?: string[];
}

export function WavePlaceholder({ title, description, icon, items }: WavePlaceholderProps) {
  return (
    <section className="rounded-2xl border border-dashed border-bd-wave/40 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bd-wave/10 text-lg">
          {icon}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-bd-navy">{title}</h3>
            <span className="rounded-full bg-bd-wave/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bd-wave">
              Wave
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {(items ?? ["Connect Wave API", "Sync on page load", "Auto-refresh every 5 min"]).map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white/70 px-4 py-3"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-bd-wave/60" />
            <span className="text-sm text-slate-400">{item}</span>
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-300">
              Pending
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Future integration: <code className="rounded bg-slate-100 px-1 py-0.5">GET /wave/opportunities</code>{" "}
        → map to dashboard sections
      </p>
    </section>
  );
}
