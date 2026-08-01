import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { createPromptSchema } from '../../../backend/validators/promptValidator';
import { PromptCategory, CreatePromptInput } from '../../types/prompt';
import { CATEGORY_NAMES } from '../../constants/categories';
import { usePrompts } from '../../context/PromptContext';
import { TagPill } from '../common/Badge';

export const PromptFormModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedPromptForEdit,
    setSelectedPromptForEdit,
    createPrompt,
    updatePrompt,
  } = usePrompts();

  const isOpen = isCreateModalOpen || !!selectedPromptForEdit;
  const isEditing = !!selectedPromptForEdit;

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePromptInput>({
    resolver: zodResolver(createPromptSchema) as any,
    defaultValues: {
      title: '',
      prompt: '',
      description: '',
      category: 'Coding',
      tags: [],
    },
  });

  useEffect(() => {
    if (selectedPromptForEdit) {
      setValue('title', selectedPromptForEdit.title);
      setValue('prompt', selectedPromptForEdit.prompt);
      setValue('description', selectedPromptForEdit.description || '');
      setValue('category', selectedPromptForEdit.category);
      setTags(selectedPromptForEdit.tags || []);
    } else {
      reset({
        title: '',
        prompt: '',
        description: '',
        category: 'Coding',
        tags: [],
      });
      setTags([]);
    }
  }, [selectedPromptForEdit, setValue, reset]);

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setSelectedPromptForEdit(null);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data: CreatePromptInput) => {
    const payload = { ...data, tags };
    if (isEditing && selectedPromptForEdit) {
      await updatePrompt(selectedPromptForEdit._id, payload);
    } else {
      await createPrompt(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Prompt' : 'Create New AI Prompt'}
      subtitle={
        isEditing
          ? 'Update the title, prompt text, or categorization.'
          : 'Add a reusable prompt template to your library.'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Prompt Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="e.g. Senior TypeScript Code Auditor"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Category & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {CATEGORY_NAMES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (Press Enter or Comma)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="e.g. React, Audit, API"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Active Tag Pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            {tags.map((tag) => (
              <TagPill key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
            ))}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Short Description
          </label>
          <input
            type="text"
            {...register('description')}
            placeholder="Brief overview of when and how to use this prompt..."
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Prompt Content */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Prompt Body / Template <span className="text-rose-500">*</span>
          </label>
          <textarea
            {...register('prompt')}
            rows={6}
            placeholder="You are an AI assistant specialized in... [INSERT INSTRUCTIONS HERE]"
            className="w-full px-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed"
          />
          {errors.prompt && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.prompt.message}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Save Changes'
              : 'Create Prompt'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
