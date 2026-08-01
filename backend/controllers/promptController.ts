import { Request, Response } from 'express';
import { getPromptRepository } from '../../database/config/db';
import { createPromptSchema, updatePromptSchema, importPromptsSchema, reorderSchema } from '../validators/promptValidator';

export const getPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, favorite, pinned, sort } = req.query as Record<string, string>;
    const repo = getPromptRepository();
    const prompts = await repo.getPrompts({ search: q, category, favorite, pinned, sort });
    res.json({ success: true, count: prompts.length, data: prompts });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getPromptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const prompt = await repo.getPromptById(id);
    if (!prompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data: prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createPromptSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.error.issues });
      return;
    }

    const repo = getPromptRepository();
    const newPrompt = await repo.createPrompt(validation.data);
    res.status(201).json({ success: true, data: newPrompt });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
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

    const repo = getPromptRepository();
    const updatedPrompt = await repo.updatePrompt(id, validation.data);
    if (!updatedPrompt) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data: updatedPrompt });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deletePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const success = await repo.deletePrompt(id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, message: 'Prompt deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const duplicatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const duplicate = await repo.duplicatePrompt(id);
    if (!duplicate) {
      res.status(404).json({ success: false, message: 'Original prompt not found' });
      return;
    }
    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const updated = await repo.toggleFavorite(id);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const togglePin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const updated = await repo.togglePin(id);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const reorderPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = reorderSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, errors: validation.error.issues });
      return;
    }

    let items: { id: string; displayOrder: number }[] = [];
    if ('orderedIds' in validation.data) {
      items = validation.data.orderedIds.map((id, index) => ({
        id,
        displayOrder: index + 1,
      }));
    } else {
      items = validation.data;
    }

    const repo = getPromptRepository();
    const updatedList = await repo.reorderPrompts(items);
    res.json({ success: true, message: 'Display order updated successfully', data: updatedList });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
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

    const repo = getPromptRepository();
    const importedCount = await repo.importPrompts(validation.data);
    res.status(201).json({
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} prompts.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const exportPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getPromptRepository();
    const list = await repo.getPrompts({});
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
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getPromptRepository();
    const stats = await repo.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
