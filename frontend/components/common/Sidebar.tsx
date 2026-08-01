import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  Star,
  Pin,
  Settings,
  X,
  Plus,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '../../constants/categories';
import { usePrompts } from '../../context/PromptContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNewPrompt: () => void;
}

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/prompts', label: 'All Prompts', icon: Library, end: true },
  { to: '/favorites', label: 'Favorites', icon: Star, end: true },
  { to: '/pinned', label: 'Pinned', icon: Pin, end: true },
];

export function Sidebar({ open, onClose, onNewPrompt }: SidebarProps) {
  const { prompts, stats } = usePrompts();
  const [catsOpen, setCatsOpen] = useState(true);

  const countFor = (name: string) => prompts.filter((p) => p.category === name).length;

  const badgeFor = (to: string) => {
    if (to === '/prompts') return stats.total;
    if (to === '/favorites') return stats.favorites;
    if (to === '/pinned') return stats.pinned;
    return null;
  };

  const content = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-ink">
          <Sparkles className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <div className="font-display text-[17px] font-semibold leading-tight tracking-tight text-ink">
            Promptsmith
          </div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Prompt Library
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring ml-auto rounded-lg p-1.5 text-muted hover:bg-canvas-deep hover:text-ink lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onNewPrompt}
          className="focus-ring group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-ink shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          New prompt
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => {
            const badge = badgeFor(to);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/12 text-primary'
                        : 'text-ink-soft hover:bg-canvas-deep hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                      <span className="flex-1">{label}</span>
                      {badge !== null && badge > 0 && (
                        <span className="rounded-full bg-canvas-deep px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Categories */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setCatsOpen((v) => !v)}
            className="flex w-full items-center gap-1.5 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink-soft"
          >
            Categories
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${catsOpen ? '' : '-rotate-90'}`}
            />
          </button>
          {catsOpen && (
            <ul className="space-y-0.5">
              {CATEGORIES.map((cat) => {
                const count = countFor(cat.name);
                return (
                  <li key={cat.id}>
                    <NavLink
                      to={`/categories/${cat.id}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                          isActive
                            ? 'bg-canvas-deep font-medium text-ink'
                            : 'text-muted hover:bg-canvas-deep/70 hover:text-ink-soft'
                        }`
                      }
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full ring-2 transition-all"
                        style={
                          {
                            background: cat.color,
                            '--tw-ring-color': `color-mix(in srgb, ${cat.color} 22%, transparent)`,
                          } as React.CSSProperties
                        }
                      />
                      <span className="flex-1 truncate">{cat.name}</span>
                      <span className="text-[11px] tabular-nums opacity-70">{count}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 border-t border-edge pt-3">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/12 text-primary'
                  : 'text-ink-soft hover:bg-canvas-deep hover:text-ink'
              }`
            }
          >
            <Settings className="h-4 w-4" strokeWidth={2} />
            Settings
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-edge px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {stats.total} prompts · {stats.activeCategories}/10 categories
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop — fixed rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-edge bg-surface/70 backdrop-blur-xl lg:block">
        {content}
      </aside>

      {/* Mobile — drawer */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-[#100e0c]/55 backdrop-blur-[2px] animate-fade-in"
            onClick={onClose}
            aria-hidden
          />
          <aside className="animate-slide-in-left relative h-full w-[17rem] max-w-[85vw] border-r border-edge bg-surface shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
