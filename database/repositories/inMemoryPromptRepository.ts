import { IPromptRepository, PromptQueryFilter, ReorderItem, PromptStats } from './promptRepository';
import { INITIAL_SEED_PROMPTS, SeedPrompt } from '../utils/seedData';
import { PromptCategory } from '../models/Prompt';

export class InMemoryPromptRepository implements IPromptRepository {
  private static prompts: SeedPrompt[] = [...INITIAL_SEED_PROMPTS];

  private processInMemoryPrompts(
    prompts: SeedPrompt[],
    query: PromptQueryFilter
  ): SeedPrompt[] {
    let list = [...prompts];

    if (query.search) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (query.category && query.category !== 'All') {
      list = list.filter((p) => p.category === query.category);
    }

    if (query.favorite === 'true') {
      list = list.filter((p) => p.favorite);
    }

    if (query.pinned === 'true') {
      list = list.filter((p) => p.pinned);
    }

    const sort = query.sort || 'custom';
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sort === 'a-z') {
        return a.title.localeCompare(b.title);
      } else if (sort === 'z-a') {
        return b.title.localeCompare(a.title);
      } else {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
    });

    return list;
  }

  async getPrompts(filter: PromptQueryFilter): Promise<any[]> {
    return this.processInMemoryPrompts(InMemoryPromptRepository.prompts, filter);
  }

  async getPromptById(id: string): Promise<any | null> {
    const found = InMemoryPromptRepository.prompts.find((p) => p._id === id);
    return found || null;
  }

  async createPrompt(data: {
    title: string;
    prompt: string;
    description?: string;
    category: PromptCategory;
    tags?: string[];
  }): Promise<any> {
    const newPrompt: SeedPrompt = {
      _id: 'prompt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: data.title,
      prompt: data.prompt,
      description: data.description || '',
      category: data.category,
      tags: data.tags || [],
      favorite: false,
      pinned: false,
      displayOrder: InMemoryPromptRepository.prompts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    InMemoryPromptRepository.prompts = [newPrompt, ...InMemoryPromptRepository.prompts];
    return newPrompt;
  }

  async updatePrompt(id: string, data: any): Promise<any | null> {
    const index = InMemoryPromptRepository.prompts.findIndex((p) => p._id === id);
    if (index === -1) return null;

    const updated = {
      ...InMemoryPromptRepository.prompts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    InMemoryPromptRepository.prompts[index] = updated;
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    const originalLength = InMemoryPromptRepository.prompts.length;
    InMemoryPromptRepository.prompts = InMemoryPromptRepository.prompts.filter((p) => p._id !== id);
    return InMemoryPromptRepository.prompts.length < originalLength;
  }

  async duplicatePrompt(id: string): Promise<any | null> {
    const original = InMemoryPromptRepository.prompts.find((p) => p._id === id);
    if (!original) return null;

    const copy: SeedPrompt = {
      ...original,
      _id: 'prompt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: `${original.title} (Copy)`,
      favorite: false,
      pinned: false,
      displayOrder: InMemoryPromptRepository.prompts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    InMemoryPromptRepository.prompts = [copy, ...InMemoryPromptRepository.prompts];
    return copy;
  }

  async toggleFavorite(id: string): Promise<any | null> {
    const target = InMemoryPromptRepository.prompts.find((p) => p._id === id);
    if (!target) return null;

    target.favorite = !target.favorite;
    target.updatedAt = new Date().toISOString();
    return target;
  }

  async togglePin(id: string): Promise<any | null> {
    const target = InMemoryPromptRepository.prompts.find((p) => p._id === id);
    if (!target) return null;

    target.pinned = !target.pinned;
    target.updatedAt = new Date().toISOString();
    return target;
  }

  async reorderPrompts(items: ReorderItem[]): Promise<any[]> {
    const orderMap = new Map(items.map((i) => [i.id, i.displayOrder]));

    InMemoryPromptRepository.prompts.forEach((p) => {
      if (orderMap.has(p._id)) {
        p.displayOrder = orderMap.get(p._id)!;
      }
    });

    return this.getPrompts({});
  }

  async importPrompts(prompts: any[]): Promise<number> {
    const newItems: SeedPrompt[] = prompts.map((item, idx) => ({
      _id: 'prompt-imp-' + Date.now() + '-' + idx,
      title: item.title,
      prompt: item.prompt,
      description: item.description || '',
      category: item.category,
      tags: item.tags || [],
      favorite: item.favorite || false,
      pinned: item.pinned || false,
      displayOrder: InMemoryPromptRepository.prompts.length + idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    InMemoryPromptRepository.prompts = [...newItems, ...InMemoryPromptRepository.prompts];
    return newItems.length;
  }

  async getStats(): Promise<PromptStats> {
    const list = InMemoryPromptRepository.prompts;
    const totalPrompts = list.length;
    const favoritePrompts = list.filter((p) => p.favorite).length;
    const pinnedPrompts = list.filter((p) => p.pinned).length;

    const categoryBreakdown: Record<string, number> = {};
    list.forEach((p) => {
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });

    const recentlyAdded = [...list]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalPrompts,
      favoritePrompts,
      pinnedPrompts,
      categoriesCount: Object.keys(categoryBreakdown).length,
      categoryBreakdown,
      recentlyAdded,
    };
  }
}
