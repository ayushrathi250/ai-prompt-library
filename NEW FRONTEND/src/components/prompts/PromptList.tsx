import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { FileQuestion, GripVertical } from 'lucide-react';
import PromptCard from './PromptCard';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import type { Prompt } from '../../types/prompt';
import { usePrompts } from '../../context/PromptContext';
import { getCategory } from '../../constants/categories';

interface PromptListProps {
  prompts: Prompt[];
  loading?: boolean;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onOpen: (prompt: Prompt) => void;
  /** Drag-to-reorder is only enabled when sort === 'custom'. */
  draggable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onClearFilters?: () => void;
}

export function PromptList({
  prompts,
  loading = false,
  onEdit,
  onDelete,
  onOpen,
  draggable = false,
  emptyTitle = 'No prompts match those filters',
  emptyDescription = 'Try a different search term, clear the active filters, or create a new prompt.',
  emptyActionLabel,
  onEmptyAction,
  onClearFilters,
}: PromptListProps) {
  const { reorder } = usePrompts();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => prompts.map((p) => p.id), [prompts]);
  const activePrompt = prompts.find((p) => p.id === activeId) ?? null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      void reorder(arrayMove(ids, oldIndex, newIndex));
    },
    [ids, reorder],
  );

  if (loading) return <SkeletonLoader count={6} />;

  if (!prompts.length) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        secondaryLabel={onClearFilters ? 'Clear filters' : undefined}
        onSecondary={onClearFilters}
      />
    );
  }

  const grid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt, i) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          index={i}
          draggable={draggable}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </div>
  );

  if (!draggable) return grid;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22,1,0.36,1)' }}>
        {activePrompt ? (
          <div
            className="flex items-center gap-3 rounded-xl border-2 bg-surface px-4 py-3 shadow-2xl shadow-black/30"
            style={{ borderColor: getCategory(activePrompt.category).color }}
          >
            <GripVertical className="h-4 w-4 text-muted" />
            <span className="font-display text-sm font-semibold text-ink">
              {activePrompt.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default PromptList;
