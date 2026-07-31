import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { PromptCard } from './PromptCard';
import { Prompt } from '../../types/prompt';
import { usePrompts } from '../../context/PromptContext';
import { EmptyState } from '../common/EmptyState';
import { PromptCardSkeleton } from '../common/SkeletonLoader';

interface PromptListProps {
  prompts: Prompt[];
  isLoading?: boolean;
  onViewPrompt: (prompt: Prompt) => void;
  enableDrag?: boolean;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  isLoading = false,
  onViewPrompt,
  enableDrag = true,
}) => {
  const { reorderPromptsLocallyAndSave, setIsCreateModalOpen } = usePrompts();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px drag to trigger to avoid accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = prompts.findIndex((item) => item._id === active.id);
    const newIndex = prompts.findIndex((item) => item._id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(prompts, oldIndex, newIndex);
      reorderPromptsLocallyAndSave(newItems);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return <EmptyState onAction={() => setIsCreateModalOpen(true)} />;
  }

  const itemIds = prompts.map((p) => p._id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt._id}
              prompt={prompt}
              onView={onViewPrompt}
              isSortable={enableDrag}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
