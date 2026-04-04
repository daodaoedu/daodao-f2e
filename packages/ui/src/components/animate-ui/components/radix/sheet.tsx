import { XIcon } from "lucide-react";
import { cn } from "../../../../lib/utils";
import {
  SheetClose as SheetClosePrimitive,
  type SheetCloseProps as SheetClosePrimitiveProps,
  SheetContent as SheetContentPrimitive,
  type SheetContentProps as SheetContentPrimitiveProps,
  SheetDescription as SheetDescriptionPrimitive,
  type SheetDescriptionProps as SheetDescriptionPrimitiveProps,
  SheetFooter as SheetFooterPrimitive,
  type SheetFooterProps as SheetFooterPrimitiveProps,
  SheetHeader as SheetHeaderPrimitive,
  type SheetHeaderProps as SheetHeaderPrimitiveProps,
  SheetOverlay as SheetOverlayPrimitive,
  type SheetOverlayProps as SheetOverlayPrimitiveProps,
  SheetPortal as SheetPortalPrimitive,
  Sheet as SheetPrimitive,
  type SheetProps as SheetPrimitiveProps,
  SheetTitle as SheetTitlePrimitive,
  type SheetTitleProps as SheetTitlePrimitiveProps,
  SheetTrigger as SheetTriggerPrimitive,
  type SheetTriggerProps as SheetTriggerPrimitiveProps,
} from "../../primitives/radix/sheet";

type SheetProps = SheetPrimitiveProps;

function Sheet(props: SheetProps) {
  return <SheetPrimitive {...props} />;
}

type SheetTriggerProps = SheetTriggerPrimitiveProps;

function SheetTrigger(props: SheetTriggerProps) {
  return <SheetTriggerPrimitive {...props} />;
}

type SheetOverlayProps = SheetOverlayPrimitiveProps;

function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  return (
    <SheetOverlayPrimitive
      className={cn("fixed inset-0 z-50 bg-[#0D3036B2]", className)}
      {...props}
    />
  );
}

type SheetCloseProps = SheetClosePrimitiveProps;

function SheetClose(props: SheetCloseProps) {
  return <SheetClosePrimitive {...props} />;
}

type SheetContentProps = SheetContentPrimitiveProps;

function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  return (
    <SheetPortalPrimitive>
      <SheetOverlay />
      <SheetContentPrimitive
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg",
          side === "right" && "h-full w-[400px] border-l rounded-l-3xl",
          side === "left" && "h-full w-[400px] border-r rounded-r-3xl",
          side === "top" && "w-full h-[calc(100dvh-64px)] border-b rounded-b-3xl",
          side === "bottom" && "w-full h-[calc(100dvh-64px)] border-t rounded-t-3xl",
          className
        )}
        side={side}
        {...props}
      >
        {children}
      </SheetContentPrimitive>
    </SheetPortalPrimitive>
  );
}

type SheetHeaderProps = SheetHeaderPrimitiveProps & {
  isSticky?: boolean;
  showCloseButton?: boolean;
};

function SheetHeader({
  className,
  children,
  isSticky = true,
  showCloseButton = true,
  ...props
}: SheetHeaderProps) {
  return (
    <SheetHeaderPrimitive
      className={cn(
        "flex flex-col gap-1.5 p-4",
        isSticky && "sticky top-0 left-0 right-0 bg-white z-10",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <SheetClose className="p-2 ring-offset-background focus:ring-ring bg-[#F5F6F6]/50 absolute top-2 right-2 rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-hidden cursor-pointer disabled:pointer-events-none">
          <XIcon className="size-6 text-light-gray" />
          <span className="sr-only">Close</span>
        </SheetClose>
      )}
    </SheetHeaderPrimitive>
  );
}

type SheetFooterProps = SheetFooterPrimitiveProps;

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <SheetFooterPrimitive className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
  );
}

type SheetTitleProps = SheetTitlePrimitiveProps;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetTitlePrimitive className={cn("text-center text-md font-medium text-text-dark", className)} {...props} />
  );
}

type SheetDescriptionProps = SheetDescriptionPrimitiveProps;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return <SheetDescriptionPrimitive className={cn("text-text-dark", className)} {...props} />;
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetProps,
  type SheetTriggerProps,
  type SheetCloseProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
};

// 導出 SheetManager 相關功能
export {
  type SheetConfig,
  SheetManagerProvider,
  useSheetManager,
} from "./sheet-manager";
