import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { PromptList } from '../components/prompts/PromptList';
import { CATEGORY_NAMES } from '../constants/categories';
import { SortOption } from '../types/prompt';
import { SlidersHorizontal, Sparkles, X, Plus } from 'lucide-react';

export const AllPromptsPage: React.FC = () => {
  const {
    prompts,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    setSelectedPromptForView,
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen,
    activeTab,
  } = usePrompts();

  const getPageTitle = () => {
    if (activeTab === 'favorites') return 'Favorite Prompts';
    if (activeTab === 'pinned') return 'Pinned Prompts';
    if (selectedCategory && selectedCategory !== 'All') return `${selectedCategory} Prompts`;
    return 'All Prompts Library';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            {getPageTitle()}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              {prompts.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag cards by their handle to customize prompt display ordering.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Prompt
        </button>
      </div>

      {/* Filtering & Sorting Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>

          {CATEGORY_NAMES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="custom">Custom (Drag & Drop)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">Title (A - Z)</option>
            <option value="z-a">Title (Z - A)</option>
          </select>
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Showing search results for "<span className="font-bold">{searchQuery}</span>"
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Prompts DnD Grid */}
      <PromptList
        prompts={prompts}
        isLoading={isLoading}
        onViewPrompt={setSelectedPromptForView}
        enableDrag={sortOption === 'custom'}
      />
    </div>
  );
};
