import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Database,
  Server,
  RotateCcw,
  Keyboard,
  Download,
  Check,
} from 'lucide-react';
import { useTheme, type Theme } from '../context/ThemeContext';
import { usePrompts } from '../context/PromptContext';
import { hasBackend } from '../services/api';
import DeleteDialog from '../components/common/DeleteDialog';
import { CATEGORIES } from '../constants/categories';
import type { ShellContext } from '../App';

const THEME_OPTIONS: { value: Theme; label: string; hint: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Paper', hint: 'Warm light canvas', icon: Sun },
  { value: 'dark', label: 'Ink', hint: 'Low-glare dark canvas', icon: Moon },
];

const SHORTCUTS = [
  { keys: ['⌘', 'K'], action: 'Focus global search' },
  { keys: ['Enter'], action: 'Commit a tag in the form' },
  { keys: [','], action: 'Commit a tag in the form' },
  { keys: ['Esc'], action: 'Close any modal' },
];

function Section({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: typeof Sun;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-up rounded-xl border border-edge bg-surface/80 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-edge bg-canvas-deep/60 text-primary">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { prompts, stats, resetLibrary, exportToFile } = usePrompts();
  const { openImportExport } = useOutletContext<ShellContext>();
  const [resetOpen, setResetOpen] = useState(false);

  const systemPref =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="animate-fade-up">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Appearance, data and the shortcuts that keep you fast.
        </p>
      </div>

      <Section
        icon={Palette}
        title="Appearance"
        description="Pick a canvas. Your choice is saved to localStorage under app-theme."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  active
                    ? 'border-primary/55 bg-primary/8'
                    : 'border-edge bg-canvas-deep/40 hover:border-edge-strong'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                    active ? 'border-primary/40 text-primary' : 'border-edge text-muted'
                  }`}
                  style={{
                    background:
                      opt.value === 'light'
                        ? 'linear-gradient(135deg,#f5efe4,#fffdf8)'
                        : 'linear-gradient(135deg,#100e0c,#221d18)',
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                  <span className="block text-[12px] text-muted">{opt.hint}</span>
                </span>
                {active && (
                  <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-edge pt-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-canvas-deep"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            Toggle theme
          </button>
          <button
            type="button"
            onClick={() => setTheme(systemPref)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-canvas-deep"
          >
            <Monitor className="h-3.5 w-3.5" /> Match system ({systemPref})
          </button>
        </div>
      </Section>

      <Section
        icon={Database}
        title="Library data"
        description="Back up, restore or reset the prompts in this workspace."
        delay={60}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Prompts', value: stats.total },
            { label: 'Favorites', value: stats.favorites },
            { label: 'Pinned', value: stats.pinned },
            { label: 'Categories used', value: `${stats.activeCategories}/10` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-edge bg-canvas-deep/40 p-3"
            >
              <div className="font-display text-xl font-semibold tabular-nums text-ink">
                {item.value}
              </div>
              <div className="mt-0.5 text-[11.5px] text-muted">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void exportToFile()}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-ink transition-opacity hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
          <button
            type="button"
            onClick={openImportExport}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge px-3.5 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-canvas-deep"
          >
            Import / Export panel
          </button>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-lg border border-danger/35 px-3.5 py-2 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to samples
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-edge pt-4">
          {CATEGORIES.map((c) => {
            const count = prompts.filter((p) => p.category === c.name).length;
            return (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px]"
                style={{
                  color: count ? c.color : 'var(--muted)',
                  borderColor: count
                    ? `color-mix(in srgb, ${c.color} 38%, transparent)`
                    : 'var(--border)',
                  background: count
                    ? `color-mix(in srgb, ${c.color} 10%, transparent)`
                    : 'transparent',
                }}
              >
                {c.name}
                <span className="tabular-nums opacity-75">{count}</span>
              </span>
            );
          })}
        </div>
      </Section>

      <Section
        icon={Server}
        title="Backend connection"
        description="Where this client reads and writes prompts."
        delay={120}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-edge bg-canvas-deep/40 px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold text-ink">API status</div>
              <div className="mt-0.5 text-[12px] text-muted">
                {hasBackend
                  ? 'Connected to the configured REST API'
                  : 'No VITE_API_URL set — running on the local mock store'}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${
                hasBackend
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-edge bg-surface-2 text-muted'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${hasBackend ? 'bg-accent' : 'bg-muted'}`}
              />
              {hasBackend ? 'Live' : 'Mock'}
            </span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-muted">
            Requests route through a single axios instance —{' '}
            <code className="rounded bg-canvas-deep px-1.5 py-0.5 font-mono text-[11.5px] text-ink-soft">
              /api
            </code>{' '}
            in development,{' '}
            <code className="rounded bg-canvas-deep px-1.5 py-0.5 font-mono text-[11.5px] text-ink-soft">
              VITE_API_URL
            </code>{' '}
            in production. Set that variable to swap the mock store for a real server; no
            component code changes.
          </p>
        </div>
      </Section>

      <Section
        icon={Keyboard}
        title="Keyboard shortcuts"
        description="Small habits that add up."
        delay={180}
      >
        <ul className="divide-y divide-edge">
          {SHORTCUTS.map((s) => (
            <li key={s.action + s.keys.join()} className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ink-soft">{s.action}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md border border-edge bg-canvas-deep px-2 py-0.5 font-mono text-[11px] text-muted"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <DeleteDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => resetLibrary()}
        title="Reset library"
        description="This replaces every prompt in this workspace with the original sample set. Anything you created will be lost."
        confirmLabel="Reset library"
      />
    </div>
  );
}

export default SettingsPage;
