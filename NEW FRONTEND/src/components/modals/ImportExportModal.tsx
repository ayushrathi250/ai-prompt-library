import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileJson,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ClipboardPaste,
} from 'lucide-react';
import Modal from '../common/Modal';
import { usePrompts } from '../../context/PromptContext';
import type { ImportSummary } from '../../types/prompt';

interface ImportExportModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'export' | 'import';

const SAMPLE = `[
  {
    "title": "Weekly Standup Summariser",
    "content": "Summarise these standup notes into blockers, wins and asks...",
    "description": "Turns raw notes into a shareable digest",
    "category": "Productivity",
    "tags": ["standup", "summary"]
  }
]`;

export function ImportExportModal({ open, onClose }: ImportExportModalProps) {
  const { prompts, exportToFile, importFromJson } = usePrompts();
  const [tab, setTab] = useState<Tab>('export');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pasted, setPasted] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const runImport = async (raw: string, source: string) => {
    setBusy(true);
    setSummary(null);
    try {
      const parsed = JSON.parse(raw);
      const result = await importFromJson(parsed);
      setSummary(result);
      setFileName(source);
      if (result.imported && !result.failed) {
        toast.success(`Imported ${result.imported} prompt${result.imported === 1 ? '' : 's'}`);
      } else if (result.imported) {
        toast(
          `Imported ${result.imported} · skipped ${result.failed} invalid`,
          { icon: '⚠️' },
        );
      } else {
        toast.error(`No valid prompts found — ${result.failed} entries rejected`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not read that file';
      toast.error(message);
      setSummary({ imported: 0, failed: 0, errors: [message] });
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast.error('Please choose a .json file');
      return;
    }
    const text = await file.text();
    await runImport(text, file.name);
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportToFile();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setSummary(null);
    setFileName(null);
    setPasted('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      icon={<FileJson className="h-5 w-5" strokeWidth={2} />}
      title="Import & Export"
      subtitle="Move your library between devices as portable JSON."
    >
      <div className="mb-5 inline-flex rounded-lg border border-edge bg-canvas-deep/60 p-1">
        {(['export', 'import'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-semibold capitalize transition-colors ${
              tab === t ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink-soft'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'export' ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-edge bg-canvas-deep/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  {prompts.length} prompts ready
                </p>
                <p className="mt-0.5 text-[13px] text-muted">
                  Downloads as{' '}
                  <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-soft">
                    ai-prompts-export.json
                  </code>
                </p>
              </div>
              <ArrowDownToLine className="h-8 w-8 text-primary opacity-40" strokeWidth={1.5} />
            </div>
          </div>

          <ul className="space-y-1.5 text-[13px] text-muted">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              Includes titles, content, categories, tags, favorites & pins
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              Preserves your custom drag order via <code className="font-mono">displayOrder</code>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              Re-importable into any Promptsmith workspace
            </li>
          </ul>

          <button
            type="button"
            onClick={handleExport}
            disabled={busy || !prompts.length}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4" />
            )}
            Download JSON
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/8'
                : 'border-edge-strong bg-canvas-deep/40'
            }`}
          >
            <ArrowUpFromLine className="mb-3 h-7 w-7 text-primary" strokeWidth={1.6} />
            <p className="text-sm font-medium text-ink">Drop a JSON file here</p>
            <p className="mt-1 text-[13px] text-muted">or</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="focus-ring mt-2 rounded-lg border border-edge bg-surface px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-edge-strong disabled:opacity-50"
            >
              {busy ? 'Validating…' : 'Browse files'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
          </div>

          <details className="group rounded-xl border border-edge bg-canvas-deep/40 p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] font-medium text-ink-soft">
              <ClipboardPaste className="h-3.5 w-3.5" /> Paste JSON instead
            </summary>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={6}
              placeholder={SAMPLE}
              className="mt-3 w-full resize-y rounded-lg border border-edge bg-surface px-3 py-2 font-mono text-[11.5px] leading-relaxed text-ink placeholder:text-muted/60 focus:border-primary/60 focus:outline-none"
            />
            <button
              type="button"
              disabled={!pasted.trim() || busy}
              onClick={() => void runImport(pasted, 'pasted JSON')}
              className="focus-ring mt-2 rounded-lg border border-edge bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-edge-strong disabled:opacity-50"
            >
              Validate & import
            </button>
          </details>

          {summary && (
            <div className="animate-fade-up space-y-2 rounded-xl border border-edge bg-canvas-deep/50 p-4">
              <p className="text-[13px] font-semibold text-ink">
                Result{fileName ? ` · ${fileName}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[12px] font-medium text-accent">
                  <CheckCircle2 className="h-3 w-3" /> {summary.imported} imported
                </span>
                {summary.failed > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/10 px-2.5 py-0.5 text-[12px] font-medium text-danger">
                    <AlertCircle className="h-3 w-3" /> {summary.failed} rejected
                  </span>
                )}
              </div>
              {summary.errors.length > 0 && (
                <ul className="mt-1 space-y-1 font-mono text-[11.5px] leading-relaxed text-muted">
                  {summary.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-[12px] leading-relaxed text-muted">
            Each entry needs at least <code className="font-mono">title</code> and{' '}
            <code className="font-mono">content</code>. Unknown categories fall back to{' '}
            <span className="text-ink-soft">Others</span>; invalid entries are skipped, not
            merged.
          </p>
        </div>
      )}
    </Modal>
  );
}

export default ImportExportModal;
