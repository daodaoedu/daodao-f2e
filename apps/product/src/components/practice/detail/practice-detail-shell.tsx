"use client";

import type { ReactionTypeValue } from "@daodao/api";
import {
  followTarget,
  removeReaction,
  unfollowTarget,
  upsertReaction,
  useCopyPractice,
  useExtractOgImage,
  useReactions,
} from "@daodao/api";
import {
  BookSvg,
  ChartColumnIncreasingSvg,
  DefaultAvatarSvg,
  DialogOutlineSvg,
  FlagOutlineSvg,
  TelescopeSvg,
} from "@daodao/assets";
import type { MentionCandidate } from "@daodao/features-mention";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { useSheetManager } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { toast } from "@daodao/ui/components/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { cn } from "@daodao/ui/lib/utils";
import {
  Archive,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  List,
  LockIcon,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Shapes,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { CheckInRecordCard, CheckInStack } from "@/components/check-in";
import { CheckInList } from "@/components/check-in/display";
import {
  CommentSection,
  type IComment,
  ReactionPickerButton,
} from "@/components/check-in/reactions";
import { LottieEmoji } from "@/components/check-in/reactions/lottie-emoji";
import { PracticeOverviewCard } from "@/components/practice";
import { CheckInCommentGroups } from "@/components/practice/detail/check-in-comment-groups";
import { PracticeDetailTitle } from "@/components/practice/detail/practice-detail-title";
import { PracticeScheduleDetails } from "@/components/practice/detail/practice-schedule-details";
import {
  BrowseActivityContent,
  type IBrowseActivityFollower,
} from "@/components/practice/shared/browse-activity-content";
import type { ExecutionTiming } from "@/constants/practice-form";
import { PracticeStatus } from "@/constants/practice-status";
import {
  PICKER_REACTIONS,
  REACTION_CONFIG,
  type ReactionTypeType,
} from "@/constants/reaction-type";
import { getStatusConfig, mapPracticeStatusToTaskStatus } from "@/constants/task-status";

import { getResourceDate } from "@/lib/resource-usage-date";

interface IPracticeDetailResource {
  id: string;
  name: string;
  url?: string;
  /** 指定第幾天使用（1 = 開始日當天；null/undefined 代表整段期間皆可使用） */
  dayNumber?: number | null;
  relevantDate?: string | null;
  isLocked?: boolean;
}

interface IPracticeDetailCreator {
  id: string;
  name: string;
  photoURL?: string | null;
  customId?: string | null;
  date?: string;
}

interface IPracticeDetailViewModel {
  id: string;
  title: string;
  /** 共同挑戰實踐：不可複製（FR-CC-09），加入挑戰是唯一途徑 */
  isChallenge?: boolean;
  isCohortPractice?: boolean;
  /** Server copy policy, separate from cohort resource locking. */
  isCopyRestricted?: boolean;
  status?: PracticeStatus;
  actionDescription: string;
  /** 每週頻率，例 "1-3"、"7"（daodao#370） */
  frequency: string;
  durationMinutes: number;
  /** 實踐天數（照 API，可為 1～上限任何天數）；null 代表 API 無法判斷天數 */
  durationDays: number | null;
  startDate?: string;
  executionTiming: ExecutionTiming[];
  customTiming?: string;
  tags: string[];
  progress: number;
  creator?: IPracticeDetailCreator;
  resources: IPracticeDetailResource[];
}

type TabType = "comments" | "checkins" | "resources";

const CheckInView = {
  list: "list",
  bubbles: "bubbles",
} as const;
type CheckInViewType = (typeof CheckInView)[keyof typeof CheckInView];

const CHECK_IN_VIEWS = [
  { id: CheckInView.list, labelKey: "checkin_view_list", Icon: List },
  { id: CheckInView.bubbles, labelKey: "checkin_view_bubbles", Icon: Shapes },
] as const;

interface IBrowseActivityData {
  viewCount?: number;
  followers?: IBrowseActivityFollower[];
}

interface IPracticeDetailShellProps {
  practice: IPracticeDetailViewModel;
  practiceId: string;
  isOwner: boolean;
  readOnly?: boolean;
  /** 頁面頂端已有 sticky 導覽列（高 56px）：分頁列黏在它下方，手機版不再預留關閉鈕空間 */
  hasTopBar?: boolean;
  checkInsData: React.ComponentProps<typeof CheckInRecordCard>["checkInsData"];
  isLoadingCheckIns: boolean;
  checkInsError?: boolean;
  onRetryCheckIns?: () => void;
  isLoadingComments?: boolean;
  commentsError?: boolean;
  onRetryComments?: () => void;
  comments: IComment[];
  currentUserName?: string;
  currentUserId?: string;
  currentUserPhotoURL?: string;
  mentionCandidates?: MentionCandidate[];
  commentCount?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  onEditPractice: () => void;
  onArchivePractice: () => void;
  onDeletePractice: () => void;
  onDeleteResource?: (resourceId: string) => void;
  onSubmitComment: (content: string, parentId?: string, mentionedUserIds?: number[]) => void;
  onEditComment: (
    id: string,
    content: string,
    mentionedUserIds?: number[]
  ) => Promise<unknown> | unknown;
  onDeleteComment: (id: string) => Promise<unknown> | unknown;
  footer?: React.ReactNode;
  browseActivity?: IBrowseActivityData;
}

const TABS = [
  { id: "comments", labelKey: "tab_comments", Icon: DialogOutlineSvg },
  { id: "checkins", labelKey: "tab_checkins", Icon: CalendarCheck },
  { id: "resources", labelKey: "tab_resources", Icon: BookOpen },
] as const;

interface IPracticeResourceListCardProps {
  startDate?: string;
  resource: IPracticeDetailResource;
}

function PracticeResourceListCard({ startDate, resource }: IPracticeResourceListCardProps) {
  const t = useTranslations("practice");
  const [imageError, setImageError] = useState(false);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);
  const ogImageUrl = ogImageData?.ogImageUrl ?? null;
  const shouldShowDefaultThumbnail = !ogImageUrl || imageError || isLoading || !resource.url;

  return (
    <div
      className={cn(
        "relative flex min-h-[66px] items-stretch rounded-lg border border-[#E4EAE9] bg-white p-2 gap-3 w-full transition-colors",
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
        {resource.isLocked && (
          <span
            className="absolute right-1 top-1 z-[2] rounded-full bg-white/90 p-1 text-[#0D7773]"
            role="img"
            aria-label={t("resource_locked_by_coach")}
            title={t("resource_locked_by_coach")}
          >
            <LockIcon className="size-3" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1 overflow-hidden whitespace-normal">
        {resource.dayNumber != null && (
          <span className="inline-block mb-1 rounded-full bg-[#E7FAF7] px-2 py-0.5 text-[11px] font-semibold text-[#0D7773]">
            {getResourceDate(startDate || "", resource.dayNumber)?.replaceAll("-", "/")} (
            {t("resource_day_badge", { day: resource.dayNumber })})
          </span>
        )}
        <p className="text-sm font-semibold text-[#295E5C] leading-snug line-clamp-2">
          {resource.name}
        </p>
        <p className="text-xs text-logo-cyan mt-1.5 break-all line-clamp-2">
          {resource.url || t("resource_no_link")}
        </p>
      </div>

      {resource.relevantDate && (
        <span className="shrink-0 self-start pt-1 text-[11px] font-normal text-[#0D7773]">
          {resource.relevantDate}
        </span>
      )}
    </div>
  );
}

export function PracticeDetailShell({
  practice,
  practiceId,
  isOwner,
  readOnly = false,
  hasTopBar = false,
  checkInsData,
  isLoadingCheckIns,
  checkInsError = false,
  onRetryCheckIns,
  isLoadingComments = false,
  commentsError = false,
  onRetryComments,
  comments,
  currentUserName,
  currentUserId,
  currentUserPhotoURL,
  mentionCandidates,
  commentCount,
  onEditPractice,
  onArchivePractice,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  previousLabel,
  nextLabel,
  onDeletePractice,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  footer,
  browseActivity,
}: IPracticeDetailShellProps) {
  const t = useTranslations("practice");
  const cohortT = useTranslations("cohort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { copyPractice } = useCopyPractice();
  const [isCopying, setIsCopying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("checkins");
  const [checkInView, setCheckInView] = useState<CheckInViewType>(CheckInView.list);
  // 各打卡的留言數（由 CheckInCommentGroups 回報），用於留言分頁的總數
  const [checkInCommentCounts, setCheckInCommentCounts] = useState<Record<string, number | null>>(
    {}
  );
  // Many comment requests can settle together. Keep aggregate counter updates
  // nonurgent so their parent rerenders do not nest inside SWR store notifications.
  const [, startCommentCountTransition] = useTransition();
  const handleCheckInCommentCount = useCallback((checkInId: string, count: number | null) => {
    startCommentCountTransition(() => {
      setCheckInCommentCounts((prev) =>
        prev[checkInId] === count ? prev : { ...prev, [checkInId]: count }
      );
    });
  }, []);
  const checkInCommentTotal = (checkInsData?.data ?? []).reduce(
    (sum, checkIn) => sum + (checkInCommentCounts[String(checkIn.id)] ?? 0),
    0
  );
  const commentCountsPending =
    readOnly &&
    (isLoadingCheckIns ||
      checkInsError ||
      isLoadingComments ||
      commentsError ||
      (checkInsData?.data ?? []).some(
        (checkIn) => checkInCommentCounts[String(checkIn.id)] == null
      ));
  const practiceCommentCount = commentCount ?? comments.length;
  // Active practice details can collapse on compact screens; desktop stays expanded.
  const isOverviewCollapsible = practice.status === PracticeStatus.active;
  const [overviewOpenOnMobile, setOverviewOpenOnMobile] = useState(true);
  const [practiceMenuOpen, setPracticeMenuOpen] = useState(false);
  const [isFollowingPractice, setIsFollowingPractice] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const practiceCommentsRef = useRef<HTMLDivElement>(null);
  const practiceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!practice.id) return;
    setActiveTab("checkins");
    setCheckInView(CheckInView.list);
    setOverviewOpenOnMobile(true);
    setPracticeMenuOpen(false);
  }, [practice.id]);

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
  const tabParam = searchParams.get("tab");

  const isValidTab = useCallback(
    (tab: string | null): tab is TabType => {
      if (!tab) {
        return false;
      }

      return TABS.some((item) => item.id === tab) && (tab !== "comments" || readOnly);
    },
    [readOnly]
  );

  useEffect(() => {
    if (!isValidTab(tabParam)) {
      if (tabParam === "comments" && !readOnly) {
        requestAnimationFrame(() => {
          practiceCommentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return;
    }

    setActiveTab(tabParam);
    if (tabParam !== "comments") {
      return;
    }

    requestAnimationFrame(() => {
      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isValidTab, tabParam, readOnly]);

  const currentUserReaction = (reactionsData?.data?.currentUserReaction ??
    null) as ReactionTypeType | null;
  const effectiveReaction = pendingReaction !== undefined ? pendingReaction : currentUserReaction;
  const headerReactions: ReactionTypeType[] = effectiveReaction ? [effectiveReaction] : [];
  const reactionFollowers = browseActivity?.followers ?? [];
  const activeReactions = (reactionsData?.data?.reactions ?? [])
    .filter((reaction) => reaction.count > 0)
    .slice(0, PICKER_REACTIONS.length);
  const totalReactionCount = (reactionsData?.data?.reactions ?? []).reduce(
    (sum, reaction) => sum + reaction.count,
    0
  );
  const serverActiveReactionTypes = activeReactions.map(
    (reaction) => reaction.type as ReactionTypeType
  );
  const displayReactions =
    reactionFollowers.length > 0
      ? ([...new Set(reactionFollowers.map((follower) => follower.reaction))].slice(
          0,
          PICKER_REACTIONS.length
        ) as ReactionTypeType[])
      : effectiveReaction && !serverActiveReactionTypes.includes(effectiveReaction)
        ? [effectiveReaction, ...serverActiveReactionTypes].slice(0, PICKER_REACTIONS.length)
        : serverActiveReactionTypes;

  const handleHeaderReactionToggle = useCallback(
    (type: ReactionTypeType) => {
      if (!currentUserId) {
        const queryString = searchParams.toString();
        const redirectUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
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
    [
      currentUserId,
      router,
      pathname,
      searchParams,
      currentUserReaction,
      practiceId,
      mutateReactions,
    ]
  );
  const { open: openSheet, close: closeSheet } = useSheetManager();

  const taskStatus = practice.status ? mapPracticeStatusToTaskStatus(practice.status) : undefined;
  const statusInfo = taskStatus ? getStatusConfig(taskStatus) : undefined;

  const openBrowseActivity = () => {
    setPracticeMenuOpen(false);
    openSheet({
      title: t("action_browse_activity"),
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
    if (!currentUserId) {
      const queryString = searchParams.toString();
      const redirectUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    const wasFollowing = isFollowingPractice;
    setIsFollowingPractice(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowTarget("practice", practiceId);
        toast.success(t("unfollow_success"));
      } else {
        await followTarget({ targetType: "practice", targetId: practiceId });
        toast.success(t("follow_success"));
      }
    } catch {
      setIsFollowingPractice(wasFollowing);
      toast.error(t("operation_failed"));
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-[72px] pb-24">
      <div className="grid grid-cols-1 lg:mx-auto lg:w-full lg:max-w-5xl lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <section className={cn("md:pt-4", hasTopBar ? "pt-4" : "pt-[60px]")}>
          <div className="flex items-center justify-between mb-2">
            {statusInfo ? (
              <Badge variant={statusInfo.variant} size="sm">
                {t(statusInfo.label)}
              </Badge>
            ) : (
              <div />
            )}

            <div ref={practiceMenuRef} className="relative">
              {!readOnly && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setPracticeMenuOpen((value) => !value)}
                  className={cn(
                    "h-8 w-8",
                    practiceMenuOpen ? "bg-[#E4EAE9]" : "hover:bg-[#E4EAE9]"
                  )}
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              )}

              {!readOnly && practiceMenuOpen && isOwner && (
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
                    <span>{t("action_edit")}</span>
                  </Button>
                  {!practice.isCopyRestricted &&
                    !practice.isCohortPractice &&
                    !practice.isChallenge && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={async () => {
                          setPracticeMenuOpen(false);
                          try {
                            setIsCopying(true);
                            const { id } = await copyPractice(practiceId);
                            router.push(`/practices/copy-success?practiceId=${id}`);
                          } catch {
                            toast.error(t("copy_failed"));
                          } finally {
                            setIsCopying(false);
                          }
                        }}
                        disabled={isCopying}
                        className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                      >
                        <Copy className="size-[18px] shrink-0" />
                        <span>{t("action_copy")}</span>
                      </Button>
                    )}
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
                    <span>{t("action_archive")}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={openBrowseActivity}
                    className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <ChartColumnIncreasingSvg className="size-[18px] shrink-0" />
                    <span>{t("action_browse_activity")}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPracticeMenuOpen(false);
                      // 確認框由 onDeletePractice（頁面的 useDeletePracticeDialog）負責，這裡不再自帶一層（daodao#369）
                      onDeletePractice();
                    }}
                    className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-[18px] shrink-0" />
                    <span>{t("action_delete")}</span>
                  </Button>
                </div>
              )}

              {!readOnly && practiceMenuOpen && !isOwner && (
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
                    <span>{t("action_report")}</span>
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
                    <span>{isFollowingPractice ? t("action_unfollow") : t("action_follow")}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={openBrowseActivity}
                    className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
                  >
                    <ChartColumnIncreasingSvg className="size-5 shrink-0" />
                    <span>{t("action_browse_activity")}</span>
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
            previousDisabled={previousDisabled}
            nextDisabled={nextDisabled}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
          />

          {isOverviewCollapsible && !overviewOpenOnMobile && (
            <div className="-mt-3 mb-3 flex w-full items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm md:hidden">
              <Button
                type="button"
                variant="ghost"
                aria-expanded={overviewOpenOnMobile}
                aria-controls="practice-overview-card"
                aria-label={t("show_practice_details")}
                onClick={() => setOverviewOpenOnMobile(true)}
                className="flex h-auto min-w-0 flex-1 items-center justify-between gap-3 rounded-lg p-0 text-left cursor-pointer hover:bg-white"
              >
                {practice.creator && (
                  <Avatar className="size-8 shrink-0">
                    {practice.creator.photoURL && (
                      <AvatarImage src={practice.creator.photoURL} alt={practice.creator.name} />
                    )}
                    <AvatarFallback>
                      <DefaultAvatarSvg aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-[#6B8789]">
                    {practice.creator?.name ?? t("show_practice_details")}
                  </span>
                  {practice.actionDescription && (
                    <span className="mt-0.5 block truncate text-sm font-normal text-text-dark">
                      {practice.actionDescription}
                    </span>
                  )}
                </span>
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-[#9FB5B8]" />
              </Button>
              {!overviewOpenOnMobile && (
                <div className="w-28 shrink-0">
                  <ReactionPickerButton
                    selectedReactions={headerReactions}
                    onToggle={handleHeaderReactionToggle}
                    variant="card"
                    alignment="end"
                    displayReactions={displayReactions.slice(0, 3)}
                    totalCount={totalReactionCount}
                    openOnClick
                    stackOverlapClassName="ml-1"
                  />
                </div>
              )}
            </div>
          )}

          <div
            id="practice-overview-card"
            className={cn(
              "bg-white rounded-lg shadow-sm mb-4",
              isOverviewCollapsible && !overviewOpenOnMobile && "hidden md:block"
            )}
          >
            <PracticeOverviewCard
              actionDescription={practice.actionDescription}
              frequency={practice.frequency}
              durationMinutes={practice.durationMinutes}
              tags={practice.tags}
              progress={practice.progress}
              showProgress
              creator={practice.creator}
              headerActionMobileOnly
              headerAction={
                isOverviewCollapsible ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("hide_practice_details")}
                    aria-expanded={overviewOpenOnMobile}
                    aria-controls="practice-overview-card"
                    onClick={() => setOverviewOpenOnMobile(false)}
                    className="text-light-gray md:hidden"
                  >
                    <ChevronUp aria-hidden="true" className="size-4" />
                  </Button>
                ) : undefined
              }
            />

            <div className="px-4">
              {!readOnly &&
                !isOwner &&
                !practice.isCopyRestricted &&
                !practice.isChallenge &&
                !practice.isCohortPractice && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-3 gap-2 rounded-full"
                    disabled={isCopying}
                    onClick={async () => {
                      if (!currentUserId) {
                        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                        return;
                      }
                      try {
                        setIsCopying(true);
                        const { id } = await copyPractice(practiceId);
                        router.push(`/practices/copy-success?practiceId=${id}`);
                      } catch {
                        toast.error(t("copy_failed"));
                      } finally {
                        setIsCopying(false);
                      }
                    }}
                  >
                    <Copy className="size-4" />
                    {isCopying ? t("action_copying") : t("action_also_practice")}
                  </Button>
                )}
              <PracticeScheduleDetails
                executionTiming={practice.executionTiming}
                customTiming={practice.customTiming}
                durationDays={practice.durationDays}
                startDate={practice.startDate}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex w-fit rounded-xl py-1 transition-colors hover:bg-gray-100">
                    <ReactionPickerButton
                      selectedReactions={headerReactions}
                      onToggle={handleHeaderReactionToggle}
                      variant="card"
                      alignment="start"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`${t("practice_comments_heading")} (${practiceCommentCount})`}
                    title={t("practice_comments_heading")}
                    onClick={() =>
                      practiceCommentsRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className="h-8 shrink-0 gap-1.5 px-2 text-xs text-[#6B8789] hover:text-logo-cyan"
                  >
                    <MessageCircle aria-hidden="true" className="size-4" />
                    <span className="tabular-nums">{practiceCommentCount}</span>
                  </Button>
                </div>
                {(() => {
                  const followers = reactionFollowers;
                  const latestActorName =
                    (reactionsData?.data?.reactions ?? []).find((r) => r.count > 0)
                      ?.latestActorName ?? null;
                  const firstName = followers[0]?.name;
                  const text =
                    followers.length > 1
                      ? t("followers_with_others", {
                          firstName: firstName ?? "",
                          count: String(followers.length - 1),
                        })
                      : followers.length === 1
                        ? firstName
                        : effectiveReaction
                          ? totalReactionCount > 1
                            ? t("you_with_others", { count: String(totalReactionCount - 1) })
                            : t("you")
                          : totalReactionCount > 0
                            ? latestActorName
                              ? totalReactionCount > 1
                                ? t("others_with_count", {
                                    name: latestActorName,
                                    count: String(totalReactionCount - 1),
                                  })
                                : latestActorName
                              : t("count_people", { count: String(totalReactionCount) })
                            : undefined;
                  if (displayReactions.length === 0 && !text) return null;
                  return (
                    <button
                      type="button"
                      onClick={openBrowseActivity}
                      className="flex w-fit items-center justify-end gap-2 text-right hover:opacity-70 transition-opacity cursor-pointer"
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
            </div>
          </div>

          <div
            ref={practiceCommentsRef}
            className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-xs font-semibold text-[#6B8789]">
                {t("practice_comments_heading")}
              </h2>
            </div>
            {commentsError && (
              <div role="alert" className="p-4 text-sm">
                <p>{t("load_failed")}</p>
                <Button variant="outline" onClick={onRetryComments}>
                  {cohortT("retry")}
                </Button>
              </div>
            )}
            {!commentsError &&
              (isLoadingComments ? (
                <div className="px-4 py-6 text-xs text-[#9FB5B8] text-center">
                  {t("comments_loading")}
                </div>
              ) : (
                <CommentSection
                  comments={comments}
                  selectedReactions={[]}
                  onSubmit={(content, _reactions, parentId, mentionedUserIds) =>
                    onSubmitComment(content, parentId, mentionedUserIds)
                  }
                  hasMoreComments
                  previewCount={2}
                  currentUserName={currentUserName}
                  currentUserId={currentUserId}
                  currentUserPhotoURL={currentUserPhotoURL}
                  mentionCandidates={mentionCandidates}
                  onEditComment={onEditComment}
                  onDeleteComment={onDeleteComment}
                />
              ))}
          </div>
        </section>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === "comments" || value === "checkins" || value === "resources") {
              setActiveTab(value);
            }
          }}
          asChild
        >
          <main className="min-w-0 lg:pt-12">
            <div
              ref={commentsRef}
              className={cn(
                "sticky z-20 flex bg-gray-100 lg:ml-12 lg:mr-0",
                hasTopBar ? "top-14 scroll-mt-14" : "top-0"
              )}
            >
              <TabsList
                aria-label={practice.title}
                className="min-w-0 flex-1 justify-start gap-0 overflow-x-auto px-0 md:px-0 lg:px-0"
              >
                {(readOnly ? TABS : TABS.filter(({ id }) => id !== "comments")).map(
                  ({ id, labelKey, Icon }) => {
                    const countMap: Record<TabType, number> = {
                      comments: checkInCommentTotal,
                      checkins:
                        checkInsData?.pagination?.totalItems ?? checkInsData?.data?.length ?? 0,
                      resources: practice.resources.length,
                    };
                    const count = countMap[id];
                    const countPending = id === "comments" && commentCountsPending;
                    const label = id === "comments" ? t("checkin_comments_heading") : t(labelKey);
                    const accessibleLabel = countPending
                      ? `${label} (${t("comments_loading")})`
                      : `${label}${count > 0 ? ` (${count})` : ""}`;
                    return (
                      <TabsTrigger
                        key={id}
                        value={id}
                        aria-label={accessibleLabel}
                        title={label}
                        className="min-h-11 min-w-max flex-1 gap-1.5 px-3 pt-3 pb-2 text-sm font-medium text-text-dark hover:bg-bg-gray/50 data-[state=active]:border-b-logo-cyan data-[state=active]:text-text-dark focus-visible:ring-inset focus-visible:ring-text-dark"
                      >
                        <Icon aria-hidden="true" className="size-5" />
                        <span>{label}</span>
                        {countPending ? (
                          <span className="text-xs">…</span>
                        ) : (
                          count > 0 && <span className="text-xs">{count}</span>
                        )}
                      </TabsTrigger>
                    );
                  }
                )}
              </TabsList>
              {isOwner && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("edit_resources")}
                  title={t("edit_resources")}
                  onClick={() => router.push(`/practices/${practiceId}/edit#practice-resources`)}
                  className="size-11 shrink-0 self-center text-text-dark hover:bg-bg-gray/50 hover:text-text-dark focus-visible:ring-2 focus-visible:ring-text-dark"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* 保持掛載（分頁非留言時隱藏），留言分頁的總數才能在一進頁面就包含打卡留言 */}
            {readOnly && (
              <TabsContent
                value="comments"
                forceMount
                hidden={activeTab !== "comments"}
                className="p-0 md:p-0 lg:p-0"
              >
                <CheckInCommentGroups
                  practiceId={practiceId}
                  checkInsData={checkInsData}
                  onCountChange={handleCheckInCommentCount}
                  currentUserName={currentUserName}
                  currentUserId={currentUserId}
                  currentUserPhotoURL={currentUserPhotoURL}
                />
              </TabsContent>
            )}

            <TabsContent value="checkins" className="p-0 pt-4 md:p-0 md:pt-1 lg:p-0 lg:pt-1">
              {checkInsError && (
                <div role="alert" className="p-4 text-sm">
                  <p>{t("load_failed")}</p>
                  <Button variant="outline" onClick={onRetryCheckIns}>
                    {cohortT("retry")}
                  </Button>
                </div>
              )}
              <div className="lg:pl-12 lg:pr-0">
                <CheckInRecordCard checkInsData={checkInsData} isLoading={isLoadingCheckIns} />
              </div>
              {(checkInsData?.data?.length ?? 0) > 0 && (
                <fieldset className="mx-4 mt-4 hidden justify-end md:flex">
                  <legend className="sr-only">{t("checkin_view_label")}</legend>
                  <div className="flex rounded-full bg-[#E4EAE9] p-0.5">
                    {CHECK_IN_VIEWS.map(({ id, labelKey, Icon }) => (
                      <Button
                        key={id}
                        type="button"
                        variant="ghost"
                        aria-pressed={checkInView === id}
                        onClick={() => setCheckInView(id)}
                        className={cn(
                          "h-8 gap-1.5 rounded-full px-3 text-xs font-medium cursor-pointer",
                          checkInView === id
                            ? "bg-white text-[#0D7773] shadow-sm hover:bg-white"
                            : "text-[#6B8789] hover:bg-transparent hover:text-text-dark"
                        )}
                      >
                        <Icon aria-hidden="true" className="size-3.5" />
                        {t(labelKey)}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              )}
              {checkInView === CheckInView.list ? (
                <div className="pt-3 pb-4 lg:pl-12 lg:pr-0">
                  <CheckInList practiceId={practiceId} checkInsData={checkInsData} />
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-clip pt-10 md:flex md:justify-center lg:pl-12">
                    <CheckInStack practiceId={practiceId} checkInsData={checkInsData} />
                  </div>
                  <div className="pt-3 pb-4 md:hidden">
                    <CheckInList practiceId={practiceId} checkInsData={checkInsData} />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent
              value="resources"
              className="flex flex-col gap-3 p-0 pt-4 pb-4 md:p-0 md:pt-4 md:pb-4 lg:p-0 lg:pt-4 lg:pb-4 lg:pl-12"
            >
              {practice.resources.length > 0 ? (
                // 有指定使用日的資源依天數排前面，沒指定的（整段期間皆可用）排最後
                [...practice.resources]
                  .sort((a, b) =>
                    practice.isCohortPractice
                      ? 0
                      : (a.dayNumber ?? Number.MAX_SAFE_INTEGER) -
                        (b.dayNumber ?? Number.MAX_SAFE_INTEGER)
                  )
                  .map((resource) => (
                    <PracticeResourceListCard
                      key={resource.id}
                      resource={resource}
                      startDate={practice.startDate}
                    />
                  ))
              ) : (
                <div className="pl-14 py-4 text-sm text-[#9FB5B8] lg:pl-0">{t("no_resources")}</div>
              )}
            </TabsContent>

            {footer}
          </main>
        </Tabs>
      </div>
    </div>
  );
}
