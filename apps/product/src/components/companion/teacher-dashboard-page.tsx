"use client";

import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Eye, Flame, MessageCircle, PenLine, Send, Sprout } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  CommentSection,
  type IComment,
  ReactionPickerButton,
} from "@/components/check-in/reactions";
import { ColorAvatar } from "@/components/poc-shared/color-avatar";
import type { ReactionTypeType } from "@/constants/reaction-type";
import {
  getQuietPartners,
  getShiningPartners,
  MOCK_PROGRAM,
  MOCK_RECENT_CHECKINS,
} from "./mock-data";
import type { Partner, PartnerCheckin } from "./types";

/** 夥伴動態卡：復用專案的 ReactionPickerButton 與 CommentSection */
function CheckinFeedCard({ checkin }: { checkin: PartnerCheckin }) {
  const [reactions, setReactions] = useState<ReactionTypeType[]>(
    checkin.responded ? ["touched"] : []
  );
  const [comments, setComments] = useState<IComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const responded = reactions.length > 0 || comments.length > 0;

  const toggleReaction = (type: ReactionTypeType) => {
    setReactions((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const submitComment = (content: string, commentReactions: ReactionTypeType[]) => {
    setComments((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        author: { name: "阿島老師" },
        content,
        reactions: commentReactions,
        time: "剛剛",
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-[#E4EAE9] bg-white p-4">
      <div className="flex items-center gap-3">
        <ColorAvatar name={checkin.displayName} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-dark">{checkin.displayName}</p>
          <p className="flex items-center gap-1 text-xs text-text-secondary">
            {checkin.checkinDate} ·
            <Flame className="size-3 text-[#FFA10B]" />
            連續 {checkin.streak} 天
          </p>
        </div>
        {responded && (
          <Badge variant="secondary" className="shrink-0">
            已回應
          </Badge>
        )}
      </div>
      <p className="mt-3 text-sm text-text-dark">{checkin.content}</p>
      <div className="mt-3 flex items-center gap-2">
        <ReactionPickerButton
          selectedReactions={reactions}
          onToggle={toggleReaction}
          variant="card"
        />
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-[#F0F9F8] hover:text-text-dark"
          aria-label="留言鼓勵"
        >
          <MessageCircle className="size-5" />
        </button>
        {comments.length > 0 && (
          <span className="text-xs text-text-secondary">{comments.length} 則留言</span>
        )}
      </div>
      {showComments && (
        <div className="mt-2 border-t border-[#F0F2F4] pt-2">
          <CommentSection
            comments={comments}
            selectedReactions={reactions}
            onSubmit={submitComment}
            currentUserName="阿島老師"
          />
        </div>
      )}
    </div>
  );
}

function QuietPartnerRow({ partner }: { partner: Partner }) {
  const [handled, setHandled] = useState<"message" | "watch" | null>(null);

  return (
    <div className="flex items-center gap-3 py-2">
      <ColorAvatar name={partner.displayName} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-dark">{partner.displayName}</p>
        <p className="text-xs text-text-secondary">{partner.daysSinceLastCheckin} 天沒動靜</p>
      </div>
      {handled ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-text-secondary">
          {handled === "message" ? (
            <>
              <Send className="size-3" />
              已傳訊息
            </>
          ) : (
            <>
              <Eye className="size-3" />
              先觀察中
            </>
          )}
        </span>
      ) : (
        <div className="flex shrink-0 gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => setHandled("message")}
          >
            傳個訊息
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={() => setHandled("watch")}
          >
            先觀察
          </Button>
        </div>
      )}
    </div>
  );
}

function ShiningPartnerRow({ partner }: { partner: Partner }) {
  const [invited, setInvited] = useState(false);

  return (
    <div className="flex items-center gap-3 py-2">
      <ColorAvatar name={partner.displayName} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-dark">{partner.displayName}</p>
        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <Sprout className="size-3 text-[#7BA428]" />
          已連續 {partner.currentStreak} 天 · 共 {partner.totalCheckins} 次
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 rounded-full"
        disabled={invited}
        onClick={() => setInvited(true)}
      >
        {invited ? "已邀請 ✓" : "邀請分享"}
      </Button>
    </div>
  );
}

export function TeacherDashboardPage() {
  const program = MOCK_PROGRAM;
  const quietPartners = getQuietPartners();
  const shiningPartners = getShiningPartners();

  return (
    <div className="flex flex-col gap-4 px-5 pt-4">
      <motion.section
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF4E3]">
          <PenLine className="size-7 text-[#FFA10B]" />
        </div>
        <h1 className="mt-2 text-xl font-bold text-text-dark">{program.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {program.partnerCount} 位夥伴 · 建立於 {program.createdAt.slice(0, 7).replace("-", "/")}
        </p>
      </motion.section>

      <section>
        <h2 className="mb-2 text-base font-bold text-text-dark">最近的動態</h2>
        <div className="flex flex-col gap-3">
          {MOCK_RECENT_CHECKINS.map((checkin) => (
            <CheckinFeedCard key={checkin.id} checkin={checkin} />
          ))}
        </div>
      </section>

      {quietPartners.length > 0 && (
        <section className="rounded-2xl border border-[#E4EAE9] bg-[#FDF6DC] p-4">
          <h2 className="text-base font-bold text-text-dark">可能需要關心</h2>
          <p className="mt-0.5 text-xs text-text-secondary">不是催促，是提醒你去看看他們</p>
          <div className="mt-2 flex flex-col divide-y divide-[#F0E8C8]">
            {quietPartners.map((partner) => (
              <QuietPartnerRow key={partner.id} partner={partner} />
            ))}
          </div>
        </section>
      )}

      {shiningPartners.length > 0 && (
        <section className="rounded-2xl border border-[#E4EAE9] bg-[#F3F8E3] p-4">
          <h2 className="text-base font-bold text-text-dark">值得被看見的歷程</h2>
          <div className="mt-2 flex flex-col divide-y divide-[#E4EDC8]">
            {shiningPartners.map((partner) => (
              <ShiningPartnerRow key={partner.id} partner={partner} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
