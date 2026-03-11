"use client";

import type { ReactionTypeValue } from "@daodao/api";
import { removeReaction, upsertReaction, useExtractOgImage, useReactions } from "@daodao/api";
import {
  BookSvg,
  ChartColumnIncreasingSvg,
  DialogOutlineSvg,
  FlagOutlineSvg,
  TelescopeSvg,
} from "@daodao/assets";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { Archive, ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { CheckInRecordCard, CheckInStack } from "@/components/check-in";
import {
  CommentSection,
  type IComment,
  ReactionPickerButton,
} from "@/components/check-in/reactions";
import { LottieEmoji } from "@/components/check-in/reactions/lottie-emoji";
import {
  ExecutionDurationCard,
  ExecutionTimingCard,
  PracticeOverviewCard,
} from "@/components/practice";
import { PracticeDetailTitle } from "@/components/practice/detail/practice-detail-title";
import type { DurationDays, ExecutionTiming, Frequency } from "@/constants/practice-form";
import type { PracticeStatus } from "@/constants/practice-status";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";
import { getStatusConfig, mapPracticeStatusToTaskStatus } from "@/constants/task-status";

interface IPracticeDetailResource {
  id: string;
  name: string;
  url?: string;
}

interface IPracticeDetailCreator {
  id: string;
  name: string;
  photoURL?: string | null;
  date?: string;
}

interface IPracticeDetailViewModel {
  id: string;
  title: string;
  status?: PracticeStatus;
  actionDescription: string;
  frequency: Frequency;
  durationMinutes: number;
  durationDays: DurationDays;
  startDate?: string;
  executionTiming: ExecutionTiming[];
  customTiming?: string;
  tags: string[];
  progress: number;
  creator?: IPracticeDetailCreator;
  resources: IPracticeDetailResource[];
}

type TabType = "comments" | "checkins" | "resources";

interface IBrowseActivityFollower {
  id: string;
  name: string;
  time: string;
  photoURL?: string;
  following: boolean;
  reaction: ReactionTypeType;
}

interface IBrowseActivityData {
  viewCount?: number;
  followers?: IBrowseActivityFollower[];
}

interface IPracticeDetailShellProps {
  practice: IPracticeDetailViewModel;
  practiceId: string;
  isOwner: boolean;
  checkInsData: React.ComponentProps<typeof CheckInRecordCard>["checkInsData"];
  isLoadingCheckIns: boolean;
  isLoadingComments?: boolean;
  comments: IComment[];
  currentUserName?: string;
  currentUserPhotoURL?: string;
  commentCount?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onEditPractice: () => void;
  onArchivePractice: () => void;
  onDeletePractice: () => void;
  onReportPractice?: () => void;
  onToggleFollowPractice?: () => void;
  isFollowingPractice?: boolean;
  onSubmitComment: (content: string, parentId?: string) => void;
  onEditComment: (id: string, content: string) => Promise<unknown> | unknown;
  onDeleteComment: (id: string) => Promise<unknown> | unknown;
  footer?: React.ReactNode;
  browseActivity?: IBrowseActivityData;
}

function BrowseActivityContent({
  viewCount,
  commentCount,
  followers,
  onToggleFollow,
}: {
  viewCount: number;
  commentCount: number;
  followers: IBrowseActivityFollower[];
  onToggleFollow: (id: string) => void;
}) {
  const [tab, setTab] = useState<"data" | "echo">("data");
  const [reactionFilter, setReactionFilter] = useState<"all" | ReactionTypeType>("all");

  const reactionCounts = followers.reduce<Record<string, number>>((acc, follower) => {
    acc[follower.reaction] = (acc[follower.reaction] || 0) + 1;
    return acc;
  }, {});
  const uniqueReactions = [...new Set(followers.map((f) => f.reaction))] as ReactionTypeType[];
  const filteredFollowers =
    reactionFilter === "all" ? followers : followers.filter((f) => f.reaction === reactionFilter);
  const followCount = followers.filter((f) => f.following).length;

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-[#E4EAE9] mx-4">
        {(["data", "echo"] as const).map((currentTab) => (
          <Button
            key={currentTab}
            type="button"
            variant="ghost"
            onClick={() => setTab(currentTab)}
            className={cn(
              "flex-1 h-auto py-3 text-sm font-medium transition-colors relative",
              tab === currentTab ? "text-logo-cyan" : "text-[#9FB5B8]"
            )}
          >
            {currentTab === "data" ? "數據" : "迴響"}
            {tab === currentTab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
            )}
          </Button>
        ))}
      </div>

      {tab === "data" && (
        <div className="flex flex-col divide-y divide-[#E4EAE9] px-4 mt-2">
          {[
            { icon: <TelescopeSvg className="size-5" />, label: "瀏覽", count: viewCount },
            { icon: <DialogOutlineSvg className="size-5" />, label: "留言", count: commentCount },
            {
              icon: <ChartColumnIncreasingSvg className="size-5" />,
              label: "關注",
              count: followCount,
            },
          ].map(({ icon, label, count }) => (
            <div key={label} className="flex items-center gap-3 py-4 text-[#295E5C]">
              <span className="text-[#9FB5B8]">{icon}</span>
              <span className="flex-1 text-sm">{label}</span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "echo" && (
        <div className="flex flex-col">
          {followers.length > 0 && (
            <div className="flex overflow-x-auto border-b border-[#E4EAE9] mx-4 mt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReactionFilter("all")}
                className={cn(
                  "shrink-0 h-auto flex items-center gap-1 px-3 py-2.5 text-sm font-medium relative whitespace-nowrap",
                  reactionFilter === "all" ? "text-logo-cyan" : "text-[#9FB5B8]"
                )}
              >
                全部 {followers.length}
                {reactionFilter === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
                )}
              </Button>
              {uniqueReactions.map((reaction) => {
                const config = REACTION_CONFIG[reaction];
                const count = reactionCounts[reaction] || 0;
                const isActive = reactionFilter === reaction;
                return (
                  <Button
                    key={reaction}
                    type="button"
                    variant="ghost"
                    onClick={() => setReactionFilter(reaction)}
                    className={cn(
                      "shrink-0 h-auto flex items-center gap-1 px-3 py-2.5 text-sm font-medium relative whitespace-nowrap",
                      isActive ? "text-logo-cyan" : "text-[#9FB5B8]"
                    )}
                  >
                    <LottieEmoji
                      url={config.lottieUrl}
                      fallback={config.emoji}
                      size={18}
                      play={false}
                    />
                    {count}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-logo-cyan rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-1 px-4 mt-2">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((follower) => (
                <div key={follower.id} className="flex items-center gap-3 py-3">
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      {follower.photoURL && (
                        <AvatarImage src={follower.photoURL} alt={follower.name} />
                      )}
                      <AvatarFallback className="text-sm font-medium text-text-dark bg-[#E8FAF9]">
                        {follower.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white ring-1 ring-white flex items-center justify-center">
                      <LottieEmoji
                        url={REACTION_CONFIG[follower.reaction].lottieUrl}
                        fallback={REACTION_CONFIG[follower.reaction].emoji}
                        size={14}
                        play={false}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#295E5C]">{follower.name}</p>
                    <p className="text-xs text-[#9FB5B8]">{follower.time}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onToggleFollow(follower.id)}
                    className={cn(
                      "shrink-0 h-auto text-sm font-medium px-4 py-1.5 rounded-full transition-colors",
                      follower.following
                        ? "border border-[#E4EAE9] text-[#295E5C] hover:bg-[#F0F9F8]"
                        : "bg-logo-cyan text-white hover:bg-logo-cyan/80"
                    )}
                  >
                    {follower.following ? "取消關注" : "+ 關注"}
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-[#9FB5B8]">目前還沒有互動紀錄</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TABS: { id: TabType; label: string }[] = [
  { id: "comments", label: "留言" },
  { id: "checkins", label: "打卡紀錄" },
  { id: "resources", label: "使用資源" },
];

interface IPracticeResourceListCardProps {
  resource: IPracticeDetailResource;
  isOwner: boolean;
  onEditPractice: () => void;
}

function PracticeResourceListCard({
  resource,
  isOwner,
  onEditPractice,
}: IPracticeResourceListCardProps) {
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);
  const ogImageUrl = ogImageData?.ogImageUrl ?? null;
  const shouldShowDefaultThumbnail = !ogImageUrl || imageError || isLoading || !resource.url;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="flex items-stretch rounded-lg border border-[#E4EAE9] bg-white shadow-sm p-2 gap-3 w-full">
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          try {
            const { protocol } = new URL(resource.url ?? "");
            if (protocol === "https:" || protocol === "http:") {
              window.open(resource.url, "_blank");
            }
          } catch {
            // 無效 URL，略過
          }
        }}
        className="h-auto p-0 flex flex-1 items-stretch gap-3 text-left justify-start hover:bg-transparent"
      >
        <div className="shrink-0 w-[100px] rounded overflow-hidden bg-[#D4E8E6] relative">
          {shouldShowDefaultThumbnail ? (
            <div className="absolute inset-0 flex items-center justify-center bg-light-cyan">
              {isLoading ? (
                <div className="size-6 border-2 border-logo-cyan border-t-transparent rounded-full animate-spin" />
              ) : (
                <BookSvg width={56} height={56} className="opacity-50" />
              )}
            </div>
          ) : (
            <Image
              src={ogImageUrl}
              alt={resource.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 py-1 overflow-hidden whitespace-normal">
          <p className="text-sm font-semibold text-[#295E5C] leading-snug line-clamp-2">
            {resource.name}
          </p>
          {resource.url && (
            <p className="text-xs text-logo-cyan mt-1.5 break-all line-clamp-2">{resource.url}</p>
          )}
        </div>
      </Button>

      <div ref={menuRef} className="relative shrink-0 self-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen((value) => !value)}
          className="h-6 w-6 p-1 text-[#9FB5B8] hover:text-text-dark"
        >
          <MoreHorizontal className="size-4" />
        </Button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#E4EAE9] py-1 z-20 min-w-[120px]">
            {resource.url && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMenuOpen(false);
                  try {
                    const { protocol } = new URL(resource.url ?? "");
                    if (protocol === "https:" || protocol === "http:") {
                      window.open(resource.url, "_blank");
                    }
                  } catch {
                    // 無效 URL，略過
                  }
                }}
                className="w-full h-auto justify-start rounded-none px-3 py-2 text-xs text-[#295E5C] hover:bg-[#F0F9F8]"
              >
                開啟連結
              </Button>
            )}
            {isOwner && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMenuOpen(false);
                  onEditPractice();
                }}
                className="w-full h-auto justify-start rounded-none px-3 py-2 text-xs text-[#295E5C] hover:bg-[#F0F9F8]"
              >
                編輯實踐
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PracticeDetailShell({
  practice,
  practiceId,
  isOwner,
  checkInsData,
  isLoadingCheckIns,
  isLoadingComments = false,
  comments,
  currentUserName,
  currentUserPhotoURL,
  commentCount,
  onEditPractice,
  onArchivePractice,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
  onDeletePractice,
  onReportPractice,
  onToggleFollowPractice,
  isFollowingPractice = false,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  footer,
  browseActivity,
}: IPracticeDetailShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>("comments");
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [practiceMenuOpen, setPracticeMenuOpen] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  const { data: reactionsData, mutate: mutateReactions } = useReactions({
    targetType: "practice",
    targetId: practiceId,
  });
  const [, startReactionTransition] = useTransition();

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const headerReactions: ReactionTypeType[] = currentUserReaction ? [currentUserReaction] : [];

  const handleHeaderReactionToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      startReactionTransition(async () => {
        if (isSelected) {
          await removeReaction({ targetType: "practice", targetId: practiceId });
        } else {
          await upsertReaction({
            targetType: "practice",
            targetId: practiceId,
            reactionType: type as ReactionTypeValue,
          });
        }
        await mutateReactions();
      });
    },
    [currentUserReaction, practiceId, mutateReactions]
  );
  const { open: openSheet } = useSheetManager();
  const { openWarningDialog } = useDialog();

  const taskStatus = practice.status ? mapPracticeStatusToTaskStatus(practice.status) : undefined;
  const statusInfo = taskStatus ? getStatusConfig(taskStatus) : undefined;

  const openBrowseActivity = () => {
    setPracticeMenuOpen(false);
    const followers = browseActivity?.followers ?? [];
    openSheet({
      title: "瀏覽活動",
      content: (
        <BrowseActivityContent
          viewCount={browseActivity?.viewCount ?? 0}
          commentCount={commentCount ?? comments.length}
          followers={followers}
          onToggleFollow={(_id) => {
            if (!followers.length) {
              toast("功能開發中");
              return;
            }
            toast("功能開發中");
          }}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  return (
    <div className="flex-1 max-w-[448px] mx-auto w-full pb-24">
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          {statusInfo ? (
            <Badge variant={statusInfo.variant} size="sm">
              {statusInfo.label}
            </Badge>
          ) : (
            <div />
          )}

          <div className="relative">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setPracticeMenuOpen((value) => !value)}
              className={cn("h-8 w-8", practiceMenuOpen ? "bg-[#E4EAE9]" : "hover:bg-[#E4EAE9]")}
            >
              <MoreHorizontal className="size-5" />
            </Button>

            {practiceMenuOpen && isOwner && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPracticeMenuOpen(false);
                    onEditPractice();
                  }}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                >
                  <Pencil className="size-[18px] shrink-0" />
                  <span>編輯</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPracticeMenuOpen(false);
                    onArchivePractice();
                  }}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                >
                  <Archive className="size-[18px] shrink-0" />
                  <span>封存</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={openBrowseActivity}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                >
                  <ChartColumnIncreasingSvg className="size-[18px] shrink-0" />
                  <span>瀏覽活動</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
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
                      onDeletePractice();
                    }
                  }}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-[18px] shrink-0" />
                  <span>刪除</span>
                </Button>
              </div>
            )}

            {practiceMenuOpen && !isOwner && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPracticeMenuOpen(false);
                    if (onReportPractice) {
                      onReportPractice();
                      return;
                    }
                    toast("功能開發中");
                  }}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                >
                  <FlagOutlineSvg className="size-5 shrink-0" />
                  <span>檢舉</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPracticeMenuOpen(false);
                    if (onToggleFollowPractice) {
                      onToggleFollowPractice();
                      return;
                    }
                    toast("功能開發中");
                  }}
                  className={cn(
                    "w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
                    isFollowingPractice
                      ? "text-logo-cyan hover:bg-[#E8FAF9]"
                      : "text-[#295E5C] hover:bg-[#F0F9F8]"
                  )}
                >
                  <TelescopeSvg className="size-5 shrink-0" />
                  <span>{isFollowingPractice ? "取消關注" : "關注"}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={openBrowseActivity}
                  className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                >
                  <ChartColumnIncreasingSvg className="size-5 shrink-0" />
                  <span>瀏覽活動</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <PracticeDetailTitle
          title={practice.title}
          status={practice.status}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={onPrevious ?? (() => {})}
          onNext={onNext ?? (() => {})}
        />

        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <PracticeOverviewCard
            actionDescription={practice.actionDescription}
            frequency={practice.frequency}
            durationMinutes={practice.durationMinutes}
            tags={practice.tags}
            progress={practice.progress}
            showProgress
            creator={practice.creator}
          />

          <div className="px-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setInfoExpanded((value) => !value)}
              className="w-full h-auto justify-between px-0 text-sm text-[#9FB5B8] py-1 mb-2 cursor-pointer hover:bg-transparent"
            >
              更多資訊
              {infoExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>

            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                infoExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-2 gap-3 pb-3">
                  <ExecutionTimingCard
                    executionTiming={practice.executionTiming}
                    customTiming={practice.customTiming}
                  />
                  <ExecutionDurationCard
                    durationDays={practice.durationDays}
                    startDate={practice.startDate || ""}
                    showRemaining
                  />
                </div>
              </div>
            </div>

            {(() => {
              const followers = browseActivity?.followers ?? [];
              // 從 reactions API 取出有人按的類型（所有人共享的 aggregate）
              const activeReactions = (reactionsData?.data?.reactions ?? [])
                .filter((r) => r.count > 0)
                .slice(0, 2);
              const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
                (sum, r) => sum + r.count,
                0,
              );
              const latestActorName =
                (reactionsData?.data?.reactions ?? []).find((r) => r.count > 0)?.latestActorName ??
                null;
              // 優先用 API followers；沒有時用 aggregate reactions（所有人共享）
              const displayReactions =
                followers.length > 0
                  ? ([...new Set(followers.map((f) => f.reaction))].slice(
                      0,
                      2
                    ) as ReactionTypeType[])
                  : activeReactions.map((r) => r.type as ReactionTypeType);
              const firstName = followers[0]?.name;
              const text =
                followers.length > 1
                  ? `${firstName} 與其他 ${followers.length - 1} 人`
                  : followers.length === 1
                    ? firstName
                    : currentUserReaction
                      ? totalReactionCount > 1
                        ? `你 與其他 ${totalReactionCount - 1} 人`
                        : "你"
                      : totalReactionCount > 0
                        ? latestActorName
                          ? totalReactionCount > 1
                            ? `${latestActorName} 與其他 ${totalReactionCount - 1} 人`
                            : latestActorName
                          : `${totalReactionCount} 人`
                        : "觀看瀏覽活動";
              return (
                <button
                  type="button"
                  onClick={openBrowseActivity}
                  className="flex items-center gap-2 pb-3 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  {displayReactions.length > 0 && (
                    <div className="flex">
                      {displayReactions.map((reaction, i) => (
                        <div
                          key={reaction}
                          className={cn(
                            "size-7 rounded-full bg-[#E8FAF9] flex items-center justify-center ring-2 ring-white",
                            i > 0 && "-ml-1.5"
                          )}
                        >
                          <LottieEmoji
                            url={REACTION_CONFIG[reaction].lottieUrl}
                            fallback={REACTION_CONFIG[reaction].emoji}
                            size={18}
                            play={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-sm text-text-dark/60">{text}</span>
                </button>
              );
            })()}
          </div>

          <div className="flex items-center border-t border-[#E4EAE9] py-4 px-4">
            <div className="flex-1 flex justify-center rounded-xl hover:bg-gray-100 transition-colors py-1">
              <ReactionPickerButton
                selectedReactions={headerReactions}
                onToggle={handleHeaderReactionToggle}
                variant="card"
              />
            </div>

            <div className="w-px h-5 bg-[#E4EAE9]" />

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
                <span className="text-sm font-medium">{commentCount ?? comments.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={commentsRef} className="flex border-b border-[#E4EAE9] bg-gray-100">
        {TABS.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 h-auto rounded-none py-3 text-sm font-medium transition-colors cursor-pointer",
              activeTab === id
                ? "text-logo-cyan border-b-2 border-logo-cyan -mb-px"
                : "text-[#9FB5B8] hover:text-text-dark/60"
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      {activeTab === "comments" && (
        <div className="mx-4 mt-4 mb-4 bg-white rounded-xl overflow-hidden shadow-sm">
          {isLoadingComments ? (
            <div className="px-4 py-6 text-xs text-[#9FB5B8] text-center">留言載入中...</div>
          ) : (
            <CommentSection
              comments={comments}
              selectedReactions={[]}
              onSubmit={(content, _reactions, parentId) => onSubmitComment(content, parentId)}
              hasMoreComments
              currentUserName={currentUserName}
              currentUserPhotoURL={currentUserPhotoURL}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          )}
        </div>
      )}

      {activeTab === "checkins" && (
        <div className="pt-4">
          <div className="px-4">
            <CheckInRecordCard checkInsData={checkInsData} isLoading={isLoadingCheckIns} />
          </div>
          <CheckInStack practiceId={practiceId} checkInsData={checkInsData} />
        </div>
      )}

      {activeTab === "resources" && (
        <div className="px-4 pt-4 flex flex-col gap-3 pb-4">
          {practice.resources.length > 0 ? (
            practice.resources.map((resource) => (
              <PracticeResourceListCard
                key={resource.id}
                resource={resource}
                isOwner={isOwner}
                onEditPractice={onEditPractice}
              />
            ))
          ) : (
            <div className="text-sm text-[#9FB5B8] py-4">目前沒有使用資源</div>
          )}
        </div>
      )}

      {footer}
    </div>
  );
}
