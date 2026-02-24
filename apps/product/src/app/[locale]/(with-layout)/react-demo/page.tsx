"use client";

import { useCallback, useRef, useState } from "react";
import { CheckInCard } from "@/components/check-in/display/check-in-card";
import { CommentSection, ReactionBar } from "@/components/check-in/reactions";
import type { IComment, IReactionCount } from "@/components/check-in/reactions";
import { MoodType } from "@/constants/mood";
import { ReactionType, type ReactionTypeType } from "@/constants/reaction-type";

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CHECK_IN = {
  taskTitle: "練習寫小說",
  date: "2026.02.20",
  mood: MoodType.happy,
  content: "今天在 Blog 上更新了一小篇，終於把卡了兩週的情節寫出來了！雖然只有 800 字，但感覺突破了一個關卡。有得到一些讀者回應，很受到鼓舞。",
  tags: ["寫作", "堅持", "小說"],
  images: [],
};

const MOCK_INITIAL_REACTIONS: IReactionCount[] = [
  { type: ReactionType.encourage, count: 3, latestActorName: "Sarah" },
  { type: ReactionType.learned, count: 1, latestActorName: "Alex" },
  { type: ReactionType.sameHere, count: 2, latestActorName: "Jordan" },
  { type: ReactionType.useful, count: 0 },
  { type: ReactionType.curious, count: 0 },
];

const MOCK_INITIAL_COMMENTS: IComment[] = [
  {
    id: "c1",
    author: { name: "Sarah" },
    content: "看到你的進展真好，我很期待看你的新作！堅持下去你一定可以的 💪",
    reaction: ReactionType.encourage,
    time: "2 小時前",
    replies: [
      {
        id: "r1",
        author: { name: "Vincent" },
        content: "謝謝你！你的鼓勵讓我今天又繼續寫了 300 字 😊",
        time: "1 小時前",
      },
    ],
  },
  {
    id: "c2",
    author: { name: "Alex" },
    content: "這點對我很有啟發，特別是你說「卡關就先跳過」這個策略，我之前都是卡在那邊硬想，難怪進度超慢",
    reaction: ReactionType.learned,
    time: "3 小時前",
  },
  {
    id: "c3",
    author: { name: "Jordan" },
    content: "我也是！我也在練習每天寫一段，真的很難維持，但看到你分享就覺得自己不孤單",
    reaction: ReactionType.sameHere,
    time: "5 小時前",
  },
];

// ============================================================================
// Page
// ============================================================================

export default function ReactDemoPage() {
  const [reactions, setReactions] = useState<IReactionCount[]>(MOCK_INITIAL_REACTIONS);
  const [selectedReaction, setSelectedReaction] = useState<ReactionTypeType | null>(null);
  const [comments, setComments] = useState<IComment[]>(MOCK_INITIAL_COMMENTS);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleReactionClick = useCallback((type: ReactionTypeType) => {
    // 在 setSelectedReaction updater 內讀取「點擊當下」的前一個值，避免 stale closure
    setSelectedReaction((prev) => {
      const wasSelected = prev === type;

      // 更新計數（同步在此 updater 內呼叫，確保讀到正確的 wasSelected）
      setReactions((prevReactions) =>
        prevReactions.map((r) => {
          if (r.type !== type) return r;
          return { ...r, count: wasSelected ? Math.max(0, r.count - 1) : r.count + 1 };
        })
      );

      // 若是新選取（非取消），捲動到留言輸入框並 focus
      if (!wasSelected) {
        setTimeout(() => {
          commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          commentInputRef.current?.focus();
        }, 50);
      }

      return wasSelected ? null : type;
    });
  }, []);

  const handleCommentClick = useCallback(() => {
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    commentInputRef.current?.focus();
  }, []);

  const handleCommentSubmit = useCallback((content: string, reaction: ReactionTypeType | null) => {
    const newComment: IComment = {
      id: `c-${Date.now()}`,
      author: { name: "Enn" },
      content,
      reaction: reaction ?? undefined,
      time: "剛剛",
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F7F7]">
      <div className="max-w-[448px] mx-auto px-4 pt-6 pb-40">

        {/* 頁面標題 */}
        <p className="text-xs text-text-dark/40 text-center mb-4">
          [Prototype] 快速回應與留言
        </p>

        {/* 打卡卡片 */}
        <CheckInCard
          taskTitle={MOCK_CHECK_IN.taskTitle}
          date={MOCK_CHECK_IN.date}
          mood={MOCK_CHECK_IN.mood}
          content={MOCK_CHECK_IN.content}
          tags={MOCK_CHECK_IN.tags}
          images={MOCK_CHECK_IN.images}
          showTape
        />

        {/* 反應 + 留言區塊 */}
        <div className="mt-3 bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Reaction Bar */}
          <ReactionBar
            reactions={reactions}
            selectedReaction={selectedReaction}
            commentCount={comments.length}
            onReactionClick={handleReactionClick}
            onCommentClick={handleCommentClick}
          />

          {/* Comment Section */}
          <CommentSection
            comments={comments}
            selectedReaction={selectedReaction}
            inputRef={commentInputRef}
            onSubmit={handleCommentSubmit}
          />
        </div>

      </div>
    </div>
  );
}
