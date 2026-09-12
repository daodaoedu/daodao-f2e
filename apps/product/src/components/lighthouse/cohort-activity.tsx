"use client";

import {
  LIGHTHOUSE_ACTIVITY_TYPES,
  type LighthouseActivityItem,
  type LighthouseActivityQuery,
  type LighthouseActivityType,
  useLighthouseActivities,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@daodao/ui/components/animate-ui/components/base/tooltip";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Info, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActivityTypeBadge, formatActivityDate, formatActivityTime } from "./cohort-activity-badge";
import { CohortActivityDetailDialog } from "./cohort-activity-detail-dialog";
import { CohortErrorState } from "./cohort-error-state";

interface CohortActivityProps {
  programId: number;
  cohortId: number;
}

const PAGE_SIZE = 50;
const ROW_GRID = "grid-cols-[86px_96px_116px_minmax(150px,1fr)_minmax(280px,1.6fr)]";

/**
 * 場次「動態」（FRD frd-activity-outcome-org.md §3.1）：
 * 四張統計卡與列表共用同一組篩選（期間／類型／實踐／關鍵字／只看有文字），列表依日期分段、同日由晚到早。
 * 篩選皆帶進 SWR key，切換條件時不會殘留上一組結果（FR-ACT-08）。
 */
export function CohortActivity({ programId, cohortId }: CohortActivityProps) {
  const t = useTranslations("lighthouse");
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [type, setType] = useState<LighthouseActivityType | "">("");
  const [practiceTitle, setPracticeTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [hasText, setHasText] = useState(false);
  const [offset, setOffset] = useState(0);
  const [detail, setDetail] = useState<LighthouseActivityItem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [keyword]);
  // 任何篩選變動都回到第一頁
  // biome-ignore lint/correctness/useExhaustiveDependencies: 只在篩選變動時重置分頁
  useEffect(
    () => setOffset(0),
    [range.from, range.to, type, practiceTitle, debouncedKeyword, hasText]
  );

  const query: LighthouseActivityQuery = {
    ...range,
    ...(type ? { type } : {}),
    ...(practiceTitle ? { practiceTitle } : {}),
    ...(debouncedKeyword ? { q: debouncedKeyword } : {}),
    ...(hasText ? { hasText: true } : {}),
    limit: PAGE_SIZE,
    offset,
  };
  const feed = useLighthouseActivities(programId, cohortId, query);
  const data = feed.data?.data;

  const grouped = useMemo(() => {
    const groups: Array<{ day: string; items: LighthouseActivityItem[] }> = [];
    for (const item of data?.items ?? []) {
      const day = formatActivityDate(item.occurredAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.items.push(item);
      else groups.push({ day, items: [item] });
    }
    return groups;
  }, [data?.items]);

  if (feed.error || feed.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void feed.mutate()}
      />
    );

  const stats = data?.stats;
  const cards = [
    {
      key: "checkins",
      value: stats?.checkins,
      label: t("activity_stat_checkin"),
      tone: "teal" as const,
    },
    {
      key: "comments",
      value: stats?.comments,
      label: t("activity_stat_comment"),
      tone: "teal" as const,
    },
    {
      key: "rhythm",
      value: stats?.rhythm,
      label: t("activity_stat_rhythm"),
      tone: "amber" as const,
      hint: t("activity_stat_rhythm_hint"),
    },
    {
      key: "total",
      value: stats?.total,
      label: t("activity_stat_total"),
      tone: "mint" as const,
      hint: t("activity_stat_total_hint"),
    },
  ];
  const min = data?.range.min;
  const max = data?.range.max;
  const total = data?.total ?? 0;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-5 py-8 md:px-10">
      <p className="text-sm text-[#5A7B79]">{t("activity_description")}</p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="activity-stats">
        {cards.map((card) => (
          <div
            key={card.key}
            className={cn(
              "rounded-[18px] border p-4",
              card.tone === "amber" && "border-[#F0D9B7] bg-[#FFFCF7]",
              card.tone === "mint" && "border-[#CDEBE8] bg-[#F0FBF9]",
              card.tone === "teal" && "border-[#CDEBE8] bg-white"
            )}
          >
            <p
              className={cn(
                "text-[22px] font-semibold",
                card.tone === "amber"
                  ? "text-[#A95D00]"
                  : card.tone === "mint"
                    ? "text-[#0D5B59]"
                    : "text-[#0D7773]"
              )}
              aria-live="polite"
            >
              {card.value ?? (feed.isLoading ? "…" : 0)}
            </p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                card.tone === "amber" ? "text-[#9A7B52]" : "text-[#78928F]"
              )}
            >
              {card.label}
              {card.hint && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-5 rounded-full hover:bg-transparent"
                        aria-label={card.hint}
                      >
                        <Info className="size-3.5" aria-hidden="true" />
                      </Button>
                    }
                  />
                  <TooltipPanel
                    side="top"
                    className="max-w-[260px] rounded-lg bg-[#0D3036] px-3 py-2 text-xs text-white"
                  >
                    {card.hint}
                  </TooltipPanel>
                </Tooltip>
              )}
            </p>
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap items-center gap-2.5 rounded-[20px] border border-[#CDEBE8] bg-white p-3.5"
        data-testid="activity-filters"
      >
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#78928F]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("activity_search_placeholder")}
            aria-label={t("activity_search_placeholder")}
            className="h-[38px] rounded-full pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#CDEBE8] px-3 py-1 text-xs text-[#456B68]">
          <span>{t("activity_period")}</span>
          <input
            type="date"
            value={range.from ?? data?.range.from ?? ""}
            min={min}
            max={max}
            title={t("activity_start_hint")}
            aria-label={t("activity_start_label")}
            onChange={(event) =>
              setRange((current) => ({ ...current, from: event.target.value || undefined }))
            }
            className="h-7 rounded-md border border-transparent bg-transparent px-1 text-xs"
          />
          <span aria-hidden="true">–</span>
          <input
            type="date"
            value={range.to ?? data?.range.to ?? ""}
            min={min}
            max={max}
            title={t("activity_end_hint")}
            aria-label={t("activity_end_label")}
            onChange={(event) =>
              setRange((current) => ({ ...current, to: event.target.value || undefined }))
            }
            className="h-7 rounded-md border border-transparent bg-transparent px-1 text-xs"
          />
        </div>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as LighthouseActivityType | "")}
          aria-label={t("activity_type_label")}
          className="h-[38px] rounded-full border border-[#CDEBE8] bg-white px-3 text-sm text-[#0D3036]"
        >
          <option value="">{t("activity_type_all")}</option>
          {LIGHTHOUSE_ACTIVITY_TYPES.map((option) => (
            <option key={option} value={option}>
              {t(`activity_type_${option}`)}
            </option>
          ))}
        </select>
        <select
          value={practiceTitle}
          onChange={(event) => setPracticeTitle(event.target.value)}
          aria-label={t("activity_practice_label")}
          className="h-[38px] max-w-[220px] rounded-full border border-[#CDEBE8] bg-white px-3 text-sm text-[#0D3036]"
        >
          <option value="">{t("activity_practice_all")}</option>
          {data?.practices.map((practice) => (
            <option key={practice.title} value={practice.title}>
              {practice.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-full border border-[#CDEBE8] px-3 py-2 text-sm text-[#456B68]">
          <input
            type="checkbox"
            checked={hasText}
            onChange={(event) => setHasText(event.target.checked)}
            className="size-4 accent-[#16B9B3]"
          />
          {t("activity_text_only")}
        </label>
      </div>

      <section
        className="rounded-3xl border border-[#CDEBE8] bg-white"
        aria-labelledby="activity-list-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-2 px-6 pt-5">
          <div>
            <h2 id="activity-list-title" className="text-lg font-semibold tracking-[-0.02em]">
              {data ? `${formatDay(data.range.from)} – ${formatDay(data.range.to)}` : t("loading")}
            </h2>
            <p className="mt-0.5 text-xs text-[#78928F]">{t("activity_range_hint")}</p>
          </div>
          <p className="text-xs text-[#5A7B79]" aria-live="polite">
            {t("activity_count", { count: total })}
          </p>
        </div>
        <div className="mt-4 overflow-x-auto px-6 pb-5">
          <div className="min-w-[760px]">
            <div
              className={cn(
                "grid gap-3 rounded-t-xl bg-[#F7FCFB] px-4 py-2.5 text-[11px] font-medium text-[#78928F]",
                ROW_GRID
              )}
            >
              <span>{t("col_time")}</span>
              <span>{t("col_type")}</span>
              <span>{t("col_member")}</span>
              <span>{t("col_practice")}</span>
              <span>{t("col_summary")}</span>
            </div>
            {feed.isLoading && !data && (
              <p className="px-4 py-8 text-sm text-[#78928F]">{t("loading")}</p>
            )}
            {data && data.items.length === 0 && (
              <p
                className="px-4 py-9 text-center text-sm text-[#78928F]"
                data-testid="activity-empty"
              >
                {t("activity_empty")}
              </p>
            )}
            {grouped.map((group) => (
              <div key={group.day}>
                <p className="px-4 pt-3 pb-1 text-[11px] font-medium text-[#78928F]">{group.day}</p>
                {group.items.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={cn(
                      "grid items-center gap-3 border-b border-[#EEF6F5] px-4 py-3 text-[13px] last:border-b-0",
                      ROW_GRID
                    )}
                  >
                    <span className="font-mono text-[#78928F]">
                      {formatActivityTime(item.occurredAt)}
                    </span>
                    <span>
                      <ActivityTypeBadge item={item} />
                    </span>
                    <strong className="truncate font-semibold text-[#0D3036]">
                      {item.member.nickname ?? t("learner")}
                    </strong>
                    <span className="truncate text-[#0D5B59]">{item.practice.title}</span>
                    <button
                      type="button"
                      className="truncate rounded-lg px-2 py-1 text-left text-[#0D3036] hover:bg-[#F0FBF9] hover:text-[#0D5B59] focus-visible:outline-2 focus-visible:outline-logo-cyan"
                      title={t("activity_open_detail")}
                      onClick={() => setDetail(item)}
                    >
                      {item.summary}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-[#EEF6F5] px-6 py-3 text-xs text-[#5A7B79]">
            <span>{t("activity_page_range", { from: offset + 1, to: pageEnd, total })}</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-[#CDEBE8]"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                {t("activity_prev_page")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-[#CDEBE8]"
                disabled={pageEnd >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                {t("activity_next_page")}
              </Button>
            </div>
          </div>
        )}
      </section>

      <CohortActivityDetailDialog
        programId={programId}
        cohortId={cohortId}
        item={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

function formatDay(value: string): string {
  return value.replace(/-/g, "/");
}
