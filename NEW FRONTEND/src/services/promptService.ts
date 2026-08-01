import api, { hasBackend } from './api';
import type {
  ImportSummary,
  Prompt,
  PromptPayload,
} from '../types/prompt';
import { importedPromptSchema } from '../types/prompt';
import { MOCK_PROMPTS } from './mockData';

/**
 * Typed REST wrappers. Components must never import axios directly — they
 * talk to the API exclusively through this module.
 *
 * While no backend is configured (`VITE_API_URL` unset) every call resolves
 * against a localStorage-backed mock store so the UI is fully functional.
 * TODO(backend): once the API is live, delete the `local*` helpers below;
 * the axios branch of each function is already the real implementation.
 */

const STORAGE_KEY = 'prompt-library-store';
const LATENCY = 320;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readLocal(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PROMPTS));
      return [...MOCK_PROMPTS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Prompt[]) : [...MOCK_PROMPTS];
  } catch {
    return [...MOCK_PROMPTS];
  }
}

function writeLocal(prompts: Prompt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch {
    /* quota exceeded — ignore, state stays in memory */
  }
}

function newId() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function listPrompts(): Promise<Prompt[]> {
  if (hasBackend) {
    const { data } = await api.get<Prompt[]>('/prompts');
    return data;
  }
  await sleep(LATENCY);
  return readLocal();
}

export async function createPrompt(payload: PromptPayload): Promise<Prompt> {
  if (hasBackend) {
    const { data } = await api.post<Prompt>('/prompts', payload);
    return data;
  }
  await sleep(LATENCY);
  const store = readLocal();
  const now = new Date().toISOString();
  const prompt: Prompt = {
    id: newId(),
    title: payload.title,
    content: payload.content,
    description: payload.description ?? '',
    category: payload.category,
    tags: payload.tags ?? [],
    isFavorite: payload.isFavorite ?? false,
    isPinned: payload.isPinned ?? false,
    displayOrder: payload.displayOrder ?? -Date.now(),
    usageCount: payload.usageCount ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  writeLocal([prompt, ...store]);
  return prompt;
}

export async function updatePrompt(
  id: string,
  payload: Partial<Prompt>,
): Promise<Prompt> {
  if (hasBackend) {
    const { data } = await api.patch<Prompt>(`/prompts/${id}`, payload);
    return data;
  }
  await sleep(LATENCY / 2);
  const store = readLocal();
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Prompt not found');
  const updated: Prompt = {
    ...store[index],
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  };
  store[index] = updated;
  writeLocal(store);
  return updated;
}

export async function deletePrompt(id: string): Promise<void> {
  if (hasBackend) {
    await api.delete(`/prompts/${id}`);
    return;
  }
  await sleep(LATENCY / 2);
  writeLocal(readLocal().filter((p) => p.id !== id));
}

export async function reorderPrompts(
  order: { id: string; displayOrder: number }[],
): Promise<void> {
  if (hasBackend) {
    await api.put('/prompts/reorder', { order });
    return;
  }
  await sleep(120);
  const map = new Map(order.map((o) => [o.id, o.displayOrder]));
  const store = readLocal().map((p) =>
    map.has(p.id) ? { ...p, displayOrder: map.get(p.id)! } : p,
  );
  writeLocal(store);
}

/** Validates + persists an array parsed from an uploaded JSON file. */
export async function importPrompts(
  raw: unknown,
): Promise<{ prompts: Prompt[]; summary: ImportSummary }> {
  if (!Array.isArray(raw)) {
    throw new Error('File must contain a JSON array of prompts');
  }

  const valid: Prompt[] = [];
  const errors: string[] = [];
  const now = new Date().toISOString();

  raw.forEach((entry, i) => {
    const result = importedPromptSchema.safeParse(entry);
    if (!result.success) {
      const issue = result.error.issues[0];
      errors.push(`#${i + 1}: ${issue?.path.join('.') || 'entry'} — ${issue?.message ?? 'invalid'}`);
      return;
    }
    const d = result.data;
    valid.push({
      id: newId(),
      title: d.title,
      content: d.content,
      description: d.description ?? '',
      category: d.category,
      tags: (d.tags ?? []).map((t) => t.trim().replace(/^#/, '')).filter(Boolean).slice(0, 10),
      isFavorite: d.isFavorite,
      isPinned: d.isPinned,
      displayOrder: d.displayOrder ?? -Date.now() - i,
      usageCount: d.usageCount ?? 0,
      createdAt: d.createdAt ?? now,
      updatedAt: now,
    });
  });

  const summary: ImportSummary = {
    imported: valid.length,
    failed: errors.length,
    errors: errors.slice(0, 6),
  };

  if (hasBackend) {
    const { data } = await api.post<Prompt[]>('/prompts/import', { prompts: valid });
    return { prompts: data, summary };
  }

  await sleep(LATENCY);
  if (valid.length) writeLocal([...valid, ...readLocal()]);
  return { prompts: valid, summary };
}

/** Returns the serialisable payload for `ai-prompts-export.json`. */
export async function exportPrompts(): Promise<Prompt[]> {
  if (hasBackend) {
    const { data } = await api.get<Prompt[]>('/prompts/export');
    return data;
  }
  await sleep(160);
  return readLocal();
}

/** Wipes the local mock store (Settings → danger zone). */
export async function resetLibrary(): Promise<Prompt[]> {
  if (hasBackend) {
    const { data } = await api.post<Prompt[]>('/prompts/reset');
    return data;
  }
  await sleep(200);
  writeLocal(MOCK_PROMPTS);
  return [...MOCK_PROMPTS];
}

export const promptService = {
  list: listPrompts,
  create: createPrompt,
  update: updatePrompt,
  remove: deletePrompt,
  reorder: reorderPrompts,
  import: importPrompts,
  export: exportPrompts,
  reset: resetLibrary,
};

export default promptService;
