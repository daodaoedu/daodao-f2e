"use client";

import { useAuth } from "@daodao/auth";
import type { IAction } from "../types";

const DEFAULT_BADGE = {
  bg: "bg-[var(--am-badge-beginner)] border border-[var(--am-badge-beginner-border)] text-[var(--am-badge-beginner-border)]",
  label: "初學",
} as const;

const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
  beginner: DEFAULT_BADGE,
  intermediate: {
    bg: "bg-[var(--am-badge-intermediate)] border border-[var(--am-badge-intermediate-border)] text-[var(--am-badge-intermediate-border)]",
    label: "中級",
  },
  advanced: {
    bg: "bg-[var(--am-badge-advanced)] border border-[var(--am-badge-advanced-border)] text-[var(--am-badge-advanced-border)]",
    label: "進階",
  },
};

interface ActionCardProps {
  action: IAction;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ActionCard({ action, isSelected, onSelect }: ActionCardProps) {
  const { openLoginDialog } = useAuth();
  const badge = BADGE_STYLES[action.level] ?? DEFAULT_BADGE;

  if (action.locked) {
    return (
      <div
        className={`flex min-h-[200px] w-[280px] flex-shrink-0 flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--am-card-border)] bg-[var(--am-card-bg)] p-5 snap-center ${
          isSelected ? "ring-2 ring-white/50" : ""
        }`}
      >
        <span className={`rounded-full px-3 py-1 text-xs ${badge.bg}`}>{badge.label}</span>
        <div className="text-4xl opacity-30">🪐</div>
        <p className="text-center text-sm text-[#7B9FC4]">
          這是一顆神秘星球
          <br />
          註冊會員之後即可觀看
        </p>
        <button
          type="button"
          onClick={() =>
            openLoginDialog({
              redirectUrl: "/action-maker/actions",
              source: "website",
            })
          }
          className="rounded-full border border-white/50 px-6 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          快速註冊
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-[200px] w-[280px] flex-shrink-0 cursor-pointer flex-col gap-3 rounded-2xl border p-5 text-left transition-all snap-center ${
        isSelected
          ? "border-white/60 bg-[rgba(24,33,94,0.8)] ring-2 ring-white/30"
          : "border-[var(--am-card-border)] bg-[var(--am-card-bg)] hover:border-white/40"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className={`rounded-full px-3 py-1 text-xs ${badge.bg}`}>{badge.label}</span>
        {action.duration && <span className="text-xs text-[#7B9FC4]">{action.duration}</span>}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white">{action.title}</h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-[#BCD5EE]">{action.description}</p>

      {/* Tip */}
      {action.tip && (
        <div className="mt-auto flex gap-2 rounded-lg bg-white/5 px-3 py-2">
          <span className="flex-shrink-0 text-sm">💡</span>
          <p className="text-xs leading-relaxed text-[#7B9FC4]">{action.tip}</p>
        </div>
      )}
    </button>
  );
}
