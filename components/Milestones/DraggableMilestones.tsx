import { memo } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import dayjs from 'dayjs';
import { useDialog } from '@/contexts/Dialog';
import {
  ProjectMilestoneSchema,
  UpdateProjectMilestoneSchema,
  ProjectTaskSchema,
} from '@/services/modules/projects';
import { getIsCheckDragMilestoneStorage } from '@/utils/storage';
import { useDraggableSensors } from '@/hooks/useDraggableSensors';
import { useDraggableContainer } from '@/hooks/useDraggableContainer';
import DraggableItem from '@/shared/components/DraggableItem';
import MilestoneItem from './MilestoneItem';

const MemoMilestoneItem = memo(MilestoneItem);

interface DraggableMilestonesProps {
  milestones: ProjectMilestoneSchema[];
  projectId: string;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  isEditable?: boolean;
  isAscending?: boolean;
  onRefreshData?: () => void;
  onReorder?: (milestones: ProjectMilestoneSchema) => void;
  onReorderTask?: (task: ProjectTaskSchema) => void;
  onUpdate?: (request: UpdateProjectMilestoneSchema) => void;
}

const DraggableMilestones = ({
  milestones,
  projectId,
  startDate,
  endDate,
  isEditable = false,
  isAscending,
  onUpdate,
  onRefreshData,
  onReorder,
  onReorderTask,
}: DraggableMilestonesProps) => {
  const { openDialog } = useDialog();
  const sensors = useDraggableSensors();
  const isCheckDragMilestoneStorage = getIsCheckDragMilestoneStorage();

  const {
    items,
    activeItem,
    defaultAutoScroll,
    handleDragStart,
    handleDragEnd,
  } = useDraggableContainer<ProjectMilestoneSchema>({
    items: milestones,
    getItemId: (item) => item.id,
    updateItem: (currentItem, overItem, oldIndex, newIndex) => {
      // 計算拖拽前後的日期差
      const dayDiff = dayjs(overItem.startDate).diff(
        dayjs(currentItem.startDate),
        'day'
      );
      const isDown = dayDiff === 0 ? newIndex > oldIndex : dayDiff > 0;
      const positionOffset = isAscending ? 1 : -1;

      // 更新里程碑項目，包括日期調整
      return {
        ...currentItem,
        projectId,
        startDate: dayjs(currentItem.startDate)
          .add(dayDiff, 'day')
          .format('YYYY/MM/DD'),
        endDate: dayjs(currentItem.endDate)
          .add(dayDiff, 'day')
          .format('YYYY/MM/DD'),
        position: isDown
          ? overItem.position + positionOffset
          : overItem.position - positionOffset,
      };
    },
    onReorder: async (updatedItem) => {
      const isCheckDragMilestone = isCheckDragMilestoneStorage.get();

      if (!isCheckDragMilestone) {
        const result = await openDialog({
          content: '拖拽里程碑會改變日期，確定要繼續嗎？',
        });

        if (!result) return false;
        isCheckDragMilestoneStorage.set(true);
      }

      onReorder?.(updatedItem);
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
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 transition-opacity">
          {items.map((milestone) => (
            <DraggableItem key={milestone.id} id={milestone.id}>
              <MemoMilestoneItem
                milestone={milestone}
                milestones={items}
                projectId={projectId}
                startDate={startDate}
                endDate={endDate}
                isEditable={isEditable}
                onUpdate={onUpdate}
                onRefreshData={onRefreshData}
                onReorderTask={onReorderTask}
              />
            </DraggableItem>
          ))}
        </div>
      </SortableContext>

      {/* 拖曳覆蓋層，當拖動時顯示 */}
      <DragOverlay>
        {activeItem && (
          <div className="opacity-80 w-full">
            <MilestoneItem
              milestone={activeItem}
              milestones={items}
              projectId={projectId}
              startDate={startDate}
              endDate={endDate}
              isEditable={isEditable}
              onUpdate={onUpdate}
              onRefreshData={onRefreshData}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableMilestones;
