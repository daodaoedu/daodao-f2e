import { useState, useCallback, useEffect } from 'react';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// 標準的自動滾動配置
const defaultAutoScroll = {
  layoutShiftCompensation: true,
  acceleration: 500,
  threshold: {
    x: 0,
    y: 0.2,
  },
  interval: 5,
};

interface UseDraggableContainerProps<T> {
  /**
   * 初始項目列表
   */
  items: T[];
  /**
   * 獲取項目 ID 的函數
   * @param item 項目
   * @returns 項目 ID
   */
  getItemId: (item: T) => string | number;
  /**
   * 更新項目的函數
   * @param currentItem 當前項目
   * @param overItem 目標項目
   * @param oldIndex 舊索引
   * @param newIndex 新索引
   * @returns 更新後的項目
   */
  updateItem: (
    currentItem: T,
    overItem: T,
    oldIndex: number,
    newIndex: number
  ) => T;
  /**
   * 拖拽結束後的回調函數
   * @param updatedItem 更新後的項目
   * @returns 如果返回 false，則不更新內部狀態
   */
  onReorder?: (updatedItem: T) => void | Promise<boolean>;
}

export const useDraggableContainer = <T>({
  items: initialItems,
  getItemId,
  updateItem,
  onReorder,
}: UseDraggableContainerProps<T>) => {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [items, setItems] = useState<T[]>(() =>
    Array.isArray(initialItems) ? initialItems : []
  );

  useEffect(() => {
    if (Array.isArray(initialItems)) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const findItemById = (id: string | number) => (item: T) =>
          getItemId(item) === id;
        const oldIndex = items.findIndex(findItemById(active.id));
        const newIndex = items.findIndex(findItemById(over.id));

        if (oldIndex !== -1 && newIndex !== -1) {
          const oldItems = items.concat();
          const newItems = arrayMove(items, oldIndex, newIndex);
          const currentItem = items[oldIndex];
          const overItem = items[newIndex];

          // 使用提供的函數來更新項目位置
          const updatedItem = updateItem(
            currentItem,
            overItem,
            oldIndex,
            newIndex
          );

          setItems(newItems);

          try {
            // 如果 onReorder 返回 false，則恢復舊的項目
            const result = await onReorder?.(updatedItem);
            if (result === false) {
              setItems(oldItems);
            }
          } catch {
            setItems(oldItems);
          }
        }
      }

      setActiveId(null);
    },
    [items, onReorder, getItemId, updateItem]
  );

  const activeItem = activeId
    ? items.find((item) => getItemId(item) === activeId)
    : null;

  return {
    items,
    activeId,
    activeItem,
    handleDragStart,
    handleDragEnd,
    defaultAutoScroll,
  };
};
