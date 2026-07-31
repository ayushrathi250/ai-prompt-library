export type PromptCategory =
  | 'Coding'
  | 'Marketing'
  | 'Content Writing'
  | 'Email'
  | 'Resume'
  | 'SQL'
  | 'Design'
  | 'Social Media'
  | 'Productivity'
  | 'Others';

export interface Prompt {
  _id: string;
  title: string;
  prompt: string;
  description?: string;
  category: PromptCategory;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'custom';

export interface PromptFilter {
  search?: string;
  category?: string;
  favorite?: boolean;
  pinned?: boolean;
  sort?: SortOption;
}

export interface DashboardStats {
  totalPrompts: number;
  favoritePrompts: number;
  pinnedPrompts: number;
  categoriesCount: number;
  categoryBreakdown: Record<string, number>;
  recentlyAdded: Prompt[];
}

export interface CreatePromptInput {
  title: string;
  prompt: string;
  description?: string;
  category: PromptCategory;
  tags: string[];
}

export interface UpdatePromptInput extends Partial<CreatePromptInput> {
  favorite?: boolean;
  pinned?: boolean;
  displayOrder?: number;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  message: string;
  errors?: string[];
}
