import { IPromptRepository, PromptQueryFilter, ReorderItem, PromptStats } from './promptRepository';
import { INITIAL_SEED_PROMPTS } from '../utils/seedData';
import { PromptCategory } from '../models/Prompt';

export class InMemoryPromptRepository implements IPromptRepository {
  private static prompts: any[] = INITIAL_SEED_PROMPTS.map((p, idx) => ({
    id: p._id,
    title: p.title,
    content: p.prompt,
    description: p.description,
    category: p.category,
    tags: p.tags,
    isFavorite: p.favorite,
    isPinned: p.pinned,
    displayOrder: idx + 1,
    usageCount: 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  private processInMemoryPrompts(
    prompts: any[],
    query: PromptQueryFilter
  ): any[] {
    let list = [...prompts];

    if (query.search) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.content && p.content.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (query.category && query.category !== 'All') {
      list = list.filter((p) => p.category === query.category);
    }

    if (query.favorite === 'true') {
      list = list.filter((p) => p.isFavorite);
    }

    if (query.pinned === 'true') {
      list = list.filter((p) => p.isPinned);
    }

    const sort = query.sort || 'custom';
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sort === 'a-z' || sort === 'az') {
        return a.title.localeCompare(b.title);
      } else if (sort === 'z-a' || sort === 'za') {
        return b.title.localeCompare(a.title);
      } else {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
    });

    return list;
  }

  async getPrompts(filter: PromptQueryFilter = {}): Promise<any[]> {
    return this.processInMemoryPrompts(InMemoryPromptRepository.prompts, filter);
  }

  async getPromptById(id: string): Promise<any | null> {
    const found = InMemoryPromptRepository.prompts.find((p) => p.id === id);
    return found || null;
  }

  async createPrompt(data: {
    title: string;
    content?: string;
    prompt?: string;
    description?: string;
    category: PromptCategory;
    tags?: string[];
    isFavorite?: boolean;
    isPinned?: boolean;
    usageCount?: number;
    displayOrder?: number;
  }): Promise<any> {
    const now = new Date().toISOString();
    const newPrompt: any = {
      id: 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7),
      title: data.title,
      content: data.content || data.prompt || '',
      description: data.description || '',
      category: data.category || 'Others',
      tags: data.tags || [],
      isFavorite: data.isFavorite || false,
      isPinned: data.isPinned || false,
      displayOrder: data.displayOrder ?? (InMemoryPromptRepository.prompts.length + 1),
      usageCount: data.usageCount || 0,
      createdAt: now,
      updatedAt: now,
    };
    InMemoryPromptRepository.prompts = [newPrompt, ...InMemoryPromptRepository.prompts];
    return newPrompt;
  }

  async updatePrompt(id: string, data: any): Promise<any | null> {
    const index = InMemoryPromptRepository.prompts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const normalizedData: any = { ...data };
    if (data.prompt !== undefined && data.content === undefined) {
      normalizedData.content = data.prompt;
    }
    if (data.favorite !== undefined && data.isFavorite === undefined) {
      normalizedData.isFavorite = data.favorite;
    }
    if (data.pinned !== undefined && data.isPinned === undefined) {
      normalizedData.isPinned = data.pinned;
    }

    const updated = {
      ...InMemoryPromptRepository.prompts[index],
      ...normalizedData,
      id,
      updatedAt: new Date().toISOString(),
    };
    InMemoryPromptRepository.prompts[index] = updated;
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    const originalLength = InMemoryPromptRepository.prompts.length;
    InMemoryPromptRepository.prompts = InMemoryPromptRepository.prompts.filter((p) => p.id !== id);
    return InMemoryPromptRepository.prompts.length < originalLength;
  }

  async duplicatePrompt(id: string): Promise<any | null> {
    const original = InMemoryPromptRepository.prompts.find((p) => p.id === id);
    if (!original) return null;

    const now = new Date().toISOString();
    const copy: any = {
      ...original,
      id: 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7),
      title: `${original.title} (Copy)`,
      isFavorite: false,
      isPinned: false,
      usageCount: 0,
      displayOrder: InMemoryPromptRepository.prompts.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    InMemoryPromptRepository.prompts = [copy, ...InMemoryPromptRepository.prompts];
    return copy;
  }

  async toggleFavorite(id: string): Promise<any | null> {
    const target = InMemoryPromptRepository.prompts.find((p) => p.id === id);
    if (!target) return null;

    target.isFavorite = !target.isFavorite;
    target.updatedAt = new Date().toISOString();
    return target;
  }

  async togglePin(id: string): Promise<any | null> {
    const target = InMemoryPromptRepository.prompts.find((p) => p.id === id);
    if (!target) return null;

    target.isPinned = !target.isPinned;
    target.updatedAt = new Date().toISOString();
    return target;
  }

  async reorderPrompts(items: ReorderItem[]): Promise<any[]> {
    const orderMap = new Map(items.map((i) => [i.id, i.displayOrder]));

    InMemoryPromptRepository.prompts.forEach((p) => {
      if (orderMap.has(p.id)) {
        p.displayOrder = orderMap.get(p.id)!;
      }
    });

    return this.getPrompts({});
  }

  async importPrompts(prompts: any[]): Promise<any[]> {
    const now = new Date().toISOString();
    const newItems: any[] = prompts.map((item, idx) => ({
      id: item.id || ('p-imp-' + Date.now().toString(36) + '-' + idx),
      title: item.title,
      content: item.content || item.prompt || '',
      description: item.description || '',
      category: item.category || 'Others',
      tags: item.tags || [],
      isFavorite: item.isFavorite !== undefined ? item.isFavorite : (item.favorite || false),
      isPinned: item.isPinned !== undefined ? item.isPinned : (item.pinned || false),
      displayOrder: item.displayOrder ?? (InMemoryPromptRepository.prompts.length + idx + 1),
      usageCount: item.usageCount || 0,
      createdAt: item.createdAt || now,
      updatedAt: now,
    }));

    InMemoryPromptRepository.prompts = [...newItems, ...InMemoryPromptRepository.prompts];
    return newItems;
  }

  async resetLibrary(): Promise<any[]> {
    InMemoryPromptRepository.prompts = INITIAL_SEED_PROMPTS.map((p, idx) => ({
      id: p._id,
      title: p.title,
      content: p.prompt,
      description: p.description,
      category: p.category,
      tags: p.tags,
      isFavorite: p.favorite,
      isPinned: p.pinned,
      displayOrder: idx + 1,
      usageCount: 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return [...InMemoryPromptRepository.prompts];
  }

  async registerUse(id: string): Promise<any | null> {
    const target = InMemoryPromptRepository.prompts.find((p) => p.id === id);
    if (!target) return null;
    target.usageCount = (target.usageCount || 0) + 1;
    target.updatedAt = new Date().toISOString();
    return target;
  }

  async getStats(): Promise<PromptStats> {
    const list = InMemoryPromptRepository.prompts;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const categories = new Set(list.map((p) => p.category));

    return {
      total: list.length,
      favorites: list.filter((p) => p.isFavorite).length,
      pinned: list.filter((p) => p.isPinned).length,
      activeCategories: categories.size,
      recentlyAdded: list.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).length,
    };
  }
}
