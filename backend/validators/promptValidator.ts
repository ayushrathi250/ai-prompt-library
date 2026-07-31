import { z } from 'zod';

export const categoryEnum = z.enum([
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
]);

export const createPromptSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(120, 'Title cannot exceed 120 characters'),
  prompt: z
    .string()
    .min(1, 'Prompt content cannot be empty'),
  description: z.string().max(300, 'Description cannot exceed 300 characters').optional().default(''),
  category: categoryEnum,
  tags: z.array(z.string()).optional().default([]),
});

export const updatePromptSchema = createPromptSchema.partial().extend({
  favorite: z.boolean().optional(),
  pinned: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

export const importPromptsSchema = z.array(
  z.object({
    title: z.string().min(1, 'Title is required'),
    prompt: z.string().min(1, 'Prompt content is required'),
    description: z.string().optional().default(''),
    category: categoryEnum.catch('Others'),
    tags: z.array(z.string()).optional().default([]),
    favorite: z.boolean().optional().default(false),
    pinned: z.boolean().optional().default(false),
    displayOrder: z.number().optional().default(0),
  })
);

export const reorderSchema = z.array(
  z.object({
    id: z.string(),
    displayOrder: z.number(),
  })
);
