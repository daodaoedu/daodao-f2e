"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "relative flex h-9 items-stretch rounded-md border border-input bg-transparent shadow-xs transition-shadow focus-within:ring-1 focus-within:ring-ring [&:has([data-align=block-start],[data-align=block-end])]:h-auto [&:has([data-align=block-start],[data-align=block-end])]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex items-center gap-1.5 px-3 text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        align === "inline-start" && "order-first",
        align === "inline-end" && "order-last",
        align === "block-start" && "w-full border-b px-3 py-1.5",
        align === "block-end" && "w-full border-t px-3 py-1.5",
        className
      )}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5",
        "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
);

function InputGroupButton({
  className,
  size = "xs",
  type = "button",
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <button
      data-slot="input-group-button"
      type={type}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
