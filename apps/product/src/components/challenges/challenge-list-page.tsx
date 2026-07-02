"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Link } from "@daodao/i18n/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import { CATEGORY_LABELS, MOCK_CHALLENGES } from "./mock-data";
import type { Challenge, ChallengeSeason } from "./types";

/** 取得挑戰目前主打的期數：進行中優先，其次即將開始 */
function getPrimarySeason(challenge: Challenge): ChallengeSeason | undefined {
  return (
    challenge.seasons.find((s) => s.status === "active") ??
    challenge.seasons.find((s) => s.status === "upcoming")
  );
}

function daysLeft(endDate: string): number {
  return Math.max(0, differenceInCalendarDays(parseISO(endDate), new Date()));
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const season = getPrimarySeason(challenge);
  if (!season) return null;

  const isUpcoming = season.status === "upcoming";

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex flex-col gap-3 rounded-2xl border border-[#E4EAE9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-palest text-2xl">
            {challenge.coverEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-text-dark">{challenge.title}</h3>
              <Badge variant="secondary" className="shrink-0">
                {CATEGORY_LABELS[challenge.category]}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{challenge.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-text-secondary">
            <span>👥 {isUpcoming ? `${season.memberCount} 人已報名` : `${season.memberCount} 人`}</span>
            <span>📚 第 {season.seasonNumber} 期</span>
            {!isUpcoming && <span>⏰ 剩 {daysLeft(season.endDate)} 天</span>}
          </div>
          <Button size="sm" variant={isUpcoming ? "outline" : "default"} className="rounded-full">
            {isUpcoming ? "預先報名" : "加入本期"}
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}

export function ChallengeListPage() {
  const [category, setCategory] = useState<string>("all");

  const filtered =
    category === "all" ? MOCK_CHALLENGES : MOCK_CHALLENGES.filter((c) => c.category === category);

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <div className="text-center">
        <h1 className="text-xl font-bold text-text-dark">共同挑戰</h1>
        <p className="mt-1 text-sm text-text-secondary">找一群人，一起完成同一件事</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={category === value ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => setCategory(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-text-secondary">這個分類還沒有挑戰</p>
        )}
      </div>
    </div>
  );
}
