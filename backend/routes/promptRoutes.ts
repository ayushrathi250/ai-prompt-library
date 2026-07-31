import { Router } from 'express';
import {
  getPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt,
  toggleFavorite,
  togglePin,
  reorderPrompts,
  importPrompts,
  exportPrompts,
  getStats,
} from '../controllers/promptController';

const router = Router();

// Stats Endpoint
router.get('/stats', getStats);

// Import & Export
router.get('/prompts/export', exportPrompts);
router.post('/prompts/import', importPrompts);

// Reorder
router.patch('/prompts/reorder', reorderPrompts);

// Prompt CRUD & Action Endpoints
router.get('/prompts', getPrompts);
router.post('/prompts', createPrompt);
router.get('/prompts/:id', getPromptById);
router.put('/prompts/:id', updatePrompt);
router.delete('/prompts/:id', deletePrompt);
router.post('/prompts/:id/duplicate', duplicatePrompt);
router.patch('/prompts/:id/favorite', toggleFavorite);
router.patch('/prompts/:id/pin', togglePin);

export default router;
