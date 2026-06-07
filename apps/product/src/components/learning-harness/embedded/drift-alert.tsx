"use client";

import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback } from "@daodao/ui/components/avatar";
import { useMemo } from "react";

interface CheckInRecord {
  checkinDate?: string;
  createdAt?: string;
  note?: string | null;
}

interface DriftAlertProps {
  checkIns: CheckInRecord[];
  frequencyMaxDays?: number;
}

function computeDrift(checkIns: CheckInRecord[], maxDays: number) {
  if (checkIns.length < 3) return null;

  const sorted = [...checkIns]
    .map((c) => new Date(c.checkinDate || c.createdAt || ""))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sorted.length < 3) return null;

  const recent = sorted.slice(-5);
  const gaps: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    const curr = recent[i];
    const prev = recent[i - 1];
    if (curr && prev) {
      gaps.push((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  const recentNotes = checkIns
    .slice(-5)
    .map((c) => c.note || "")
    .filter(Boolean);
  const olderNotes = checkIns
    .slice(-10, -5)
    .map((c) => c.note || "")
    .filter(Boolean);
  const avgRecentLen =
    recentNotes.length > 0 ? recentNotes.reduce((a, n) => a + n.length, 0) / recentNotes.length : 0;
  const avgOlderLen =
    olderNotes.length > 0 ? olderNotes.reduce((a, n) => a + n.length, 0) / olderNotes.length : 0;
  const noteDecline = avgOlderLen > 0 && avgRecentLen < avgOlderLen * 0.3;

  return {
    isDrifting: avgGap > maxDays,
    avgGap: Math.round(avgGap * 10) / 10,
    noteDecline,
  };
}

export function DriftAlert({ checkIns, frequencyMaxDays = 5 }: DriftAlertProps) {
  const t = useTranslations("learning_harness");

  const drift = useMemo(
    () => computeDrift(checkIns, frequencyMaxDays),
    [checkIns, frequencyMaxDays]
  );

  if (!drift?.isDrifting) return null;

  return (
    <div className="bg-white rounded-xl p-4 border border-[#C1ECFF] space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-[#E6FBF8] text-logo-cyan text-xs">明</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-[10px] text-light-gray mb-1">小明 · Buddy</p>
          <div className="bg-[#E6FBF8] rounded-xl rounded-tl-none p-3">
            <p className="text-sm text-text-dark leading-relaxed">
              {drift.noteDecline ? t("s3_buddy_suggest") : t("j_d20_buddy_msg")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
