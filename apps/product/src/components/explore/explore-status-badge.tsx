import { cn } from "@daodao/ui/lib/utils";

export type ExploreBadgeTone = "active" | "muted" | "neutral";

const TONE_CLASS: Record<ExploreBadgeTone, string> = {
  active: "text-logo-cyan",
  muted: "text-text-dark/60",
  neutral: "text-text-dark",
};

/** 探索頁卡片左上角的狀態標籤，挑戰卡與活動卡共用（daodao#567） */
export function ExploreStatusBadge({ label, tone }: { label: string; tone: ExploreBadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium",
        TONE_CLASS[tone]
      )}
    >
      {label}
    </span>
  );
}
