import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Moon, Sun, Plus, X, Command, Upload } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePrompts } from '../../context/PromptContext';

interface HeaderProps {
  onMenuClick: () => void;
  onNewPrompt: () => void;
  onImportExport: () => void;
}

export function Header({ onMenuClick, onNewPrompt, onImportExport }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  // `searchInput` is the raw value; PromptContext debounces it by 300ms
  // before it reaches `filters.search` and the list filtering.
  const { setSearch, searchInput } = usePrompts();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/prompts');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="focus-ring rounded-lg p-2 text-ink-soft transition-colors hover:bg-canvas-deep lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={submitSearch} className="relative min-w-0 max-w-2xl flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={2}
          />
          <input
            ref={inputRef}
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search titles, content, tags…"
            aria-label="Search prompts"
            className="focus-ring h-10 w-full rounded-xl border border-edge bg-surface/80 pl-10 pr-20 text-sm text-ink placeholder:text-muted/80 transition-colors focus:border-primary/50 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-edge bg-canvas-deep px-1.5 py-0.5 font-mono text-[10px] text-muted sm:flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          )}
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onImportExport}
            aria-label="Import or export prompts"
            title="Import / Export"
            className="focus-ring hidden rounded-lg border border-edge bg-surface/70 p-2 text-ink-soft transition-colors hover:border-edge-strong hover:text-ink sm:block"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="focus-ring relative overflow-hidden rounded-lg border border-edge bg-surface/70 p-2 text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
          >
            {isDark ? (
              <Sun className="h-4 w-4 animate-fade-in" strokeWidth={2} />
            ) : (
              <Moon className="h-4 w-4 animate-fade-in" strokeWidth={2} />
            )}
          </button>

          <button
            type="button"
            onClick={onNewPrompt}
            className="focus-ring group hidden items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90 sm:inline-flex"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
            New
          </button>

          <div className="ml-1 flex items-center gap-2 border-l border-edge pl-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-edge font-display text-[13px] font-semibold text-primary-ink"
              style={{ background: 'var(--primary)' }}
              title="Signed in as Avery Quinn"
            >
              AQ
            </div>
            <div className="hidden leading-tight xl:block">
              <div className="text-[13px] font-semibold text-ink">Avery Quinn</div>
              <div className="text-[11px] text-muted">Personal workspace</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
