"use client";

import type { LighthouseOutcome } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { cn } from "@daodao/ui/lib/utils";
import { Info } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useState } from "react";
import { isFirstRowOfPerson } from "./cohort-outcome-rows";

interface CohortOutcomeTablesProps {
  outcome: LighthouseOutcome;
  /** 列印版把兩張表拆開放，不需要卡片外框 */
  plain?: boolean;
  /** 點打卡數開啟打卡紀錄抽屜；列印版不帶 */
  onOpenCheckins?: (row: LighthouseOutcome["participantProgress"][number]) => void;
}

const PRACTICE_GRID = "grid-cols-[minmax(190px,1.3fr)_repeat(5,minmax(86px,1fr))]";
const PARTICIPANT_GRID =
  "grid-cols-[minmax(120px,0.8fr)_minmax(190px,1.2fr)_minmax(150px,1fr)_repeat(4,minmax(100px,0.8fr))]";

/** 實踐成果表 + 參與者進度（FR-OUT-05/06） */
export function CohortOutcomeTables({
  outcome,
  plain = false,
  onOpenCheckins,
}: CohortOutcomeTablesProps) {
  const t = useTranslations("lighthouse");
  const [participantColumnWidth, setParticipantColumnWidth] = useState(120);

  function startParticipantResize(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = participantColumnWidth;
    const move = (moveEvent: PointerEvent) =>
      setParticipantColumnWidth(Math.max(60, startWidth + moveEvent.clientX - startX));
    const stop = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
  }

  const participantGridTemplate = plain
    ? "minmax(70px, 1fr) minmax(80px, 1.4fr) minmax(96px, 1.4fr) repeat(4, minmax(50px, 0.7fr))"
    : `${participantColumnWidth}px minmax(190px, 1.2fr) minmax(150px, 1fr) repeat(4, minmax(100px, 0.8fr))`;

  return (
    <section
      className={cn(!plain && "rounded-3xl border border-[#CDEBE8] bg-white")}
      aria-labelledby="outcome-practices-title"
    >
      <div className={cn("px-6 pt-6", plain && "px-0 pt-0")}>
        <h2 id="outcome-practices-title" className="text-lg font-semibold tracking-[-0.02em]">
          {t("outcome_practices_title")}
        </h2>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className={cn(
              "grid gap-3 border-b border-[#EEF6F5] bg-[#F7FCFB] px-[18px] py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#78928F]",
              PRACTICE_GRID
            )}
          >
            <span className="sticky left-0 z-20 bg-[#F7FCFB] shadow-[4px_0_6px_-5px_rgba(13,48,54,0.45)]">
              {t("outcome_col_practice")}
            </span>
            <span>{t("outcome_col_participation")}</span>
            <span>{t("outcome_col_started")}</span>
            <span>{t("outcome_col_completed")}</span>
            <span>{t("outcome_col_checkins")}</span>
            <span>{t("outcome_col_comments")}</span>
          </div>
          {outcome.practiceOutcomes.length === 0 && (
            <p className="px-[18px] py-6 text-sm text-[#78928F]">{t("outcome_practices_empty")}</p>
          )}
          {outcome.practiceOutcomes.map((row) => (
            <div
              key={row.title}
              className={cn(
                "grid items-center gap-3 border-b border-[#EEF6F5] bg-white px-[18px] py-3.5 text-sm last:border-b-0",
                PRACTICE_GRID
              )}
            >
              <span className="sticky left-0 z-10 truncate bg-inherit font-bold text-[#0D3036] shadow-[4px_0_6px_-5px_rgba(13,48,54,0.45)]">
                {row.title}
              </span>
              <span>{row.participants}</span>
              <span>{row.started}</span>
              <span>{row.completed}</span>
              <span>{row.checkins}</span>
              <span>{row.comments}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-6 flex flex-col gap-2 bg-[#F7FCFB] px-6 py-4 sm:flex-row sm:items-start sm:justify-between",
          plain && "rounded-xl px-4"
        )}
      >
        <div>
          <h3 className="text-[15px] font-semibold">{t("outcome_participants_title")}</h3>
        </div>
      </div>
      <div className={cn("overflow-x-auto", !plain && "rounded-b-3xl")}>
        <div className={cn(!plain && "min-w-[980px]")}>
          <div
            className={cn(
              "grid gap-3 border-b border-[#EEF6F5] bg-[#F7FCFB] px-[18px] py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#78928F]",
              plain && "gap-2 px-2 text-[9px]",
              PARTICIPANT_GRID
            )}
            style={{ gridTemplateColumns: participantGridTemplate }}
          >
            <span
              className={cn(
                "relative bg-[#F7FCFB]",
                !plain && "sticky left-0 z-20 shadow-[4px_0_6px_-5px_rgba(13,48,54,0.45)]"
              )}
            >
              {t("outcome_col_participant")}
              {!plain && (
                <button
                  type="button"
                  aria-label={t("resize_column", { column: t("outcome_col_participant") })}
                  className="absolute top-0 right-0 h-full w-2 touch-none cursor-col-resize border-r border-[#DDEFED] hover:border-[#16B9B3] focus-visible:outline-2 focus-visible:outline-logo-cyan"
                  onPointerDown={startParticipantResize}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft")
                      setParticipantColumnWidth((width) => Math.max(60, width - 10));
                    if (event.key === "ArrowRight")
                      setParticipantColumnWidth((width) => width + 10);
                  }}
                />
              )}
            </span>
            <span>{t("outcome_col_practice")}</span>
            <span>{t("outcome_col_progress")}</span>
            <span>{t("outcome_col_checkins_done")}</span>
            <span>{t("outcome_col_responses")}</span>
            <span className="flex items-center gap-1">
              {t("outcome_col_published_comments")}
              {!plain && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[#0D7773] hover:bg-[#EAF7F5] focus-visible:outline-2 focus-visible:outline-logo-cyan"
                      aria-label={t("outcome_published_comments_hint")}
                    >
                      <Info className="size-3.5" aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    sideOffset={6}
                    className="w-72 max-w-[calc(100vw-2rem)] rounded-lg border-[#CDEBE8] bg-[#0D3036] px-3 py-2 text-xs normal-case leading-relaxed tracking-normal text-white shadow-md"
                  >
                    {t("outcome_published_comments_hint")}
                  </PopoverContent>
                </Popover>
              )}
            </span>
            <span>{t("outcome_col_last_activity")}</span>
          </div>
          {outcome.participantProgress.length === 0 && (
            <p className="px-[18px] py-6 text-sm text-[#78928F]">
              {t("outcome_participants_empty")}
            </p>
          )}
          {outcome.participantProgress.map((row, index, rows) => {
            const percent =
              row.targetCount > 0
                ? Math.min(100, Math.round((row.completedCount / row.targetCount) * 100))
                : row.progressPercentage;
            return (
              <div
                key={`${row.userId}-${row.practiceId}`}
                className={cn(
                  "grid items-center gap-3 border-b border-[#EEF6F5] bg-white px-[18px] py-3.5 text-sm last:border-b-0",
                  plain && "gap-2 px-2 text-xs",
                  PARTICIPANT_GRID
                )}
                style={{ gridTemplateColumns: participantGridTemplate }}
              >
                <span
                  className={cn(
                    "truncate bg-inherit font-bold text-[#0D3036]",
                    !plain && "sticky left-0 z-10 shadow-[4px_0_6px_-5px_rgba(13,48,54,0.45)]"
                  )}
                >
                  {row.nickname ?? t("learner")}
                </span>
                <span className="truncate text-[#0D5B59]">{row.practiceTitle}</span>
                <div>
                  <div
                    className="h-[7px] overflow-hidden rounded-full bg-[#DDEFED]"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        percent >= 50 ? "bg-[#16B9B3]" : "bg-[#F0B45B]"
                      )}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#5A7B79]">
                    {row.targetCount > 0
                      ? t("outcome_progress_label", {
                          done: row.completedCount,
                          goal: row.targetCount,
                          percent,
                        })
                      : t("outcome_progress_no_goal", { done: row.checkinCount })}
                  </p>
                </div>
                {onOpenCheckins && row.checkinCount > 0 ? (
                  <button
                    type="button"
                    className="w-fit text-left font-medium text-[#0D7773] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-logo-cyan"
                    aria-label={t("open_checkin_records", { name: row.nickname || t("learner") })}
                    onClick={() => onOpenCheckins(row)}
                  >
                    {t("outcome_checkins_done_value", { count: row.checkinCount })}
                  </button>
                ) : (
                  <span>{t("outcome_checkins_done_value", { count: row.checkinCount })}</span>
                )}
                <span>{t("outcome_responses_value", { count: row.responseCount })}</span>
                <span>
                  {isFirstRowOfPerson(rows, index) ? (row.publishedCommentCount ?? "—") : ""}
                </span>
                <span className="text-[#5A7B79]">
                  {row.lastActivityAt ? formatDay(row.lastActivityAt) : t("outcome_no_activity")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {plain && (
        <p className="px-2 pt-2 text-[9px] leading-relaxed text-[#5A7B79]">
          {t("outcome_col_published_comments")}：{t("outcome_published_comments_hint")}
        </p>
      )}
    </section>
  );
}

function formatDay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}
