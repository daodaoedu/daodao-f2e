"use client";

import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { Calendar, ChevronRight, Compass, MapPin, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PracticeTheme, practiceThemeSvgMap } from "@/constants/practice-theme";

type ActivityKind = "online" | "offline";
type ActivityTag = "invite" | "public";
type FilterKey = "all" | "open" | "online" | "offline";

interface MockActivity {
  id: string;
  theme: PracticeTheme;
  tag: ActivityTag;
  title: string;
  description: string;
  dateLabel: string;
  locationLabel: string;
  kind: ActivityKind;
  isOpen: boolean;
  host: string;
  memberCount: number;
}

/**
 * 探索活動課程頁的暫時假資料。
 * 資料來源預計沿用 daodao-server 既有的 `programs`（kind='lighthouse'）/`cohorts`/
 * `cohort_enrollments`，不另開新 kind——結構跟共同挑戰（kind='challenge'）對齊，
 * `challengeService`（src/services/challenge.service.ts）的 list/getDetail/join
 * 幾乎可以照抄一份給活動用。
 *
 * 卡住的地方：lighthouse 目前全部內容都是組織會員限定（daodao-f2e middleware.ts
 * 的 hasLighthouseAccess 擋非會員），還沒有「公開/私密」旗標可以篩出哪些 cohort
 * 能公開展示給任何人看。要接真資料前得先在 cohort 加這個旗標，並補一支比照
 * `GET /api/v1/challenges` 的公開查詢端點（只回傳標記公開的 cohort）。
 * 先用假資料把畫面兜起來，schema／API 補齊後再回來接。
 */
const MOCK_OPEN_ACTIVITIES: MockActivity[] = [
  {
    id: "self-awareness",
    theme: PracticeTheme.blue,
    tag: "invite",
    title: "自我覺察練習",
    description: "六週的練習與共學，一起把注意力帶回自己身上。",
    dateLabel: "8/24 起",
    locationLabel: "台北・線上",
    kind: "online",
    isOpen: false,
    host: "Peggy",
    memberCount: 29,
  },
  {
    id: "book-club",
    theme: PracticeTheme.green,
    tag: "public",
    title: "線上讀書會",
    description: "每週二晚上讀一本書的一章，輪流帶讀、自由討論。",
    dateLabel: "每週二 20:00",
    locationLabel: "線上",
    kind: "online",
    isOpen: true,
    host: "阿哲",
    memberCount: 41,
  },
  {
    id: "morning-writing",
    theme: PracticeTheme.yellow,
    tag: "public",
    title: "晨間書寫小組",
    description: "早上八點開麥克風，安靜寫三十分鐘再聊十分鐘。",
    dateLabel: "9/02 起",
    locationLabel: "線上",
    kind: "online",
    isOpen: true,
    host: "小魚",
    memberCount: 12,
  },
  {
    id: "weekend-cooking",
    theme: PracticeTheme.pink,
    tag: "invite",
    title: "週末共煮共食",
    description: "一個月一次，帶一道菜來，邊煮邊聊這個月的生活。",
    dateLabel: "9/13 起",
    locationLabel: "新竹",
    kind: "offline",
    isOpen: false,
    host: "宜庭",
    memberCount: 8,
  },
];

const MOCK_ONGOING_ACTIVITIES = [
  {
    id: "ai-speaking",
    title: "用 AI 練習英文口說",
    host: "阿哲",
    memberCount: 12,
    dayProgress: "第 3 天 / 共 14 天",
  },
];

const FILTERS: FilterKey[] = ["all", "open", "online", "offline"];

export default function ExploreActivitiesPage() {
  const t = useTranslations("explore_activities");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredActivities = useMemo(
    () =>
      MOCK_OPEN_ACTIVITIES.filter((activity) => {
        if (filter === "all") return true;
        if (filter === "open") return activity.isOpen;
        return activity.kind === filter;
      }),
    [filter]
  );

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-10 px-4 pt-8 pb-18">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-bg-dark">
          <Compass className="size-6 text-logo-cyan" />
          {t("page_title")}
        </h1>
        <p className="text-sm text-text-dark">{t("page_subtitle")}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "h-[30px] cursor-pointer rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors",
              filter === key
                ? "border-logo-cyan bg-logo-cyan text-white"
                : "border-[#DCEBEA] bg-white text-text-dark/75 hover:border-logo-cyan/50"
            )}
          >
            {t(`filter_${key}`)}
          </button>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4.5 text-logo-cyan" />
          <h2 className="m-0 text-lg font-bold text-bg-dark">{t("section_open_title")}</h2>
          <span className="text-sm text-text-dark/40">· {filteredActivities.length}</span>
        </div>

        {filteredActivities.length === 0 ? (
          <p className="mt-6 text-center text-sm text-text-dark">{t("empty")}</p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} t={t} />
            ))}
          </div>
        )}
      </section>

      {MOCK_ONGOING_ACTIVITIES.length > 0 && (
        <section>
          <div className="flex items-center gap-2">
            <h2 className="m-0 text-lg font-bold text-bg-dark">{t("section_ongoing_title")}</h2>
            <span className="text-sm text-text-dark/40">· {MOCK_ONGOING_ACTIVITIES.length}</span>
          </div>
          <p className="mt-1.5 text-sm text-text-dark/70">{t("section_ongoing_subtitle")}</p>

          <div className="mt-5 flex flex-col gap-2.5">
            {MOCK_ONGOING_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3.5 rounded-[18px] border border-[#E4EAE9] bg-white px-4 py-3.5"
              >
                <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-light-blue">
                  <Sparkles className="size-4 text-logo-cyan" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[14.5px] font-semibold text-bg-dark">
                    {activity.title}
                  </span>
                  <span className="text-xs text-text-dark/60">
                    {t("host_members", { host: activity.host, count: activity.memberCount })} ・{" "}
                    {activity.dayProgress}
                  </span>
                </span>
                <ChevronRight className="size-[18px] shrink-0 text-text-dark/40" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-[20px] border border-dashed border-[#D4E5E4] bg-white px-6 py-5.5">
        <span className="text-[13.5px] text-text-dark/65">{t("cta_prompt")}</span>
        <Link
          href="/spaces"
          className="inline-flex h-8 items-center rounded-full bg-logo-cyan px-4 text-[13px] font-semibold text-white transition-colors hover:bg-logo-cyan/90"
        >
          {t("cta_button")}
        </Link>
      </div>
    </main>
  );
}

function ActivityCard({
  activity,
  t,
}: {
  activity: MockActivity;
  t: ReturnType<typeof useTranslations<"explore_activities">>;
}) {
  const Theme = practiceThemeSvgMap[activity.theme] ?? practiceThemeSvgMap[PracticeTheme.yellow];

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#E4EAE9] bg-white transition-all hover:border-logo-cyan/50 hover:shadow-[0_12px_26px_rgba(15,48,54,0.09)]">
      <div className="relative h-[78px] overflow-hidden">
        <Theme className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" />
        <Badge variant="secondary" size="sm" className="absolute top-2.5 left-3">
          {activity.tag === "invite" ? t("tag_invite") : t("tag_public")}
        </Badge>
      </div>
      <div className="flex flex-col gap-1.5 px-4 pt-3.5 pb-4">
        <span className="text-base font-semibold text-bg-dark">{activity.title}</span>
        <span className="line-clamp-2 text-xs text-text-dark/70">{activity.description}</span>
        <span className="mt-0.5 flex items-center gap-2.5 text-xs text-text-dark/60">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5 shrink-0" />
            {activity.dateLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            {activity.locationLabel}
          </span>
        </span>
        <span className="mt-1.5 flex items-center justify-between gap-2 border-t border-[#EEF3F3] pt-3">
          <span className="text-xs text-text-dark/60">
            {t("host_members", { host: activity.host, count: activity.memberCount })}
          </span>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-logo-cyan">
            {t("card_cta")}
            <ChevronRight className="size-3.5" />
          </span>
        </span>
      </div>
    </div>
  );
}
