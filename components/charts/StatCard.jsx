export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-foreground-dim">{label}</p>
      <p className="mt-2 break-words font-display text-3xl font-medium text-foreground">{value}</p>
      {hint && <p className="mt-1 font-mono text-xs text-cyan-deep">{hint}</p>}
    </div>
  );
}
