import { IPrompt, PromptCategory } from '../models/Prompt';

export interface PromptQueryFilter {
  search?: string;
  category?: string;
  favorite?: string;
  pinned?: string;
  sort?: string;
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

export interface PromptStats {
  totalPrompts: number;
  favoritePrompts: number;
  pinnedPrompts: number;
  categoriesCount: number;
  categoryBreakdown: Record<string, number>;
  recentlyAdded: any[];
}

export interface IPromptRepository {
  getPrompts(filter: PromptQueryFilter): Promise<any[]>;
  getPromptById(id: string): Promise<any | null>;
  createPrompt(data: {
    title: string;
    prompt: string;
    description?: string;
    category: PromptCategory;
    tags?: string[];
  }): Promise<any>;
  updatePrompt(id: string, data: any): Promise<any | null>;
  deletePrompt(id: string): Promise<boolean>;
  duplicatePrompt(id: string): Promise<any | null>;
  toggleFavorite(id: string): Promise<any | null>;
  togglePin(id: string): Promise<any | null>;
  reorderPrompts(items: ReorderItem[]): Promise<any[]>;
  importPrompts(prompts: any[]): Promise<number>;
  getStats(): Promise<PromptStats>;
}
