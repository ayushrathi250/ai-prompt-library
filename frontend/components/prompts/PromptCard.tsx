import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import {
  Copy,
  Check,
  Star,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  CopyPlus,
  GripVertical,
  MoreHorizontal,
  Maximize2,
  CalendarDays,
} from 'lucide-react';
import type { Prompt } from '../../types/prompt';
import { getCategory } from '../../constants/categories';
import { Badge, TagPill } from '../common/Badge';
import { usePrompts } from '../../context/PromptContext';

interface PromptCardProps {
  key?: React.Key;
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onOpen: (prompt: Prompt) => void;
  draggable?: boolean;
  index?: number;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onOpen,
  draggable = false,
  index = 0,
}: PromptCardProps) {
  const { toggleFavorite, togglePin, duplicatePrompt, registerUse } = usePrompts();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id, disabled: !draggable });

  const meta = getCategory(prompt.category);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
    animationDelay: `${Math.min(index, 10) * 35}ms`,
  } as React.CSSProperties;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      registerUse(prompt.id);
      toast.success('Prompt copied to clipboard', { id: `copy-${prompt.id}` });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Clipboard unavailable in this browser');
    }
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`animate-fade-up group relative flex h-full flex-col overflow-hidden rounded-xl border bg-surface/85 backdrop-blur-sm transition-shadow duration-200 ${
        isDragging
          ? 'border-primary/60 opacity-90 shadow-2xl shadow-black/20'
          : 'border-edge hover:border-edge-strong hover:shadow-lg hover:shadow-black/5'
      }`}
    >
      {/* Category accent rail */}
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${meta.color}, color-mix(in srgb, ${meta.color} 15%, transparent))`,
        }}
      />

      <div className="flex items-start gap-2 px-4 pb-2 pt-4">
        {draggable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="focus-ring -ml-1 mt-0.5 cursor-grab touch-none rounded-md p-1 text-muted opacity-50 transition-opacity hover:bg-canvas-deep hover:text-ink active:cursor-grabbing group-hover:opacity-100"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <Badge category={prompt.category} />

        <div className="ml-auto flex items-center gap-0.5">
          {prompt.isPinned && (
            <span
              title="Pinned"
              className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/12 text-primary"
            >
              <Pin className="h-3.5 w-3.5 fill-current" />
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(prompt.id)}
            aria-label={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`focus-ring rounded-md p-1.5 transition-all active:scale-90 ${
              prompt.isFavorite
                ? 'text-primary'
                : 'text-muted opacity-60 hover:text-primary group-hover:opacity-100'
            }`}
          >
            <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(prompt)}
        className="px-4 text-left"
      >
        <h3 className="font-display text-[17px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-primary">
          {prompt.title}
        </h3>
      </button>

      {prompt.description && (
        <p className="clamp-2 mt-1.5 px-4 text-[13px] leading-relaxed text-muted">
          {prompt.description}
        </p>
      )}

      <button
        type="button"
        onClick={() => onOpen(prompt)}
        className="mx-4 mt-3 rounded-lg border border-edge bg-canvas-deep/60 p-3 text-left transition-colors hover:border-edge-strong"
      >
        <p className="clamp-3 whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-ink-soft/85">
          {prompt.content}
        </p>
      </button>

      {prompt.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 px-4">
          {prompt.tags.slice(0, 4).map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
          {prompt.tags.length > 4 && (
            <span className="self-center text-[11px] text-muted">
              +{prompt.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-edge px-3 py-2.5 pt-3">
        <span className="flex items-center gap-1.5 pl-1 text-[11px] text-muted">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.8} />
          {formatDate(prompt.createdAt)}
        </span>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy prompt"
            aria-label="Copy prompt to clipboard"
            className={`focus-ring rounded-lg p-1.5 transition-colors ${
              copied ? 'text-accent' : 'text-muted hover:bg-canvas-deep hover:text-ink'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => togglePin(prompt.id)}
            title={prompt.isPinned ? 'Unpin' : 'Pin to top'}
            aria-label={prompt.isPinned ? 'Unpin prompt' : 'Pin prompt'}
            className="focus-ring rounded-lg p-1.5 text-muted transition-colors hover:bg-canvas-deep hover:text-ink"
          >
            {prompt.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => onEdit(prompt)}
            title="Edit"
            aria-label="Edit prompt"
            className="focus-ring rounded-lg p-1.5 text-muted transition-colors hover:bg-canvas-deep hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => window.setTimeout(() => setMenuOpen(false), 140)}
              title="More actions"
              aria-label="More actions"
              aria-expanded={menuOpen}
              className="focus-ring rounded-lg p-1.5 text-muted transition-colors hover:bg-canvas-deep hover:text-ink"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="animate-pop-in absolute bottom-full right-0 z-30 mb-1.5 w-44 overflow-hidden rounded-xl border border-edge bg-surface py-1 shadow-xl shadow-black/15">
                <button
                  type="button"
                  onClick={() => onOpen(prompt)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-canvas-deep hover:text-ink"
                >
                  <Maximize2 className="h-3.5 w-3.5" /> View details
                </button>
                <button
                  type="button"
                  onClick={() => duplicatePrompt(prompt)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-canvas-deep hover:text-ink"
                >
                  <CopyPlus className="h-3.5 w-3.5" /> Duplicate
                </button>
                <div className="my-1 h-px bg-edge" />
                <button
                  type="button"
                  onClick={() => onDelete(prompt)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-danger transition-colors hover:bg-danger/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default PromptCard;
