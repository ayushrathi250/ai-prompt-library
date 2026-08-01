import { PromptCategory } from '../types/prompt';

export interface CategoryInfo {
  name: PromptCategory;
  description: string;
  badgeColor: string;
  gradient: string;
  border: string;
  text: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'Coding',
    description: 'Code generation, refactoring, code review, & debugging prompts',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Marketing',
    description: 'Ad copy, SEO strategies, value propositions, & brand messaging',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    name: 'Content Writing',
    description: 'Blog posts, articles, storytelling, & creative ideation',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'Email',
    description: 'Cold outreach, newsletters, customer support, & follow-ups',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    gradient: 'from-indigo-500/20 to-purple-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    name: 'Resume',
    description: 'Resume optimization, cover letters, & interview prep prompts',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'SQL',
    description: 'Complex query generation, schema design, & optimization',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    name: 'Design',
    description: 'UI/UX design briefs, Midjourney/DALL-E prompts, & styling guides',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    gradient: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
  },
  {
    name: 'Social Media',
    description: 'LinkedIn posts, Twitter/X threads, & viral captions',
    badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    gradient: 'from-sky-500/20 to-blue-500/10',
    border: 'border-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
  },
  {
    name: 'Productivity',
    description: 'Task organization, workflow automation, & time management',
    badgeColor: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    gradient: 'from-violet-500/20 to-fuchsia-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    name: 'Others',
    description: 'General purpose, custom templates, & multi-modal prompts',
    badgeColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    gradient: 'from-slate-500/20 to-zinc-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
  },
];

export const CATEGORY_NAMES: PromptCategory[] = CATEGORIES.map((c) => c.name);

export function getCategoryInfo(categoryName: PromptCategory): CategoryInfo {
  return (
    CATEGORIES.find((c) => c.name === categoryName) || {
      name: 'Others',
      description: 'General prompts',
      badgeColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
      gradient: 'from-slate-500/20 to-zinc-500/10',
      border: 'border-slate-500/20',
      text: 'text-slate-600 dark:text-slate-400',
    }
  );
}
