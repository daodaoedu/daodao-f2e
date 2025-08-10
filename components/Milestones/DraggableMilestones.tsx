import { memo, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { toDate } from 'date-fns';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import dayjs from 'dayjs';
import { useDialog } from '@/contexts/Dialog';
import {
  ProjectMilestoneSchema,
  ProjectMilestoneFormSchema,
  ProjectTaskSchema,
} from '@/services/projects';
import { getIsCheckDragMilestoneStorage } from '@/utils/storage';
import { useDraggableSensors } from '@/hooks/useDraggableSensors';
import { useDraggableContainer } from '@/hooks/useDraggableContainer';
import DraggableItem from '@/shared/components/DraggableItem';
import { DateRangePicker } from '@/components/ui/date-picker';
import SwapRightIcon from '@/public/assets/icons/swap-right.svg';
import MilestoneItem from './MilestoneItem';

const MemoMilestoneItem = memo(MilestoneItem);

interface DraggableMilestonesProps {
  milestones: ProjectMilestoneSchema[];
  projectId: string;
  minDate?: dayjs.Dayjs;
  maxDate?: dayjs.Dayjs;
  isEditable?: boolean;
  isAscending?: boolean;
  onRefreshData?: () => void;
  onReorder?: (milestones: ProjectMilestoneSchema) => void;
  onReorderTask?: (task: ProjectTaskSchema) => void;
  onUpdate?: (request: ProjectMilestoneFormSchema) => void;
}

const DraggableMilestones = ({
  milestones,
  projectId,
  minDate,
  maxDate,
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

  const calculateDatePosition = useCallback(
    (
      _activeItem: ProjectMilestoneSchema,
      _overItem: ProjectMilestoneSchema,
      oldIndex: number,
      newIndex: number
    ) => {
      const dayDiff = dayjs(_overItem.startDate).diff(
        dayjs(_activeItem.startDate),
        'day'
      );
      const isDown = dayDiff === 0 ? newIndex > oldIndex : dayDiff > 0;
      const positionOffset = isAscending ? 1 : -1;

      return {
        startDate: dayjs(_activeItem.startDate)
          .add(dayDiff, 'day')
          .format('YYYY/MM/DD'),
        endDate: dayjs(_activeItem.endDate)
          .add(dayDiff, 'day')
          .format('YYYY/MM/DD'),
        position: isDown
          ? _overItem.position + positionOffset
          : _overItem.position - positionOffset,
      };
    },
    [isAscending]
  );

  const {
    items,
    activeItem,
    overItem,
    defaultAutoScroll,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = useDraggableContainer<ProjectMilestoneSchema>({
    items: milestones,
    getItemId: (item) => item.id,
    updateItem: (_activeItem, _overItem, oldIndex, newIndex) => ({
      ..._activeItem,
      ...calculateDatePosition(_activeItem, _overItem, oldIndex, newIndex),
      projectId,
    }),
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

  const previewNewDate = useMemo(() => {
    if (!activeItem || !overItem) return undefined;
    const { startDate, endDate } = calculateDatePosition(
      activeItem,
      overItem,
      0,
      0
    );
    return { from: toDate(startDate), to: toDate(endDate) };
  }, [activeItem, overItem]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
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
                minDate={minDate}
                maxDate={maxDate}
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
          <div className="relative w-full opacity-90">
            <DateRangePicker
              value={previewNewDate}
              separator={<SwapRightIcon className="size-4 text-basic-black/25" />}
              className="absolute -top-12 left-0 bg-basic-white"
            />
            <MilestoneItem
              milestone={activeItem}
              milestones={items}
              projectId={projectId}
              minDate={minDate}
              maxDate={maxDate}
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
