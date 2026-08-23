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

export function CompactTimelineStrip({ coordinates, onNodeClick }: CompactTimelineStripProps) {
  const todayIndex = coordinates.findIndex((node) => node.kind === "today");

  return (
    <div className="flex items-center gap-1 px-6 py-5" data-testid="home-timeline-summary">
      {coordinates.map((node, index) => {
        const isToday = node.kind === "today";
        const isFuture = isFutureLetterKind(node.kind) || (todayIndex >= 0 && index > todayIndex);
        const isPastConnector = todayIndex < 0 || index < todayIndex;

        return (
          <div key={node.id} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "h-px w-6",
                  isPastConnector || (todayIndex >= 0 && index === todayIndex)
                    ? "bg-[#5FAFAC]"
                    : "border-t border-dashed border-[#E4B84D] bg-transparent"
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
              aria-label={node.monthLabel ? `${node.monthLabel} ${node.dateLabel}` : node.dateLabel}
              className="relative flex items-center justify-center"
            >
              {node.monthLabel && !isFuture && (
                <span className="absolute -top-6 whitespace-nowrap text-[11px] text-[#295E5C]/70">
                  {node.monthLabel}
                </span>
              )}
              <span
                className={cn(
                  "rounded-full transition-colors",
                  isToday
                    ? "size-6 border-2 border-[#0D7C78] bg-[#0D7C78]"
                    : isFuture
                      ? "size-4 border-2 border-dashed border-[#E4B84D] bg-white"
                      : "size-3.5 bg-[#5FAFAC]"
                )}
              />
            </button>
          </div>
        );
      })}
      <div
        className="ml-2 border-t border-dashed border-[#E4B84D]"
        style={{ width: 24 }}
        aria-hidden="true"
      />
      <ChevronsRight className="size-5 shrink-0 text-[#295E5C]/60" aria-hidden="true" />
    </div>
  );
}
