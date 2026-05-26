"use client";

import type { RoadmapItemPublic } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { categoryKey, statusKey } from "./constants";

interface RoadmapItemCardProps {
  item: RoadmapItemPublic;
  isAuthenticated: boolean;
  /** 投票切換；回傳伺服器最新結果，失敗則 throw 供 rollback */
  onToggle: (
    externalId: string,
    currentlyVoted: boolean
  ) => Promise<{ support_count: number; voted: boolean }>;
  /** 未登入點投票時觸發登入引導（帶 intent） */
  onUnauthenticated: (externalId: string) => void;
}

export function RoadmapItemCard({
  item,
  isAuthenticated,
  onToggle,
  onUnauthenticated,
}: RoadmapItemCardProps) {
  const t = useTranslations("roadmap");
  const [voted, setVoted] = useState(item.voted);
  const [count, setCount] = useState(item.support_count);
  const [pending, setPending] = useState(false);

  // 上游資料更新時（切換分頁、重新整理）同步
  useEffect(() => {
    setVoted(item.voted);
    setCount(item.support_count);
  }, [item.voted, item.support_count]);

  const handleClick = async () => {
    if (pending) return;
    if (!isAuthenticated) {
      onUnauthenticated(item.external_id);
      return;
    }
    const prevVoted = voted;
    const prevCount = count;
    // 樂觀更新
    setVoted(!prevVoted);
    setCount(prevCount + (prevVoted ? -1 : 1));
    setPending(true);
    try {
      const result = await onToggle(item.external_id, prevVoted);
      setVoted(result.voted);
      setCount(result.support_count);
    } catch {
      // rollback
      setVoted(prevVoted);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-light-gray/40 bg-basic-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline-logo" size="sm">
          {t(categoryKey(item.category))}
        </Badge>
        <Badge variant="gray" size="sm">
          {t(statusKey(item.status))}
        </Badge>
      </div>
      <h3 className="text-lg font-semibold text-text-dark">{item.title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-light-gray">
        {item.description}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm text-light-gray">{t("supporters", { count })}</span>
        <Button
          type="button"
          variant={voted ? "secondary" : "outline"}
          size="sm"
          onClick={handleClick}
          aria-pressed={voted}
          className="gap-1.5"
        >
          <Heart className={cn("size-4", voted && "fill-logo-cyan text-logo-cyan")} />
          {voted ? t("voted") : t("vote")}
        </Button>
      </div>
    </div>
  );
}
