import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import promptService from '../services/promptService';
import type {
  ImportSummary,
  Prompt,
  PromptPayload,
  PromptStats,
  SortOption,
} from '../types/prompt';
import { CATEGORIES } from '../constants/categories';
import { useDebounce } from '../hooks/useDebounce';

/** Anchor taken once per session so `stats` stays a pure computation. */
const SESSION_START = Date.now();

interface Filters {
  search: string;
  category: string | null;
  favoritesOnly: boolean;
  pinnedOnly: boolean;
  sort: SortOption;
}

interface PromptContextValue {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  /** Raw (un-debounced) search box value — the header binds to this. */
  searchInput: string;
  stats: PromptStats;
  setSearch: (value: string) => void;
  setCategory: (value: string | null) => void;
  setFavoritesOnly: (value: boolean) => void;
  setPinnedOnly: (value: boolean) => void;
  setSort: (value: SortOption) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  addPrompt: (payload: PromptPayload) => Promise<Prompt | null>;
  editPrompt: (id: string, payload: Partial<Prompt>) => Promise<Prompt | null>;
  removePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (prompt: Prompt) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
  importFromJson: (raw: unknown) => Promise<ImportSummary>;
  exportToFile: () => Promise<void>;
  resetLibrary: () => Promise<void>;
  registerUse: (id: string) => void;
  getVisiblePrompts: (scope?: Partial<Filters>) => Prompt[];
}

const PromptContext = createContext<PromptContextValue | undefined>(undefined);

type BaseFilters = Omit<Filters, 'search'>;

const DEFAULT_FILTERS: BaseFilters = {
  category: null,
  favoritesOnly: false,
  pinnedOnly: false,
  sort: 'newest',
};

function matchesSearch(prompt: Prompt, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    prompt.title.toLowerCase().includes(q) ||
    prompt.description.toLowerCase().includes(q) ||
    prompt.content.toLowerCase().includes(q) ||
    prompt.category.toLowerCase().includes(q) ||
    prompt.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function sortPrompts(list: Prompt[], sort: SortOption): Prompt[] {
  const sorted = [...list];
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case 'oldest':
      sorted.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
      break;
    case 'az':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'za':
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'custom':
      sorted.sort((a, b) => a.displayOrder - b.displayOrder);
      break;
  }
  // Pinned prompts always float to the top, whatever the sort.
  return [
    ...sorted.filter((p) => p.isPinned),
    ...sorted.filter((p) => !p.isPinned),
  ];
}

export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseFilters, setFilters] = useState<BaseFilters>(DEFAULT_FILTERS);

  // The raw input lives here so every consumer (header, pages) shares one
  // source of truth; the 300ms debounce is applied before filtering.
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const filters = useMemo<Filters>(
    () => ({ ...baseFilters, search: debouncedSearch }),
    [baseFilters, debouncedSearch],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promptService.list();
      setPrompts(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load prompts';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch. Written as an async IIFE (rather than calling `refresh`)
  // so no state is set synchronously during the effect body.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await promptService.list();
        if (!cancelled) setPrompts(data);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'Failed to load prompts';
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------ CRUD ------------------------------ */

  const addPrompt = useCallback(async (payload: PromptPayload) => {
    try {
      const created = await promptService.create(payload);
      setPrompts((prev) => [created, ...prev]);
      toast.success(`“${created.title}” saved to your library`);
      return created;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create prompt');
      return null;
    }
  }, []);

  const editPrompt = useCallback(
    async (id: string, payload: Partial<Prompt>) => {
      const snapshot = prompts;
      // Optimistic update
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...payload } : p)),
      );
      try {
        const updated = await promptService.update(id, payload);
        setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        toast.success('Prompt updated');
        return updated;
      } catch (e) {
        setPrompts(snapshot); // rollback
        toast.error(e instanceof Error ? e.message : 'Could not update prompt');
        return null;
      }
    },
    [prompts],
  );

  const removePrompt = useCallback(
    async (id: string) => {
      const snapshot = prompts;
      const target = prompts.find((p) => p.id === id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      try {
        await promptService.remove(id);
        toast.success(`“${target?.title ?? 'Prompt'}” deleted`);
      } catch (e) {
        setPrompts(snapshot); // rollback
        toast.error(e instanceof Error ? e.message : 'Could not delete prompt');
      }
    },
    [prompts],
  );

  const duplicatePrompt = useCallback(async (prompt: Prompt) => {
    try {
      const copy = await promptService.create({
        title: `${prompt.title} (Copy)`,
        content: prompt.content,
        description: prompt.description,
        category: prompt.category,
        tags: [...prompt.tags],
        isFavorite: false,
        isPinned: false,
        usageCount: 0,
      });
      setPrompts((prev) => [copy, ...prev]);
      toast.success('Duplicated as a new draft');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not duplicate prompt');
    }
  }, []);

  /* --------------------- favourite / pin (optimistic) --------------- */

  const toggleFavorite = useCallback(
    async (id: string) => {
      const snapshot = prompts;
      const current = prompts.find((p) => p.id === id);
      if (!current) return;
      const next = !current.isFavorite;
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite: next } : p)),
      );
      try {
        await promptService.update(id, { isFavorite: next });
        toast.success(next ? 'Added to favorites' : 'Removed from favorites', {
          id: `fav-${id}`,
        });
      } catch (e) {
        setPrompts(snapshot); // rollback on failure
        toast.error(e instanceof Error ? e.message : 'Could not update favorite');
      }
    },
    [prompts],
  );

  const togglePin = useCallback(
    async (id: string) => {
      const snapshot = prompts;
      const current = prompts.find((p) => p.id === id);
      if (!current) return;
      const next = !current.isPinned;
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPinned: next } : p)),
      );
      try {
        await promptService.update(id, { isPinned: next });
        toast.success(next ? 'Pinned to the top' : 'Unpinned', { id: `pin-${id}` });
      } catch (e) {
        setPrompts(snapshot);
        toast.error(e instanceof Error ? e.message : 'Could not update pin');
      }
    },
    [prompts],
  );

  /* ------------------------------ reorder --------------------------- */

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      const snapshot = prompts;
      const orderMap = new Map(orderedIds.map((id, index) => [id, index]));
      setPrompts((prev) =>
        prev.map((p) =>
          orderMap.has(p.id) ? { ...p, displayOrder: orderMap.get(p.id)! } : p,
        ),
      );
      try {
        await promptService.reorder(
          orderedIds.map((id, index) => ({ id, displayOrder: index })),
        );
      } catch (e) {
        setPrompts(snapshot);
        toast.error(e instanceof Error ? e.message : 'Could not save new order');
      }
    },
    [prompts],
  );

  /* --------------------------- import / export ---------------------- */

  const importFromJson = useCallback(async (raw: unknown) => {
    const { prompts: imported, summary } = await promptService.import(raw);
    if (imported.length) setPrompts((prev) => [...imported, ...prev]);
    return summary;
  }, []);

  const exportToFile = useCallback(async () => {
    const data = await promptService.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-prompts-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} prompts`);
  }, []);

  const resetLibrary = useCallback(async () => {
    try {
      const fresh = await promptService.reset();
      setPrompts(fresh);
      toast.success('Library restored to the sample set');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not reset library');
    }
  }, []);

  /** Local-only counter bump when a prompt is copied. */
  const registerUse = useCallback((id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p)),
    );
    // TODO(backend): POST /prompts/:id/use to persist usage analytics.
  }, []);

  /* ------------------------------ filters --------------------------- */

  const setSearch = useCallback((search: string) => setSearchInput(search), []);
  const setCategory = useCallback(
    (category: string | null) => setFilters((f) => ({ ...f, category })),
    [],
  );
  const setFavoritesOnly = useCallback(
    (favoritesOnly: boolean) => setFilters((f) => ({ ...f, favoritesOnly })),
    [],
  );
  const setPinnedOnly = useCallback(
    (pinnedOnly: boolean) => setFilters((f) => ({ ...f, pinnedOnly })),
    [],
  );
  const setSort = useCallback((sort: SortOption) => setFilters((f) => ({ ...f, sort })), []);
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const getVisiblePrompts = useCallback(
    (scope: Partial<Filters> = {}) => {
      const f = { ...filters, ...scope };
      const filtered = prompts.filter((p) => {
        if (!matchesSearch(p, f.search.trim())) return false;
        if (f.category && p.category !== f.category) return false;
        if (f.favoritesOnly && !p.isFavorite) return false;
        if (f.pinnedOnly && !p.isPinned) return false;
        return true;
      });
      return sortPrompts(filtered, f.sort);
    },
    [prompts, filters],
  );

  const stats = useMemo<PromptStats>(() => {
    const weekAgo = SESSION_START - 7 * 24 * 60 * 60 * 1000;
    return {
      total: prompts.length,
      favorites: prompts.filter((p) => p.isFavorite).length,
      pinned: prompts.filter((p) => p.isPinned).length,
      activeCategories: CATEGORIES.filter((c) =>
        prompts.some((p) => p.category === c.name),
      ).length,
      recentlyAdded: prompts.filter((p) => +new Date(p.createdAt) >= weekAgo).length,
    };
  }, [prompts]);

  const value = useMemo<PromptContextValue>(
    () => ({
      prompts,
      loading,
      error,
      filters,
      searchInput,
      stats,
      setSearch,
      setCategory,
      setFavoritesOnly,
      setPinnedOnly,
      setSort,
      resetFilters,
      refresh,
      addPrompt,
      editPrompt,
      removePrompt,
      duplicatePrompt,
      toggleFavorite,
      togglePin,
      reorder,
      importFromJson,
      exportToFile,
      resetLibrary,
      registerUse,
      getVisiblePrompts,
    }),
    [
      prompts,
      loading,
      error,
      filters,
      searchInput,
      stats,
      setSearch,
      setCategory,
      setFavoritesOnly,
      setPinnedOnly,
      setSort,
      resetFilters,
      refresh,
      addPrompt,
      editPrompt,
      removePrompt,
      duplicatePrompt,
      toggleFavorite,
      togglePin,
      reorder,
      importFromJson,
      exportToFile,
      resetLibrary,
      registerUse,
      getVisiblePrompts,
    ],
  );

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrompts() {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error('usePrompts must be used within a PromptProvider');
  return ctx;
}

export default PromptContext;
