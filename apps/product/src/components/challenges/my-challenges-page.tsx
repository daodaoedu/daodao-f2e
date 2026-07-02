"use client";

import { Link } from "@daodao/i18n/navigation";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@daodao/ui/components/empty";
import { Progress } from "@daodao/ui/components/progress";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { CheckCircle2, ChevronRight, Flame } from "lucide-react";
import { CategoryIconTile } from "./category-icon";
import { getChallengeById, MOCK_MY_PROGRESS } from "./mock-data";

/** 我的挑戰：我加入的所有挑戰進度總覽（對應 FRD /me/challenges） */
export function MyChallengesPage() {
  const myChallenges = Object.values(MOCK_MY_PROGRESS)
    .map((progress) => {
      const challenge = getChallengeById(progress.challengeId);
      const season = challenge?.seasons.find((s) => s.id === progress.seasonId);
      if (!challenge || !season) return null;
      return { progress, challenge, season };
    })
    .filter((item) => item !== null);

  if (myChallenges.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>還沒有加入任何挑戰</EmptyTitle>
          <EmptyDescription>找一群人，一起完成同一件事</EmptyDescription>
        </EmptyHeader>
        <Link href="/challenges">
          <Button className="rounded-full">探索共同挑戰</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      {myChallenges.map(({ progress, challenge, season }) => {
        const start = parseISO(season.startDate);
        const end = parseISO(season.endDate);
        const totalDays = Math.max(1, differenceInCalendarDays(end, start));
        const elapsedDays = Math.min(
          totalDays,
          Math.max(0, differenceInCalendarDays(new Date(), start))
        );
        const daysLeft = Math.max(0, differenceInCalendarDays(end, new Date()));

        return (
          <Link
            key={progress.seasonId}
            href={`/challenges/${challenge.id}/seasons/${season.id}`}
            className="rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <CategoryIconTile
                category={challenge.category}
                className="size-11"
                iconClassName="size-5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-text-dark">{challenge.title}</p>
                <p className="text-xs text-text-secondary">
                  第 {season.seasonNumber} 期 · 剩 {daysLeft} 天
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-text-secondary" />
            </div>

            <div className="mt-3">
              <Progress value={(elapsedDays / totalDays) * 100} className="h-2" />
              <p className="mt-1 flex justify-between text-xs text-text-secondary">
                <span>
                  進度 {elapsedDays}/{totalDays} 天
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="size-3 text-[#FFA10B]" />
                  連續 {progress.myStreak} 天 · 共 {progress.myCheckinCount} 次
                </span>
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              {progress.todayCheckedIn ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-logo-cyan" />
                  今日已打卡
                </Badge>
              ) : (
                <Badge className="bg-[#FFF4E3] text-[#B87A00]">今天還沒打卡</Badge>
              )}
              {progress.myRank !== null && (
                <span className="text-xs text-text-secondary">目前排名 #{progress.myRank}</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
