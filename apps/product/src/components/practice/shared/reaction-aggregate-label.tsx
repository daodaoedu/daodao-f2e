import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";

interface ReactionAggregateLabelProps {
  type: ReactionTypeType;
  count: number;
  latestActorName?: string | null;
}

/**
 * 反應聚合顯示文字
 * 例：「王小明 與其他 5 人覺得很有啟發」
 */
export function ReactionAggregateLabel({
  type,
  count,
  latestActorName,
}: ReactionAggregateLabelProps) {
  if (count === 0) return null;

  const config = REACTION_CONFIG[type];

  if (count === 1 && latestActorName) {
    return (
      <span className="text-xs text-text-dark/60">
        {latestActorName} {config.label}
      </span>
    );
  }

  if (latestActorName) {
    return (
      <span className="text-xs text-text-dark/60">
        {latestActorName} 與其他 {count - 1} 人{config.label}
      </span>
    );
  }

  return (
    <span className="text-xs text-text-dark/60">
      {count} 人{config.label}
    </span>
  );
}
