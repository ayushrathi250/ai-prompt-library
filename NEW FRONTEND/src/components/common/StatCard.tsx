import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
  onClick?: () => void;
  delay?: number;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  onClick,
  delay = 0,
}: StatCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-fade-up group relative overflow-hidden rounded-xl border border-edge bg-surface/80 p-5 text-left transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-edge-strong hover:shadow-lg hover:shadow-black/5' : ''
      }`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ background: accent }}
      />
      <div
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border"
        style={{
          color: accent,
          borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
          background: `color-mix(in srgb, ${accent} 12%, transparent)`,
        }}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={2} />
      </div>
      <div className="font-display text-3xl font-semibold leading-none tracking-tight text-ink tabular-nums">
        {value}
      </div>
      <div className="mt-2 text-[13px] font-medium tracking-wide text-ink-soft">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </Wrapper>
  );
}

export default StatCard;
