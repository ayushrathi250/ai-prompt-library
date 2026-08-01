import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Copy,
  Check,
  Star,
  Pin,
  Pencil,
  CopyPlus,
  Trash2,
  FileText,
  Clock,
  Repeat2,
} from 'lucide-react';
import Modal from '../common/Modal';
import { Badge, TagPill, StatusChip } from '../common/Badge';
import type { Prompt } from '../../types/prompt';
import { usePrompts } from '../../context/PromptContext';

interface PromptDetailsModalProps {
  prompt: Prompt | null;
  open: boolean;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
}

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export function PromptDetailsModal({
  prompt,
  open,
  onClose,
  onEdit,
  onDelete,
}: PromptDetailsModalProps) {
  const { toggleFavorite, togglePin, duplicatePrompt, registerUse } = usePrompts();
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      registerUse(prompt.id);
      toast.success('Prompt copied to clipboard');
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Clipboard unavailable in this browser');
    }
  };

  const words = prompt.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<FileText className="h-5 w-5" strokeWidth={2} />}
      title={prompt.title}
      subtitle={prompt.description || 'No description added'}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              onDelete(prompt);
              onClose();
            }}
            className="focus-ring mr-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button
            type="button"
            onClick={() => duplicatePrompt(prompt)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-deep"
          >
            <CopyPlus className="h-4 w-4" /> Duplicate
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit(prompt);
              onClose();
            }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-deep"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge category={prompt.category} size="md" />
          <button
            type="button"
            onClick={() => toggleFavorite(prompt.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              prompt.isFavorite
                ? 'border-primary/45 bg-primary/12 text-primary'
                : 'border-edge text-muted hover:border-edge-strong hover:text-ink-soft'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${prompt.isFavorite ? 'fill-current' : ''}`} />
            {prompt.isFavorite ? 'Favorited' : 'Favorite'}
          </button>
          <button
            type="button"
            onClick={() => togglePin(prompt.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              prompt.isPinned
                ? 'border-accent/45 bg-accent/12 text-accent'
                : 'border-edge text-muted hover:border-edge-strong hover:text-ink-soft'
            }`}
          >
            <Pin className={`h-3.5 w-3.5 ${prompt.isPinned ? 'fill-current' : ''}`} />
            {prompt.isPinned ? 'Pinned' : 'Pin'}
          </button>
          <StatusChip>
            <Repeat2 className="h-3 w-3" /> used {prompt.usageCount}×
          </StatusChip>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Prompt
            </h4>
            <span className="font-mono text-[11px] text-muted">
              {words} words · {prompt.content.length} chars
            </span>
          </div>
          <pre className="max-h-[42vh] overflow-auto whitespace-pre-wrap rounded-xl border border-edge bg-canvas-deep/60 p-4 font-mono text-[12.5px] leading-relaxed text-ink-soft">
            {prompt.content}
          </pre>
        </div>

        {prompt.tags.length > 0 && (
          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 border-t border-edge pt-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Clock className="h-3.5 w-3.5" />
            Created {fullDate(prompt.createdAt)}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Clock className="h-3.5 w-3.5" />
            Updated {fullDate(prompt.updatedAt)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default PromptDetailsModal;
