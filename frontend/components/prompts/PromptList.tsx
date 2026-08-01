import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px drag to trigger to avoid accidental clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = prompts.findIndex((item) => item._id === active.id);
    const newIndex = prompts.findIndex((item) => item._id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(prompts, oldIndex, newIndex);
      // Keep pinned items at the top section, non-pinned below
      const pinned = reordered.filter((p: Prompt) => p.pinned);
      const unpinned = reordered.filter((p: Prompt) => !p.pinned);
      const finalOrder = [...pinned, ...unpinned];
      reorderPromptsLocallyAndSave(finalOrder);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
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
  const activePrompt = activeId ? prompts.find((p) => p._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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

      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activePrompt ? (
          <PromptCard
            prompt={activePrompt}
            onView={onViewPrompt}
            isSortable={false}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
