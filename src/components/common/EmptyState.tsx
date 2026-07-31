import React from 'react';
import { Sparkles, Plus, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'sparkles' | 'search';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Create your first prompt',
  description = 'Build your personalized AI prompt library. Organize code snippets, marketing templates, and creative prompts with ease.',
  actionLabel = 'Create New Prompt',
  onAction,
  icon = 'sparkles',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 my-6">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10">
          {icon === 'sparkles' ? (
            <Sparkles className="w-10 h-10 animate-pulse" />
          ) : (
            <FolderSearch className="w-10 h-10" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
          <Plus className="w-5 h-5" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
