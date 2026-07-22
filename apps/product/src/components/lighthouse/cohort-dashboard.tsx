"use client";

import { useLighthouseCohort, useLighthouseDashboard } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Activity, CalendarCheck, Flame, Rocket, Users } from "lucide-react";

interface CohortDashboardProps {
  programId: number;
  cohortId: number;
}

export function CohortDashboard({ programId, cohortId }: CohortDashboardProps) {
  const t = useTranslations("lighthouse");
  const cohort = useLighthouseCohort(programId, cohortId).data?.data;
  const query = useLighthouseDashboard(programId, cohortId);
  const data = query.data?.data;
  const maxHeat = Math.max(1, ...Object.values(data?.rhythmHeatmap ?? {}));
  const maxTime = Math.max(1, ...Object.values(data?.timeRhythm ?? {}));

  if (query.isLoading) return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (!data)
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-center">
        <Activity className="mx-auto size-9 text-[#0D7773]" />
        <h1 className="mt-4 text-xl font-semibold">{t("dashboard_empty_title")}</h1>
        <p className="mt-2 text-[#5A7B79]">{t("dashboard_empty_copy")}</p>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("dashboard_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {cohort?.displayName ?? t("cohort_nav_dashboard")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("dashboard_description")}</p>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Users className="size-5 text-[#0D7773]" />} label={t("dashboard_enrolled")} value={data.funnel.enrolled} />
        <Metric icon={<Rocket className="size-5 text-[#0D7773]" />} label={t("dashboard_activated")} value={data.funnel.activated} />
        <Metric icon={<Flame className="size-5 text-[#0D7773]" />} label={t("dashboard_active_members")} value={data.funnel.activeMembers} />
        <Metric icon={<CalendarCheck className="size-5 text-[#0D7773]" />} label={t("dashboard_checkins")} value={data.checkins} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
          <h2 className="text-lg font-semibold">{t("dashboard_rhythm_heatmap")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">{t("dashboard_rhythm_heatmap_desc")}</p>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {Object.entries(data.rhythmHeatmap).map(([day, count]) => {
              const d = day.slice(5);
              return (
                <div
                  key={day}
                  title={`${day}: ${count}`}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="aspect-square w-full rounded-md border border-[#DDEFED]"
                    style={{
                      backgroundColor: `color-mix(in srgb, #16B9B3 ${(count / maxHeat) * 85}%, #EDF8F6)`,
                    }}
                  />
                  <span className="text-[10px] text-[#78928F]">{d}</span>
                </div>
              );
            })}
          </div>
          {!Object.keys(data.rhythmHeatmap).length && <Empty />}
        </section>
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
          <h2 className="text-lg font-semibold">{t("dashboard_funnel")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">{t("dashboard_funnel_desc")}</p>
          <div className="mt-4 grid gap-4">
            <Bar
              label={t("dashboard_enrolled")}
              value={data.funnel.enrolled}
              max={data.funnel.enrolled}
            />
            <Bar
              label={t("dashboard_activated")}
              value={data.funnel.activated}
              max={data.funnel.enrolled}
            />
            <Bar
              label={t("dashboard_active_members")}
              value={data.funnel.activeMembers}
              max={data.funnel.enrolled}
            />
          </div>
        </section>
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
          <h2 className="text-lg font-semibold">{t("dashboard_tags")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">{t("dashboard_tags_desc")}</p>
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
        </section>
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
          <h2 className="text-lg font-semibold">{t("dashboard_blockers")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">{t("dashboard_blockers_desc")}</p>
          <div className="mt-4 grid gap-3">
            {Object.entries(data.commonBlockers).map(([mood, count]) => (
              <Bar
                key={mood}
                label={t(`blocker_${mood}` as Parameters<typeof t>[0])}
                value={count}
                max={Math.max(1, ...Object.values(data.commonBlockers))}
              />
            ))}
          </div>
          {!Object.keys(data.commonBlockers).length && <Empty />}
        </section>
        <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">{t("dashboard_time_rhythm")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">{t("dashboard_time_rhythm_desc")}</p>
          <div className="mt-5 flex h-44 items-end gap-2">
            {Object.entries(data.timeRhythm).map(([hour, count]) => (
              <div key={hour} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-[#0D5B59]">{count}</span>
                <div
                  className="w-full rounded-t-md bg-[#16B9B3]"
                  style={{ height: `${Math.max(4, (count / maxTime) * 140)}px` }}
                />
                <span className="text-[10px] text-[#78928F]">{hour}</span>
              </div>
            ))}
          </div>
          {!Object.keys(data.timeRhythm).length && <Empty />}
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-[#CDEBE8] bg-[#F0FBF9] p-5">
      {icon}
      <strong className="mt-5 block text-xl text-[#0D3036]">{value}</strong>
      <span className="mt-1 block text-xs text-[#5A7B79]">{label}</span>
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
function Empty() {
  const t = useTranslations("lighthouse");
  return <p className="mt-5 text-sm text-[#78928F]">{t("chart_empty")}</p>;
}
