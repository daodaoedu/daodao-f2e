"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "../lib/utils";
import { Tooltip, TooltipPanel, TooltipTrigger } from "./animate-ui/components/base/tooltip";

type SliderContextType = {
  value: number[];
  formatValue?: (value: number, index: number) => React.ReactNode;
  renderTooltip?: (value: number, index: number) => React.ReactNode;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
};

const SliderContext = React.createContext<SliderContextType | undefined>(undefined);

const useSliderContext = () => {
  const context = React.useContext(SliderContext);
  if (!context) {
    throw new Error("SliderThumb must be used within Slider");
  }
  return context;
};

const SliderThumb = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb> & {
    index: number;
  }
>(({ className, index, ...props }, ref) => {
  const { value, formatValue, renderTooltip, isDragging } = useSliderContext();
  const thumbValue = value[index] ?? 0;
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  const tooltipContent = React.useMemo(() => {
    if (renderTooltip) {
      return renderTooltip(thumbValue, index);
    }
    if (formatValue) {
      return formatValue(thumbValue, index);
    }
    return thumbValue;
  }, [thumbValue, index, formatValue, renderTooltip]);

  // 當拖動時，強制保持 tooltip 打開
  React.useEffect(() => {
    if (isDragging) {
      setIsTooltipOpen(true);
    }
  }, [isDragging]);

  const handleMouseEnter = () => {
    if (!isDragging) {
      setIsTooltipOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsTooltipOpen(false);
    }
  };

  // 拖動時強制打開，不允許關閉
  const shouldShowTooltip = isDragging || isTooltipOpen;

  return (
    <Tooltip
      open={shouldShowTooltip}
      onOpenChange={(open) => {
        // 拖動時不允許關閉
        if (!isDragging) {
          setIsTooltipOpen(open);
        }
      }}
    >
      <TooltipTrigger
        render={
          <SliderPrimitive.Thumb
            ref={ref}
            className={cn(
              "block size-9 rounded-full bg-logo-cyan shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-cyan focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110",
              className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
          />
        }
      />
      <TooltipPanel side="top">{tooltipContent}</TooltipPanel>
    </Tooltip>
  );
});
SliderThumb.displayName = SliderPrimitive.Thumb.displayName;

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  /**
   * 自定義 tooltip 顯示的格式
   * @param value - 當前 thumb 的值
   * @param index - thumb 的索引
   * @returns 格式化後的值（可以是字串、數字或 React 節點）
   */
  formatValue?: (value: number, index: number) => React.ReactNode;
  /**
   * 完全自定義 tooltip 的渲染內容
   * @param value - 當前 thumb 的值
   * @param index - thumb 的索引
   * @returns 自定義的 React 節點
   */
  renderTooltip?: (value: number, index: number) => React.ReactNode;
};

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, value, defaultValue, children, formatValue, renderTooltip, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(defaultValue ?? [0]);
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLSpanElement>(null);
    const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Use controlled value if provided, otherwise use internal state
    const currentValue = value ?? internalValue;

    const handleValueChange = React.useCallback(
      (newValue: number[]) => {
        // 當值改變時，認為正在拖動
        setIsDragging(true);

        // 清除之前的 timeout
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }

        // 延遲關閉拖動狀態
        dragTimeoutRef.current = setTimeout(() => {
          setIsDragging(false);
          dragTimeoutRef.current = null;
        }, 300);

        if (value === undefined) {
          setInternalValue(newValue);
        }
        props.onValueChange?.(newValue);
      },
      [value, props.onValueChange]
    );

    // 監聽全局 pointer 事件，確保拖動時 tooltip 保持打開
    React.useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => {
        // 檢查是否點擊在 Slider 區域內
        if (sliderRef.current?.contains(event.target as Node)) {
          setIsDragging(true);
        }
      };

      const handlePointerUp = () => {
        if (isDragging) {
          // 延遲關閉，讓使用者看到最終值
          setTimeout(() => {
            setIsDragging(false);
          }, 200);
        }
      };

      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointercancel", handlePointerUp);
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }
      };
    }, [isDragging]);

    const thumbCount = currentValue.length;

    return (
      <SliderContext.Provider
        value={{ value: currentValue, formatValue, renderTooltip, isDragging, setIsDragging }}
      >
        <SliderPrimitive.Root
          ref={(node) => {
            sliderRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={cn("relative flex w-full touch-none select-none items-center", className)}
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-bg-gray">
            <SliderPrimitive.Range className="absolute h-full bg-logo-cyan" />
          </SliderPrimitive.Track>
          {children
            ? children
            : Array.from({ length: thumbCount }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: thumb count is fixed and order never changes, index is stable
                <SliderThumb key={index} index={index} />
              ))}
        </SliderPrimitive.Root>
      </SliderContext.Provider>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider, SliderThumb };
export type { SliderProps };
