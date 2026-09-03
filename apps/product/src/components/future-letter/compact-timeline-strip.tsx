"use client";

import { useLocale } from "@daodao/i18n";
import { ChevronRight } from "lucide-react";
import { type CSSProperties, Fragment, useMemo, useState } from "react";
import type { TimelineCoordinate } from "./timeline-model";

interface CompactTimelineStripProps {
  coordinates: TimelineCoordinate[];
  onNodeClick?: (node: TimelineCoordinate) => void;
  /** Clicking anywhere on the strip (outside a specific node) opens the footprints page. */
  onOpen?: () => void;
}

const SOLID_LINE = "rgba(41,94,92,.6)";
const DOTTED_LINE = "repeating-linear-gradient(90deg,#C79E0A 0 3px,transparent 3px 6px)";

const KEYFRAMES = `
@keyframes tealPulse{0%,100%{box-shadow:0 0 0 3px rgba(22,185,179,.25),0 0 0 0 rgba(22,185,179,.5);transform:scale(1)}50%{box-shadow:0 0 0 4px rgba(22,185,179,.18),0 0 0 12px rgba(22,185,179,0);transform:scale(1.12)}}
@keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(224,185,11,.6);opacity:.7;transform:scale(1)}50%{box-shadow:0 0 0 8px rgba(224,185,11,0);opacity:1;transform:scale(1.18)}}
@keyframes stripFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
`;

/** Prototype spaces neighbouring dots proportionally: 2px per day + 4px.
 *  Capped so a long quiet stretch cannot blow the 540px strip apart. */
function connectorWidth(from: string, to: string): number {
  const days = Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
  );
  return Math.min(2 * days + 4, 40);
}

/** Connectors take their prototype width when there is room, but may shrink
 *  (proportionally to that width, never below `minWidth`) so the strip fits a
 *  narrow mobile viewport instead of overflowing past the right edge. */
function shrinkableWidth(width: number, minWidth = 6): CSSProperties {
  return { flex: `0 1 ${width}px`, minWidth };
}

/** Prototype renders dates without zero-padding (8/14, not 08/14). */
function trimDateLabel(label: string): string {
  return label.replace(/^0/, "").replace("/0", "/");
}

/** Past dot ramp: older check-ins sit smaller and lighter, growing darker and
 *  larger toward "today" — prototype tiers: 8px #89DAD7 / 9px / 10px #0E9E99. */
function pastDotStyle(distance: number): CSSProperties {
  const [size, color] =
    distance >= 5 ? [8, "#89DAD7"] : distance >= 3 ? [9, "#0E9E99"] : [10, "#0E9E99"];
  return { width: size, height: size, borderRadius: 999, background: color };
}

export function CompactTimelineStrip({
  coordinates,
  onNodeClick,
  onOpen,
}: CompactTimelineStripProps) {
  const locale = useLocale();
  const [hintOpen, setHintOpen] = useState(false);
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short" }),
    [locale]
  );
  const todayIndex = coordinates.findIndex((node) => node.kind === "today");
  const pastAndToday = todayIndex >= 0 ? coordinates.slice(0, todayIndex + 1) : coordinates;
  const futureNodes = todayIndex >= 0 ? coordinates.slice(todayIndex + 1) : [];

  const renderNodeButton = (
    node: TimelineCoordinate,
    dotStyle: CSSProperties,
    dateColor: string,
    options: { animated?: boolean; hint?: boolean; showMonth?: boolean } = {}
  ) => {
    const isToday = node.kind === "today";
    const monthShortLabel =
      options.showMonth && node.monthLabel ? monthFormatter.format(new Date(node.date)) : null;
    return (
      <button
        type="button"
        data-testid="timeline-node"
        data-kind={node.kind}
        data-date={node.date.slice(0, 10)}
        data-node-id={node.id}
        onClick={(event) => {
          event.stopPropagation();
          onNodeClick?.(node);
        }}
        onMouseEnter={options.hint ? () => setHintOpen(true) : undefined}
        onMouseLeave={options.hint ? () => setHintOpen(false) : undefined}
        aria-label={
          isToday
            ? "今天"
            : monthShortLabel
              ? `${monthShortLabel} ${node.dateLabel}`
              : node.dateLabel
        }
        className="group relative flex flex-none items-center justify-center px-[3px] py-[9px]"
      >
        <span
          style={dotStyle}
          className={
            options.animated
              ? undefined
              : "transition-transform duration-[180ms] group-hover:scale-[1.35]"
          }
        />
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% - 2px)",
            fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', ui-monospace, monospace",
            fontSize: 10,
            color: dateColor,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
          className="opacity-0 transition-opacity duration-[160ms] group-hover:opacity-100"
        >
          {isToday ? "今天" : trimDateLabel(node.dateLabel)}
        </span>
        {monthShortLabel && (
          <span
            style={{
              position: "absolute",
              top: "calc(100% - 2px)",
              fontSize: 10,
              color: "#7FA3A6",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
            className="opacity-100 transition-opacity duration-[160ms] group-hover:opacity-0"
          >
            {monthShortLabel}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className="relative w-[540px] max-w-[calc(100%-32px)] md:max-w-[82%]"
      data-testid="home-timeline-summary"
    >
      <style>{KEYFRAMES}</style>
      {/* biome-ignore lint/a11y/useSemanticElements: contains per-node <button>s, so a native button would nest invalid HTML */}
      <div
        role="button"
        tabIndex={0}
        aria-label="我的足跡"
        onClick={() => onOpen?.()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen?.();
          }
        }}
        className="flex cursor-pointer items-center px-3 transition-transform duration-[220ms] hover:-translate-y-[2px] md:px-[22px]"
        style={{ height: 44, gap: 16, borderRadius: 999 }}
      >
        <span className="flex min-w-0 flex-1 items-center">
          {pastAndToday.map((node, index) => {
            const isToday = node.kind === "today";
            const distance = todayIndex >= 0 ? todayIndex - index : 0;
            const prev = index > 0 ? pastAndToday[index - 1] : undefined;
            return (
              <Fragment key={node.id}>
                {prev && (
                  <span
                    aria-hidden="true"
                    style={
                      isToday
                        ? { ...shrinkableWidth(12), height: 0.5, background: SOLID_LINE }
                        : {
                            ...shrinkableWidth(connectorWidth(prev.date, node.date)),
                            height: 1,
                            background: SOLID_LINE,
                          }
                    }
                  />
                )}
                {isToday
                  ? renderNodeButton(
                      node,
                      {
                        width: 13,
                        height: 13,
                        borderRadius: 999,
                        background: "#0D7C78",
                        animation: "tealPulse 2.4s ease-in-out infinite",
                      },
                      "#0D7C78",
                      { animated: true }
                    )
                  : renderNodeButton(node, pastDotStyle(distance), "#0E9E99", {
                      showMonth: true,
                    })}
              </Fragment>
            );
          })}
          <span
            aria-hidden="true"
            style={{ flex: "1 1 0%", minWidth: 0, height: 1, background: DOTTED_LINE }}
          />
          {futureNodes.map((node, index) => {
            const prev = index > 0 ? futureNodes[index - 1] : undefined;
            return (
              <Fragment key={node.id}>
                {prev && (
                  <span
                    aria-hidden="true"
                    style={{
                      ...shrinkableWidth(connectorWidth(prev.date, node.date)),
                      height: 1,
                      background: DOTTED_LINE,
                    }}
                  />
                )}
                {renderNodeButton(
                  node,
                  {
                    width: 13,
                    height: 13,
                    borderRadius: 999,
                    background: "#F9E41E",
                    boxShadow: "inset 0 0 0 1.5px #C79E0A",
                  },
                  "#A87A22",
                  { hint: true }
                )}
              </Fragment>
            );
          })}
          {futureNodes.length === 0 && (
            <span
              aria-hidden="true"
              onMouseEnter={() => setHintOpen(true)}
              onMouseLeave={() => setHintOpen(false)}
              style={{
                // Prototype is content-box: 13px + 2px dashed border = 17px outer.
                width: 17,
                height: 17,
                flex: "none",
                borderRadius: 999,
                border: "2px dashed #C79E0A",
                background: "#FFFDF0",
                animation: "breathe 2.4s ease-in-out infinite",
              }}
            />
          )}
          <span
            aria-hidden="true"
            style={{ ...shrinkableWidth(96, 20), height: 1, background: DOTTED_LINE }}
          />
        </span>
        <span
          aria-hidden="true"
          className="-ml-2 mr-2 flex flex-none items-center md:mr-[34px]"
          style={{ color: "#0F3036" }}
        >
          <ChevronRight className="size-[18px]" style={{ marginRight: -9 }} />
          <ChevronRight className="size-[18px]" />
        </span>
      </div>
      {hintOpen && (
        <div
          style={{
            position: "absolute",
            right: 76,
            bottom: 52,
            padding: "5px 11px",
            borderRadius: 11,
            background: "#F9E41E",
            color: "#0D3036",
            fontSize: 11.5,
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 6px 16px rgba(224,185,11,.26)",
            animation: "stripFadeUp .22s ease-out",
            pointerEvents: "none",
          }}
        >
          寫信給未來的自己
        </div>
      )}
    </div>
  );
}
