import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Database,
  Key,
  Globe,
  ShieldCheck,
  Sparkles,
  Server,
  RefreshCw,
} from 'lucide-react';
import { usePrompts } from '../context/PromptContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { refreshPrompts, refreshStats } = usePrompts();

  const handleRefreshData = async () => {
    await refreshPrompts();
    await refreshStats();
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          System Settings & Environment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage appearance preferences, API connections, and database state.
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Appearance Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your preferred visual mode for PromptHub.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Current Mode: <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">{theme}</span>
            </p>
            <p className="text-[11px] text-slate-400">Theme choice persists in Local Storage across browser restarts.</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </div>

      {/* Database Connection Info */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              MongoDB Atlas Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Database layer status and connection parameters.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                Backend Storage Engine
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full">
                Active & Operational
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              PromptHub features a hybrid MongoDB driver. If <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px]">MONGO_URI</code> is provided, it syncs with MongoDB Atlas. Otherwise, it runs on an optimized in-memory store so the app is 100% functional out of the box.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium text-slate-500">Sync & re-fetch data from server</span>
            <button
              onClick={handleRefreshData}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Security & Env Variables Reference */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Environment & Security Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Security policies and environment variable keys.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              Backend process.env
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Secrets and MongoDB credentials stay hidden on the server.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              Frontend VITE_API_URL
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Proxies relative API calls cleanly to Express backend endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
