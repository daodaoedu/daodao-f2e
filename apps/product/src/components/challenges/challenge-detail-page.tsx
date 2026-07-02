"use client";

import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Progress } from "@daodao/ui/components/progress";
import { Separator } from "@daodao/ui/components/separator";
import { toast } from "@daodao/ui/components/sonner";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Medal, Pencil, Users } from "lucide-react";
import { CategoryIconTile, getCategoryStyle } from "./category-icon";
import { CATEGORY_LABELS, MOCK_MY_HISTORY } from "./mock-data";
import { pocChallengeActions, usePocChallengeStore } from "./poc-store";
import type { Challenge, ChallengeSeason } from "./types";

function formatDateRange(season: ChallengeSeason): string {
  return `${format(parseISO(season.startDate), "yyyy/MM/dd")} → ${format(parseISO(season.endDate), "yyyy/MM/dd")}`;
}

function ActiveSeasonCard({
  challenge,
  season,
}: {
  challenge: Challenge;
  season: ChallengeSeason;
}) {
  const store = usePocChallengeStore();
  const joined = store.seasons[season.id]?.joined ?? false;
  const start = parseISO(season.startDate);
  const end = parseISO(season.endDate);
  const totalDays = Math.max(1, differenceInCalendarDays(end, start));
  const elapsedDays = Math.min(totalDays, Math.max(0, differenceInCalendarDays(new Date(), start)));
  const daysLeft = Math.max(0, differenceInCalendarDays(end, new Date()));
  const accent = getCategoryStyle(challenge.category);

  return (
    <section
      className="rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm"
      style={{ borderTopWidth: 3, borderTopColor: accent.color }}
    >
      <div className="flex items-center gap-2">
        <Badge>進行中</Badge>
        <h2 className="text-base font-bold text-text-dark">第 {season.seasonNumber} 期</h2>
      </div>
      <p className="mt-2 text-sm font-medium text-text-dark">目標：{season.targetDescription}</p>
      <p className="mt-1 text-sm text-text-secondary">
        {formatDateRange(season)}（剩 {daysLeft} 天）
      </p>
      <div className="mt-3">
        <Progress value={(elapsedDays / totalDays) * 100} className="h-2" />
      </div>
      <Separator className="my-3" />
      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <span className="flex items-center gap-1">
          <Users className="size-3.5" />
          {season.memberCount} 人
        </span>
        <span className="flex items-center gap-1">
          <Pencil className="size-3.5" />
          {season.totalCheckins.toLocaleString()} 次打卡
        </span>
      </div>
      <Link href={`/challenges/${challenge.id}/seasons/${season.id}`}>
        <Button
          className="mt-4 w-full rounded-full"
          variant={joined ? "outline" : "default"}
          onClick={() => {
            if (!joined) {
              pocChallengeActions.joinSeason(season.id);
              toast.success("已加入挑戰！已為你建立對應的主題實踐");
            }
          }}
        >
          {joined ? "已加入，前往打卡" : "加入本期"}
        </Button>
      </Link>
    </section>
  );
}

function UpcomingSeasonCard({ season }: { season: ChallengeSeason }) {
  const store = usePocChallengeStore();
  const registered = store.seasons[season.id]?.registered ?? false;

  return (
    <section className="rounded-2xl border border-dashed border-[#E4EAE9] bg-[#F8FBFB] p-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">即將開始</Badge>
        <h2 className="text-base font-bold text-text-dark">第 {season.seasonNumber} 期預告</h2>
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        {format(parseISO(season.startDate), "yyyy/MM/dd")} 開始 · 已有{" "}
        {season.memberCount + (registered ? 1 : 0)} 人報名
      </p>
      <Button
        variant="outline"
        className="mt-3 w-full rounded-full"
        disabled={registered}
        onClick={() => {
          pocChallengeActions.registerSeason(season.id);
          toast.success("已預先報名，開始時會通知你");
        }}
      >
        {registered ? "已預先報名 ✓" : "預先報名，開始時通知我"}
      </Button>
    </section>
  );
}

interface ChallengeDetailPageProps {
  challenge: Challenge;
}

export function ChallengeDetailPage({ challenge }: ChallengeDetailPageProps) {
  const activeSeason = challenge.seasons.find((s) => s.status === "active");
  const upcomingSeason = challenge.seasons.find((s) => s.status === "upcoming");
  const pastSeasons = challenge.seasons.filter((s) => s.status === "ended");
  const myHistory = MOCK_MY_HISTORY[challenge.id] ?? [];

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <section className="text-center">
        <CategoryIconTile
          category={challenge.category}
          className="mx-auto size-16 rounded-2xl"
          iconClassName="size-8"
        />
        <h1 className="mt-3 text-xl font-bold text-text-dark">{challenge.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {CATEGORY_LABELS[challenge.category]} · 已有 {challenge.allTimeParticipants} 人參加過
          {challenge.isRecurring && " · 定期舉辦"}
        </p>
        <p className="mt-3 text-sm text-text-secondary">{challenge.description}</p>
      </section>

      {activeSeason && <ActiveSeasonCard challenge={challenge} season={activeSeason} />}
      {upcomingSeason && <UpcomingSeasonCard season={upcomingSeason} />}

      {(pastSeasons.length > 0 || myHistory.length > 0) && (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
          <h2 className="text-base font-bold text-text-dark">歷史紀錄</h2>
          <div className="mt-2 flex flex-col gap-2">
            {pastSeasons.map((season) => {
              const mine = myHistory.find((h) => h.seasonId === season.id);
              return (
                <div key={season.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    第 {season.seasonNumber} 期 · {formatDateRange(season)} · {season.memberCount}{" "}
                    人參加
                  </span>
                  {mine && (
                    <span className="flex shrink-0 items-center gap-1 font-medium text-text-dark">
                      我打卡 {mine.checkinCount} 天
                      <Medal className="size-4 text-[#D9A606]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
