import { Card } from "@daodao/ui/components/card";
import { ChevronRight } from "lucide-react";
import type { Insight } from "../types";

interface InsightCardProps {
  insight: Insight;
  onDrillDown: (view: Insight["drillDown"]) => void;
}

/** 第二層：一句結論＋補充說明，可下鑽 */
export function InsightCard({ insight, onDrillDown }: InsightCardProps) {
  return (
    <Card className="border-[#E0E4E8] p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{insight.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-relaxed text-[#2D3436]">
            {insight.conclusion}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#8A9BA0]">{insight.detail}</p>
          <button
            type="button"
            onClick={() => onDrillDown(insight.drillDown)}
            className="mt-2 flex items-center gap-0.5 text-xs font-medium text-logo-cyan"
          >
            看完整分析
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </Card>
  );
}
