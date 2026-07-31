import { Request, Response } from 'express';
import { PromptModel } from '../models/Prompt';
import { isMongoConnected, getInMemoryPrompts, setInMemoryPrompts } from '../config/db';
import { createPromptSchema, updatePromptSchema, importPromptsSchema, reorderSchema } from '../validators/promptValidator';
import { SeedPrompt } from '../utils/seedData';

// Helper for memory filter & sort
function processInMemoryPrompts(
  prompts: SeedPrompt[],
  query: { search?: string; category?: string; favorite?: string; pinned?: string; sort?: string }
) {
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
    // Always put pinned items at top unless specifically sorting by custom order
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
      // custom / displayOrder
      return a.displayOrder - b.displayOrder;
    }
  });

  return list;
}

export const getPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, favorite, pinned, sort } = req.query as Record<string, string>;

    if (!isMongoConnected()) {
      const results = processInMemoryPrompts(getInMemoryPrompts(), {
        search: q,
        category,
        favorite,
        pinned,
        sort,
      });
      res.json({ success: true, count: results.length, data: results });
      return;
    }

    const filterObj: any = {};

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filterObj.$or = [
        { title: searchRegex },
        { prompt: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (category && category !== 'All') {
      filterObj.category = category;
    }

    if (favorite === 'true') {
      filterObj.favorite = true;
    }

    if (pinned === 'true') {
      filterObj.pinned = true;
    }

    let sortObj: any = {};
    if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'a-z') sortObj = { title: 1 };
    else if (sort === 'z-a') sortObj = { title: -1 };
    else sortObj = { pinned: -1, displayOrder: 1, createdAt: -1 };

    const prompts = await PromptModel.find(filterObj).sort(sortObj);
    res.json({ success: true, count: prompts.length, data: prompts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch prompts', error: (error as Error).message });
  }
};

export const getPromptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const found = getInMemoryPrompts().find((p) => p._id === id);
      if (!found) {
        res.status(404).json({ success: false, message: 'Prompt not found' });
        return;
      }
      res.json({ success: true, data: found });
      return;
    }

    const prompt = await PromptModel.findById(id);
    if (!prompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch prompt', error: (error as Error).message });
  }
};

export const createPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createPromptSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.error.issues });
      return;
    }

    const { title, prompt, description, category, tags } = validation.data;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const newPrompt: SeedPrompt = {
        _id: 'prompt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title,
        prompt,
        description: description || '',
        category,
        tags: tags || [],
        favorite: false,
        pinned: false,
        displayOrder: memoryList.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInMemoryPrompts([newPrompt, ...memoryList]);
      res.status(201).json({ success: true, data: newPrompt });
      return;
    }

    const count = await PromptModel.countDocuments();
    const newPrompt = await PromptModel.create({
      title,
      prompt,
      description: description || '',
      category,
      tags: tags || [],
      displayOrder: count + 1,
    });

    res.status(201).json({ success: true, data: newPrompt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create prompt', error: (error as Error).message });
  }
};

export const updatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validation = updatePromptSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.error.issues });
      return;
    }

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const index = memoryList.findIndex((p) => p._id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Prompt not found' });
        return;
      }

      const updated = {
        ...memoryList[index],
        ...validation.data,
        updatedAt: new Date().toISOString(),
      };
      memoryList[index] = updated;
      setInMemoryPrompts([...memoryList]);
      res.json({ success: true, data: updated });
      return;
    }

    const updatedPrompt = await PromptModel.findByIdAndUpdate(
      id,
      { ...validation.data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedPrompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }

    res.json({ success: true, data: updatedPrompt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update prompt', error: (error as Error).message });
  }
};

export const deletePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const filtered = memoryList.filter((p) => p._id !== id);
      if (filtered.length === memoryList.length) {
        res.status(404).json({ success: false, message: 'Prompt not found' });
        return;
      }
      setInMemoryPrompts(filtered);
      res.json({ success: true, message: 'Prompt deleted successfully', id });
      return;
    }

    const deleted = await PromptModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }

    res.json({ success: true, message: 'Prompt deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete prompt', error: (error as Error).message });
  }
};

export const duplicatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const original = memoryList.find((p) => p._id === id);
      if (!original) {
        res.status(404).json({ success: false, message: 'Original prompt not found' });
        return;
      }

      const copy: SeedPrompt = {
        ...original,
        _id: 'prompt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: `${original.title} (Copy)`,
        favorite: false,
        pinned: false,
        displayOrder: memoryList.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setInMemoryPrompts([copy, ...memoryList]);
      res.status(201).json({ success: true, data: copy });
      return;
    }

    const original = await PromptModel.findById(id);
    if (!original) {
      res.status(404).json({ success: false, message: 'Original prompt not found' });
      return;
    }

    const count = await PromptModel.countDocuments();
    const copy = await PromptModel.create({
      title: `${original.title} (Copy)`,
      prompt: original.prompt,
      description: original.description,
      category: original.category,
      tags: original.tags,
      favorite: false,
      pinned: false,
      displayOrder: count + 1,
    });

    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to duplicate prompt', error: (error as Error).message });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const target = memoryList.find((p) => p._id === id);
      if (!target) {
        res.status(404).json({ success: false, message: 'Prompt not found' });
        return;
      }
      target.favorite = !target.favorite;
      target.updatedAt = new Date().toISOString();
      setInMemoryPrompts([...memoryList]);
      res.json({ success: true, data: target });
      return;
    }

    const prompt = await PromptModel.findById(id);
    if (!prompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }

    prompt.favorite = !prompt.favorite;
    await prompt.save();

    res.json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle favorite', error: (error as Error).message });
  }
};

export const togglePin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const target = memoryList.find((p) => p._id === id);
      if (!target) {
        res.status(404).json({ success: false, message: 'Prompt not found' });
        return;
      }
      target.pinned = !target.pinned;
      target.updatedAt = new Date().toISOString();
      setInMemoryPrompts([...memoryList]);
      res.json({ success: true, data: target });
      return;
    }

    const prompt = await PromptModel.findById(id);
    if (!prompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }

    prompt.pinned = !prompt.pinned;
    await prompt.save();

    res.json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle pin', error: (error as Error).message });
  }
};

export const reorderPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = reorderSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.error.issues });
      return;
    }

    const items = validation.data;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const orderMap = new Map(items.map((i) => [i.id, i.displayOrder]));

      memoryList.forEach((p) => {
        if (orderMap.has(p._id)) {
          p.displayOrder = orderMap.get(p._id)!;
        }
      });

      setInMemoryPrompts([...memoryList]);
      res.json({ success: true, message: 'Display order updated successfully' });
      return;
    }

    const bulkOps: any[] = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await PromptModel.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Display order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reorder prompts', error: (error as Error).message });
  }
};

export const importPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON payload. Expected an array of prompt objects.',
      });
      return;
    }

    const validation = importPromptsSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed on imported items schema.',
        errors: validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
      return;
    }

    const itemsToImport = validation.data;

    if (!isMongoConnected()) {
      const memoryList = getInMemoryPrompts();
      const newItems: SeedPrompt[] = itemsToImport.map((item, idx) => ({
        _id: 'prompt-imp-' + Date.now() + '-' + idx,
        title: item.title,
        prompt: item.prompt,
        description: item.description || '',
        category: item.category,
        tags: item.tags || [],
        favorite: item.favorite || false,
        pinned: item.pinned || false,
        displayOrder: memoryList.length + idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setInMemoryPrompts([...newItems, ...memoryList]);
      res.status(201).json({
        success: true,
        importedCount: newItems.length,
        message: `Successfully imported ${newItems.length} prompts.`,
      });
      return;
    }

    const count = await PromptModel.countDocuments();
    const docs = itemsToImport.map((item, idx) => ({
      title: item.title,
      prompt: item.prompt,
      description: item.description || '',
      category: item.category,
      tags: item.tags || [],
      favorite: item.favorite || false,
      pinned: item.pinned || false,
      displayOrder: count + idx + 1,
    }));

    const inserted = await PromptModel.insertMany(docs as any);
    res.status(201).json({
      success: true,
      importedCount: inserted.length,
      message: `Successfully imported ${inserted.length} prompts.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to import prompts', error: (error as Error).message });
  }
};

export const exportPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    let list: any[] = [];
    if (!isMongoConnected()) {
      list = getInMemoryPrompts();
    } else {
      list = await PromptModel.find().sort({ displayOrder: 1, createdAt: -1 });
    }

    const sanitized = list.map((p) => ({
      title: p.title,
      prompt: p.prompt,
      description: p.description,
      category: p.category,
      tags: p.tags,
      favorite: p.favorite,
      pinned: p.pinned,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-prompts-export.json"');
    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export prompts', error: (error as Error).message });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      const list = getInMemoryPrompts();
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

      res.json({
        success: true,
        data: {
          totalPrompts,
          favoritePrompts,
          pinnedPrompts,
          categoriesCount: Object.keys(categoryBreakdown).length,
          categoryBreakdown,
          recentlyAdded,
        },
      });
      return;
    }

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

    res.json({
      success: true,
      data: {
        totalPrompts,
        favoritePrompts,
        pinnedPrompts,
        categoriesCount: Object.keys(categoryBreakdown).length,
        categoryBreakdown,
        recentlyAdded,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: (error as Error).message });
  }
};
