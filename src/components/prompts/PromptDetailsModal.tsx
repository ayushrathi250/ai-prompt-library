import React from 'react';
import { Copy, Clock, Heart, Pin, Edit2, Trash2, Calendar, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { CategoryBadge, TagPill } from '../common/Badge';
import { usePrompts } from '../../context/PromptContext';

export const PromptDetailsModal: React.FC = () => {
  const {
    selectedPromptForView,
    setSelectedPromptForView,
    copyToClipboard,
    toggleFavorite,
    togglePin,
    setSelectedPromptForEdit,
    setPromptToDelete,
  } = usePrompts();

  if (!selectedPromptForView) return null;

  const prompt = selectedPromptForView;

  const createdDate = new Date(prompt.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const updatedDate = new Date(prompt.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Modal
      isOpen={!!selectedPromptForView}
      onClose={() => setSelectedPromptForView(null)}
      title={prompt.title}
      subtitle={prompt.description}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Badges & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={prompt.category} size="md" />
            {prompt.pinned && (
              <span className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3 fill-current" />
                Pinned
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(prompt._id)}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                prompt.favorite
                  ? 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${prompt.favorite ? 'fill-current text-rose-500' : ''}`} />
              {prompt.favorite ? 'Favorited' : 'Favorite'}
            </button>

            <button
              onClick={() => {
                setSelectedPromptForView(null);
                setSelectedPromptForEdit(prompt);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Full Prompt Display Box */}
        <div className="relative group">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-300 rounded-t-2xl border-b border-slate-800 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Prompt Content
            </span>

            <button
              onClick={() => copyToClipboard(prompt.prompt, prompt.title)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Prompt
            </button>
          </div>

          <pre className="p-5 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap rounded-b-2xl overflow-x-auto max-h-96 select-all border border-slate-800">
            {prompt.prompt}
          </pre>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag, idx) => (
                <TagPill key={idx} tag={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Timestamps & Actions */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Created: {createdDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Updated: {updatedDate}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedPromptForView(null);
              setPromptToDelete(prompt);
            }}
            className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Prompt
          </button>
        </div>
      </div>
    </Modal>
  );
};
