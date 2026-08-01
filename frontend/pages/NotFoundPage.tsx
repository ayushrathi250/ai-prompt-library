import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { setActiveTab } = usePrompts();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-800">
        <Sparkles className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        The prompt template or page view you were looking for does not exist or has been moved.
      </p>

      <button
        onClick={() => setActiveTab('dashboard')}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </button>
    </div>
  );
};
