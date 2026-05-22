import { useTranslations } from "@daodao/i18n";
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
  const t = useTranslations("app_product");
  if (count === 0) return null;

  const config = REACTION_CONFIG[type];
  const label = t(config.label);

  if (count === 1 && latestActorName) {
    return (
      <span className="text-xs text-text-dark/60">
        {latestActorName} {label}
      </span>
    );
  }

  if (latestActorName) {
    return (
      <span className="text-xs text-text-dark/60">
        {t("reaction_aggregate_with_others", {
          name: latestActorName,
          count: count - 1,
          label,
        })}
      </span>
    );
  }

  return (
    <span className="text-xs text-text-dark/60">
      {t("reaction_aggregate_count", { count, label })}
    </span>
  );
}
