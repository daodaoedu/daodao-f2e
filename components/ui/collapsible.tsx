"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

const Collapsible = CollapsiblePrimitive.Root;

interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<
    typeof CollapsiblePrimitive.CollapsibleTrigger
  > {
  className?: string;
  withIcon?: boolean;
  children?: React.ReactNode;
  expandLabel?: React.ReactNode;
  collapseLabel?: React.ReactNode;
}

const CollapsibleTrigger = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  CollapsibleTriggerProps
>(({ className, withIcon, expandLabel, collapseLabel, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(
      "flex items-center [&[data-state=open]>svg]:rotate-180",
      "[&>div[data-slot=expand]]:data-[state=open]:hidden",
      "[&>div[data-slot=collapse]]:data-[state=closed]:hidden",
      className
    )}
    {...props}
  >
    <div data-slot="expand">{expandLabel}</div>
    <div data-slot="collapse">{collapseLabel}</div>
    {props.children}
    {withIcon && (
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    )}
  </CollapsiblePrimitive.CollapsibleTrigger>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.CollapsibleTrigger.displayName;

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
    {...props}
  >
    <div className={cn(className)}>{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
