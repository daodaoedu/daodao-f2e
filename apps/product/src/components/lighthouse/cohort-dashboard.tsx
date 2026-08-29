"use client";

import { type LighthouseDashboardQuery, useLighthouseDashboard } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { Activity, Flame, Rocket, Users } from "lucide-react";
import { useState } from "react";
import { CohortErrorState } from "./cohort-error-state";
import { CohortParticipantsTable } from "./cohort-participants-table";

interface CohortDashboardProps {
  programId: number;
  cohortId: number;
}

const HEAT_CELL = 32;
const monthDay = (value: string): string => format(parseISO(value), "M/d");

/** FRD 3.3 儀表板：實踐 chip × 日期範圍驅動所有區塊；只呈現絕對數字（TP-AG-04） */
export function CohortDashboard({ programId, cohortId }: CohortDashboardProps) {
  const t = useTranslations("lighthouse");
  const [practiceTitle, setPracticeTitle] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
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

  const maxHeat = Math.max(1, ...Object.values(data.heatmap));
  const maxHour = Math.max(1, ...Object.values(data.hourHistogram));
  const maxMood = Math.max(1, ...data.moodDistribution.map((item) => item.count));
  const showOverview = data.practiceTitle === null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10">
      {/* FR-DB-01 實踐篩選器 */}
      <fieldset
        className="flex flex-wrap gap-2"
        aria-label={t("dashboard_practice_filter")}
        data-testid="practice-filter"
      >
        <Chip active={!practiceTitle} onClick={() => setPracticeTitle(undefined)}>
          {t("dashboard_all_practices")}
        </Chip>
        {data.practices.map((practice) => (
          <Chip
            key={practice.title}
            active={practiceTitle === practice.title}
            onClick={() => setPracticeTitle(practice.title)}
          >
            {practice.title}
          </Chip>
        ))}
      </fieldset>

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
          value={data.kpi.activated}
        />
        <Metric
          icon={<Flame className="size-5 text-[#0D7773]" aria-hidden="true" />}
          label={t("dashboard_active_members")}
          value={data.kpi.activeThisWeek}
        />
      </div>

      {/* FR-DB-03 實踐總覽表（僅全部實踐） */}
      {showOverview && (
        <section
          className="mt-5 rounded-3xl border border-[#CDEBE8] bg-white p-6"
          aria-labelledby="dashboard-overview-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="dashboard-overview-title" className="text-lg font-semibold">
                {t("dashboard_practice_overview")}
              </h2>
              <p className="mt-1 text-xs text-[#78928F]">
                {t("dashboard_range_summary", {
                  from: data.range.from.replaceAll("-", "/"),
                  to: data.range.to.replaceAll("-", "/"),
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Input
                type="date"
                aria-label={t("dashboard_range_from")}
                value={range.from ?? data.range.from}
                max={range.to ?? data.range.to}
                onChange={(event) => setRange((r) => ({ ...r, from: event.target.value }))}
                className="h-9 w-[150px] text-xs"
              />
              <span aria-hidden="true">–</span>
              <Input
                type="date"
                aria-label={t("dashboard_range_to")}
                value={range.to ?? data.range.to}
                min={range.from ?? data.range.from}
                onChange={(event) => setRange((r) => ({ ...r, to: event.target.value }))}
                className="h-9 w-[150px] text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[#CDEBE8]"
                onClick={() => setRange({})}
              >
                {t("dashboard_range_all")}
              </Button>
            </div>
          </div>
          <ul className="mt-4 grid gap-2">
            {data.practiceOverview.map((row) => (
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
            {!data.practiceOverview.length && <Empty />}
          </ul>
        </section>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* FR-DB-04 打卡熱度圖 */}
        <Card
          title={t("dashboard_rhythm_heatmap")}
          description={t("dashboard_rhythm_heatmap_desc")}
        >
          <div
            className="mt-4 grid w-full gap-1.5"
            style={{ gridTemplateColumns: `repeat(auto-fill, ${HEAT_CELL}px)` }}
          >
            {Object.entries(data.heatmap).map(([day, count]) => (
              <div key={day} className="group relative" data-heat>
                <div
                  className="rounded-md border border-[#DDEFED]"
                  style={{
                    width: HEAT_CELL,
                    height: HEAT_CELL,
                    backgroundColor: `color-mix(in srgb, #16B9B3 ${(count / maxHeat) * 85}%, #EDF8F6)`,
                  }}
                  role="img"
                  aria-label={t("dashboard_heat_tooltip", { date: monthDay(day), count })}
                />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0D3036] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  {t("dashboard_heat_tooltip", { date: monthDay(day), count })}
                </span>
              </div>
            ))}
          </div>
          {!Object.keys(data.heatmap).length && <Empty />}
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
          <h2 id="dashboard-hours-title" className="text-lg font-semibold">
            {t("dashboard_time_rhythm")}
          </h2>
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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-[#CDEBE8] bg-[#F0FBF9] px-5 py-4">
      {icon}
      <div>
        <strong className="block text-xl text-[#0D3036]">{value}</strong>
        <span className="block text-xs text-[#5A7B79]">{label}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
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

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <p>
          <strong className="text-3xl font-semibold text-[#0D3036]">{trend.thisWeek}</strong>
          <span className="ml-2 text-xs text-[#78928F]">{t("dashboard_trend_unit")}</span>
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
      <div className="flex justify-between text-[10px] text-[#78928F]">
        <span>{t("dashboard_trend_last_week")}</span>
        <span>{t("dashboard_trend_this_week")}</span>
      </div>
    </div>
  );
}

function Empty() {
  const t = useTranslations("lighthouse");
  return <p className="mt-5 text-sm text-[#78928F]">{t("chart_empty")}</p>;
}
