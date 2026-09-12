"use client";

import type { LighthouseOutcome } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";

interface CohortOutcomeTablesProps {
  outcome: LighthouseOutcome;
  /** 列印版把兩張表拆開放，不需要卡片外框 */
  plain?: boolean;
}

const PRACTICE_GRID = "grid-cols-[minmax(190px,1.3fr)_repeat(5,minmax(86px,1fr))]";
const PARTICIPANT_GRID =
  "grid-cols-[minmax(120px,0.8fr)_minmax(190px,1.2fr)_minmax(150px,1fr)_repeat(3,minmax(100px,0.8fr))]";

/** 實踐成果表 + 依參與者查看進度（FR-OUT-05/06）；進度不是評分，只顯示完成數／目標數 */
export function CohortOutcomeTables({ outcome, plain = false }: CohortOutcomeTablesProps) {
  const t = useTranslations("lighthouse");
  return (
    <section
      className={cn(!plain && "rounded-3xl border border-[#CDEBE8] bg-white")}
      aria-labelledby="outcome-practices-title"
    >
      <div className={cn("px-6 pt-6", plain && "px-0 pt-0")}>
        <h2 id="outcome-practices-title" className="text-lg font-semibold tracking-[-0.02em]">
          {t("outcome_practices_title")}
        </h2>
        <p className="mt-1 text-[13px] text-[#78928F]">{t("outcome_practices_description")}</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className={cn(
              "grid gap-3 border-b border-[#EEF6F5] bg-[#F7FCFB] px-[18px] py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#78928F]",
              PRACTICE_GRID
            )}
          >
            <span>{t("outcome_col_practice")}</span>
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
                "grid items-center gap-3 border-b border-[#EEF6F5] px-[18px] py-3.5 text-sm last:border-b-0",
                PRACTICE_GRID
              )}
            >
              <span className="truncate font-bold text-[#0D3036]">{row.title}</span>
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
          <p className="mt-1 text-[13px] text-[#78928F]">{t("outcome_participants_description")}</p>
        </div>
        <span className="shrink-0 self-start rounded-full bg-white px-3 py-1 text-xs font-medium text-[#456B68]">
          {t("outcome_no_ai_badge")}
        </span>
      </div>
      <div className={cn("overflow-x-auto", !plain && "rounded-b-3xl")}>
        <div className="min-w-[880px]">
          <div
            className={cn(
              "grid gap-3 border-b border-[#EEF6F5] bg-[#F7FCFB] px-[18px] py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#78928F]",
              PARTICIPANT_GRID
            )}
          >
            <span>{t("outcome_col_participant")}</span>
            <span>{t("outcome_col_practice")}</span>
            <span>{t("outcome_col_progress")}</span>
            <span>{t("outcome_col_checkins_done")}</span>
            <span>{t("outcome_col_responses")}</span>
            <span>{t("outcome_col_last_activity")}</span>
          </div>
          {outcome.participantProgress.length === 0 && (
            <p className="px-[18px] py-6 text-sm text-[#78928F]">
              {t("outcome_participants_empty")}
            </p>
          )}
          {outcome.participantProgress.map((row) => {
            const percent =
              row.targetCount > 0
                ? Math.min(100, Math.round((row.completedCount / row.targetCount) * 100))
                : row.progressPercentage;
            return (
              <div
                key={`${row.userId}-${row.practiceId}`}
                className={cn(
                  "grid items-center gap-3 border-b border-[#EEF6F5] px-[18px] py-3.5 text-sm last:border-b-0",
                  PARTICIPANT_GRID
                )}
              >
                <span className="truncate font-bold text-[#0D3036]">
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
                <span>{t("outcome_checkins_done_value", { count: row.checkinCount })}</span>
                <span>{t("outcome_responses_value", { count: row.responseCount })}</span>
                <span className="text-[#5A7B79]">
                  {row.lastActivityAt ? formatShort(row.lastActivityAt) : t("outcome_no_activity")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatShort(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}
