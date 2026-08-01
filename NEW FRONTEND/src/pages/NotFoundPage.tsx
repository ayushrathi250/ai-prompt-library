import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, Library } from 'lucide-react';

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-up relative mb-6">
        <div
          className="absolute inset-0 -z-10 blur-3xl"
          style={{ background: 'color-mix(in srgb, var(--primary) 35%, transparent)' }}
        />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-edge bg-surface">
          <Compass className="h-9 w-9 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <p
        className="animate-fade-up font-display text-[76px] font-semibold leading-none tracking-tighter text-ink sm:text-[104px]"
        style={{ animationDelay: '60ms' }}
      >
        404
      </p>
      <h1
        className="animate-fade-up mt-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        style={{ animationDelay: '120ms' }}
      >
        This prompt went missing
      </h1>
      <p
        className="animate-fade-up mt-2 max-w-md text-balance text-sm leading-relaxed text-muted"
        style={{ animationDelay: '160ms' }}
      >
        Nothing lives at{' '}
        <code className="rounded bg-canvas-deep px-1.5 py-0.5 font-mono text-[12px] text-ink-soft">
          {location.pathname}
        </code>
        . It may have been renamed, deleted, or never existed at all.
      </p>

      <div
        className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-2"
        style={{ animationDelay: '220ms' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90"
        >
          <Home className="h-4 w-4" /> Dashboard
        </Link>
        <Link
          to="/prompts"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
        >
          <Library className="h-4 w-4" /> All prompts
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
