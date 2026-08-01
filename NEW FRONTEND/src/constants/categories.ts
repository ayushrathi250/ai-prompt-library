import {
  Code2,
  Megaphone,
  PenLine,
  Mail,
  BriefcaseBusiness,
  Database,
  Palette,
  Share2,
  Zap,
  Shapes,
} from 'lucide-react';
import type { Category, CategoryName } from '../types/prompt';
import { CATEGORY_NAMES } from '../types/prompt';

/**
 * The exact 10 categories, each mapped to an accent colour + icon.
 * Hues are spaced around the wheel and mid-chroma so badges stay legible
 * on both the light (paper) and dark (ink) themes.
 */
export const CATEGORIES: Category[] = [
  {
    id: 'coding',
    name: 'Coding',
    color: '#e2483d',
    description: 'Refactors, reviews, debugging & architecture',
    icon: Code2,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#d19a06',
    description: 'Campaigns, positioning & ad copy',
    icon: Megaphone,
  },
  {
    id: 'content-writing',
    name: 'Content Writing',
    color: '#35a657',
    description: 'Articles, scripts & long-form drafts',
    icon: PenLine,
  },
  {
    id: 'email',
    name: 'Email',
    color: '#3b82f6',
    description: 'Outreach, follow-ups & newsletters',
    icon: Mail,
  },
  {
    id: 'resume',
    name: 'Resume',
    color: '#7c5cf0',
    description: 'CVs, cover letters & interview prep',
    icon: BriefcaseBusiness,
  },
  {
    id: 'sql',
    name: 'SQL',
    color: '#17a2a2',
    description: 'Queries, schema design & optimisation',
    icon: Database,
  },
  {
    id: 'design',
    name: 'Design',
    color: '#d14bc4',
    description: 'UI direction, briefs & critique',
    icon: Palette,
  },
  {
    id: 'social-media',
    name: 'Social Media',
    color: '#e8743b',
    description: 'Threads, hooks & content calendars',
    icon: Share2,
  },
  {
    id: 'productivity',
    name: 'Productivity',
    color: '#93a80a',
    description: 'Planning, summarising & delegation',
    icon: Zap,
  },
  {
    id: 'others',
    name: 'Others',
    color: '#8b8178',
    description: 'Everything that defies a bucket',
    icon: Shapes,
  },
];

const CATEGORY_MAP = new Map<CategoryName, Category>(
  CATEGORIES.map((c) => [c.name, c]),
);

export function getCategory(name: string): Category {
  return CATEGORY_MAP.get(name as CategoryName) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryColor(name: string): string {
  return getCategory(name).color;
}

export { CATEGORY_NAMES };
