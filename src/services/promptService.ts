import { api } from './api';
import {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  PromptFilter,
  DashboardStats,
  ImportResult,
} from '../types/prompt';

export const promptService = {
  async getPrompts(filter?: PromptFilter): Promise<Prompt[]> {
    const params: Record<string, string> = {};
    if (filter?.search) params.q = filter.search;
    if (filter?.category) params.category = filter.category;
    if (filter?.favorite !== undefined) params.favorite = String(filter.favorite);
    if (filter?.pinned !== undefined) params.pinned = String(filter.pinned);
    if (filter?.sort) params.sort = filter.sort;

    const response = await api.get<{ success: boolean; data: Prompt[] }>('/prompts', { params });
    return response.data.data;
  },

  async getPromptById(id: string): Promise<Prompt> {
    const response = await api.get<{ success: boolean; data: Prompt }>(`/prompts/${id}`);
    return response.data.data;
  },

  async createPrompt(input: CreatePromptInput): Promise<Prompt> {
    const response = await api.post<{ success: boolean; data: Prompt }>('/prompts', input);
    return response.data.data;
  },

  async updatePrompt(id: string, input: UpdatePromptInput): Promise<Prompt> {
    const response = await api.put<{ success: boolean; data: Prompt }>(`/prompts/${id}`, input);
    return response.data.data;
  },

  async deletePrompt(id: string): Promise<void> {
    await api.delete(`/prompts/${id}`);
  },

  async duplicatePrompt(id: string): Promise<Prompt> {
    const response = await api.post<{ success: boolean; data: Prompt }>(`/prompts/${id}/duplicate`);
    return response.data.data;
  },

  async toggleFavorite(id: string): Promise<Prompt> {
    const response = await api.patch<{ success: boolean; data: Prompt }>(`/prompts/${id}/favorite`);
    return response.data.data;
  },

  async togglePin(id: string): Promise<Prompt> {
    const response = await api.patch<{ success: boolean; data: Prompt }>(`/prompts/${id}/pin`);
    return response.data.data;
  },

  async reorderPrompts(items: { id: string; displayOrder: number }[]): Promise<void> {
    await api.patch('/prompts/reorder', items);
  },

  async importPrompts(jsonArray: any[]): Promise<ImportResult> {
    const response = await api.post<ImportResult>('/prompts/import', jsonArray);
    return response.data;
  },

  async exportPrompts(): Promise<void> {
    const response = await api.get('/prompts/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ai-prompts-export.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/stats');
    return response.data.data;
  },
};
