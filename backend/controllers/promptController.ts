import { Request, Response } from 'express';
import { getPromptRepository } from '../../database/config/db';

export const getPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, favorite, pinned, sort } = req.query as Record<string, string>;
    const repo = getPromptRepository();
    const prompts = await repo.getPrompts({ search: q, category, favorite, pinned, sort });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getPromptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const prompt = await repo.getPromptById(id);
    if (!prompt) {
      res.status(404).json({ message: 'Prompt not found' });
      return;
    }
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getPromptRepository();
    const newPrompt = await repo.createPrompt(req.body);
    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const updatedPrompt = await repo.updatePrompt(id, req.body);
    if (!updatedPrompt) {
      res.status(404).json({ message: 'Prompt not found' });
      return;
    }
    res.json(updatedPrompt);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deletePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const success = await repo.deletePrompt(id);
    if (!success) {
      res.status(404).json({ message: 'Prompt not found' });
      return;
    }
    res.json({ message: 'Prompt deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const duplicatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const duplicate = await repo.duplicatePrompt(id);
    if (!duplicate) {
      res.status(404).json({ message: 'Original prompt not found' });
      return;
    }
    res.status(201).json(duplicate);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const updated = await repo.toggleFavorite(id);
    if (!updated) {
      res.status(404).json({ message: 'Prompt not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const togglePin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const updated = await repo.togglePin(id);
    if (!updated) {
      res.status(404).json({ message: 'Prompt not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const reorderPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    let items: { id: string; displayOrder: number }[] = [];

    if (payload && Array.isArray(payload.order)) {
      items = payload.order;
    } else if (payload && Array.isArray(payload.orderedIds)) {
      items = payload.orderedIds.map((id: string, index: number) => ({
        id,
        displayOrder: index + 1,
      }));
    } else if (Array.isArray(payload)) {
      items = payload;
    }

    const repo = getPromptRepository();
    const updatedList = await repo.reorderPrompts(items);
    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const importPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPrompts = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.prompts)
      ? req.body.prompts
      : null;

    if (!rawPrompts) {
      res.status(400).json({ message: 'Invalid payload. Expected an array of prompts.' });
      return;
    }

    const repo = getPromptRepository();
    const importedList = await repo.importPrompts(rawPrompts);
    res.status(201).json(importedList);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const exportPrompts = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getPromptRepository();
    const list = await repo.getPrompts({});
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const resetLibrary = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getPromptRepository();
    const freshList = await repo.resetLibrary();
    res.json(freshList);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const registerUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = getPromptRepository();
    const updated = await repo.registerUse(id);
    if (!updated) {
      res.status(404).json({ message: 'Prompt not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = getPromptRepository();
    const stats = await repo.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
