"use client";

import type { RoadmapItemPublic } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categoryKey, statusKey } from "./constants";

interface RoadmapItemCardProps {
  item: RoadmapItemPublic;
  isAuthenticated: boolean;
  /** 投票切換；回傳伺服器最新結果，失敗則 throw 供 rollback */
  onToggle?: (
    externalId: string,
    currentlyVoted: boolean
  ) => Promise<{ support_count: number; voted: boolean }>;
  /** 未登入點投票時觸發登入引導（帶 intent） */
  onUnauthenticated?: (externalId: string) => void;
  /** 是否可支持（許願池預設 false） */
  supportable?: boolean;
}

export function RoadmapItemCard({
  item,
  isAuthenticated,
  onToggle,
  onUnauthenticated,
  supportable = true,
}: RoadmapItemCardProps) {
  const t = useTranslations("roadmap");
  const isWishItem = item.external_id.startsWith("wish-");
  const [voted, setVoted] = useState(item.voted);
  const [count, setCount] = useState(item.support_count);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const displayStatus = isWishItem ? "pending" : item.status;
  const statusVisual = (() => {
    switch (displayStatus) {
      case "collected":
        return {
          card: "border-[#9CCBFF] bg-[#F4F9FF]",
          badge: "border-[#B8DFFF] bg-[#EAF4FF] text-[#2B6EA8]",
        };
      case "discussing":
        return {
          card: "border-[#8CCDE8] bg-[#F2F9FD]",
          badge: "border-[#ADE0F0] bg-[#E9F6FC] text-[#197FA0]",
        };
      case "planned":
        return {
          card: "border-[#8BC6FF] bg-[#EFF6FF]",
          badge: "border-[#C0DCFF] bg-[#EAF3FF] text-[#2E6BB1]",
        };
      case "in_progress":
        return {
          card: "border-[#9FD7BC] bg-[#F1FDF7]",
          badge: "border-[#BEE8D2] bg-[#EAF9F3] text-[#1E7A5A]",
        };
      case "done":
        return {
          card: "border-[#8FD3B4] bg-[#F3FBF7]",
          badge: "border-[#AFE3C8] bg-[#E6F7EF] text-[#1C7A5A]",
        };
      case "parked":
        return {
          card: "border-[#F6C2AE] bg-[#FFF5F1]",
          badge: "border-[#FFD1C0] bg-[#FFF0E8] text-[#A45A3A]",
        };
      case "pending":
        return {
          card: "border-[#F0D5A6] bg-[#FFF9EE]",
          badge: "border-[#FFDF9F] bg-[#FFF2D8] text-[#A06B16]",
        };
      default:
        return {
          card: "border-light-gray/40 bg-basic-white",
          badge: "border-transparent bg-very-light-gray text-basic-400",
        };
    }
  })();

  // 上游資料更新時（切換分頁、重新整理）同步；投票進行中則略過，避免覆寫樂觀值
  useEffect(() => {
    if (pendingRef.current) return;
    setVoted(item.voted);
    setCount(item.support_count);
  }, [item.voted, item.support_count]);

  const handleClick = async () => {
    if (!supportable) return;
    if (pending) return;
    if (!isAuthenticated) {
      onUnauthenticated?.(item.external_id);
      return;
    }
    const prevVoted = voted;
    const prevCount = count;
    // 樂觀更新
    setVoted(!prevVoted);
    setCount(prevCount + (prevVoted ? -1 : 1));
    setPending(true);
    pendingRef.current = true;
    try {
      const result = await onToggle?.(item.external_id, prevVoted);
      if (!result) {
        throw new Error("toggle support not available");
      }
      setVoted(result.voted);
      setCount(result.support_count);
    } catch {
      // rollback
      setVoted(prevVoted);
      setCount(prevCount);
      toast.error(t("toast_vote_failed"));
    } finally {
      setPending(false);
      pendingRef.current = false;
    }
  };

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border p-5 shadow-sm", statusVisual.card)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline-logo" size="sm">
          {t(categoryKey(item.category))}
        </Badge>
        <Badge variant="gray" size="sm" className={statusVisual.badge}>
          {isWishItem ? t("wish_pool_status") : t(statusKey(item.status))}
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
          variant={supportable && voted ? "secondary" : "outline"}
          size="sm"
          onClick={handleClick}
          aria-pressed={voted}
          disabled={!supportable}
          className="gap-1.5"
        >
          <Heart
            className={cn("size-4", voted && supportable && "fill-logo-cyan text-logo-cyan")}
          />
          {!supportable ? t("wish_vote_soon") : voted ? t("voted") : t("vote")}
        </Button>
      </div>
    </div>
  );
}
