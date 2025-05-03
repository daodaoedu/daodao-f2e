import { memo } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ProjectTaskSchema } from '@/services/modules/projects';
import { useMilestones } from '@/contexts/Milestones';
import { useDraggableContainer } from '@/hooks/useDraggableContainer';
import { useDraggableSensors } from '@/hooks/useDraggableSensors';
import DraggableItem from '@/shared/components/DraggableItem';
import Task from './Task';

const MemoTask = memo(Task);

interface DraggableTasksProps {
  tasks: ProjectTaskSchema[];
  projectId: string;
  milestoneId: number;
  onRefreshData?: () => void;
  onReorderTask?: (tasks: ProjectTaskSchema) => void;
}

const DraggableTasks = ({
  tasks,
  projectId,
  milestoneId,
  onRefreshData,
  onReorderTask,
}: DraggableTasksProps) => {
  const { dispatchTask } = useMilestones();

  const sensors = useDraggableSensors();

  const {
    items,
    activeItem,
    defaultAutoScroll,
    handleDragStart,
    handleDragEnd,
  } = useDraggableContainer({
    items: tasks,
    getItemId: (item) => item.id,
    updateItem: (currentItem, overItem, oldIndex, newIndex) => ({
      ...currentItem,
      position:
        newIndex > oldIndex ? overItem.position + 1 : overItem.position - 1,
    }),
    onReorder: async (updatedItem) => {
      onReorderTask?.(updatedItem);
      await dispatchTask(projectId, milestoneId, updatedItem);
      return true;
    },
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
      autoScroll={defaultAutoScroll}
    >
      <SortableContext
        items={items.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 transition-opacity">
          {items.map((task) => (
            <DraggableItem
              key={task.id}
              id={task.id}
              dragHandleClassName="top-1/2 left-0 -translate-y-1/2 translate-x-1/2 rounded"
            >
              <MemoTask
                projectId={projectId}
                milestoneId={milestoneId}
                task={task}
                onRefreshData={onRefreshData}
              />
            </DraggableItem>
          ))}
        </div>
      </SortableContext>

      {/* 拖曳覆蓋層，當拖動時顯示 */}
      <DragOverlay>
        {activeItem && (
          <div className="opacity-80 w-full">
            <Task
              projectId={projectId}
              milestoneId={Number(milestoneId)}
              task={activeItem}
              onRefreshData={onRefreshData}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableTasks;
