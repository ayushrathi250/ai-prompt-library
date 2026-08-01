import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  SortOption,
  DashboardStats,
  PromptCategory,
} from '../types/prompt';
import { promptService } from '../services/promptService';
import { useDebounce } from '../hooks/useDebounce';

export type NavigationTab = 'dashboard' | 'all' | 'favorites' | 'pinned' | 'category' | 'settings';

interface PromptContextType {
  prompts: Prompt[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  // View state
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;

  // Modal controls
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isImportExportModalOpen: boolean;
  setIsImportExportModalOpen: (open: boolean) => void;
  selectedPromptForView: Prompt | null;
  setSelectedPromptForView: (prompt: Prompt | null) => void;
  selectedPromptForEdit: Prompt | null;
  setSelectedPromptForEdit: (prompt: Prompt | null) => void;
  promptToDelete: Prompt | null;
  setPromptToDelete: (prompt: Prompt | null) => void;

  // API Methods
  refreshPrompts: () => Promise<void>;
  refreshStats: () => Promise<void>;
  createPrompt: (input: CreatePromptInput) => Promise<boolean>;
  updatePrompt: (id: string, input: UpdatePromptInput) => Promise<boolean>;
  deletePrompt: (id: string) => Promise<boolean>;
  duplicatePrompt: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  reorderPromptsLocallyAndSave: (reordered: Prompt[]) => Promise<void>;
  importPrompts: (jsonArray: any[]) => Promise<boolean>;
  exportPrompts: () => Promise<void>;
  copyToClipboard: (text: string, title?: string) => Promise<void>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('custom');

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState<boolean>(false);
  const [selectedPromptForView, setSelectedPromptForView] = useState<Prompt | null>(null);
  const [selectedPromptForEdit, setSelectedPromptForEdit] = useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter: any = {
        search: debouncedSearch,
        sort: sortOption,
      };

      if (activeTab === 'favorites') {
        filter.favorite = true;
      } else if (activeTab === 'pinned') {
        filter.pinned = true;
      } else if (activeTab === 'category' && selectedCategory !== 'All') {
        filter.category = selectedCategory;
      } else if (selectedCategory !== 'All') {
        filter.category = selectedCategory;
      }

      const data = await promptService.getPrompts(filter);
      setPrompts(data);
    } catch (err) {
      const msg = (err as Error).message || 'Failed to load prompts';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, sortOption, activeTab, selectedCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await promptService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
    fetchStats();
  }, [fetchPrompts, fetchStats]);

  const createPrompt = async (input: CreatePromptInput): Promise<boolean> => {
    const loadingToast = toast.loading('Creating prompt...');
    try {
      const newPrompt = await promptService.createPrompt(input);
      toast.success('Prompt created successfully!', { id: loadingToast });
      setPrompts((prev) => [newPrompt, ...prev]);
      fetchStats();
      setIsCreateModalOpen(false);
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Failed to create prompt', { id: loadingToast });
      return false;
    }
  };

  const updatePrompt = async (id: string, input: UpdatePromptInput): Promise<boolean> => {
    const loadingToast = toast.loading('Updating prompt...');
    try {
      const updated = await promptService.updatePrompt(id, input);
      toast.success('Prompt updated successfully!', { id: loadingToast });
      setPrompts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      if (selectedPromptForView?._id === id) setSelectedPromptForView(updated);
      fetchStats();
      setSelectedPromptForEdit(null);
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update prompt', { id: loadingToast });
      return false;
    }
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    const loadingToast = toast.loading('Deleting prompt...');
    try {
      await promptService.deletePrompt(id);
      toast.success('Prompt deleted successfully!', { id: loadingToast });
      setPrompts((prev) => prev.filter((p) => p._id !== id));
      if (selectedPromptForView?._id === id) setSelectedPromptForView(null);
      fetchStats();
      setPromptToDelete(null);
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Failed to delete prompt', { id: loadingToast });
      return false;
    }
  };

  const duplicatePrompt = async (id: string): Promise<boolean> => {
    const loadingToast = toast.loading('Duplicating prompt...');
    try {
      const copy = await promptService.duplicatePrompt(id);
      toast.success('Prompt duplicated successfully!', { id: loadingToast });
      setPrompts((prev) => [copy, ...prev]);
      fetchStats();
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Failed to duplicate prompt', { id: loadingToast });
      return false;
    }
  };

  const toggleFavorite = async (id: string) => {
    // Optimistic UI update
    setPrompts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, favorite: !p.favorite } : p))
    );

    try {
      const updated = await promptService.toggleFavorite(id);
      toast.success(updated.favorite ? 'Added to Favorites' : 'Removed from Favorites', {
        icon: updated.favorite ? '❤️' : '🤍',
      });
      fetchStats();
    } catch (err) {
      // Revert on error
      setPrompts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, favorite: !p.favorite } : p))
      );
      toast.error('Failed to update favorite status');
    }
  };

  const togglePin = async (id: string) => {
    // Optimistic UI update
    setPrompts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, pinned: !p.pinned } : p))
    );

    try {
      const updated = await promptService.togglePin(id);
      toast.success(updated.pinned ? 'Prompt Pinned to top' : 'Prompt Unpinned', {
        icon: updated.pinned ? '📌' : '📍',
      });
      fetchStats();
    } catch (err) {
      setPrompts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, pinned: !p.pinned } : p))
      );
      toast.error('Failed to update pin status');
    }
  };

  const reorderPromptsLocallyAndSave = async (reordered: Prompt[]) => {
    const previousPrompts = [...prompts];
    setPrompts(reordered);
    const orderedIds = reordered.map((item) => item._id);

    try {
      await promptService.reorderPrompts(orderedIds);
      toast.success('Display order saved', { duration: 1500 });
    } catch (err) {
      setPrompts(previousPrompts);
      toast.error('Failed to save display order');
    }
  };

  const importPrompts = async (jsonArray: any[]): Promise<boolean> => {
    const loadingToast = toast.loading('Importing prompts...');
    try {
      const result = await promptService.importPrompts(jsonArray);
      toast.success(result.message, { id: loadingToast });
      fetchPrompts();
      fetchStats();
      setIsImportExportModalOpen(false);
      return true;
    } catch (err) {
      toast.error((err as Error).message || 'Import failed', { id: loadingToast });
      return false;
    }
  };

  const exportPrompts = async () => {
    const loadingToast = toast.loading('Preparing export file...');
    try {
      await promptService.exportPrompts();
      toast.success('Prompts exported successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to export prompts', { id: loadingToast });
    }
  };

  const copyToClipboard = async (text: string, title?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(title ? `Copied "${title}" to clipboard!` : 'Prompt copied to clipboard!', {
        icon: '📋',
        style: {
          borderRadius: '12px',
          background: '#101827',
          color: '#f9fafb',
        },
      });
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <PromptContext.Provider
      value={{
        prompts,
        stats,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isImportExportModalOpen,
        setIsImportExportModalOpen,
        selectedPromptForView,
        setSelectedPromptForView,
        selectedPromptForEdit,
        setSelectedPromptForEdit,
        promptToDelete,
        setPromptToDelete,
        refreshPrompts: fetchPrompts,
        refreshStats: fetchStats,
        createPrompt,
        updatePrompt,
        deletePrompt,
        duplicatePrompt,
        toggleFavorite,
        togglePin,
        reorderPromptsLocallyAndSave,
        importPrompts,
        exportPrompts,
        copyToClipboard,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompts = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompts must be used within a PromptProvider');
  }
  return context;
};
