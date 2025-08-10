import { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/utils/cn';

interface DraggableItemProps {
  id: string | number;
  children: ReactNode;
  dragHandleClassName?: string;
}

const DraggableItem = ({
  id,
  children,
  dragHandleClassName,
}: DraggableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="relative">
        {/*
          拖曳按鈕：
          - 桌面端：只在 hover 時顯示 (group-hover:opacity-100)
          - 移動端：始終顯示，但透明度較低 (md:opacity-0 opacity-30)
        */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={cn(
            'absolute',
            'cursor-grab active:cursor-grabbing touch-none group-hover:opacity-100',
            'bg-basic-100 rounded-xl md:opacity-0 opacity-30 transition-opacity',
            dragHandleClassName
          )}
          aria-label="拖曳排序"
          title="長按可拖曳排序"
        >
          <GripVertical className="size-5 text-basic-300" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default DraggableItem;
