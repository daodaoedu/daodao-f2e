"use client";

import { Plus, X } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  LayoutGroup,
  motion,
  type Transition,
} from "motion/react";
import * as React from "react";
import { cn } from "../../../../lib/utils";

type PinListItem = {
  id: string;
  name: string;
  className?: string;
  pinned: boolean;
};

type PinListProps = {
  items: PinListItem[];
  labels?: {
    pinned?: string;
    unpinned?: string;
  };
  transition?: Transition;
  labelMotionProps?: HTMLMotionProps<"p">;
  className?: string;
  labelClassName?: string;
  pinnedSectionClassName?: string;
  unpinnedSectionClassName?: string;
  zIndexResetDelay?: number;
  onItemToggle?: (item: PinListItem) => void;
  transformItems?: (items: PinListItem[]) => PinListItem[];
} & Omit<HTMLMotionProps<"div">, "onToggle">;

function PinList({
  items,
  labels = { pinned: "Pinned Items", unpinned: "All Items" },
  transition = { stiffness: 320, damping: 20, mass: 0.8, type: "spring" },
  labelMotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: "easeInOut" },
  },
  className,
  labelClassName,
  pinnedSectionClassName,
  unpinnedSectionClassName,
  zIndexResetDelay = 500,
  onItemToggle,
  transformItems,
  ...props
}: PinListProps) {
  const [listItems, setListItems] = React.useState(items);
  const [togglingGroup, setTogglingGroup] = React.useState<"pinned" | "unpinned" | null>(null);
  const previousItemsRef = React.useRef(items);
  const isInternalUpdateRef = React.useRef(false);

  // Sync internal state with external items prop
  React.useEffect(() => {
    // Skip update if it was triggered by internal state change
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // Only update if items reference changed or content changed
    const itemsChanged =
      previousItemsRef.current.length !== items.length ||
      previousItemsRef.current.some((prevItem, index) => {
        const currentItem = items[index];
        return (
          !currentItem ||
          prevItem.id !== currentItem.id ||
          prevItem.pinned !== currentItem.pinned ||
          prevItem.name !== currentItem.name
        );
      });

    if (itemsChanged) {
      // Apply transformItems if provided when syncing external items
      const transformedItems = transformItems ? transformItems(items) : items;
      setListItems(transformedItems);
      previousItemsRef.current = transformedItems;
    }
  }, [items, transformItems]);

  const pinned = listItems.filter((u) => u.pinned);
  const unpinned = listItems.filter((u) => !u.pinned);

  const toggleStatus = (id: string) => {
    const item = listItems.find((u) => u.id === id);
    if (!item) return;

    const toggled = { ...item, pinned: !item.pinned };

    // Mark that this is an internal update to prevent useEffect from syncing back
    isInternalUpdateRef.current = true;

    setTogglingGroup(item.pinned ? "pinned" : "unpinned");
    setListItems((prev) => {
      const idx = prev.findIndex((u) => u.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const [item] = updated.splice(idx, 1);
      if (!item) return prev;
      if (toggled.pinned) updated.push(toggled);
      else updated.unshift(toggled);

      // Apply transformItems if provided to update items and adjust order
      const transformed = transformItems ? transformItems(updated) : updated;
      return transformed;
    });

    onItemToggle?.(toggled);

    // Reset group z-index after the animation duration (keep in sync with animation timing)
    setTimeout(() => setTogglingGroup(null), zIndexResetDelay);
  };

  return (
    <motion.div className={cn("flex gap-8", className)} {...props}>
      <LayoutGroup>
        <div>
          <AnimatePresence>
            {pinned.length > 0 && (
              <motion.p
                layout
                key="pinned-label"
                className={cn("text-text-dark text-sm mb-3", labelClassName)}
                {...labelMotionProps}
              >
                {labels.pinned}
              </motion.p>
            )}
          </AnimatePresence>
          {pinned.length > 0 && (
            <div
              className={cn(
                "space-y-3 relative",
                togglingGroup === "pinned" ? "z-5" : "z-10",
                pinnedSectionClassName
              )}
            >
              {pinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  onClick={() => toggleStatus(item.id)}
                  transition={transition}
                  className={cn(
                    "flex items-center justify-between gap-5 rounded-lg bg-white border border-blue px-4 py-1.5",
                    item.className
                  )}
                >
                  <div className="text-text-dark">{item.name}</div>
                  <X className="size-4.5 text-text-dark" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <AnimatePresence>
            {unpinned.length > 0 && (
              <motion.p
                layout
                key="all-label"
                className={cn("text-text-dark text-sm mb-3", labelClassName)}
                {...labelMotionProps}
              >
                {labels.unpinned}
              </motion.p>
            )}
          </AnimatePresence>
          {unpinned.length > 0 && (
            <div
              className={cn(
                "space-y-3 relative",
                togglingGroup === "unpinned" ? "z-5" : "z-10",
                unpinnedSectionClassName
              )}
            >
              {unpinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  onClick={() => toggleStatus(item.id)}
                  transition={transition}
                  className={cn(
                    "flex items-center justify-between gap-5 rounded-lg bg-very-light-blue border border-blue px-4 py-1.5",
                    item.className
                  )}
                >
                  <div className="text-text-dark">{item.name}</div>
                  <Plus className="size-4.5 text-text-dark" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}

export { PinList, type PinListProps, type PinListItem };
