import { useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Library,
  Star,
  LayoutGrid,
  Clock3,
  Plus,
  ArrowRight,
  Flame,
  Pin,
  Upload,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { SkeletonStats } from '../components/common/SkeletonLoader';
import PromptList from '../components/prompts/PromptList';
import PromptCard from '../components/prompts/PromptCard';
import { CATEGORIES } from '../constants/categories';
import { usePrompts } from '../context/PromptContext';
import type { ShellContext } from '../App';

export function Dashboard() {
  const { prompts, stats, loading } = usePrompts();
  const { openCreate, openEdit, openDetails, requestDelete, openImportExport } =
    useOutletContext<ShellContext>();
  const navigate = useNavigate();

  const recent = useMemo(
    () =>
      [...prompts]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6),
    [prompts],
  );

  const mostUsed = useMemo(
    () => [...prompts].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
    [prompts],
  );

  const countFor = (name: string) => prompts.filter((p) => p.category === name).length;
  const maxCount = Math.max(1, ...CATEGORIES.map((c) => countFor(c.name)));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-edge bg-surface/70 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--accent)' }}
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          Your workspace
        </p>
        <h1 className="mt-2 max-w-2xl text-balance font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-[42px]">
          Every good prompt you've written,{' '}
          <span className="italic text-primary">one keystroke away.</span>
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Capture what works, tag it, pin the essentials and copy it into any model in a
          single click. No more scrolling old chat histories.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openCreate()}
            className="focus-ring group inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
            New prompt
          </button>
          <Link
            to="/prompts"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
          >
            Browse library <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={openImportExport}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
          >
            <Upload className="h-4 w-4" /> Import / Export
          </button>
        </div>
      </section>

      {/* Stats */}
      <section>
        {loading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Prompts"
              value={stats.total}
              hint="across all categories"
              icon={Library}
              accent="#b8501c"
              onClick={() => navigate('/prompts')}
              delay={0}
            />
            <StatCard
              label="Favorites"
              value={stats.favorites}
              hint="starred for quick access"
              icon={Star}
              accent="#d19a06"
              onClick={() => navigate('/favorites')}
              delay={70}
            />
            <StatCard
              label="Active Categories"
              value={`${stats.activeCategories}/10`}
              hint="buckets currently in use"
              icon={LayoutGrid}
              accent="#1f6f5c"
              delay={140}
            />
            <StatCard
              label="Recently Added"
              value={stats.recentlyAdded}
              hint="in the last 7 days"
              icon={Clock3}
              accent="#7c5cf0"
              delay={210}
            />
          </div>
        )}
      </section>

      {/* Category grid */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Categories
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Ten fixed buckets keep the library navigable.
            </p>
          </div>
          <Link
            to="/prompts"
            className="hidden items-center gap-1 text-[13px] font-medium text-primary hover:underline sm:inline-flex"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat, i) => {
            const count = countFor(cat.name);
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-fade-up group relative overflow-hidden rounded-xl border border-edge bg-surface/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-edge-strong hover:shadow-lg hover:shadow-black/5"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ background: cat.color }}
                />
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border"
                  style={{
                    color: cat.color,
                    borderColor: `color-mix(in srgb, ${cat.color} 35%, transparent)`,
                    background: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <h3 className="text-[13.5px] font-semibold leading-tight text-ink">
                  {cat.name}
                </h3>
                <p className="clamp-2 mt-1 text-[11.5px] leading-snug text-muted">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-canvas-deep">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-muted">{count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Most used */}
      {!loading && mostUsed.length > 0 && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="animate-fade-up rounded-xl border border-edge bg-surface/80 p-5 lg:col-span-1">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink">
              <Flame className="h-4 w-4 text-primary" /> Most used
            </h2>
            <ol className="space-y-1">
              {mostUsed.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => openDetails(p)}
                    className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-canvas-deep"
                  >
                    <span className="font-mono text-[11px] tabular-nums text-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft group-hover:text-ink">
                      {p.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                      {p.usageCount}×
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <Link
              to="/pinned"
              className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline"
            >
              <Pin className="h-3.5 w-3.5" /> See pinned prompts
            </Link>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Recently added
              </h2>
              <Link
                to="/prompts"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
              >
                All prompts <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recent.slice(0, 4).map((p, i) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  index={i}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                  onOpen={openDetails}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight text-ink">
            Recently added
          </h2>
          <PromptList
            prompts={[]}
            loading
            onEdit={openEdit}
            onDelete={requestDelete}
            onOpen={openDetails}
          />
        </section>
      )}
    </div>
  );
}

export default Dashboard;
