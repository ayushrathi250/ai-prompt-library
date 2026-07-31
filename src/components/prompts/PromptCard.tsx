import React from 'react';
import { motion } from 'motion/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Heart,
  Pin,
  Copy,
  GripVertical,
  Edit2,
  Trash2,
  CopyPlus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Prompt } from '../../types/prompt';
import { CategoryBadge, TagPill } from '../common/Badge';
import { usePrompts } from '../../context/PromptContext';

interface PromptCardProps {
  prompt: Prompt;
  onView: (prompt: Prompt) => void;
  isSortable?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onView, isSortable = true }) => {
  const {
    toggleFavorite,
    togglePin,
    copyToClipboard,
    setSelectedPromptForEdit,
    setPromptToDelete,
    duplicatePrompt,
  } = usePrompts();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt._id,
    disabled: !isSortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const formattedCreated = new Date(prompt.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900 border ${
        prompt.pinned
          ? 'border-indigo-500/50 dark:border-indigo-500/60 shadow-indigo-500/5'
          : 'border-slate-200 dark:border-slate-800 shadow-sm'
      } hover:shadow-md transition-all h-full overflow-hidden`}
    >
      {/* Top Bar & Content Area */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Drag Handle */}
            {isSortable && (
              <button
                {...attributes}
                {...listeners}
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}

            <CategoryBadge category={prompt.category} size="sm" />

            {prompt.pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-full">
                <Pin className="w-2.5 h-2.5 fill-current" />
                Pinned
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(prompt._id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                prompt.favorite
                  ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={prompt.favorite ? 'Remove Favorite' : 'Mark Favorite'}
            >
              <Heart className={`w-4 h-4 ${prompt.favorite ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePin(prompt._id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                prompt.pinned
                  ? 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={prompt.pinned ? 'Unpin Prompt' : 'Pin to Top'}
            >
              <Pin className={`w-4 h-4 ${prompt.pinned ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(prompt)}
          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 transition-colors mb-1"
        >
          {prompt.title}
        </h3>

        {/* Description */}
        {prompt.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {prompt.description}
          </p>
        )}

        {/* Prompt Preview Box */}
        <div
          onClick={() => onView(prompt)}
          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-3 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors relative group/box"
        >
          {prompt.prompt}
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {prompt.tags.slice(0, 3).map((tag, idx) => (
              <TagPill key={idx} tag={tag} />
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 self-center">
                +{prompt.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar Controls / Footer */}
      <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          {formattedCreated}
        </span>

        <div className="flex items-center gap-1">
          {/* Copy Prompt Button */}
          <button
            type="button"
            onClick={() => copyToClipboard(prompt.prompt, prompt.title)}
            className="px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1"
            title="Copy prompt text"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => duplicatePrompt(prompt._id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            title="Duplicate Prompt"
          >
            <CopyPlus className="w-3.5 h-3.5" />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => setSelectedPromptForEdit(prompt)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            title="Edit Prompt"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setPromptToDelete(prompt)}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Prompt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
