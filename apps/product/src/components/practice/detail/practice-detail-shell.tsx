"use client";

import type { ReactionTypeValue } from "@daodao/api";
import {
  followTarget,
  removeReaction,
  unfollowTarget,
  upsertReaction,
  useExtractOgImage,
  useReactions,
} from "@daodao/api";
import {
  BookSvg,
  ChartColumnIncreasingSvg,
  DialogOutlineSvg,
  FlagOutlineSvg,
  TelescopeSvg,
} from "@daodao/assets";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
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
import {
  BrowseActivityContent,
  type IBrowseActivityFollower,
} from "@/components/practice/shared/browse-activity-content";
import type { DurationDays, ExecutionTiming, Frequency } from "@/constants/practice-form";
import type { PracticeStatus } from "@/constants/practice-status";
import {
  PICKER_REACTIONS,
  REACTION_CONFIG,
  type ReactionTypeType,
} from "@/constants/reaction-type";
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
  currentUserId?: string;
  currentUserPhotoURL?: string;
  commentCount?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onEditPractice: () => void;
  onArchivePractice: () => void;
  onDeletePractice: () => void;
  onDeleteResource?: (resourceId: string) => void;
  onSubmitComment: (content: string, parentId?: string, mentionedUserIds?: number[]) => void;
  onEditComment: (id: string, content: string) => Promise<unknown> | unknown;
  onDeleteComment: (id: string) => Promise<unknown> | unknown;
  footer?: React.ReactNode;
  browseActivity?: IBrowseActivityData;
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
  onDeleteResource?: (resourceId: string) => void;
}

function PracticeResourceListCard({
  resource,
  isOwner,
  onEditPractice,
  onDeleteResource,
}: IPracticeResourceListCardProps) {
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);
  const { openWarningDialog } = useDialog();
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

  const handleDeleteResource = async () => {
    setMenuOpen(false);
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
      onDeleteResource?.(resource.id);
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-stretch rounded-lg border border-[#E4EAE9] bg-white p-2 gap-3 w-full transition-colors",
        resource.url ? "hover:bg-[#F0F9F8]" : "hover:bg-[#F7FAFA]"
      )}
    >
      {/* Full-card link overlay (has-url only) */}
      {resource.url && /^https?:\/\//.test(resource.url) && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 rounded-lg z-[1]"
        >
          <span className="sr-only">{resource.name}</span>
        </a>
      )}

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

      <div ref={menuRef} className="relative shrink-0 self-start z-10">
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
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[100px]">
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEditPractice();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
              >
                編輯實踐
              </button>
            )}
            {isOwner && onDeleteResource && (
              <button
                type="button"
                onClick={handleDeleteResource}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="size-[18px] shrink-0" />
                <span>刪除</span>
              </button>
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
  currentUserId,
  currentUserPhotoURL,
  commentCount,
  onEditPractice,
  onArchivePractice,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
  onDeletePractice,
  onDeleteResource,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  footer,
  browseActivity,
}: IPracticeDetailShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>("comments");
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [practiceMenuOpen, setPracticeMenuOpen] = useState(false);
  const [isFollowingPractice, setIsFollowingPractice] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const practiceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!practiceMenuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (practiceMenuRef.current && !practiceMenuRef.current.contains(e.target as Node)) {
        setPracticeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [practiceMenuOpen]);

  const { data: reactionsData, mutate: mutateReactions } = useReactions({
    targetType: "practice",
    targetId: practiceId,
  });
  const [, startReactionTransition] = useTransition();
  // undefined = no pending (use server data), null = optimistically removed, type = optimistically set
  const [pendingReaction, setPendingReaction] = useState<ReactionTypeType | null | undefined>(
    undefined
  );

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const effectiveReaction = pendingReaction !== undefined ? pendingReaction : currentUserReaction;
  const headerReactions: ReactionTypeType[] = effectiveReaction ? [effectiveReaction] : [];

  const handleHeaderReactionToggle = useCallback(
    (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      // Optimistic update: reflect change immediately before API resolves
      setPendingReaction(isSelected ? null : type);
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
        setPendingReaction(undefined);
      });
    },
    [currentUserReaction, practiceId, mutateReactions]
  );
  const { open: openSheet, close: closeSheet } = useSheetManager();
  const { openWarningDialog } = useDialog();

  const taskStatus = practice.status ? mapPracticeStatusToTaskStatus(practice.status) : undefined;
  const statusInfo = taskStatus ? getStatusConfig(taskStatus) : undefined;

  const openBrowseActivity = () => {
    setPracticeMenuOpen(false);
    openSheet({
      title: "瀏覽活動",
      content: (
        <BrowseActivityContent
          viewCount={browseActivity?.viewCount ?? 0}
          commentCount={commentCount ?? comments.length}
          followers={browseActivity?.followers ?? []}
          onClose={() => closeSheet()}
        />
      ),
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  };

  const handleToggleFollowPractice = async () => {
    const wasFollowing = isFollowingPractice;
    setIsFollowingPractice(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowTarget("practice", practiceId);
        toast.success("已取消關注");
      } else {
        await followTarget({ targetType: "practice", targetId: practiceId });
        toast.success("已關注此實踐");
      }
    } catch {
      setIsFollowingPractice(wasFollowing);
      toast.error("操作失敗，請稍後再試");
    }
  };

  return (
    <div className="flex-1 max-w-[448px] mx-auto w-full pb-24">
      <div className="px-4 pt-[60px]">
        <div className="flex items-center justify-between mb-2">
          {statusInfo ? (
            <Badge variant={statusInfo.variant} size="sm">
              {statusInfo.label}
            </Badge>
          ) : (
            <div />
          )}

          <div ref={practiceMenuRef} className="relative">
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
                    window.open("https://tally.so/r/BzGQy4", "_blank");
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
                    void handleToggleFollowPractice();
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
            <div className="border-t border-[#E4EAE9] mb-2" />
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
                .slice(0, PICKER_REACTIONS.length);
              const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
                (sum, r) => sum + r.count,
                0
              );
              const latestActorName =
                (reactionsData?.data?.reactions ?? []).find((r) => r.count > 0)?.latestActorName ??
                null;
              // 優先用 API followers；沒有時用 aggregate reactions（所有人共享）
              const displayReactions =
                followers.length > 0
                  ? ([...new Set(followers.map((f) => f.reaction))].slice(
                      0,
                      PICKER_REACTIONS.length
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
                            size={20}
                            play={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-sm text-text-dark">{text}</span>
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

      <div ref={commentsRef} className="flex border-b border-[#E4EAE9] mx-4">
        {TABS.map(({ id, label }) => {
          const countMap: Record<TabType, number> = {
            comments: commentCount ?? comments?.length ?? 0,
            checkins: checkInsData?.data?.length ?? 0,
            resources: practice?.resources?.length ?? 0,
          };
          const count = countMap[id];
          const displayLabel = count > 0 ? `${label}(${count})` : label;
          return (
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
              {displayLabel}
            </Button>
          );
        })}
      </div>

      {activeTab === "comments" && (
        <div className="mx-4 mt-4 mb-4 bg-white rounded-xl overflow-hidden shadow-sm">
          {isLoadingComments ? (
            <div className="px-4 py-6 text-xs text-[#9FB5B8] text-center">留言載入中...</div>
          ) : (
            <CommentSection
              comments={comments}
              selectedReactions={[]}
              onSubmit={(content, _reactions, parentId, mentionedUserIds) =>
                onSubmitComment(content, parentId, mentionedUserIds)
              }
              hasMoreComments
              currentUserName={currentUserName}
              currentUserId={currentUserId}
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
          <div className="pt-10">
            <CheckInStack practiceId={practiceId} checkInsData={checkInsData} />
          </div>
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
                onDeleteResource={onDeleteResource}
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
