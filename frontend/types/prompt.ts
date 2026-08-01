import type React from 'react';
import { z } from 'zod';

/**
 * The 10 canonical categories. This tuple is the single source of truth —
 * do not add, rename or remove entries.
 */
export const CATEGORY_NAMES = [
  'Coding',
  'Marketing',
  'Content Writing',
  'Email',
  'Resume',
  'SQL',
  'Design',
  'Social Media',
  'Productivity',
  'Others',
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

/** Presentation metadata for a category (see constants/categories.ts). */
export interface Category {
  id: string;
  name: CategoryName;
  /** Hex accent used for badges, dots and gradients (works in both themes). */
  color: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  category: CategoryName;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  displayOrder: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by create/update endpoints. */
export type PromptPayload = Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>> & {
  title: string;
  content: string;
  category: CategoryName;
};

export type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'custom';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'Title A → Z' },
  { value: 'za', label: 'Title Z → A' },
  { value: 'custom', label: 'Custom order' },
];

/* ------------------------------------------------------------------ */
/* Validation schemas                                                  */
/* ------------------------------------------------------------------ */

export const promptFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title needs at least 3 characters')
    .max(90, 'Title must be 90 characters or fewer'),
  content: z
    .string()
    .trim()
    .min(10, 'A prompt needs at least 10 characters')
    .max(8000, 'Prompt must be 8000 characters or fewer'),
  category: z.enum(CATEGORY_NAMES),
  description: z
    .string()
    .trim()
    .max(240, 'Description must be 240 characters or fewer')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().trim().min(1).max(24))
    .max(10, 'Up to 10 tags')
    .default([]),
});

export type PromptFormValues = z.input<typeof promptFormSchema>;
export type PromptFormOutput = z.output<typeof promptFormSchema>;

/** Schema used when validating an imported JSON file. */
export const importedPromptSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(90),
  content: z.string().trim().min(1),
  description: z.string().max(400).optional().default(''),
  // Unknown / missing categories fall back to "Others" rather than rejecting.
  category: z.enum(CATEGORY_NAMES).catch('Others'),
  tags: z.array(z.string()).catch([]),
  isFavorite: z.boolean().catch(false),
  isPinned: z.boolean().catch(false),
  displayOrder: z.number().optional(),
  usageCount: z.number().catch(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ImportedPrompt = z.output<typeof importedPromptSchema>;

export interface ImportSummary {
  imported: number;
  failed: number;
  errors: string[];
}

export interface PromptStats {
  total: number;
  favorites: number;
  pinned: number;
  activeCategories: number;
  recentlyAdded: number;
}
