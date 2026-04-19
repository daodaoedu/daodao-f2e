"use client";

import { Button } from "@daodao/ui/components/button";
import type { IChallenge } from "@/hooks/use-challenges";

interface CommunityChallengeCardProps {
  challenge: IChallenge;
  onJoin?: (id: string) => void;
}

export function CommunityChallengeCard({ challenge, onJoin }: CommunityChallengeCardProps) {
  const { id, title, description, statusLabel, period, participantCount, participants } = challenge;

  return (
    <div className="relative w-[294px] shrink-0 rounded-xl overflow-hidden bg-[#FFF3E8] min-h-[260px] flex flex-col p-5 gap-4">
      {/* Top badges + period */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <span className="text-xs border border-gray-300 bg-white rounded px-2 py-0.5 text-text-dark">
            共同挑戰
          </span>
          <span className="text-xs border border-orange-400 bg-white rounded px-2 py-0.5 text-orange-500">
            {statusLabel}
          </span>
        </div>
        <span className="text-xs text-text-dark whitespace-nowrap">
          期間: {period.start} - {period.end}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-text-dark leading-snug">🏆 {title}</h3>

      {/* Description */}
      <p className="text-sm text-text-dark leading-relaxed flex-1">{description}</p>

      {/* Participants */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {participants.slice(0, 3).map((p, i) => (
            <div
              key={p.id}
              className="w-7 h-7 rounded-full border-2 border-white"
              style={{ backgroundColor: p.avatarColor, marginLeft: i === 0 ? 0 : -8 }}
            />
          ))}
        </div>
        <span className="text-sm text-text-dark">
          有 <strong>{participantCount}</strong> 位夥伴努力中
        </span>
      </div>

      {/* Join button */}
      <Button
        variant="orange"
        onClick={() => onJoin?.(id)}
        className="w-full rounded-full py-3 text-sm font-bold"
      >
        ✦ 馬上加入
      </Button>

      {/* Unlock note */}
      <p className="text-center text-xs text-gray-400">
        💬 加入即可解鎖 <span className="text-primary-base font-semibold">專屬留言交流</span>
      </p>
    </div>
  );
}
