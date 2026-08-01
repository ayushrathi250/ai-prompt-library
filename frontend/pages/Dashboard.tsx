import React from 'react';
import { motion } from 'motion/react';
import {
  FolderKanban,
  Heart,
  Layers,
  Sparkles,
  Plus,
  Upload,
  Download,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { usePrompts } from '../context/PromptContext';
import { PromptCard } from '../components/prompts/PromptCard';
import { CATEGORIES, getCategoryInfo } from '../constants/categories';
import { StatCardSkeleton } from '../components/common/SkeletonLoader';

export const DashboardPage: React.FC = () => {
  const {
    stats,
    isLoading,
    setActiveTab,
    setSelectedCategory,
    setIsCreateModalOpen,
    setIsImportExportModalOpen,
    setSelectedPromptForView,
  } = usePrompts();

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setActiveTab('category');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-indigo-500/40 text-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Prompt Engine Workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Welcome to your AI Prompt Library
          </h1>
          <p className="text-xs text-indigo-100/90 leading-relaxed">
            Manage, organize, and execute high-converting prompt templates across specialized categories with MongoDB persistence.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            New Prompt
          </button>
          <button
            onClick={() => setIsImportExportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg border border-indigo-500/50 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-indigo-200" />
            Import JSON
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div>
        <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          Analytics & Overview
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Prompts"
              value={stats?.totalPrompts || 0}
              subtitle="Active templates in database"
              icon={FolderKanban}
              onClick={() => setActiveTab('all')}
            />
            <StatCard
              title="Favorites"
              value={stats?.favoritePrompts || 0}
              subtitle="Bookmarked for fast access"
              icon={Heart}
              onClick={() => setActiveTab('favorites')}
            />
            <StatCard
              title="Categories"
              value={stats?.categoriesCount || 0}
              subtitle="Specialized prompt domains"
              icon={Layers}
              onClick={() => setActiveTab('all')}
            />
            <StatCard
              title="Recently Added"
              value={stats?.recentlyAdded?.length || 0}
              subtitle="Added in past sessions"
              icon={Sparkles}
              onClick={() => setActiveTab('all')}
            />
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Explore Categories
          </h2>
          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All Prompts <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const count = stats?.categoryBreakdown[cat.name] || 0;
            return (
              <motion.button
                key={cat.name}
                whileHover={{ y: -2 }}
                onClick={() => handleCategoryClick(cat.name)}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left transition-all hover:border-indigo-300 dark:hover:border-indigo-700 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-current ${cat.text}`} />
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recently Added Prompts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Recently Added Prompts
          </h2>
          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            See full library <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.recentlyAdded && stats.recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.recentlyAdded.map((prompt) => (
              <PromptCard
                key={prompt._id}
                prompt={prompt}
                onView={setSelectedPromptForView}
                isSortable={false}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium">
            No recent prompts available.
          </div>
        )}
      </div>
    </div>
  );
};
