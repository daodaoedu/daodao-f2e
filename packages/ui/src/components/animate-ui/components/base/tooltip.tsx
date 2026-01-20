import { cn } from "../../../../lib/utils";
import {
  TooltipArrow as TooltipArrowPrimitive,
  TooltipPopup as TooltipPopupPrimitive,
  type TooltipPopupProps as TooltipPopupPrimitiveProps,
  TooltipPortal as TooltipPortalPrimitive,
  TooltipPositioner as TooltipPositionerPrimitive,
  type TooltipPositionerProps as TooltipPositionerPrimitiveProps,
  Tooltip as TooltipPrimitive,
  type TooltipProps as TooltipPrimitiveProps,
  TooltipProvider as TooltipProviderPrimitive,
  type TooltipProviderProps as TooltipProviderPrimitiveProps,
  TooltipTrigger as TooltipTriggerPrimitive,
  type TooltipTriggerProps as TooltipTriggerPrimitiveProps,
} from "../../primitives/base/tooltip";

type TooltipProviderProps = TooltipProviderPrimitiveProps;

function TooltipProvider({ delay, ...props }: TooltipProviderProps) {
  // 確保 delay 始終是一個明確的值，避免 hydration mismatch
  // 如果 delay 是 undefined，使用 0 作為默認值，確保服務器端和客戶端一致
  const delayValue = delay !== undefined ? delay : 0;
  return <TooltipProviderPrimitive delay={delayValue} {...props} />;
}

type TooltipProps = TooltipPrimitiveProps & {
  delay?: TooltipPrimitiveProps["delay"];
  alwaysOpen?: boolean;
};

function Tooltip({ delay, alwaysOpen, ...props }: TooltipProps) {
  // 確保 delay 始終是一個明確的值，避免 hydration mismatch
  // 如果 delay 是 undefined，使用 0 作為默認值，確保服務器端和客戶端一致
  const delayValue = delay !== undefined ? delay : 0;
  return (
    <TooltipProvider delay={delayValue}>
      <TooltipPrimitive alwaysOpen={alwaysOpen} {...props} />
    </TooltipProvider>
  );
}

type TooltipTriggerProps = TooltipTriggerPrimitiveProps;

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipTriggerPrimitive {...props} />;
}

type TooltipPanelProps = TooltipPositionerPrimitiveProps & TooltipPopupPrimitiveProps;

function TooltipPanel({ className, sideOffset = 4, children, style, ...props }: TooltipPanelProps) {
  return (
    <TooltipPortalPrimitive>
      <TooltipPositionerPrimitive sideOffset={sideOffset} className="z-50" {...props}>
        <TooltipPopupPrimitive
          className={cn(
            "bg-primary text-primary-foreground w-fit origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
            className
          )}
          style={style}
        >
          {children}
          <TooltipArrowPrimitive className="bg-inherit fill-inherit z-50 size-(--arrow-size,10px) data-[side='bottom']:-top-[4px] data-[side='right']:-left-[4px] data-[side='left']:-right-[4px] data-[side='inline-start']:-right-[4px] data-[side='inline-end']:-left-[4px] rotate-45 rounded-[2px] skew-10" />
        </TooltipPopupPrimitive>
      </TooltipPositionerPrimitive>
    </TooltipPortalPrimitive>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipPanel,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipPanelProps,
};
