"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { ExecutionDurationCard, ExecutionTimingCard, PracticeOverviewCard } from "@/components/practice";
import { CheckInRecordCard, CheckInStack } from "@/components/check-in";
import { CommentSection } from "@/components/check-in/reactions";
import type { IComment, IReactionCount } from "@/components/check-in/reactions";
import { LottieEmoji } from "@/components/check-in/reactions/lottie-emoji";
import { ExecutionTiming, Frequency, DurationDays } from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";
import { ReactionType, type ReactionTypeType, REACTION_CONFIG } from "@/constants/reaction-type";
import { getStatusConfig, mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import { Badge } from "@daodao/ui/components/badge";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { ChartColumnIncreasingSvg, DialogOutlineSvg, FlagOutlineSvg, LikeOutlineSvg, TelescopeSvg } from "@daodao/assets";

// ============================================================================
// Mock Data — named exports kept for sub-pages
// ============================================================================

export const MOCK_PRACTICE = {
  name: "練習寫小說",
  status: PracticeStatus.active,
  actionDescription: "每天至少寫 500 字，可以是正文、人物設定或場景描述，不求完美只求持續",
  frequency: Frequency.twoToFour,
  durationMinutes: 30,
  durationDays: DurationDays.fourteen,
  startDate: "2026-03-01",
  executionTiming: [ExecutionTiming.morning, ExecutionTiming.commute, ExecutionTiming.beforeSleep],
  tags: ["寫作", "創意", "小說"],
  creator: {
    id: "vincent-mock-id",
    name: "Vincent",
    photoURL: undefined,
    date: "2026/03/01",
  },
};

const MOCK_PRACTICE_OTHERS = {
  ...MOCK_PRACTICE,
  creator: {
    id: "sarah-mock-id",
    name: "Sarah",
    photoURL: "https://i.pravatar.cc/40?img=5",
    date: "2026/03/01",
  },
};

// 符合 PracticeCheckInsResponse 格式的 mock 打卡資料
export const MOCK_CHECK_INS_DATA = {
  success: true as const,
  data: [
    { id: 1, practiceId: 1, userId: 2, checkinDate: "2026-02-22", mood: "happy" as const, note: "今天終於把卡了兩週的情節寫出來了！雖然只有 800 字，但感覺突破了一個關卡。", imageUrls: [], ogImageUrl: null, tags: ["寫作", "突破"], createdAt: "2026-02-22T10:00:00.000Z" },
    { id: 2, practiceId: 1, userId: 2, checkinDate: "2026-02-20", mood: "neutral" as const, note: "今天狀態不太好，只寫了 300 字，但還是有寫就好。", imageUrls: [], ogImageUrl: null, tags: ["堅持"], createdAt: "2026-02-20T10:00:00.000Z" },
    { id: 3, practiceId: 1, userId: 2, checkinDate: "2026-02-18", mood: "happy" as const, note: "靈感大爆發！一口氣寫了 1500 字，角色的背景故事越來越清晰了。", imageUrls: [], ogImageUrl: null, tags: ["靈感", "寫作"], createdAt: "2026-02-18T10:00:00.000Z" },
    { id: 4, practiceId: 1, userId: 2, checkinDate: "2026-02-16", mood: "good" as const, note: "今天練習了對話節奏，讀了一些參考書，有新的靈感。", imageUrls: [], ogImageUrl: null, tags: ["學習", "寫作"], createdAt: "2026-02-16T10:00:00.000Z" },
    { id: 5, practiceId: 1, userId: 2, checkinDate: "2026-02-14", mood: "frustrated" as const, note: "今天寫的內容感覺很差，但還是逼自己完成了 500 字。", imageUrls: [], ogImageUrl: null, tags: ["堅持"], createdAt: "2026-02-14T10:00:00.000Z" },
    { id: 6, practiceId: 1, userId: 2, checkinDate: "2026-02-12", mood: "good" as const, note: "重新規劃了故事大綱，感覺走向更清晰了。", imageUrls: [], ogImageUrl: null, tags: ["計畫", "寫作"], createdAt: "2026-02-12T10:00:00.000Z" },
  ],
  pagination: { currentPage: 1, totalPages: 1, totalItems: 6, itemsPerPage: 30, hasNext: false, hasPrev: false },
  timestamp: "2026-02-24T00:00:00.000Z",
};

export const MOCK_INITIAL_REACTIONS: IReactionCount[] = [
  { type: ReactionType.encourage, count: 3, latestActorName: "Sarah" },
  { type: ReactionType.fire,      count: 1, latestActorName: "Alex" },
  { type: ReactionType.sameHere,  count: 2, latestActorName: "Jordan" },
  { type: ReactionType.touched,   count: 0 },
  { type: ReactionType.useful,    count: 0 },
  { type: ReactionType.curious,   count: 0 },
];

export const TOTAL_COMMENT_COUNT = 3;

const MOCK_COMMENTS: IComment[] = [
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

interface IResource {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
}

const MOCK_RESOURCES: IResource[] = [
  {
    id: "r1",
    title: "原子習慣",
    url: "books.com.tw/products/0010822522",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80",
  },
  {
    id: "r2",
    title: "如何每天寫 500 字：給新手的寫作指南",
    url: "medium.com/@writer/how-to-write-500-words",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80",
  },
  {
    id: "r3",
    title: "故事的解剖",
    url: "books.com.tw/products/0010360297",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80",
  },
];

// ============================================================================
// Browse Activity Sheet Content
// ============================================================================

const MOCK_FOLLOWERS: { id: string; name: string; time: string; photoURL: string; following: boolean; reaction: ReactionTypeType }[] = [
  { id: "f1", name: "Alen Chan", time: "1 小時前", photoURL: "https://i.pravatar.cc/40?img=11", following: false, reaction: "fire"      },
  { id: "f2", name: "Joyyy",     time: "1 小時前", photoURL: "https://i.pravatar.cc/40?img=25", following: true,  reaction: "touched"   },
  { id: "f3", name: "Leo Wang",  time: "3 小時前", photoURL: "https://i.pravatar.cc/40?img=52", following: false, reaction: "encourage" },
];

function BrowseActivityContent({ commentCount }: { commentCount: number }) {
  const [tab, setTab] = useState<"data" | "echo">("data");
  const [followers, setFollowers] = useState(MOCK_FOLLOWERS);

  const toggleFollow = (id: string) => {
    setFollowers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, following: !f.following } : f))
    );
  };

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#E4EAE9] mx-4">
        {(["data", "echo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative cursor-pointer",
              tab === t ? "text-logo-cyan" : "text-[#9FB5B8]"
            )}
          >
            {t === "data" ? "數據" : "迴響"}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 數據 tab */}
      {tab === "data" && (
        <div className="flex flex-col divide-y divide-[#E4EAE9] px-4 mt-2">
          {[
            { icon: <Eye className="size-5" />, label: "瀏覽", count: 283 },
            { icon: <DialogOutlineSvg className="size-5" />, label: "留言", count: commentCount },
            { icon: <TelescopeSvg className="size-5" />, label: "關注", count: followers.filter((f) => f.following).length + 5 },
          ].map(({ icon, label, count }) => (
            <div key={label} className="flex items-center gap-3 py-4 text-[#295E5C]">
              <span className="text-[#9FB5B8]">{icon}</span>
              <span className="flex-1 text-sm">{label}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* 迴響 tab */}
      {tab === "echo" && (
        <div className="flex flex-col gap-1 px-4 mt-2">
          {followers.map((f) => (
            <div key={f.id} className="flex items-center gap-3 py-3">
              <div className="relative shrink-0">
                <Avatar className="size-10">
                  <AvatarImage src={f.photoURL} alt={f.name} />
                  <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                    {f.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white ring-1 ring-white flex items-center justify-center">
                  <LottieEmoji url={REACTION_CONFIG[f.reaction].lottieUrl} fallback={REACTION_CONFIG[f.reaction].emoji} size={14} play={false} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#295E5C]">{f.name}</p>
                <p className="text-xs text-[#9FB5B8]">{f.time}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFollow(f.id)}
                className={cn(
                  "shrink-0 text-sm font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer",
                  f.following
                    ? "border border-[#E4EAE9] text-[#295E5C] hover:bg-[#F0F9F8]"
                    : "bg-logo-cyan text-white hover:bg-logo-cyan/80"
                )}
              >
                {f.following ? "取消關注" : "+ 關注"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Reaction Picker Button
// ============================================================================

const PICKER_REACTIONS: ReactionTypeType[] = [
  ReactionType.encourage,
  ReactionType.touched,
  ReactionType.fire,
  ReactionType.useful,
];

function ReactionPickerButton({
  selectedReactions,
  onReactionToggle,
}: {
  selectedReactions: ReactionTypeType[];
  onReactionToggle: (type: ReactionTypeType) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover trigger for emoji picker
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      onMouseEnter={() => setOpen(true)}
    >
      {/* Emoji picker popup */}
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 bg-white rounded-full shadow-lg border border-[#E4EAE9] px-2 py-1.5 z-10">
          {PICKER_REACTIONS.map((type) => {
            const config = REACTION_CONFIG[type];
            const isSelected = selectedReactions.includes(type);
            return (
              <div key={type} className="group/emoji relative flex flex-col items-center">
                {/* Tooltip label */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#295E5C] text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover/emoji:opacity-100 transition-opacity pointer-events-none">
                  {config.label}
                </div>
                <button
                  type="button"
                  onClick={() => onReactionToggle(type)}
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
      )}

      {/* Main button — icon only, no border */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 transition-colors p-1.5 cursor-pointer",
          "text-text-dark"
        )}
      >
        <LikeOutlineSvg className="size-[22px]" />
      </button>
    </div>
  );
}

// ============================================================================
// Tab Types
// ============================================================================

type Tab = "comments" | "checkins" | "resources";

const TABS: { id: Tab; label: string }[] = [
  { id: "comments", label: "留言" },
  { id: "checkins", label: "打卡紀錄" },
  { id: "resources", label: "使用資源" },
];

// ============================================================================
// PracticeDetail — shared component
// ============================================================================

interface PracticeDetailProps {
  /** true = 自己的實踐；false = 別人的實踐 */
  isOwner?: boolean;
}

export function PracticeDetail({ isOwner = true }: PracticeDetailProps) {
  const practice = isOwner ? MOCK_PRACTICE : MOCK_PRACTICE_OTHERS;

  const [activeTab, setActiveTab] = useState<Tab>("comments");
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [selectedReactions, _setSelectedReactions] = useState<ReactionTypeType[]>([]);
  const [comments, setComments] = useState<IComment[]>(MOCK_COMMENTS);
  const [headerReactions, setHeaderReactions] = useState<ReactionTypeType[]>([]);
  const [practiceMenuOpen, setPracticeMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [openResourceMenuId, setOpenResourceMenuId] = useState<string | null>(null);
  const practiceMenuRef = useRef<HTMLDivElement>(null);
  const resourceMenuRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const { open: openSheet } = useSheetManager();
  const { openWarningDialog } = useDialog();

  useEffect(() => {
    if (!practiceMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (practiceMenuRef.current && !practiceMenuRef.current.contains(e.target as Node)) {
        setPracticeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [practiceMenuOpen]);

  useEffect(() => {
    if (!openResourceMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (resourceMenuRef.current && !resourceMenuRef.current.contains(e.target as Node)) {
        setOpenResourceMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openResourceMenuId]);

  const handleCommentSubmit = useCallback((content: string, submittedReactions: ReactionTypeType[]) => {
    const newComment: IComment = {
      id: `c${Date.now()}`,
      author: { name: "Vincent" },
      content,
      reactions: submittedReactions.length > 0 ? submittedReactions : undefined,
      time: "剛剛",
    };
    setComments((prev) => [newComment, ...prev]);
    toast.success("留言成功！");
  }, []);

  const handleHeaderReactionToggle = useCallback((type: ReactionTypeType) => {
    setHeaderReactions((prev) =>
      prev.includes(type) ? [] : [type]
    );
  }, []);

  const handleEditComment = useCallback((id: string, content: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, content }
          : { ...c, replies: c.replies?.map((r) => (r.id === id ? { ...r, content } : r)) }
      )
    );
  }, []);

  const handleDeleteComment = useCallback((id: string) => {
    setComments((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== id) }))
    );
  }, []);

  const taskStatus = mapPracticeStatusToTaskStatus(MOCK_PRACTICE.status);
  const statusInfo = getStatusConfig(taskStatus);

  const openBrowseActivity = () => {
    setPracticeMenuOpen(false);
    openSheet({
      title: "瀏覽活動",
      content: <BrowseActivityContent commentCount={comments.length} />,
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-gray-100">
      <PageHeader leftAction={null} title="主題實踐" rightActionTo="/" className="max-w-none w-full pl-4 pr-2 [&>div:last-child]:md:absolute [&>div:last-child]:md:top-3 [&>div:last-child]:md:right-2" />

      <div className="flex-1 max-w-[448px] mx-auto w-full pb-24">

        {/* ── Practice Info ── */}
        <div className="px-4 pt-3">
          {/* Status badge + menu */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant={statusInfo.variant} size="sm">
              {statusInfo.label}
            </Badge>

            {/* Practice action menu */}
            <div ref={practiceMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setPracticeMenuOpen((v) => !v)}
                className={cn(
                  "p-1 text-text-dark transition-colors rounded-full cursor-pointer",
                  practiceMenuOpen ? "bg-[#E4EAE9]" : "hover:bg-[#E4EAE9]"
                )}
              >
                <MoreHorizontal className="size-5" />
              </button>

              {/* ── Own Practice Menu ── */}
              {practiceMenuOpen && isOwner && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => {
                      setPracticeMenuOpen(false);
                      toast("功能開發中");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <Pencil className="size-[18px] shrink-0" />
                    <span>編輯</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setPracticeMenuOpen(false);
                      const result = await openWarningDialog({
                        title: "確定封存這個實踐？",
                        message: "封存後將不再顯示於進行中清單，可以隨時復原。",
                        textAlign: "left",
                        buttons: [
                          { label: "確定封存", value: "confirm", variant: "outline" },
                          { label: "先不要", value: "cancel", variant: "orange" },
                        ],
                      });
                      if (result.value === "confirm") {
                        toast.success("已封存此實踐");
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <Archive className="size-[18px] shrink-0" />
                    <span>封存</span>
                  </button>
                  <button
                    type="button"
                    onClick={openBrowseActivity}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <ChartColumnIncreasingSvg className="size-[18px] shrink-0" />
                    <span>瀏覽活動</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setPracticeMenuOpen(false);
                      const result = await openWarningDialog({
                        title: "確定刪除這個實踐？",
                        message: "一旦刪除就無法復原，所有打卡紀錄也會一併消失。",
                        textAlign: "left",
                        buttons: [
                          { label: "確定刪除", value: "confirm", variant: "outline" },
                          { label: "先不要", value: "cancel", variant: "orange" },
                        ],
                      });
                      if (result.value === "confirm") {
                        toast.success("已刪除此實踐");
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-[18px] shrink-0" />
                    <span>刪除</span>
                  </button>
                </div>
              )}

              {/* ── Others' Practice Menu ── */}
              {practiceMenuOpen && !isOwner && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => setPracticeMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <FlagOutlineSvg className="size-5 shrink-0" />
                    <span>檢舉</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isFollowing;
                      setIsFollowing(next);
                      if (next) {
                        toast.success("已關注此實踐");
                      } else {
                        toast("已取消關注");
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
                      isFollowing ? "text-logo-cyan hover:bg-[#E8FAF9]" : "text-[#295E5C] hover:bg-[#F0F9F8]"
                    )}
                  >
                    <TelescopeSvg className="size-5 shrink-0" />
                    <span>{isFollowing ? "取消關注" : "關注"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openBrowseActivity}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <ChartColumnIncreasingSvg className="size-5 shrink-0" />
                    <span>瀏覽活動</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-text-dark mb-3">{practice.name}</h1>

          {/* ── Unified white card: overview + 更多資訊 + action buttons ── */}
          <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
            {/* Practice overview — no own card wrapper */}
            <PracticeOverviewCard
              actionDescription={practice.actionDescription}
              frequency={practice.frequency}
              durationMinutes={practice.durationMinutes}
              tags={practice.tags}
              progress={62}
              showProgress
              creator={{
                id: practice.creator.id,
                name: practice.creator.name,
                photoURL: practice.creator.photoURL,
              }}
              className="rounded-none shadow-none mb-0"
            />

            {/* 更多資訊 collapsible — text left, chevron far right */}
            <div className="px-4">
              <button
                type="button"
                onClick={() => setInfoExpanded((v) => !v)}
                className="flex items-center justify-between w-full text-sm text-[#9FB5B8] py-1 mb-2 cursor-pointer"
              >
                更多資訊
                {infoExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>

              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                infoExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}>
                <div className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 pb-3">
                    <ExecutionTimingCard
                      executionTiming={practice.executionTiming}
                    />
                    <ExecutionDurationCard
                      durationDays={practice.durationDays}
                      startDate={practice.startDate}
                      showRemaining
                    />
                  </div>
                </div>
              </div>

              {/* Lottie emoji circles — 永遠顯示，不在折疊內 */}
              <button
                type="button"
                onClick={openBrowseActivity}
                className="flex items-center gap-2 pb-3 hover:opacity-70 transition-opacity cursor-pointer"
              >
                <div className="flex">
                  <div className="size-7 rounded-full bg-[#E8FAF9] flex items-center justify-center ring-2 ring-white">
                    <LottieEmoji url={REACTION_CONFIG.fire.lottieUrl} fallback="🔥" size={18} play={false} />
                  </div>
                  <div className="size-7 rounded-full bg-[#E8FAF9] flex items-center justify-center ring-2 ring-white -ml-1.5">
                    <LottieEmoji url={REACTION_CONFIG.touched.lottieUrl} fallback="💓" size={18} play={false} />
                  </div>
                </div>
                <span className="text-sm text-text-dark/60">Joy 與其他 12 人</span>
              </button>
            </div>

            {/* ── Action Buttons — centered with vertical divider ── */}
            <div className="flex items-center border-t border-[#E4EAE9] py-4 px-4">
              {/* Reaction — left half, centered */}
              <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1">
                <ReactionPickerButton
                  selectedReactions={headerReactions}
                  onReactionToggle={handleHeaderReactionToggle}
                />
              </div>
              {/* Vertical divider */}
              <div className="w-px h-5 bg-[#E4EAE9]" />
              {/* Comment — right half, centered */}
              <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("comments");
                    setTimeout(() => {
                      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 0);
                  }}
                  className="flex items-center gap-1.5 p-1.5 text-text-dark cursor-pointer"
                >
                  <DialogOutlineSvg className="size-[22px]" />
                  <span className="text-sm font-medium">{comments.length}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div ref={commentsRef} className="flex border-b border-[#E4EAE9] bg-gray-100">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer",
                activeTab === id
                  ? "text-logo-cyan border-b-2 border-logo-cyan -mb-px"
                  : "text-[#9FB5B8] hover:text-text-dark/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "comments" && (
          <div className="mx-4 mt-4 mb-4 bg-white rounded-xl overflow-hidden shadow-sm">
            <CommentSection
              comments={comments}
              selectedReactions={selectedReactions}
              onSubmit={handleCommentSubmit}
              hasMoreComments
              currentUserName="Vincent"
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        )}

        {activeTab === "checkins" && (
          <div className="pt-4">
            <div className="px-4">
              <CheckInRecordCard checkInsData={MOCK_CHECK_INS_DATA} />
            </div>
            <CheckInStack practiceId="react-demo" checkInsData={MOCK_CHECK_INS_DATA} />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="px-4 pt-4 flex flex-col gap-3 pb-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-stretch rounded-lg border border-[#E4EAE9] bg-white p-2 gap-3"
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-[100px] rounded overflow-hidden bg-[#D4E8E6]">
                  {resource.imageUrl ? (
                    <img
                      src={resource.imageUrl}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D4E8E6]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <p className="text-sm font-semibold text-[#295E5C] leading-snug">{resource.title}</p>
                  <p className="text-xs text-logo-cyan mt-1.5 truncate">{resource.url}</p>
                </div>

                {/* Menu */}
                <div ref={openResourceMenuId === resource.id ? resourceMenuRef : null} className="relative self-start">
                  <button
                    type="button"
                    onClick={() => setOpenResourceMenuId(openResourceMenuId === resource.id ? null : resource.id)}
                    className="p-1 text-[#9FB5B8] hover:text-text-dark transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                  {isOwner && openResourceMenuId === resource.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[100px]">
                      <button
                        type="button"
                        onClick={async () => {
                          setOpenResourceMenuId(null);
                          const result = await openWarningDialog({
                            title: "確定刪除這個資源？",
                            message: "刪除後無法復原。",
                            textAlign: "left",
                            buttons: [
                              { label: "確定刪除", value: "confirm", variant: "outline" },
                              { label: "先不要", value: "cancel", variant: "orange" },
                            ],
                          });
                          if (result.value === "confirm") {
                            setResources((prev) => prev.filter((r) => r.id !== resource.id));
                            toast.success("已刪除資源");
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-[18px] shrink-0" />
                        <span>刪除</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Fixed 打卡 Button (own practice only) ── */}
      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-20 pt-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto w-full max-w-[448px] h-14 rounded-full bg-[#F5A623] text-white text-base font-bold shadow-md hover:bg-[#E09918] active:scale-95 transition-all cursor-pointer"
          >
            打卡
          </button>
        </div>
      )}
    </div>
  );
}
