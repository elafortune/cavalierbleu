// Visuel provisoire pour les documents / photos pas encore fournis.
export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-brand-700/30 bg-brand-100/50 p-6 text-center ${className}`}
      role="img"
      aria-label={`Visuel à venir : ${label}`}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-700/50" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p className="text-sm font-semibold text-brand-700/80">{label}</p>
      <p className="text-xs text-muted">Document à venir</p>
    </div>
  );
}
