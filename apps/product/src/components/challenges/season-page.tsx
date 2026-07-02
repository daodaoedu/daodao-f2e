"use client";

import { Button } from "@daodao/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { motion } from "motion/react";
import { useState } from "react";
import { MOCK_MY_PROGRESS, MOCK_SEASON_CHECKINS, MOCK_SEASON_RANKING } from "./mock-data";
import type { Challenge, ChallengeSeason, SeasonCheckin, SeasonRankingEntry } from "./types";

function CheckinCard({ checkin }: { checkin: SeasonCheckin }) {
  return (
    <div className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-palest text-xl">
          {checkin.avatarEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-dark">{checkin.displayName}</p>
          <p className="text-xs text-text-secondary">
            {checkin.checkinDate} · 🔥 連續 {checkin.streak} 天
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-text-dark">{checkin.content}</p>
      <div className="mt-3 flex gap-2 text-sm text-text-secondary">
        <button type="button" className="hover:text-text-dark">
          ❤️ 加油
        </button>
        <button type="button" className="hover:text-text-dark">
          💬 留言
        </button>
      </div>
    </div>
  );
}

function RankingRow({ entry }: { entry: SeasonRankingEntry }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${entry.isMe ? "bg-primary-palest" : ""}`}
    >
      <span className="w-6 shrink-0 text-center text-sm font-bold text-text-dark">
        {entry.rank}
      </span>
      <div className="flex size-8 items-center justify-center rounded-full bg-[#F0F9F8] text-base">
        {entry.avatarEmoji}
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-dark">
        {entry.displayName}
        {entry.isMe && "（我）"}
      </span>
      <span className="shrink-0 text-xs text-text-secondary">
        {entry.totalCheckins} 次 · 🔥 {entry.currentStreak} 天
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
        <p className="mt-1 text-sm text-text-secondary">
          剩 {daysLeft} 天 · 👥 {season.memberCount} 人 · ✏️{" "}
          {season.totalCheckins.toLocaleString()} 次打卡
        </p>
      </section>

      {joined ? (
        <section className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
          {challenge.checkinPrompt && (
            <p className="text-sm text-text-secondary">今日打卡提示：「{challenge.checkinPrompt}」</p>
          )}
          <Button
            className="mt-3 w-full rounded-full"
            disabled={progress?.todayCheckedIn}
          >
            {progress?.todayCheckedIn ? "✅ 今日已打卡" : "✏️ 今日打卡"}
          </Button>
          {progress && (
            <p className="mt-3 text-center text-sm text-text-secondary">
              我的進度：🔥 連續 {progress.myStreak} 天 · 共 {progress.myCheckinCount} 次
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
