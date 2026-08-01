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
  resetLibrary,
  registerUsage,
  getStats,
} from '../controllers/promptController';

const router = Router();

// Stats Endpoint
router.get('/stats', getStats);

// Reset & Import & Export
router.post('/prompts/reset', resetLibrary);
router.get('/prompts/export', exportPrompts);
router.post('/prompts/import', importPrompts);

// Reorder (supports both PUT and PATCH)
router.put('/prompts/reorder', reorderPrompts);
router.patch('/prompts/reorder', reorderPrompts);

// Prompt CRUD & Action Endpoints
router.get('/prompts', getPrompts);
router.post('/prompts', createPrompt);
router.get('/prompts/:id', getPromptById);
router.patch('/prompts/:id', updatePrompt);
router.put('/prompts/:id', updatePrompt);
router.delete('/prompts/:id', deletePrompt);
router.post('/prompts/:id/duplicate', duplicatePrompt);
router.post('/prompts/:id/use', registerUsage);
router.patch('/prompts/:id/favorite', toggleFavorite);
router.patch('/prompts/:id/pin', togglePin);

export default router;
