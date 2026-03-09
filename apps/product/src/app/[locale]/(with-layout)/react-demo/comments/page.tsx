"use client";

import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { PracticeOverviewCard } from "@/components/practice";
import { CommentSection, ReactionBar } from "@/components/check-in/reactions";
import type { IComment, IReactionCount } from "@/components/check-in/reactions";
import { ReactionType, type ReactionTypeType } from "@/constants/reaction-type";
import {
  MOCK_PRACTICE,
  MOCK_INITIAL_REACTIONS,
} from "../page";

// ============================================================================
// Mock Comments
// ============================================================================

const MOCK_INITIAL_COMMENTS: IComment[] = [
  {
    id: "c1",
    author: { name: "Sarah" },
    content: "看到你的進展真好，我很期待看你的新作！堅持下去你一定可以的 💪",
    reactions: [ReactionType.encourage],
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
    reactions: [ReactionType.fire],
    time: "3 小時前",
  },
  {
    id: "c3",
    author: { name: "Jordan" },
    content: "我也是！我也在練習每天寫一段，真的很難維持，但看到你分享就覺得自己不孤單",
    reactions: [ReactionType.sameHere],
    time: "5 小時前",
  },
];

// ============================================================================
// Page
// ============================================================================

export default function ReactDemoCommentsPage() {
  const searchParams = useSearchParams();
  const reactionParam = searchParams.get("reaction") as ReactionTypeType | null;

  const [reactions, setReactions] = useState<IReactionCount[]>(() =>
    // If arriving from main page with a reaction, bump that count by 1
    MOCK_INITIAL_REACTIONS.map((r) =>
      r.type === reactionParam ? { ...r, count: r.count + 1 } : r
    )
  );
  const [selectedReactions, setSelectedReactions] = useState<ReactionTypeType[]>(
    reactionParam ? [reactionParam] : []
  );
  const [comments, setComments] = useState<IComment[]>(MOCK_INITIAL_COMMENTS);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleReactionClick = useCallback((type: ReactionTypeType) => {
    setSelectedReactions((prev) => {
      const isSelected = prev.includes(type);
      setReactions((prevReactions) =>
        prevReactions.map((r) => {
          if (r.type !== type) return r;
          return { ...r, count: isSelected ? Math.max(0, r.count - 1) : r.count + 1 };
        })
      );
      return isSelected ? prev.filter((r) => r !== type) : [...prev, type];
    });
  }, []);

  const handleCommentSubmit = useCallback((content: string, reactions: ReactionTypeType[]) => {
    const newComment: IComment = {
      id: `c-${Date.now()}`,
      author: { name: "Enn" },
      content,
      reactions: reactions.length > 0 ? reactions : undefined,
      time: "剛剛",
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
  }, []);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-y-auto bg-[#F4F6F6] flex flex-col">
      {/* Header：無背景，透出灰底 */}
      <PageHeader className="w-full max-w-[448px]" leftAction="back" leftLabel="" title="留言" />

      {/* 灰底內容區 */}
      <div className="max-w-[448px] w-full mx-auto px-5 py-4 flex flex-col gap-4 pb-8">

        {/* 卡片 1：實踐概覽（[&>div]:mb-0 消除卡片內的 mb-4） */}
        <div className="bg-white rounded-lg overflow-hidden [&>div]:mb-0">
          <PracticeOverviewCard
            actionDescription={MOCK_PRACTICE.actionDescription}
            frequency={MOCK_PRACTICE.frequency}
            durationMinutes={MOCK_PRACTICE.durationMinutes}
            tags={MOCK_PRACTICE.tags}
            progress={62}
            showProgress
            creator={MOCK_PRACTICE.creator}
          />
        </div>

        {/* 卡片 2：快速回應 + 留言（同一張白卡） */}
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Reaction Bar */}
          <ReactionBar
            reactions={reactions}
            selectedReactions={selectedReactions}
            onReactionClick={handleReactionClick}
          />

          {/* 留言區 */}
          <CommentSection
            comments={comments}
            selectedReactions={selectedReactions}
            inputRef={commentInputRef}
            onSubmit={handleCommentSubmit}
          />
        </div>

      </div>
    </div>
  );
}
