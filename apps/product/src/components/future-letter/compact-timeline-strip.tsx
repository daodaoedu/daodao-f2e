"use client";

import { cn } from "@daodao/ui/lib/utils";
import { ChevronsRight } from "lucide-react";
import type { TimelineCoordinate } from "./timeline-model";

interface CompactTimelineStripProps {
  coordinates: TimelineCoordinate[];
  onNodeClick?: (node: TimelineCoordinate) => void;
}

const isFutureLetterKind = (kind: TimelineCoordinate["kind"]) =>
  kind === "scheduled" || kind === "delivered-unopened" || kind === "opened";

/** Past dots fade smaller/lighter the further back they sit from "today",
 *  matching the reference prototype's 3-tier size/color ramp. */
function pastDotClass(distanceFromToday: number): string {
  if (distanceFromToday >= 5) return "size-2 bg-[#89DAD7]";
  if (distanceFromToday >= 3) return "size-[9px] bg-[#0E9E99]";
  return "size-2.5 bg-[#0E9E99]";
}

export function CompactTimelineStrip({ coordinates, onNodeClick }: CompactTimelineStripProps) {
  const todayIndex = coordinates.findIndex((node) => node.kind === "today");

  return (
    <div className="flex items-center gap-1 px-6 py-5" data-testid="home-timeline-summary">
      {coordinates.map((node, index) => {
        const isToday = node.kind === "today";
        const isFuture = isFutureLetterKind(node.kind) || (todayIndex >= 0 && index > todayIndex);
        const isPastConnector = todayIndex < 0 || index < todayIndex;
        const monthShortLabel = node.monthLabel
          ? `${new Date(node.date).getMonth() + 1}月`
          : null;

        return (
          <div key={node.id} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "h-px w-6",
                  isPastConnector || (todayIndex >= 0 && index === todayIndex)
                    ? "bg-[#295E5C]/60"
                    : "border-t border-dashed border-[#C79E0A] bg-transparent"
                )}
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              data-testid="timeline-node"
              data-kind={node.kind}
              data-date={node.date.slice(0, 10)}
              data-node-id={node.id}
              onClick={() => onNodeClick?.(node)}
              aria-label={monthShortLabel ? `${monthShortLabel} ${node.dateLabel}` : node.dateLabel}
              className="relative flex flex-col items-center justify-center"
            >
              <span
                className={cn(
                  "rounded-full transition-colors",
                  isToday
                    ? "size-3.5 bg-[#0D7C78]"
                    : isFuture
                      ? "size-[18px] border-2 border-dashed border-[#C79E0A] bg-[#FFFDF0]"
                      : pastDotClass(todayIndex >= 0 ? todayIndex - index : 0)
                )}
              />
              {monthShortLabel && !isFuture && (
                <span className="mt-2 whitespace-nowrap text-[10px] text-[#7FA3A6]">
                  {monthShortLabel}
                </span>
              )}
            </button>
          </div>
        );
      })}
      <div
        className="ml-2 border-t border-dashed border-[#C79E0A]"
        style={{ width: 24 }}
        aria-hidden="true"
      />
      <ChevronsRight className="size-5 shrink-0 text-[#295E5C]/70" aria-hidden="true" />
    </div>
  );
}
