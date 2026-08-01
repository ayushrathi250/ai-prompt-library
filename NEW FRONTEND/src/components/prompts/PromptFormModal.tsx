import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Sparkles, Tags } from 'lucide-react';
import Modal from '../common/Modal';
import { CATEGORIES } from '../../constants/categories';
import { promptFormSchema } from '../../types/prompt';
import type {
  CategoryName,
  Prompt,
  PromptFormValues,
  PromptFormOutput,
} from '../../types/prompt';
import { usePrompts } from '../../context/PromptContext';
import { TagPill } from '../common/Badge';

interface PromptFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When present the modal opens pre-filled in edit mode. */
  prompt?: Prompt | null;
  defaultCategory?: CategoryName;
}

const EMPTY: PromptFormValues = {
  title: '',
  content: '',
  category: 'Coding',
  description: '',
  tags: [],
};

const inputBase =
  'w-full rounded-lg border border-edge bg-canvas-deep/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15';

export function PromptFormModal({
  open,
  onClose,
  prompt,
  defaultCategory,
}: PromptFormModalProps) {
  const { addPrompt, editPrompt } = usePrompts();
  const [tagDraft, setTagDraft] = useState('');
  const titleRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormValues, unknown, PromptFormOutput>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: EMPTY,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) return;
    setTagDraft('');
    reset(
      prompt
        ? {
            title: prompt.title,
            content: prompt.content,
            category: prompt.category,
            description: prompt.description,
            tags: [...prompt.tags],
          }
        : { ...EMPTY, category: defaultCategory ?? 'Coding' },
    );
    window.setTimeout(() => titleRef.current?.focus(), 60);
  }, [open, prompt, defaultCategory, reset]);

  const content = watch('content') ?? '';
  const title = watch('title') ?? '';
  const description = watch('description') ?? '';
  const tags = watch('tags') ?? [];

  const commitTag = (raw: string) => {
    const clean = raw.trim().replace(/^#/, '').replace(/,+$/, '').slice(0, 24);
    if (!clean) return;
    const current = tags ?? [];
    if (current.includes(clean) || current.length >= 10) {
      setTagDraft('');
      return;
    }
    setValue('tags', [...current, clean], { shouldValidate: true, shouldDirty: true });
    setTagDraft('');
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag(tagDraft);
    } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
      setValue('tags', tags.slice(0, -1), { shouldDirty: true });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category,
      description: (values.description ?? '').trim(),
      tags: values.tags ?? [],
    };
    const result = prompt
      ? await editPrompt(prompt.id, payload)
      : await addPrompt(payload);
    if (result) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Sparkles className="h-5 w-5" strokeWidth={2} />}
      title={prompt ? 'Edit prompt' : 'New prompt'}
      subtitle={
        prompt
          ? 'Refine the wording, category or tags.'
          : 'Capture a prompt worth reusing. Use {{variables}} for placeholders.'
      }
      footer={
        <>
          <span className="mr-auto hidden text-xs text-muted sm:block">
            {content.length.toLocaleString()} characters
          </span>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg border border-edge px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-deep"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="prompt-form"
            disabled={isSubmitting}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {prompt ? 'Save changes' : 'Create prompt'}
          </button>
        </>
      }
    >
      <form id="prompt-form" onSubmit={onSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="title" className="text-[13px] font-semibold text-ink">
              Title <span className="text-danger">*</span>
            </label>
            <span className="font-mono text-[11px] text-muted">{title.length}/90</span>
          </div>
          <input
            id="title"
            {...register('title')}
            ref={(el) => {
              register('title').ref(el);
              titleRef.current = el;
            }}
            placeholder="e.g. Senior Code Reviewer"
            maxLength={90}
            className={inputBase}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-danger">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="mb-1.5 block text-[13px] font-semibold text-ink">
            Category <span className="text-danger">*</span>
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <>
                <select
                  id="category"
                  {...field}
                  className={`${inputBase} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='%238b8178' d='M6 8.5 1.5 4h9z'/%3E%3C/svg%3E\")",
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => {
                    const active = field.value === c.name;
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => field.onChange(c.name)}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-all"
                        style={{
                          color: active ? c.color : 'var(--muted)',
                          borderColor: active
                            ? `color-mix(in srgb, ${c.color} 50%, transparent)`
                            : 'var(--border)',
                          background: active
                            ? `color-mix(in srgb, ${c.color} 14%, transparent)`
                            : 'transparent',
                        }}
                      >
                        <Icon className="h-3 w-3" strokeWidth={2.2} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          />
        </div>

        {/* Content */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="content" className="text-[13px] font-semibold text-ink">
              Prompt content <span className="text-danger">*</span>
            </label>
            <span className="font-mono text-[11px] text-muted">{content.length}/8000</span>
          </div>
          <textarea
            id="content"
            {...register('content')}
            rows={9}
            maxLength={8000}
            placeholder={'You are a…\n\nTask: …\nConstraints: …\nOutput format: …'}
            className={`${inputBase} resize-y font-mono text-[12.5px] leading-relaxed`}
          />
          {errors.content && (
            <p className="mt-1.5 text-xs text-danger">{errors.content.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="description" className="text-[13px] font-semibold text-ink">
              Description
            </label>
            <span className="font-mono text-[11px] text-muted">{description.length}/240</span>
          </div>
          <textarea
            id="description"
            {...register('description')}
            rows={2}
            maxLength={240}
            placeholder="One line on when to reach for this prompt."
            className={`${inputBase} resize-none`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Tags className="h-3.5 w-3.5 text-muted" /> Tags
            <span className="font-normal text-muted">— press Enter or , to add</span>
          </label>
          <div
            className="flex flex-wrap items-center gap-1.5 rounded-lg border border-edge bg-canvas-deep/50 p-2 transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15"
            onClick={() => document.getElementById('tags')?.focus()}
          >
            {tags.map((tag) => (
              <TagPill
                key={tag}
                label={tag}
                onRemove={() =>
                  setValue(
                    'tags',
                    tags.filter((t) => t !== tag),
                    { shouldDirty: true },
                  )
                }
              />
            ))}
            <input
              id="tags"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={() => commitTag(tagDraft)}
              disabled={tags.length >= 10}
              placeholder={tags.length >= 10 ? 'Tag limit reached' : 'Add a tag…'}
              className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
            />
          </div>
          {errors.tags && (
            <p className="mt-1.5 text-xs text-danger">{errors.tags.message as string}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default PromptFormModal;
