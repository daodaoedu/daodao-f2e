import { usePracticeCheckIns, useUpdatePracticeCheckIn } from "@daodao/api";
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, TextArea, View, XStack, YStack } from "tamagui";
import { ShareCheckInSheet } from "@/components";
import { CheckInDateSelector } from "@/components/check-in/date-selector";
import { CheckInCard } from "@/components/check-in/display/check-in-card";
import { MoodSelector } from "@/components/check-in/form/components/mood-selector";
import { TagSelector } from "@/components/check-in/form/components/tag-selector";
import type { ICheckInDate, ICheckInDisplayData } from "@/components/check-in/types";
import { CommentSheet } from "@/components/persona/CommentSheet";
import { BrowseActivitySheet } from "@/components/practice/detail/BrowseActivitySheet";
import { CommentSection } from "@/components/practice/detail/CommentSection";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import { Button } from "@/components/ui/button";
import {
  type ApiMoodType,
  MOOD_OPTIONS,
  type MoodType,
  mapApiMoodToMoodType,
  mapMoodTypeToApiMood,
} from "@/constants/mood";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { useShareCheckInSheet } from "@/hooks/use-share-check-in-sheet";
import { useComments } from "@/hooks/useComments";
import { usePractice } from "@/hooks/usePractices";
import {
  removeReaction,
  upsertReaction,
  useReactions,
  useReactionsList,
} from "@/hooks/useReactions";
import { useMobileTranslation } from "@/i18n";

type CheckInDetailRecord = {
  id: string | number;
  practiceId?: string | number;
  note?: string | null;
  mood?: ApiMoodType | MoodType | null;
  tags?: string[] | null;
  images?: string[] | null;
  imageUrls?: string[] | null;
  mediaUrls?: string[] | null;
  image_urls?: string[] | null;
  checkinDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CheckInsResponse = {
  data?: CheckInDetailRecord[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value.replace(/-/g, ".");

  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const toDateKey = (checkIn: CheckInDetailRecord) => {
  if (checkIn.checkinDate) return checkIn.checkinDate;
  if (!checkIn.createdAt) return "";
  return checkIn.createdAt.split("T")[0] ?? "";
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeMood = (mood?: ApiMoodType | MoodType | null): MoodType | null => {
  if (!mood) return null;

  const apiMood = mapApiMoodToMoodType(mood as ApiMoodType);
  if (apiMood) return apiMood;

  return MOOD_OPTIONS.some((option) => option.id === mood) ? (mood as MoodType) : null;
};

const getImages = (checkIn?: CheckInDetailRecord) => {
  return (
    checkIn?.imageUrls ??
    checkIn?.images ??
    checkIn?.mediaUrls ??
    checkIn?.image_urls ??
    []
  ).filter(Boolean);
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  if (typeof error === "object" && error !== null && "error" in error) {
    const nested = (error as { error?: { message?: unknown } }).error;
    if (typeof nested?.message === "string" && nested.message) return nested.message;
  }
  return fallback;
}

function EditCheckInModal({
  visible,
  checkIn,
  onClose,
  onSave,
}: {
  visible: boolean;
  checkIn?: CheckInDetailRecord;
  onClose: () => void;
  onSave: (values: {
    mood: MoodType;
    note: string;
    tags: string[];
    existingImageUrls: string[];
  }) => Promise<void>;
}) {
  const t = useMobileTranslation("mobile.checkInDetail");
  const [mood, setMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible || !checkIn) return;
    setMood(normalizeMood(checkIn.mood));
    setNote(checkIn.note ?? "");
    setTags(checkIn.tags ?? []);
  }, [checkIn, visible]);

  const handleSave = async () => {
    if (!mood) {
      Alert.alert(t("errorTitle"), t("moodRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        mood,
        note,
        tags,
        existingImageUrls: getImages(checkIn),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          <XStack padding="$4" alignItems="center" justifyContent="space-between">
            <Button size="$3" chromeless onPress={onClose} disabled={isSaving}>
              <Text fontSize={14} color="$color">
                {t("cancel")}
              </Text>
            </Button>
            <Text fontSize={16} fontWeight="600" color="$color">
              {t("editTitle")}
            </Text>
            <Button size="$3" chromeless onPress={handleSave} disabled={isSaving}>
              <Text fontSize={14} color={colors.primary.base} fontWeight="600">
                {isSaving ? t("saving") : t("save")}
              </Text>
            </Button>
          </XStack>
          <ScrollView flex={1} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <MoodSelector value={mood} onChange={setMood} />
            <TagSelector value={tags} onChange={setTags} />
            <YStack gap="$2">
              <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
                {t("noteLabel")}
              </Text>
              <TextArea
                size="$4"
                value={note}
                onChangeText={setNote}
                placeholder={t("notePlaceholder")}
                numberOfLines={5}
                maxLength={600}
              />
              <Text fontSize={12} color="$color" opacity={0.5} textAlign="right">
                {note.length}/600
              </Text>
            </YStack>
          </ScrollView>
        </YStack>
      </SafeAreaView>
    </Modal>
  );
}

export default function CheckInDetailScreen() {
  const { id, checkInId } = useLocalSearchParams<{ id: string; checkInId: string }>();
  const router = useRouter();
  const t = useMobileTranslation("mobile.checkInDetail");
  const tCommon = useMobileTranslation("common");
  const tCheckIn = useMobileTranslation("mobile.checkIn");
  const tPractice = useMobileTranslation("mobile.practiceDetail");
  const { practice, isLoading: isPracticeLoading, error: practiceError } = usePractice(id);
  const {
    data: checkInsData,
    error: checkInsError,
    isLoading: isCheckInsLoading,
    mutate: mutateCheckIns,
  } = usePracticeCheckIns(id, { limit: 100, include: "images,tags" });
  const { updateCheckIn } = useUpdatePracticeCheckIn(id, String(checkInId));
  const [showEditModal, setShowEditModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showBrowseActivity, setShowBrowseActivity] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const checkInIdStr = String(checkInId);
  const {
    currentUserReaction,
    totalCount: reactionTotalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("checkin", checkInIdStr);
  const { items: reactors, firstReactorName } = useReactionsList("checkin", checkInIdStr);
  const { comments } = useComments("checkin", checkInIdStr);
  const { isOpen: isShareOpen, openShareSheet, closeShareSheet } = useShareCheckInSheet({});

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      if (isSelected) {
        await removeReaction("checkin", checkInIdStr);
      } else {
        await upsertReaction("checkin", checkInIdStr, type);
      }
      await mutateReactions();
    },
    [currentUserReaction, checkInIdStr, mutateReactions]
  );

  const checkIns = ((checkInsData as CheckInsResponse | undefined)?.data ?? []) as
    | CheckInDetailRecord[]
    | undefined;

  const checkIn = useMemo(
    () => checkIns?.find((item) => String(item.id) === String(checkInId)),
    [checkIns, checkInId]
  );

  const mood = normalizeMood(checkIn?.mood);
  const images = getImages(checkIn);
  const tags = checkIn?.tags ?? [];
  const isLoading = isPracticeLoading || isCheckInsLoading;
  const error = practiceError || checkInsError;
  const sortedCheckIns = useMemo(() => {
    return [...(checkIns ?? [])].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? "").getTime();
      const bTime = new Date(b.createdAt ?? "").getTime();
      return (Number.isFinite(aTime) ? aTime : 0) - (Number.isFinite(bTime) ? bTime : 0);
    });
  }, [checkIns]);
  const checkInDateToInfo = useMemo(() => {
    const map = new Map<string, { id: string; count: number }>();

    sortedCheckIns.forEach((item) => {
      const dateKey = toDateKey(item);
      if (!dateKey) return;
      const existing = map.get(dateKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(dateKey, { id: String(item.id), count: 1 });
      }
    });

    return map;
  }, [sortedCheckIns]);
  const checkInsRecord = useMemo(() => {
    return sortedCheckIns.reduce<Record<string, ICheckInDisplayData>>((acc, item) => {
      const itemMood = normalizeMood(item.mood);
      if (!itemMood || !practice) return acc;
      acc[String(item.id)] = {
        id: String(item.id),
        date: formatDate(toDateKey(item)),
        mood: itemMood,
        content: item.note ?? "",
        tags: item.tags ?? [],
        images: getImages(item),
        practiceTitle: practice.title,
      };
      return acc;
    }, {});
  }, [practice, sortedCheckIns]);
  const checkInDates = useMemo<ICheckInDate[]>(() => {
    const durationDays = practice?.targetDays ?? 0;
    const start = practice?.createdAt ? new Date(practice.createdAt) : null;

    if (start && !Number.isNaN(start.getTime()) && durationDays > 0) {
      return Array.from({ length: durationDays }, (_, index) => {
        const dateKey = toYmd(addDays(start, index));
        const info = checkInDateToInfo.get(dateKey);
        return {
          id: info?.id ?? `empty-${dateKey}`,
          date: dateKey,
          hasCheckIn: Boolean(info),
          checkInCount: info?.count ?? 0,
        };
      });
    }

    return Array.from(checkInDateToInfo.entries()).map(([date, info]) => ({
      id: info.id,
      date,
      hasCheckIn: true,
      checkInCount: info.count,
    }));
  }, [checkInDateToInfo, practice]);
  const sameDayState = useMemo(() => {
    if (!checkIn) return { ids: [] as string[], currentIndex: 0 };
    const currentDate = toDateKey(checkIn);
    const ids = sortedCheckIns
      .filter((item) => toDateKey(item) === currentDate)
      .map((item) => String(item.id));
    const currentIndex = Math.max(ids.indexOf(String(checkInId)), 0);
    return { ids, currentIndex };
  }, [checkIn, checkInId, sortedCheckIns]);
  const sameDayTotal = sameDayState.ids.length;
  const hasPreviousSameDay = sameDayState.currentIndex > 0;
  const hasNextSameDay = sameDayState.currentIndex < sameDayTotal - 1;

  const goToPractice = () => {
    router.push(`/practices/${id}` as `/practices/${string}`);
  };

  const goToCheckIn = (targetCheckInId: string) => {
    router.push(`/practices/${id}/check-ins/${targetCheckInId}` as never);
  };

  const handleUpdateCheckIn = async (values: {
    mood: MoodType;
    note: string;
    tags: string[];
    existingImageUrls: string[];
  }) => {
    try {
      await updateCheckIn({
        mood: mapMoodTypeToApiMood(values.mood),
        tags: values.tags,
        description: values.note,
        media: [],
        existingImageUrls: values.existingImageUrls,
      });
      await mutateCheckIns();
      Alert.alert(t("successTitle"), t("updateSuccess"));
    } catch (updateError) {
      Alert.alert(t("errorTitle"), getErrorMessage(updateError, t("updateFailed")));
      throw updateError;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !practice || !checkIn) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          <XStack padding="$4" alignItems="center" gap="$3">
            <Button
              size="$4"
              circular
              chromeless
              onPress={() => router.back()}
              accessibilityLabel={tCommon("back")}
            >
              <ChevronLeft size={24} color="$color" />
            </Button>
            <Text fontSize={18} fontWeight="600" color="$color">
              {t("title")}
            </Text>
          </XStack>

          <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$5">
            <Text fontSize={16} fontWeight="600" color="$color">
              {error ? t("loadFailed") : t("notFound")}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
              {t("returnPracticeDescription")}
            </Text>
            <Button backgroundColor={colors.primary.base} borderRadius="$md" onPress={goToPractice}>
              <Text color="white" fontWeight="600">
                {t("backToPractice")}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.logo.cyan }} edges={["top"]}>
      <YStack flex={1} backgroundColor={colors.logo.cyan}>
        {/* 頂部半透明青色 nav：標題置中 + X 關閉 + 日期選擇器 */}
        <CheckInDateSelector
          checkInDates={checkInDates}
          checkIns={checkInsRecord}
          practiceId={id}
          activeCheckInId={String(checkInId)}
          onCheckInSelect={goToCheckIn}
          title={t("title")}
          onClose={goToPractice}
        />

        <ScrollView
          flex={1}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* 三點選單（編輯 + 瀏覽活動），對齊 product 卡片右上角 */}
          <XStack justifyContent="flex-end" marginBottom="$2">
            <View position="relative">
              <Button
                size="$4"
                circular
                backgroundColor="rgba(41, 94, 92, 0.6)"
                pressStyle={{ backgroundColor: "rgba(41, 94, 92, 0.8)" }}
                onPress={() => setShowMenu((v) => !v)}
                accessibilityLabel={t("editTitle")}
              >
                <MoreHorizontal size={20} color={colors.basic.white} />
              </Button>
              {showMenu && (
                <YStack
                  position="absolute"
                  right={0}
                  top="100%"
                  marginTop={4}
                  zIndex={30}
                  backgroundColor="white"
                  borderRadius={16}
                  paddingVertical="$2"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.15}
                  shadowRadius={8}
                  elevation={5}
                  minWidth={160}
                >
                  <Button
                    chromeless
                    onPress={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                    justifyContent="flex-start"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                  >
                    <XStack gap="$3" alignItems="center">
                      <Pencil size={18} color={colors.text.dark} />
                      <Text fontSize={14} color={colors.text.dark}>
                        {t("editTitle")}
                      </Text>
                    </XStack>
                  </Button>
                  <Button
                    chromeless
                    onPress={() => {
                      setShowMenu(false);
                      setShowBrowseActivity(true);
                    }}
                    justifyContent="flex-start"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                  >
                    <XStack gap="$3" alignItems="center">
                      <BarChart3 size={18} color={colors.text.dark} />
                      <Text fontSize={14} color={colors.text.dark}>
                        {tPractice("browse_activity")}
                      </Text>
                    </XStack>
                  </Button>
                </YStack>
              )}
            </View>
          </XStack>

          {/* 筆記本風格打卡卡片，對齊 product */}
          <CheckInCard
            taskTitle={practice.title}
            date={toDateKey(checkIn)}
            mood={mood}
            content={checkIn.note ?? ""}
            tags={tags}
            images={images}
            scrollable
            afterTitle={
              sameDayTotal > 1 ? (
                <XStack alignItems="center" justifyContent="center" gap="$4" marginBottom="$3">
                  <Button
                    size="$4"
                    circular
                    backgroundColor="white"
                    disabled={!hasPreviousSameDay}
                    opacity={hasPreviousSameDay ? 1 : 0.35}
                    onPress={() => goToCheckIn(sameDayState.ids[sameDayState.currentIndex - 1])}
                    accessibilityLabel={t("previousSameDay")}
                  >
                    <ChevronLeft size={20} color={colors.primary.base} />
                  </Button>
                  <Text fontSize={15} fontWeight="600" color={colors.basic.white}>
                    {sameDayState.currentIndex + 1} / {sameDayTotal}
                  </Text>
                  <Button
                    size="$4"
                    circular
                    backgroundColor="white"
                    disabled={!hasNextSameDay}
                    opacity={hasNextSameDay ? 1 : 0.35}
                    onPress={() => goToCheckIn(sameDayState.ids[sameDayState.currentIndex + 1])}
                    accessibilityLabel={t("nextSameDay")}
                  >
                    <ChevronRight size={20} color={colors.primary.base} />
                  </Button>
                </XStack>
              ) : undefined
            }
            bottomActions={
              <XStack alignItems="center" paddingVertical="$3">
                <View flex={1} alignItems="center" justifyContent="center">
                  <ReactionPickerButton
                    selectedReaction={currentUserReaction}
                    onToggle={handleReactionToggle}
                    variant="card"
                    totalCount={reactionTotalCount}
                    displayReactions={displayReactions}
                    firstReactorName={firstReactorName}
                  />
                </View>
                <View width={1} height={20} backgroundColor="#E4EAE9" />
                <Pressable
                  style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                  onPress={() => setShowComments(true)}
                >
                  <XStack alignItems="center" gap="$1.5" justifyContent="center">
                    <MessageCircle size={20} color={colors.text.dark} />
                    {comments.length > 0 && (
                      <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                        {comments.length}
                      </Text>
                    )}
                  </XStack>
                </Pressable>
              </XStack>
            }
          />

          {/* 白色藥丸按鈕：回到實踐 + 分享這篇打卡（alignSelf center + 預設 stretch 讓兩顆等寬） */}
          <YStack alignSelf="center" gap="$3" marginTop="$2">
            <Button
              backgroundColor="white"
              borderRadius="$full"
              paddingHorizontal="$6"
              pressStyle={{ opacity: 0.85 }}
              onPress={goToPractice}
            >
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <ArrowLeft size={16} color={colors.text.dark} />
                <Text color={colors.text.dark} fontWeight="600">
                  {t("backToPractice")}
                </Text>
              </XStack>
            </Button>
            <Button
              backgroundColor="white"
              borderRadius="$full"
              paddingHorizontal="$6"
              pressStyle={{ opacity: 0.85 }}
              onPress={openShareSheet}
            >
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <Share2 size={16} color={colors.text.dark} />
                <Text color={colors.text.dark} fontWeight="600">
                  {tCheckIn("share_this_checkin")}
                </Text>
              </XStack>
            </Button>
          </YStack>
        </ScrollView>
        <EditCheckInModal
          visible={showEditModal}
          checkIn={checkIn}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateCheckIn}
        />
        <CommentSheet
          open={showComments}
          onOpenChange={setShowComments}
          title={tCommon("comments")}
        >
          <CommentSection targetType="checkin" targetId={checkInIdStr} />
        </CommentSheet>
        {showBrowseActivity && (
          <BrowseActivitySheet
            open={showBrowseActivity}
            onOpenChange={setShowBrowseActivity}
            commentCount={comments.length}
            reactors={reactors}
          />
        )}
        <ShareCheckInSheet
          open={isShareOpen}
          onOpenChange={(open) => {
            if (!open) closeShareSheet();
          }}
          practice={practice}
          streakCount={(practice.currentStreak ?? 0) + 1}
        />
      </YStack>
    </SafeAreaView>
  );
}
