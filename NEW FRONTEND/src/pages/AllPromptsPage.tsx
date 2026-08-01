import { useMemo } from 'react';
import { useOutletContext, useParams, useLocation, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Star,
  Pin,
  Library,
  X,
  ArrowUpDown,
  Plus,
  GripVertical,
} from 'lucide-react';
import PromptList from '../components/prompts/PromptList';
import { usePrompts } from '../context/PromptContext';
import { CATEGORIES } from '../constants/categories';
import { SORT_OPTIONS, type SortOption, type Prompt } from '../types/prompt';
import type { ShellContext } from '../App';

type Scope = 'all' | 'favorites' | 'pinned' | 'category';

interface AllPromptsPageProps {
  scope?: Scope;
}

export function AllPromptsPage({ scope = 'all' }: AllPromptsPageProps) {
  const { openCreate, openEdit, openDetails, requestDelete } =
    useOutletContext<ShellContext>();
  const {
    loading,
    filters,
    setCategory,
    setFavoritesOnly,
    setSort,
    resetFilters,
    setSearch,
    getVisiblePrompts,
    prompts,
  } = usePrompts();
  const { categoryId } = useParams();
  const location = useLocation();

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId) ?? null,
    [categoryId],
  );

  const scopeOverrides = useMemo(() => {
    if (scope === 'favorites') return { favoritesOnly: true, category: null };
    if (scope === 'pinned') return { pinnedOnly: true, category: null };
    if (scope === 'category' && activeCategory) return { category: activeCategory.name };
    return {};
  }, [scope, activeCategory]);

  const visible = getVisiblePrompts(scopeOverrides);

  const heading = useMemo(() => {
    switch (scope) {
      case 'favorites':
        return {
          title: 'Favorites',
          subtitle: 'The prompts you reach for again and again.',
          icon: Star,
          accent: 'var(--primary)',
        };
      case 'pinned':
        return {
          title: 'Pinned',
          subtitle: 'Kept at the top of every list, whatever the sort.',
          icon: Pin,
          accent: 'var(--accent)',
        };
      case 'category':
        return {
          title: activeCategory?.name ?? 'Category',
          subtitle: activeCategory?.description ?? '',
          icon: activeCategory?.icon ?? Library,
          accent: activeCategory?.color ?? 'var(--primary)',
        };
      default:
        return {
          title: 'All Prompts',
          subtitle: 'Your full library — search, filter, sort and reorder.',
          icon: Library,
          accent: 'var(--primary)',
        };
    }
  }, [scope, activeCategory]);

  const HeadingIcon = heading.icon;
  const isCustom = filters.sort === 'custom';
  const showCategoryFilter = scope === 'all';
  const hasActiveFilters =
    Boolean(filters.search) ||
    (showCategoryFilter && (Boolean(filters.category) || filters.favoritesOnly));

  const onDelete = (prompt: Prompt) => requestDelete(prompt);

  return (
    <div key={location.pathname} className="space-y-6">
      {/* Page heading */}
      <div className="animate-fade-up flex flex-wrap items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
          style={{
            color: heading.accent,
            borderColor: `color-mix(in srgb, ${heading.accent} 35%, transparent)`,
            background: `color-mix(in srgb, ${heading.accent} 12%, transparent)`,
          }}
        >
          <HeadingIcon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            {heading.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{heading.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => openCreate(activeCategory?.name)}
          className="focus-ring group inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          New prompt
        </button>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-up sticky top-16 z-30 -mx-1 rounded-xl border border-edge bg-surface/85 px-3 py-3 backdrop-blur-xl" style={{ animationDelay: '60ms' }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-canvas-deep/60 px-2.5 py-1.5 text-[12.5px] font-medium text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="tabular-nums text-ink">{visible.length}</span>
            of {prompts.length}
          </span>

          {showCategoryFilter && (
            <>
              <div className="relative">
                <select
                  aria-label="Filter by category"
                  value={filters.category ?? ''}
                  onChange={(e) => setCategory(e.target.value || null)}
                  className="focus-ring h-9 appearance-none rounded-lg border border-edge bg-canvas-deep/60 pl-3 pr-8 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-edge-strong focus:outline-none"
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                  ▾
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFavoritesOnly(!filters.favoritesOnly)}
                className={`focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium transition-colors ${
                  filters.favoritesOnly
                    ? 'border-primary/45 bg-primary/12 text-primary'
                    : 'border-edge bg-canvas-deep/60 text-ink-soft hover:border-edge-strong'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${filters.favoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>
            </>
          )}

          <div className="relative ml-auto">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <select
              aria-label="Sort prompts"
              value={filters.sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="focus-ring h-9 appearance-none rounded-lg border border-edge bg-canvas-deep/60 pl-8 pr-8 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-edge-strong focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">
              ▾
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                resetFilters();
                setSearch('');
              }}
              className="focus-ring inline-flex h-9 items-center gap-1 rounded-lg border border-edge px-2.5 text-[12.5px] font-medium text-muted transition-colors hover:text-danger"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {isCustom && (
          <p className="mt-2.5 flex items-center gap-1.5 border-t border-edge pt-2.5 text-[12px] text-muted">
            <GripVertical className="h-3.5 w-3.5" />
            Drag the handle on any card to set your own order — it persists as{' '}
            <code className="font-mono text-[11px] text-ink-soft">displayOrder</code>.
          </p>
        )}

        {filters.search && (
          <p className="mt-2.5 border-t border-edge pt-2.5 text-[12px] text-muted">
            Showing results for{' '}
            <span className="font-medium text-ink">“{filters.search}”</span>
          </p>
        )}
      </div>

      {/* Category quick-nav on the category view */}
      {scope === 'category' && (
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = c.id === categoryId;
            const count = prompts.filter((p) => p.category === c.name).length;
            return (
              <Link
                key={c.id}
                to={`/categories/${c.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-all"
                style={{
                  color: active ? c.color : 'var(--muted)',
                  borderColor: active
                    ? `color-mix(in srgb, ${c.color} 50%, transparent)`
                    : 'var(--border)',
                  background: active
                    ? `color-mix(in srgb, ${c.color} 14%, transparent)`
                    : 'transparent',
                }}
              >
                {c.name}
                <span className="tabular-nums opacity-70">{count}</span>
              </Link>
            );
          })}
        </div>
      )}

      <PromptList
        prompts={visible}
        loading={loading}
        draggable={isCustom}
        onEdit={openEdit}
        onDelete={onDelete}
        onOpen={openDetails}
        emptyTitle={
          scope === 'favorites'
            ? 'No favorites yet'
            : scope === 'pinned'
              ? 'Nothing pinned'
              : filters.search
                ? `No prompts match “${filters.search}”`
                : scope === 'category'
                  ? `No ${activeCategory?.name ?? ''} prompts yet`
                  : 'Your library is empty'
        }
        emptyDescription={
          scope === 'favorites'
            ? 'Tap the star on any card to keep it within reach here.'
            : scope === 'pinned'
              ? 'Pin a prompt and it will float to the top of every list.'
              : scope === 'category'
                ? `Add your first ${activeCategory?.name ?? ''} prompt to start this collection.`
                : 'Create your first prompt or import an existing JSON library.'
        }
        emptyActionLabel="Create a prompt"
        onEmptyAction={() => openCreate(activeCategory?.name)}
        onClearFilters={hasActiveFilters ? () => { resetFilters(); setSearch(''); } : undefined}
      />
    </div>
  );
}

export default AllPromptsPage;
