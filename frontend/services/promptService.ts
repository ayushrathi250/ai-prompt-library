import api, { hasBackend } from './api';
import type {
  ImportSummary,
  Prompt,
  PromptPayload,
} from '../types/prompt';
import { importedPromptSchema } from '../types/prompt';
import { MOCK_PROMPTS } from './mockData';

const STORAGE_KEY = 'prompt-library-store';
const LATENCY = 200;

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
    /* quota exceeded — ignore */
  }
}

function newId() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function unwrapResponse<T>(resData: any): T {
  if (resData && typeof resData === 'object' && 'data' in resData) {
    return resData.data as T;
  }
  return resData as T;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function listPrompts(): Promise<Prompt[]> {
  if (hasBackend) {
    try {
      const response = await api.get('/prompts');
      const list = unwrapResponse<Prompt[]>(response.data);
      if (Array.isArray(list)) {
        writeLocal(list);
        return list;
      }
    } catch (e) {
      console.warn('[promptService] API unavailable, using local cache:', e);
    }
  }
  await sleep(LATENCY);
  return readLocal();
}

export async function createPrompt(payload: PromptPayload): Promise<Prompt> {
  if (hasBackend) {
    try {
      const response = await api.post('/prompts', payload);
      const created = unwrapResponse<Prompt>(response.data);
      if (created && created.id) return created;
    } catch (e) {
      console.warn('[promptService] API create failed, saving locally:', e);
    }
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
    try {
      const response = await api.patch(`/prompts/${id}`, payload);
      const updated = unwrapResponse<Prompt>(response.data);
      if (updated && updated.id) return updated;
    } catch (e) {
      console.warn('[promptService] API update failed, saving locally:', e);
    }
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
    try {
      await api.delete(`/prompts/${id}`);
      return;
    } catch (e) {
      console.warn('[promptService] API delete failed, deleting locally:', e);
    }
  }
  await sleep(LATENCY / 2);
  writeLocal(readLocal().filter((p) => p.id !== id));
}

export async function reorderPrompts(
  order: { id: string; displayOrder: number }[],
): Promise<void> {
  if (hasBackend) {
    try {
      await api.put('/prompts/reorder', { order });
      return;
    } catch (e) {
      console.warn('[promptService] API reorder failed, reordering locally:', e);
    }
  }
  await sleep(120);
  const map = new Map(order.map((o) => [o.id, o.displayOrder]));
  const store = readLocal().map((p) =>
    map.has(p.id) ? { ...p, displayOrder: map.get(p.id)! } : p,
  );
  writeLocal(store);
}

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
      id: d.id || newId(),
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
    try {
      const response = await api.post('/prompts/import', { prompts: valid });
      const imported = unwrapResponse<Prompt[]>(response.data);
      if (Array.isArray(imported)) {
        return { prompts: imported, summary };
      }
    } catch (e) {
      console.warn('[promptService] API import failed, saving locally:', e);
    }
  }

  await sleep(LATENCY);
  if (valid.length) writeLocal([...valid, ...readLocal()]);
  return { prompts: valid, summary };
}

export async function exportPrompts(): Promise<Prompt[]> {
  if (hasBackend) {
    try {
      const response = await api.get('/prompts/export');
      const data = unwrapResponse<Prompt[]>(response.data);
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn('[promptService] API export failed, exporting locally:', e);
    }
  }
  await sleep(160);
  return readLocal();
}

export async function resetLibrary(): Promise<Prompt[]> {
  if (hasBackend) {
    try {
      const response = await api.post('/prompts/reset');
      const data = unwrapResponse<Prompt[]>(response.data);
      if (Array.isArray(data)) {
        writeLocal(data);
        return data;
      }
    } catch (e) {
      console.warn('[promptService] API reset failed, resetting locally:', e);
    }
  }
  await sleep(200);
  writeLocal(MOCK_PROMPTS);
  return [...MOCK_PROMPTS];
}

export async function registerUse(id: string): Promise<void> {
  if (hasBackend) {
    try {
      await api.post(`/prompts/${id}/use`);
    } catch (e) {
      console.warn('[promptService] API registerUse failed:', e);
    }
  }
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
  registerUse,
};

export default promptService;
