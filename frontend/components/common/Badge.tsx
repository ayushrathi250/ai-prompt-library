import React from 'react';
import { PromptCategory } from '../../types/prompt';
import { getCategoryInfo } from '../../constants/categories';

interface CategoryBadgeProps {
  category: PromptCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md', className = '' }) => {
  const info = getCategoryInfo(category);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded-full',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-full',
    lg: 'px-3 py-1.5 text-sm font-semibold rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border transition-all ${info.badgeColor} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {info.name}
    </span>
  );
};

interface TagPillProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export const TagPill: React.FC<TagPillProps> = ({ tag, onRemove, onClick, className = '' }) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-md transition-colors ${
        onClick ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700' : ''
      } ${className}`}
    >
      #{tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          &times;
        </button>
      )}
    </span>
  );
};
