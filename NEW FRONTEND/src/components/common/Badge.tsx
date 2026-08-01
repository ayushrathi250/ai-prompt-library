import type { ReactNode } from 'react';
import { getCategory } from '../../constants/categories';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
  withIcon?: boolean;
  className?: string;
}

/** Color-coded category badge — tints derive from the category accent. */
export function Badge({
  category,
  size = 'sm',
  withIcon = true,
  className = '',
}: CategoryBadgeProps) {
  const meta = getCategory(category);
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide whitespace-nowrap ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${className}`}
      style={{
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 38%, transparent)`,
        background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
      }}
    >
      {withIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={2.2} />}
      {meta.name}
    </span>
  );
}

interface TagPillProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
}

/** `#tag` pill used on cards and inside the tag input. */
export function TagPill({ label, onRemove, onClick, active }: TagPillProps) {
  const content = (
    <>
      <span className="font-mono text-[11px] opacity-60">#</span>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full px-1 text-muted transition-colors hover:text-danger"
          aria-label={`Remove tag ${label}`}
        >
          ×
        </button>
      )}
    </>
  );

  const base = `inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
    active
      ? 'border-primary/50 bg-primary/12 text-primary'
      : 'border-edge bg-surface-2/60 text-muted hover:border-edge-strong hover:text-ink-soft'
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {content}
      </button>
    );
  }
  return <span className={base}>{content}</span>;
}

/** Generic small status chip. */
export function StatusChip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'accent';
}) {
  const tones = {
    neutral: 'border-edge bg-surface-2/70 text-muted',
    primary: 'border-primary/40 bg-primary/10 text-primary',
    accent: 'border-accent/40 bg-accent/10 text-accent',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
