import { PromptModel, IPrompt, PromptCategory } from '../models/Prompt';
import { IPromptRepository, PromptQueryFilter, ReorderItem, PromptStats } from './promptRepository';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MongoPromptRepository implements IPromptRepository {
  async getPrompts(filter: PromptQueryFilter): Promise<any[]> {
    const filterObj: any = {};

    if (filter.search) {
      const escapedQuery = escapeRegExp(filter.search);
      const searchRegex = new RegExp(escapedQuery, 'i');
      filterObj.$or = [
        { title: searchRegex },
        { prompt: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (filter.category && filter.category !== 'All') {
      filterObj.category = filter.category;
    }

    if (filter.favorite === 'true') {
      filterObj.favorite = true;
    }

    if (filter.pinned === 'true') {
      filterObj.pinned = true;
    }

    let sortObj: any = {};
    const sort = filter.sort || 'custom';
    if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'a-z') sortObj = { title: 1 };
    else if (sort === 'z-a') sortObj = { title: -1 };
    else sortObj = { pinned: -1, displayOrder: 1, createdAt: -1 };

    return await PromptModel.find(filterObj).sort(sortObj);
  }

  async getPromptById(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    return await PromptModel.findById(id);
  }

  async createPrompt(data: {
    title: string;
    prompt: string;
    description?: string;
    category: PromptCategory;
    tags?: string[];
  }): Promise<any> {
    const count = await PromptModel.countDocuments();
    return await PromptModel.create({
      title: data.title,
      prompt: data.prompt,
      description: data.description || '',
      category: data.category,
      tags: data.tags || [],
      displayOrder: count + 1,
    });
  }

  async updatePrompt(id: string, data: any): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    return await PromptModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
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
    return await PromptModel.create({
      title: `${original.title} (Copy)`,
      prompt: original.prompt,
      description: original.description,
      category: original.category,
      tags: original.tags,
      favorite: false,
      pinned: false,
      displayOrder: count + 1,
    });
  }

  async toggleFavorite(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const prompt = await PromptModel.findById(id);
    if (!prompt) return null;

    prompt.favorite = !prompt.favorite;
    return await prompt.save();
  }

  async togglePin(id: string): Promise<any | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const prompt = await PromptModel.findById(id);
    if (!prompt) return null;

    prompt.pinned = !prompt.pinned;
    return await prompt.save();
  }

  async reorderPrompts(items: ReorderItem[]): Promise<any[]> {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    if (bulkOps.length > 0) {
      await PromptModel.bulkWrite(bulkOps);
    }

    return await this.getPrompts({});
  }

  async importPrompts(prompts: any[]): Promise<number> {
    const count = await PromptModel.countDocuments();
    const docs = prompts.map((item, idx) => ({
      title: item.title,
      prompt: item.prompt,
      description: item.description || '',
      category: item.category,
      tags: item.tags || [],
      favorite: item.favorite || false,
      pinned: item.pinned || false,
      displayOrder: count + idx + 1,
    }));

    const inserted = await PromptModel.insertMany(docs);
    return inserted.length;
  }

  async getStats(): Promise<PromptStats> {
    const totalPrompts = await PromptModel.countDocuments();
    const favoritePrompts = await PromptModel.countDocuments({ favorite: true });
    const pinnedPrompts = await PromptModel.countDocuments({ pinned: true });

    const categoriesAggregation = await PromptModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryBreakdown: Record<string, number> = {};
    categoriesAggregation.forEach((item) => {
      categoryBreakdown[item._id] = item.count;
    });

    const recentlyAdded = await PromptModel.find().sort({ createdAt: -1 }).limit(5);

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
