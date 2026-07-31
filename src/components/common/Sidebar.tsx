import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Heart,
  Pin,
  Upload,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { usePrompts, NavigationTab } from '../../context/PromptContext';
import { CATEGORIES } from '../../constants/categories';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    setIsImportExportModalOpen,
    exportPrompts,
    stats,
  } = usePrompts();

  const handleNavClick = (tab: NavigationTab, categoryName?: string) => {
    setActiveTab(tab);
    if (categoryName) setSelectedCategory(categoryName);
    else if (tab !== 'category') setSelectedCategory('All');
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'all' as NavigationTab,
      label: 'All Prompts',
      icon: FolderKanban,
      badge: stats?.totalPrompts || 0,
    },
    {
      id: 'favorites' as NavigationTab,
      label: 'Favorites',
      icon: Heart,
      badge: stats?.favoritePrompts || 0,
    },
    {
      id: 'pinned' as NavigationTab,
      label: 'Pinned',
      icon: Pin,
      badge: stats?.pinnedPrompts || 0,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                PromptHub
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Professional Prompt Engine</p>
            </div>
          )}
        </div>

        {/* Collapse toggle desktop button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Menu */}
        <div>
          {!isCollapsed && (
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
              Main Menu
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                  {!isCollapsed && item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categories Section */}
        <div>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Categories
              </p>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}

          <nav className="space-y-0.5">
            <button
              onClick={() => handleNavClick('all', 'All')}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === 'All' && activeTab === 'all'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {!isCollapsed && <span className="flex-1 text-left truncate">All Categories</span>}
            </button>

            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleNavClick('category', cat.name)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCatActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={cat.name}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.text}`} />
                  {!isCollapsed && <span className="flex-1 text-left truncate">{cat.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Data & Actions Section */}
        <div>
          {!isCollapsed && (
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
              Actions
            </p>
          )}

          <nav className="space-y-1">
            <button
              onClick={() => {
                setIsImportExportModalOpen(true);
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Import JSON Prompts"
            >
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {!isCollapsed && <span>Import</span>}
            </button>

            <button
              onClick={() => {
                exportPrompts();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Export JSON Prompts"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {!isCollapsed && <span>Export</span>}
            </button>

            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              {!isCollapsed && <span>Settings</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Footer / User Pro Card */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-100">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 truncate">Pro Plan Member</p>
            </div>
            <button
              onClick={toggleTheme}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[80vw] shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
