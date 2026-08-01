import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-edge-strong bg-surface/50 px-6 py-16 text-center">
      <div className="relative mb-5">
        <div
          className="absolute inset-0 -z-10 blur-2xl"
          style={{ background: 'color-mix(in srgb, var(--primary) 25%, transparent)' }}
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-edge bg-surface-2">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.6} />
        </div>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-balance text-sm leading-relaxed text-muted">
        {description}
      </p>
      {(actionLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90"
            >
              {actionLabel}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="focus-ring rounded-lg border border-edge px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-deep"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
