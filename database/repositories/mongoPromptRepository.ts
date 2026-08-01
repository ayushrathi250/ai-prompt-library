import { PromptModel, PromptCategory } from '../models/Prompt';
import { IPromptRepository, PromptQueryFilter, ReorderItem, PromptStats } from './promptRepository';
import { INITIAL_SEED_PROMPTS } from '../utils/seedData';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeInputData(data: any): any {
  const normalized: any = { ...data };
  if (data.content !== undefined && data.prompt === undefined) {
    normalized.prompt = data.content;
  }
  if (data.isFavorite !== undefined && data.favorite === undefined) {
    normalized.favorite = data.isFavorite;
  }
  if (data.isPinned !== undefined && data.pinned === undefined) {
    normalized.pinned = data.isPinned;
  }
  return normalized;
}

export class MongoPromptRepository implements IPromptRepository {
  async getPrompts(filter?: PromptQueryFilter): Promise<any[]> {
    const filterObj: any = {};

    if (filter?.search) {
      const escapedQuery = escapeRegExp(filter.search);
      const searchRegex = new RegExp(escapedQuery, 'i');
      filterObj.$or = [
        { title: searchRegex },
        { prompt: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (filter?.category && filter.category !== 'All') {
      filterObj.category = filter.category;
    }

    if (filter?.favorite === 'true') {
      filterObj.favorite = true;
    }

    if (filter?.pinned === 'true') {
      filterObj.pinned = true;
    }

    let sortObj: any = {};
    const sort = filter?.sort || 'custom';
    if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'a-z' || sort === 'az') sortObj = { title: 1 };
    else if (sort === 'z-a' || sort === 'za') sortObj = { title: -1 };
    else sortObj = { pinned: -1, displayOrder: 1, createdAt: -1 };

    const docs = await PromptModel.find(filterObj).sort(sortObj);
    return docs.map((doc) => doc.toJSON());
  }

  async getPromptById(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await PromptModel.findById(id);
    return doc ? doc.toJSON() : null;
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
    const normalized = normalizeInputData(data);
    const count = await PromptModel.countDocuments();

    const created = await PromptModel.create({
      title: normalized.title,
      prompt: normalized.prompt || normalized.content || '',
      description: normalized.description || '',
      category: normalized.category || 'Others',
      tags: normalized.tags || [],
      favorite: normalized.favorite || false,
      pinned: normalized.pinned || false,
      usageCount: normalized.usageCount || 0,
      displayOrder: normalized.displayOrder ?? (count + 1),
    });

    return created.toJSON();
  }

  async updatePrompt(id: string, data: any): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const normalized = normalizeInputData(data);

    const updated = await PromptModel.findByIdAndUpdate(
      id,
      { ...normalized, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return updated ? updated.toJSON() : null;
  }

  async deletePrompt(id: string): Promise<boolean> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;
    const deleted = await PromptModel.findByIdAndDelete(id);
    return !!deleted;
  }

  async duplicatePrompt(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const original = await PromptModel.findById(id);
    if (!original) return null;

    const count = await PromptModel.countDocuments();
    const copy = await PromptModel.create({
      title: `${original.title} (Copy)`,
      prompt: original.prompt,
      description: original.description,
      category: original.category,
      tags: [...original.tags],
      favorite: false,
      pinned: false,
      usageCount: 0,
      displayOrder: count + 1,
    });

    return copy.toJSON();
  }

  async toggleFavorite(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const prompt = await PromptModel.findById(id);
    if (!prompt) return null;

    prompt.favorite = !prompt.favorite;
    await prompt.save();
    return prompt.toJSON();
  }

  async togglePin(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const prompt = await PromptModel.findById(id);
    if (!prompt) return null;

    prompt.pinned = !prompt.pinned;
    await prompt.save();
    return prompt.toJSON();
  }

  async reorderPrompts(items: ReorderItem[]): Promise<any[]> {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    if (bulkOps.length > 0) {
      await PromptModel.bulkWrite(bulkOps as any);
    }

    return await this.getPrompts({});
  }

  async importPrompts(prompts: any[]): Promise<any[]> {
    const count = await PromptModel.countDocuments();
    const docs = prompts.map((item, idx) => {
      const norm = normalizeInputData(item);
      return {
        title: norm.title,
        prompt: norm.prompt || norm.content || '',
        description: norm.description || '',
        category: norm.category || 'Others',
        tags: norm.tags || [],
        favorite: norm.favorite || false,
        pinned: norm.pinned || false,
        usageCount: norm.usageCount || 0,
        displayOrder: norm.displayOrder ?? (count + idx + 1),
      };
    });

    await PromptModel.insertMany(docs);
    return await this.getPrompts({});
  }

  async resetLibrary(): Promise<any[]> {
    await PromptModel.deleteMany({});
    const docs = INITIAL_SEED_PROMPTS.map((item, idx) => ({
      title: item.title,
      prompt: item.prompt,
      description: item.description,
      category: item.category,
      tags: item.tags,
      favorite: item.favorite,
      pinned: item.pinned,
      usageCount: 0,
      displayOrder: idx + 1,
    }));
    await PromptModel.insertMany(docs);
    return await this.getPrompts({});
  }

  async registerUse(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const updated = await PromptModel.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    return updated ? updated.toJSON() : null;
  }

  async getStats(): Promise<PromptStats> {
    const total = await PromptModel.countDocuments();
    const favorites = await PromptModel.countDocuments({ favorite: true });
    const pinned = await PromptModel.countDocuments({ pinned: true });

    const categoriesAggregation = await PromptModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyAdded = await PromptModel.countDocuments({ createdAt: { $gte: weekAgo } });

    return {
      total,
      favorites,
      pinned,
      activeCategories: categoriesAggregation.length,
      recentlyAdded,
    };
  }
}
