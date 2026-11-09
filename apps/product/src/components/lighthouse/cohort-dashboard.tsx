"use client";

import { type LighthouseDashboardQuery, useLighthouseDashboard } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { DatePicker } from "@daodao/ui/components/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { cn } from "@daodao/ui/lib/utils";
import { addDays, differenceInCalendarWeeks, format, parseISO, startOfWeek } from "date-fns";
import { Activity, Flame, Info, Rocket, Users } from "lucide-react";
import { useState } from "react";
import { DEFAULT_ACTIVITY_TIMEZONE } from "./cohort-activity-badge";
import { CohortErrorState } from "./cohort-error-state";
import { CohortParticipantsTable } from "./cohort-participants-table";

interface CohortDashboardProps {
  programId: number;
  cohortId: number;
}

const monthDay = (value: string): string => format(parseISO(value), "yyyy/MM/dd");
const heatColor = (count: number, max: number): string =>
  `color-mix(in srgb, #16B9B3 ${(count / max) * 85}%, #EDF8F6)`;

/** FRD 3.3 儀表板：實踐 chip × 日期範圍驅動所有區塊；只呈現絕對數字（TP-AG-04） */
export function CohortDashboard({ programId, cohortId }: CohortDashboardProps) {
  const t = useTranslations("lighthouse");
  const [practiceTitle, setPracticeTitle] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [selectedHeatDate, setSelectedHeatDate] = useState<string | undefined>();
  const isAllTime = !range.from && !range.to;

  const filter: LighthouseDashboardQuery = { practiceTitle, ...range };
  const query = useLighthouseDashboard(programId, cohortId, filter);
  const data = query.data?.data;

  if (query.isLoading && !data)
    return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (query.error || query.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void query.mutate()}
      />
    );
  if (!data)
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-center">
        <Activity className="mx-auto size-9 text-[#0D7773]" aria-hidden="true" />
        <p className="mt-4 text-xl font-semibold">{t("dashboard_empty_title")}</p>
        <p className="mt-2 text-[#5A7B79]">{t("dashboard_empty_copy")}</p>
      </div>
    );

  const maxHeatCount = Math.max(0, ...Object.values(data.heatmap));
  const maxHeat = Math.max(1, maxHeatCount);
  const maxHour = Math.max(1, ...Object.values(data.hourHistogram));
  const maxMood = Math.max(1, ...data.moodDistribution.map((item) => item.count));
  const heatRangeStart = parseISO(data.range.from);
  const heatRangeEnd = parseISO(data.range.to);
  const firstHeatWeek = startOfWeek(heatRangeStart, { weekStartsOn: 1 });
  const lastHeatWeek = startOfWeek(heatRangeEnd, { weekStartsOn: 1 });
  const heatWeekCount =
    differenceInCalendarWeeks(lastHeatWeek, firstHeatWeek, { weekStartsOn: 1 }) + 1;
  const heatWeeks = Array.from({ length: heatWeekCount }, (_, weekIndex) => {
    const weekStart = addDays(firstHeatWeek, weekIndex * 7);
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const dateKey = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");
      const inRange = dateKey >= data.range.from && dateKey <= data.range.to;
      return { dateKey, inRange, count: data.heatmap[dateKey] ?? 0 };
    });
    return { dateLabel: days.find((day) => day.inRange)?.dateKey, days };
  });
  const overviewRows = practiceTitle
    ? data.practiceOverview.filter((row) => row.title === practiceTitle)
    : data.practiceOverview;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10">
      {/* FR-DB-02 KPI 摘要卡 */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={<Users className="size-5 text-[#0D7773]" aria-hidden="true" />}
          label={t("dashboard_enrolled")}
          value={data.kpi.enrolled}
        />
        <Metric
          icon={<Rocket className="size-5 text-[#0D7773]" aria-hidden="true" />}
          label={t("dashboard_activated")}
          hint={t("dashboard_activated_hint")}
          value={data.kpi.activated}
        />
        <Metric
          icon={<Flame className="size-5 text-[#0D7773]" aria-hidden="true" />}
          label={t("dashboard_active_members")}
          hint={t("dashboard_active_members_hint")}
          value={data.kpi.activeThisWeek}
        />
      </div>

      {/* FR-DB-03 實踐篩選與總覽 */}
      <section
        className="mt-5 rounded-3xl border border-[#CDEBE8] bg-white p-6"
        aria-labelledby="dashboard-overview-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 id="dashboard-overview-title" className="text-lg font-semibold">
            {t("dashboard_practice_overview")}
          </h2>
        </div>
        {/* FR-DB-01 實踐與日期篩選器 */}
        <div className="mt-4 rounded-2xl bg-[#F0FBF9] p-4" data-testid="dashboard-filters">
          <div className="flex flex-col gap-4">
            <fieldset
              className="flex flex-wrap gap-2"
              aria-label={t("dashboard_practice_filter")}
              data-testid="practice-filter"
            >
              <Chip
                active={!practiceTitle}
                onClick={() => {
                  setSelectedHeatDate(undefined);
                  setPracticeTitle(undefined);
                }}
              >
                {t("dashboard_all_practices")}
              </Chip>
              {data.practices.map((practice) => (
                <Chip
                  key={practice.title}
                  active={practiceTitle === practice.title}
                  onClick={() => {
                    setSelectedHeatDate(undefined);
                    setPracticeTitle(practice.title);
                  }}
                >
                  {practice.title}
                </Chip>
              ))}
            </fieldset>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <DatePicker
                aria-label={t("dashboard_range_from")}
                value={parseISO(range.from ?? data.range.from)}
                maxDate={parseISO(range.to ?? data.range.to)}
                onChange={(date) => {
                  setSelectedHeatDate(undefined);
                  setRange((r) => ({ ...r, from: date ? format(date, "yyyy-MM-dd") : undefined }));
                }}
                className="h-9 w-[150px] text-xs"
              />
              <DatePicker
                aria-label={t("dashboard_range_to")}
                value={parseISO(range.to ?? data.range.to)}
                minDate={parseISO(range.from ?? data.range.from)}
                onChange={(date) => {
                  setSelectedHeatDate(undefined);
                  setRange((r) => ({ ...r, to: date ? format(date, "yyyy-MM-dd") : undefined }));
                }}
                className="h-9 w-[150px] text-xs"
              />
              <p className="text-xs text-[#78928F]" aria-live="polite">
                {t("dashboard_range_summary", {
                  from: data.range.from.replaceAll("-", "/"),
                  to: data.range.to.replaceAll("-", "/"),
                })}
              </p>
              <Button
                type="button"
                variant={isAllTime ? "default" : "outline"}
                size="sm"
                className="border-[#CDEBE8]"
                aria-pressed={isAllTime}
                onClick={() => {
                  setSelectedHeatDate(undefined);
                  setRange({});
                }}
              >
                {t("dashboard_range_all")}
              </Button>
            </div>
          </div>
        </div>
        <ul className="mt-4 grid gap-2">
          {overviewRows.map((row) => (
            <li
              key={row.title}
              className="grid gap-3 rounded-2xl border border-[#DDEFED] px-4 py-3 md:grid-cols-[1.6fr_repeat(4,1fr)] md:items-center"
            >
              <div>
                <p className="font-semibold">{row.title}</p>
                <p className="mt-0.5 text-xs text-[#78928F]">
                  {row.startDate ? row.startDate.slice(0, 10).replaceAll("-", "/") : "—"} –{" "}
                  {row.endDate ? row.endDate.slice(0, 10).replaceAll("-", "/") : "—"}
                </p>
              </div>
              <Stat label={t("dashboard_started_count")} value={row.startedCount} />
              <Stat label={t("dashboard_checkin_count")} value={row.checkinCount} />
              <Stat label={t("dashboard_avg_people")} value={row.avgCheckinPeople} />
              <Stat label={t("dashboard_avg_length")} value={row.avgCheckinLength} />
            </li>
          ))}
          {!overviewRows.length && <Empty />}
        </ul>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* FR-DB-04 打卡熱度圖 */}
        <Card
          title={t("dashboard_rhythm_heatmap")}
          description={t("dashboard_rhythm_heatmap_desc")}
        >
          <div className="mt-4 grid w-full gap-x-2 gap-y-2 overflow-x-auto">
            {heatWeeks.map((week, weekIndex) => (
              <div
                key={week.dateLabel ?? weekIndex}
                className="grid w-max grid-cols-[70px_repeat(7,24px)] items-center gap-x-1 sm:grid-cols-[76px_repeat(7,28px)] sm:gap-x-1.5"
              >
                <span className="text-[9px] text-[#78928F] sm:text-[10px]">
                  {week.dateLabel ? monthDay(week.dateLabel) : ""}
                </span>
                {week.days.map((day) => {
                  if (!day.inRange) return <span key={day.dateKey} className="size-6 sm:size-7" />;
                  const tooltip = t("dashboard_heat_tooltip", {
                    date: monthDay(day.dateKey),
                    count: day.count,
                  });
                  return (
                    <div key={day.dateKey} className="group relative" data-heat>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        animation="none"
                        aria-label={tooltip}
                        aria-pressed={selectedHeatDate === day.dateKey}
                        onClick={() => setSelectedHeatDate(day.dateKey)}
                        className={cn(
                          "size-6 rounded-md border border-[#DDEFED] p-0 hover:bg-transparent sm:size-7",
                          selectedHeatDate === day.dateKey && "ring-2 ring-[#0D7773]"
                        )}
                        style={{ backgroundColor: heatColor(day.count, maxHeat) }}
                      />
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0D3036] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        {tooltip}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {selectedHeatDate && (
            <p className="mt-2 text-xs text-[#456B68]" aria-live="polite">
              {t("dashboard_heat_tooltip", {
                date: monthDay(selectedHeatDate),
                count: data.heatmap[selectedHeatDate] ?? 0,
              })}
            </p>
          )}
          {!Object.keys(data.heatmap).length && <Empty />}
          <div className="mt-4 flex items-center gap-2 text-[10px] text-[#78928F]">
            <span>{t("dashboard_heat_legend_title")}</span>
            <span>{t("dashboard_heat_legend_min")}</span>
            <span
              aria-label={t("dashboard_heat_legend_description", { max: maxHeatCount })}
              className="h-2 w-20 rounded-full"
              role="img"
              style={{
                background: `linear-gradient(to right, #EDF8F6, ${heatColor(maxHeat, maxHeat)})`,
              }}
            />
            <span>{t("dashboard_heat_legend_max", { count: maxHeatCount })}</span>
          </div>
        </Card>

        {/* FR-DB-05 打卡標籤分佈 */}
        <Card title={t("dashboard_tags")} description={t("dashboard_tags_desc")}>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.tagDistribution.map((item) => (
              <span
                key={item.tag}
                className="rounded-full bg-[#E7FAF7] px-3 py-2 text-sm text-[#0D5B59]"
              >
                {item.tag} · {item.count}
              </span>
            ))}
          </div>
          {!data.tagDistribution.length && <Empty />}
        </Card>

        {/* FR-DB-06 情緒分佈 */}
        <Card title={t("dashboard_mood")} description={t("dashboard_mood_desc")}>
          <div className="mt-4 grid gap-3">
            {data.moodDistribution.map((item) => (
              <Bar
                key={item.mood}
                label={t(`mood_${item.mood}` as Parameters<typeof t>[0])}
                value={item.count}
                max={maxMood}
              />
            ))}
          </div>
          {!data.moodDistribution.some((item) => item.count > 0) && <Empty />}
        </Card>

        {/* FR-DB-07 打卡走勢 */}
        <Card title={t("dashboard_trend")} description={t("dashboard_trend_desc")}>
          <TrendChart trend={data.trend} />
        </Card>

        {/* FR-DB-08 打卡時段 */}
        <section
          className="min-w-0 rounded-3xl border border-[#CDEBE8] bg-white p-6 lg:col-span-2"
          aria-labelledby="dashboard-hours-title"
        >
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 id="dashboard-hours-title" className="text-lg font-semibold">
              {t("dashboard_time_rhythm")}
            </h2>
            <span className="text-xs text-[#456B68]">({DEFAULT_ACTIVITY_TIMEZONE})</span>
          </div>
          <p className="mt-1 text-xs text-[#78928F]">{t("dashboard_time_rhythm_desc")}</p>
          <div className="mt-5 flex h-44 items-end gap-2 overflow-x-auto">
            {Object.entries(data.hourHistogram).map(([hour, count]) => (
              <div key={hour} className="flex min-w-6 flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-[#0D5B59]">{count}</span>
                <div
                  className="w-full rounded-t-md bg-[#16B9B3]"
                  style={{ height: `${Math.max(4, (count / maxHour) * 140)}px` }}
                />
                <span className="text-[10px] text-[#78928F]">{hour.padStart(2, "0")}</span>
              </div>
            ))}
          </div>
          {!Object.keys(data.hourHistogram).length && <Empty />}
        </section>
      </div>

      {/* FR-DB-09 參與者明細表 */}
      <CohortParticipantsTable
        programId={programId}
        cohortId={cohortId}
        practices={data.practices.map((practice) => practice.title)}
        defaultRange={data.range}
        appliedRange={range}
        practiceTitle={practiceTitle}
      />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-chip={active ? "true" : undefined}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border-[#CDEBE8] bg-white text-[#345E5B]",
        active && "border-[#0D3036] bg-[#0D3036] text-white hover:bg-[#0D3036] hover:text-white"
      )}
    >
      {children}
    </Button>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-[#CDEBE8] bg-white p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-[#78928F]">{description}</p>
      {children}
    </section>
  );
}

function Metric({
  icon,
  label,
  hint,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-[#CDEBE8] bg-[#F0FBF9] px-5 py-4">
      {icon}
      <div>
        <strong className="block text-xl text-[#0D3036]">{value}</strong>
        <span className="flex items-center gap-1 text-xs text-[#5A7B79]">
          {label}
          {hint && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 rounded-full text-[#0D7773] hover:bg-[#EAF7F5]"
                  aria-label={hint}
                >
                  <Info className="size-3.5" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                sideOffset={6}
                className="w-72 max-w-[calc(100vw-2rem)] rounded-lg border-[#CDEBE8] bg-[#0D3036] px-3 py-2 text-xs leading-relaxed text-white shadow-md"
              >
                {hint}
              </PopoverContent>
            </Popover>
          )}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2 md:block">
      <p className="text-[11px] text-[#78928F]">{label}</p>
      <p className="text-base font-semibold text-[#0D3036]">{value}</p>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EDF8F6]">
        <div
          className="h-full rounded-full bg-[#16B9B3]"
          style={{ width: `${max ? (value / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

/** FR-DB-07：14 天折線 + 面積 + 末端圓點；每日以透明柱承接 hover tooltip */
function TrendChart({
  trend,
}: {
  trend: {
    days: { date: string; count: number }[];
    thisWeek: number;
    lastWeek: number;
    delta: number;
  };
}) {
  const t = useTranslations("lighthouse");
  const width = 420;
  const height = 120;
  const padding = 8;
  const max = Math.max(1, ...trend.days.map((day) => day.count));
  const step = trend.days.length > 1 ? (width - padding * 2) / (trend.days.length - 1) : 0;
  const points = trend.days.map((day, index) => ({
    x: padding + index * step,
    y: height - padding - (day.count / max) * (height - padding * 2),
    ...day,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding},${height - padding} ${line} ${points.at(-1)?.x ?? padding},${height - padding}`;
  const last = points.at(-1);
  const deltaLabel = `${trend.delta >= 0 ? "+" : ""}${trend.delta}`;
  const thisWeekDays = trend.days.slice(-7);
  const thisWeekStart = thisWeekDays[0]?.date;
  const thisWeekEnd = thisWeekDays.at(-1)?.date;
  const dateTickIndices = [
    0,
    Math.round((trend.days.length - 1) / 3),
    Math.round(((trend.days.length - 1) * 2) / 3),
    trend.days.length - 1,
  ].filter((index, position, indices) => indices.indexOf(index) === position);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <strong className="text-3xl font-semibold text-[#0D3036]">{trend.thisWeek}</strong>
          <span className="text-xs text-[#78928F]">{t("dashboard_trend_unit")}</span>
          {thisWeekStart && thisWeekEnd && (
            <span className="text-xs text-[#78928F]">
              {t("dashboard_trend_date_range", {
                from: monthDay(thisWeekStart),
                to: monthDay(thisWeekEnd),
              })}
            </span>
          )}
        </p>
        <span className="rounded-full bg-[#E7FAF7] px-3 py-1 text-xs font-semibold text-[#0D5B59]">
          {t("dashboard_trend_delta", { delta: deltaLabel })}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-32 w-full"
        role="img"
        aria-label={t("dashboard_trend_desc")}
      >
        <polygon points={area} fill="#EDF8F6" />
        <polyline points={line} fill="none" stroke="#16B9B3" strokeWidth={2} />
        {last && (
          <circle cx={last.x} cy={last.y} r={4} fill="#16B9B3" stroke="#fff" strokeWidth={2} />
        )}
        {points.map((point) => (
          <g key={point.date} className="group">
            <rect
              x={point.x - step / 2}
              y={0}
              width={Math.max(step, 6)}
              height={height}
              fill="transparent"
            >
              <title>
                {t("dashboard_heat_tooltip", { date: monthDay(point.date), count: point.count })}
              </title>
            </rect>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between gap-1 text-[9px] text-[#78928F] sm:text-[10px]">
        {dateTickIndices.map((index, tickIndex) => (
          <span
            key={trend.days[index]?.date ?? index}
            className={cn(
              "whitespace-nowrap",
              tickIndex === 0 && "text-left",
              tickIndex === dateTickIndices.length - 1 && "text-right"
            )}
          >
            {trend.days[index] ? monthDay(trend.days[index].date) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function Empty() {
  const t = useTranslations("lighthouse");
  return <p className="mt-5 text-sm text-[#78928F]">{t("chart_empty")}</p>;
}
