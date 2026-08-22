"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { CalendarCheck, Dna, Mail, Sparkles, Sun } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import type { TimelineCoordinate, TimelineNodeKind } from "./timeline-model";

interface HorizontalTimelineProps {
  coordinates: TimelineCoordinate[];
  summary?: boolean;
  focusId?: string;
  onNodeClick?: (node: TimelineCoordinate) => void;
}

const markerClass: Record<TimelineNodeKind, string> = {
  "check-in": "border-logo-cyan bg-white text-logo-cyan",
  milestone: "border-[#E4B84D] bg-[#FFF6D9] text-[#9A7419]",
  "learning-dna": "border-[#77A9C4] bg-[#EDF5FA] text-[#4A90B8]",
  scheduled: "border-dashed border-[#E4B84D] bg-white text-[#B88B23]",
  "delivered-unopened": "border-logo-cyan bg-logo-cyan text-white motion-safe:animate-pulse",
  opened: "border-[#AFC8C8] bg-[#E7F0F0] text-[#6F9292]",
  today: "border-logo-cyan bg-white text-logo-cyan ring-4 ring-logo-cyan/10",
};

function MarkerIcon({ kind }: { kind: TimelineNodeKind }) {
  if (kind === "today") return <Sun className="size-4" />;
  if (kind === "scheduled" || kind === "delivered-unopened" || kind === "opened")
    return <Mail className="size-4" />;
  if (kind === "learning-dna") return <Dna className="size-4" />;
  if (kind === "milestone") return <Sparkles className="size-4" />;
  return <CalendarCheck className="size-4" />;
}

export function HorizontalTimeline({
  coordinates,
  summary = false,
  focusId,
  onNodeClick,
}: HorizontalTimelineProps) {
  const t = useTranslations("future_letter");
  const viewportRef = useRef<HTMLDivElement>(null);
  const coordinateCount = coordinates.length;

  useLayoutEffect(() => {
    if (coordinateCount === 0) return;
    const target = viewportRef.current?.querySelector<HTMLElement>(
      `[data-node-id="${focusId ?? "today"}"]`
    );
    target?.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
  }, [coordinateCount, focusId]);

  return (
    <div
      ref={viewportRef}
      className="overflow-x-auto scrollbar-hide"
      data-testid={summary ? "home-timeline-summary" : "future-letter-timeline"}
    >
      <div
        className={cn(
          "relative flex w-max min-w-full items-start px-[45vw] pb-5 pt-8",
          summary && "px-6 py-5"
        )}
      >
        <div
          className="absolute left-0 right-0 top-[3.45rem] h-px bg-[#C9DADA]"
          aria-hidden="true"
        />
        {coordinates.map((node) => {
          const isLetter =
            node.kind === "scheduled" ||
            node.kind === "delivered-unopened" ||
            node.kind === "opened";
          const interactive = Boolean(onNodeClick && (summary || isLetter));
          const content = (
            <>
              {!summary && (
                <span className="absolute -top-6 whitespace-nowrap text-[11px] text-text-secondary">
                  {node.monthLabel}
                </span>
              )}
              <span
                className={cn(
                  "relative z-10 flex size-9 items-center justify-center rounded-full border-2",
                  markerClass[node.kind]
                )}
              >
                <MarkerIcon kind={node.kind} />
              </span>
              <span
                className={cn(
                  "mt-2 whitespace-nowrap text-xs",
                  node.kind === "today" ? "font-bold text-logo-cyan" : "text-text-secondary"
                )}
              >
                {node.kind === "today" ? t("label_today") : node.dateLabel}
              </span>
              {!summary && node.kind === "scheduled" && (
                <span className="mt-1 whitespace-nowrap text-[11px] text-[#9A7419]">
                  {t("scheduled_countdown", { days: node.daysRemaining ?? 0 })}
                </span>
              )}
              {!summary && node.kind === "delivered-unopened" && (
                <span className="mt-1 whitespace-nowrap text-[11px] font-medium text-logo-cyan">
                  {t("unopened_label")}
                </span>
              )}
              {!summary && node.kind === "opened" && (
                <span className="mt-1 whitespace-nowrap text-[11px] text-text-secondary">
                  {t("opened_label")}
                </span>
              )}
            </>
          );
          const commonProps = {
            "data-testid": "timeline-node",
            "data-kind": node.kind,
            "data-date": node.date.slice(0, 10),
            "data-node-id": node.id,
            className: "relative flex w-24 shrink-0 flex-col items-center",
          };
          return interactive ? (
            <Button
              key={node.id}
              type="button"
              variant="ghost"
              onClick={() => onNodeClick?.(node)}
              aria-label={
                isLetter
                  ? t(`node_${node.kind.replace("-", "_")}`)
                  : `${node.dateLabel} ${node.title ?? ""}`
              }
              {...commonProps}
            >
              {content}
            </Button>
          ) : (
            <div key={node.id} {...commonProps}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
