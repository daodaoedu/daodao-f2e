"use client";

import { LikeOutlineSvg } from "@daodao/assets";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  PICKER_REACTIONS,
  REACTION_CONFIG,
  type ReactionTypeType,
} from "@/constants/reaction-type";
import { LottieEmoji } from "./lottie-emoji";

// ============================================================================
// Types
// ============================================================================

export interface ReactionPickerButtonProps {
  selectedReactions: ReactionTypeType[];
  onToggle: (type: ReactionTypeType) => void;
  /**
   * "card"    — 卡片層級，較大按鈕（size-9 / emoji 24），無計數
   * "comment" — 留言層級，較小按鈕（size-7 / emoji 18），顯示計數
   * "summary" — 摘要列，圓形 emoji 泡泡 + "X 與其他 N 人" 文字
   */
  variant?: "card" | "comment" | "summary";
  /** comment / summary variant 的總反應計數（所有用戶，非僅當前用戶） */
  totalCount?: number;
  /** 要疊加顯示的 reaction 類型（aggregate，最多 4 個） */
  displayReactions?: ReactionTypeType[];
  /** summary variant：第一個反應者姓名 */
  firstReactorName?: string;
}

const LONG_PRESS_DELAY = 400;

// ============================================================================
// ReactionEmojiStack — 疊加 emoji 圓圈（共用）
// ============================================================================

interface ReactionEmojiStackProps {
  reactions: ReactionTypeType[];
  selectedReactions?: ReactionTypeType[];
  size: number;
  circleClassName: string;
  selectedCircleClassName?: string;
  unselectedCircleClassName?: string;
  overlapClassName?: string;
}

function ReactionEmojiStack({
  reactions,
  selectedReactions = [],
  size,
  circleClassName,
  selectedCircleClassName,
  unselectedCircleClassName,
  overlapClassName = "-ml-1",
}: ReactionEmojiStackProps) {
  return (
    <div className="flex items-center">
      {reactions.slice(0, PICKER_REACTIONS.length).map((type, i) => (
        <div
          key={type}
          className={cn(
            circleClassName,
            selectedReactions.includes(type) ? selectedCircleClassName : unselectedCircleClassName,
            i > 0 && overlapClassName
          )}
        >
          <LottieEmoji
            url={REACTION_CONFIG[type].lottieUrl}
            fallback={REACTION_CONFIG[type].emoji}
            size={size}
            play={selectedReactions.includes(type)}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ReactionPickerButton
// ============================================================================

export function ReactionPickerButton({
  selectedReactions,
  onToggle,
  variant = "comment",
  totalCount,
  displayReactions,
  firstReactorName,
}: ReactionPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 用來區分最後一次互動是 touch 還是 mouse，避免 touch 後誤觸 mouseenter
  const lastInteractionWasTouch = useRef(false);

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // ── Desktop: hover 開啟／關閉 ──
  const handleMouseEnter = () => {
    if (lastInteractionWasTouch.current) return;
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (lastInteractionWasTouch.current) return;
    setOpen(false);
  };

  // ── Mobile: 長按開啟 ──
  const handleTouchStart = () => {
    lastInteractionWasTouch.current = true;
    longPressTimer.current = setTimeout(() => {
      setOpen(true);
    }, LONG_PRESS_DELAY);
  };

  const handleTouchEnd = () => {
    clearLongPress();
    // 短暫重設，讓後續 mouseenter 仍可正常觸發（桌機切換場景）
    setTimeout(() => {
      lastInteractionWasTouch.current = false;
    }, 500);
  };

  const handleTouchMove = () => {
    // 滑動時取消長按
    clearLongPress();
  };

  const isCard = variant === "card";
  const isSummary = variant === "summary";
  const hasSelection = selectedReactions.length > 0;
  const pickerButtonSize = isCard ? "size-9" : "size-7";
  const emojiSize = isCard ? 24 : 18;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover/long-press trigger for emoji picker
    <div
      ref={containerRef}
      className={cn(
        "relative",
        isCard ? "w-full flex items-center justify-center" : "flex items-center"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Summary variant：圓形 emoji 泡泡 + "X 與其他 N 人" */}
      {isSummary && (
        <>
          {open && (
            <div className="absolute bottom-full pb-2 z-10 flex flex-col items-center left-0">
              <div className="flex gap-1 bg-white rounded-full shadow-lg border border-[#E4EAE9] px-2 py-1.5">
                {PICKER_REACTIONS.map((type) => {
                  const config = REACTION_CONFIG[type];
                  const isSelected = selectedReactions.includes(type);
                  return (
                    <div key={type} className="group/emoji relative flex flex-col items-center">
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#295E5C] text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover/emoji:opacity-100 transition-opacity pointer-events-none">
                        {config.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onToggle(type);
                          setOpen(false);
                        }}
                        className={cn(
                          "size-9 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer",
                          isSelected ? "bg-[#E8FAF9]" : "hover:bg-[#F0F9F8]"
                        )}
                      >
                        <LottieEmoji
                          url={config.lottieUrl}
                          fallback={config.emoji}
                          size={24}
                          play={true}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <button
            type="button"
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            {/* Emoji 圓圈 */}
            {(displayReactions && displayReactions.length > 0) || hasSelection ? (
              <ReactionEmojiStack
                reactions={
                  displayReactions && displayReactions.length > 0
                    ? displayReactions
                    : selectedReactions
                }
                selectedReactions={selectedReactions}
                size={18}
                circleClassName="size-7 rounded-full flex items-center justify-center ring-2 ring-white"
                selectedCircleClassName="bg-[#E8FAF9]"
                unselectedCircleClassName="bg-[#EAF7FF]"
                overlapClassName="-ml-1.5"
              />
            ) : (
              <LikeOutlineSvg className="size-6 text-[#9FB5B8]" />
            )}
            {/* 文字摘要 */}
            {totalCount != null && totalCount > 0 && (
              <span className="text-sm text-[#295E5C]">
                {firstReactorName
                  ? totalCount > 1
                    ? `${firstReactorName} 與其他 ${totalCount - 1} 人`
                    : firstReactorName
                  : `${totalCount} 人`}
              </span>
            )}
          </button>
        </>
      )}
      {/* Emoji picker popup (card / comment variant) */}
      {!isSummary && open && (
        <div
          className={cn(
            "absolute bottom-full pb-2 z-10 flex flex-col items-center",
            isCard ? "left-1/2 -translate-x-1/2" : "left-0"
          )}
        >
          <div className="flex gap-1 bg-white rounded-full shadow-lg border border-[#E4EAE9] px-2 py-1.5">
            {PICKER_REACTIONS.map((type) => {
              const config = REACTION_CONFIG[type];
              const isSelected = selectedReactions.includes(type);
              return (
                <div key={type} className="group/emoji relative flex flex-col items-center">
                  {/* Tooltip — desktop hover only */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#295E5C] text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover/emoji:opacity-100 transition-opacity pointer-events-none">
                    {config.label}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onToggle(type);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer",
                      pickerButtonSize,
                      isSelected ? "bg-[#E8FAF9]" : "hover:bg-[#F0F9F8]"
                    )}
                  >
                    <LottieEmoji
                      url={config.lottieUrl}
                      fallback={config.emoji}
                      size={emojiSize}
                      play={true}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main trigger button (card / comment variant) */}
      {!isSummary && (
        <button
          type="button"
          // 防止瀏覽器長按跳出系統選單
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className={cn(
            "flex items-center gap-1.5 transition-colors cursor-pointer select-none",
            isCard
              ? "p-1.5 text-text-dark"
              : cn(
                  "h-auto px-0 gap-1 text-xs",
                  hasSelection ? "text-logo-cyan" : "text-[#9FB5B8] hover:text-logo-cyan"
                )
          )}
        >
          {isCard ? (
            /* card variant：顯示聚合 reaction emoji（含他人）+ 總數，或預設 👍 */
            <>
              {(displayReactions && displayReactions.length > 0) || hasSelection ? (
                <ReactionEmojiStack
                  reactions={
                    displayReactions && displayReactions.length > 0
                      ? displayReactions
                      : selectedReactions
                  }
                  selectedReactions={selectedReactions}
                  size={22}
                  circleClassName="size-[22px]"
                />
              ) : (
                <LikeOutlineSvg className="size-[22px]" />
              )}
              {totalCount != null && totalCount > 0 && (
                <span className="text-sm font-medium">{totalCount}</span>
              )}
            </>
          ) : (
            /* comment variant：Facebook 疊加圓圈（displayReactions）+ 總數 */
            <>
              {displayReactions && displayReactions.length > 0 ? (
                <ReactionEmojiStack
                  reactions={displayReactions}
                  selectedReactions={selectedReactions}
                  size={14}
                  circleClassName="size-5 rounded-full flex items-center justify-center ring-1 ring-white"
                  selectedCircleClassName="bg-[#E8FAF9]"
                  unselectedCircleClassName="bg-[#EAF7FF]"
                />
              ) : (
                <LikeOutlineSvg className="size-5" />
              )}
              {totalCount != null && totalCount > 0 && <span>{totalCount}</span>}
            </>
          )}
        </button>
      )}
    </div>
  );
}
