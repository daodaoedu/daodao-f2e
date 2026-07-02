"use client";

import { Button } from "@daodao/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { CheckCircle2, Flame, Heart, MessageCircle, Pencil, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ColorAvatar } from "@/components/poc-shared/color-avatar";
import { MOCK_MY_PROGRESS, MOCK_SEASON_CHECKINS, MOCK_SEASON_RANKING } from "./mock-data";
import type { Challenge, ChallengeSeason, SeasonCheckin, SeasonRankingEntry } from "./types";

/** 前三名的獎牌配色（金/銀/銅） */
const RANK_BADGES = ["#D9A606", "#9AA8AC", "#C77B4A"] as const;

function CheckinCard({ checkin }: { checkin: SeasonCheckin }) {
  return (
    <div className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
      <div className="flex items-center gap-3">
        <ColorAvatar name={checkin.displayName} photoURL={checkin.photoURL} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-dark">{checkin.displayName}</p>
          <p className="flex items-center gap-1 text-xs text-text-secondary">
            {checkin.checkinDate} ·
            <Flame className="size-3 text-[#FFA10B]" />
            連續 {checkin.streak} 天
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-text-dark">{checkin.content}</p>
      <div className="mt-3 flex gap-4 text-sm text-text-secondary">
        <button type="button" className="flex items-center gap-1 hover:text-text-dark">
          <Heart className="size-4" />
          加油
        </button>
        <button type="button" className="flex items-center gap-1 hover:text-text-dark">
          <MessageCircle className="size-4" />
          留言
        </button>
      </div>
    </div>
  );
}

function RankingRow({ entry }: { entry: SeasonRankingEntry }) {
  const medal = entry.rank <= 3 ? RANK_BADGES[entry.rank - 1] : undefined;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${entry.isMe ? "bg-primary-palest" : ""}`}
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={
          medal
            ? { backgroundColor: medal, color: "#fff" }
            : { backgroundColor: "#F0F2F4", color: "#536166" }
        }
      >
        {entry.rank}
      </span>
      <ColorAvatar name={entry.displayName} photoURL={entry.photoURL} className="size-8" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-dark">
        {entry.displayName}
        {entry.isMe && "（我）"}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs text-text-secondary">
        {entry.totalCheckins} 次 ·
        <Flame className="size-3 text-[#FFA10B]" />
        {entry.currentStreak} 天
      </span>
    </div>
  );
}

interface SeasonPageProps {
  challenge: Challenge;
  season: ChallengeSeason;
}

export function SeasonPage({ challenge, season }: SeasonPageProps) {
  const progress = MOCK_MY_PROGRESS[season.id];
  const checkins = MOCK_SEASON_CHECKINS[season.id] ?? [];
  const ranking = MOCK_SEASON_RANKING[season.id] ?? [];
  const [joined, setJoined] = useState(progress?.joined ?? false);
  const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(season.endDate), new Date()));

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <section className="text-center">
        <h1 className="text-lg font-bold text-text-dark">
          {challenge.title}｜第 {season.seasonNumber} 期
        </h1>
        <p className="mt-1 flex items-center justify-center gap-3 text-sm text-text-secondary">
          <span>剩 {daysLeft} 天</span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {season.memberCount} 人
          </span>
          <span className="flex items-center gap-1">
            <Pencil className="size-3.5" />
            {season.totalCheckins.toLocaleString()} 次打卡
          </span>
        </p>
      </section>

      {joined ? (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
          {challenge.checkinPrompt && (
            <p className="text-sm text-text-secondary">
              今日打卡提示：「{challenge.checkinPrompt}」
            </p>
          )}
          <Button className="mt-3 w-full rounded-full" disabled={progress?.todayCheckedIn}>
            {progress?.todayCheckedIn ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                今日已打卡
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Pencil className="size-4" />
                今日打卡
              </span>
            )}
          </Button>
          {progress && (
            <p className="mt-3 flex items-center justify-center gap-1 text-sm text-text-secondary">
              我的進度：
              <Flame className="size-3.5 text-[#FFA10B]" />
              連續 {progress.myStreak} 天 · 共 {progress.myCheckinCount} 次
              {progress.myRank !== null && ` · 排名 #${progress.myRank}`}
            </p>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4 text-center">
          <p className="text-sm text-text-dark">目標：{season.targetDescription}</p>
          <Button className="mt-3 w-full rounded-full" onClick={() => setJoined(true)}>
            加入挑戰
          </Button>
        </section>
      )}

      <Tabs defaultValue="wall">
        <TabsList className="w-full">
          <TabsTrigger value="wall" className="flex-1">
            打卡牆
          </TabsTrigger>
          {challenge.hasRanking && (
            <TabsTrigger value="ranking" className="flex-1">
              排名
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="wall">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3 pt-3"
          >
            {checkins.map((checkin) => (
              <CheckinCard key={checkin.id} checkin={checkin} />
            ))}
            {checkins.length === 0 && (
              <p className="py-12 text-center text-sm text-text-secondary">
                還沒有人打卡，成為第一個吧！
              </p>
            )}
          </motion.div>
        </TabsContent>

        {challenge.hasRanking && (
          <TabsContent value="ranking">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-1 pt-3"
            >
              {ranking.map((entry) => (
                <RankingRow key={entry.userId} entry={entry} />
              ))}
              {ranking.length === 0 && (
                <p className="py-12 text-center text-sm text-text-secondary">尚無排名資料</p>
              )}
            </motion.div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
