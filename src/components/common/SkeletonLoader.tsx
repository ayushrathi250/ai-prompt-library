import React from 'react';

export const PromptCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse flex flex-col justify-between h-64">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full mb-1" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 mb-4" />

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 h-16 w-full mb-3" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex gap-1">
          <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
};
