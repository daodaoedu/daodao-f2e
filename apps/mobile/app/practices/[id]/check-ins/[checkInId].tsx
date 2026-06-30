import { usePracticeCheckIns, useUpdatePracticeCheckIn } from "@daodao/api";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MessageSquare,
  Pencil,
  Smile,
  Tag,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Spinner, Text, TextArea, XStack, YStack } from "tamagui";
import { CheckInDateSelector } from "@/components/check-in/date-selector";
import { MoodSelector } from "@/components/check-in/form/components/mood-selector";
import { TagSelector } from "@/components/check-in/form/components/tag-selector";
import type { ICheckInDate, ICheckInDisplayData } from "@/components/check-in/types";
import {
  type ApiMoodType,
  MOOD_OPTIONS,
  type MoodType,
  mapApiMoodToMoodType,
  mapMoodTypeToApiMood,
} from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { usePractice } from "@/hooks/usePractices";
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
  data?: {
    data?: CheckInDetailRecord[];
  };
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
                maxLength={300}
              />
              <Text fontSize={12} color="$color" opacity={0.5} textAlign="right">
                {note.length}/300
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
  const { practice, isLoading: isPracticeLoading, error: practiceError } = usePractice(id);
  const {
    data: checkInsData,
    error: checkInsError,
    isLoading: isCheckInsLoading,
    mutate: mutateCheckIns,
  } = usePracticeCheckIns(id, { limit: 100, include: "images,tags" });
  const { updateCheckIn } = useUpdatePracticeCheckIn(id, String(checkInId));
  const [showEditModal, setShowEditModal] = useState(false);

  const checkIns = ((checkInsData as CheckInsResponse | undefined)?.data?.data ?? []) as
    | CheckInDetailRecord[]
    | undefined;

  const checkIn = useMemo(
    () => checkIns?.find((item) => String(item.id) === String(checkInId)),
    [checkIns, checkInId]
  );

  const mood = normalizeMood(checkIn?.mood);
  const moodOption = mood ? MOOD_OPTIONS.find((option) => option.id === mood) : null;
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
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              {t("title")}
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={1}>
              {practice.title}
            </Text>
          </YStack>
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => setShowEditModal(true)}
            accessibilityLabel={t("editTitle")}
          >
            <Pencil size={20} color="$color" />
          </Button>
        </XStack>
        <CheckInDateSelector
          checkInDates={checkInDates}
          checkIns={checkInsRecord}
          practiceId={id}
          activeCheckInId={String(checkInId)}
          onCheckInSelect={goToCheckIn}
        />

        <ScrollView flex={1} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          <YStack gap="$4">
            {sameDayTotal > 1 && (
              <XStack alignItems="center" justifyContent="space-between">
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
                <Text fontSize={15} fontWeight="600" color="$color">
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
            )}

            <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$4">
              <YStack gap="$2">
                <Text fontSize={12} color="$color" opacity={0.6}>
                  {t("practiceLabel")}
                </Text>
                <Text fontSize={20} fontWeight="700" color="$color">
                  {practice.title}
                </Text>
              </YStack>

              <XStack alignItems="center" gap="$2">
                <Calendar size={18} color={colors.primary.base} />
                <Text fontSize={14} color="$color">
                  {formatDate(toDateKey(checkIn))} · {formatDateTime(checkIn.createdAt)}
                </Text>
              </XStack>

              {moodOption && (
                <XStack alignItems="center" gap="$2">
                  <Smile size={18} color={colors.primary.base} />
                  <Text fontSize={22}>{moodOption.emoji}</Text>
                  <Text fontSize={14} color="$color">
                    {t("moodLabel", { mood: moodOption.label })}
                  </Text>
                </XStack>
              )}
            </Card>

            <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$3">
              <XStack alignItems="center" gap="$2">
                <MessageSquare size={18} color={colors.primary.base} />
                <Text fontSize={16} fontWeight="600" color="$color">
                  {t("noteLabel")}
                </Text>
              </XStack>
              <Text fontSize={15} lineHeight={24} color="$color" opacity={checkIn.note ? 1 : 0.5}>
                {checkIn.note || t("emptyNote")}
              </Text>
            </Card>

            {tags.length > 0 && (
              <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Tag size={18} color={colors.primary.base} />
                  <Text fontSize={16} fontWeight="600" color="$color">
                    {t("tags")}
                  </Text>
                </XStack>
                <XStack flexWrap="wrap" gap="$2">
                  {tags.map((tag) => (
                    <XStack
                      key={tag}
                      backgroundColor={colors.primary.palest}
                      borderRadius="$sm"
                      paddingHorizontal="$2"
                      paddingVertical={4}
                    >
                      <Text fontSize={13} color={colors.primary.darker}>
                        # {tag}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              </Card>
            )}

            {images.length > 0 && (
              <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$3">
                <XStack alignItems="center" gap="$2">
                  <ImageIcon size={18} color={colors.primary.base} />
                  <Text fontSize={16} fontWeight="600" color="$color">
                    {t("images")}
                  </Text>
                </XStack>
                <YStack gap="$3">
                  {images.map((imageUrl) => (
                    <Image
                      key={imageUrl}
                      source={{ uri: imageUrl }}
                      style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  ))}
                </YStack>
              </Card>
            )}

            <Button
              size="$5"
              backgroundColor={colors.primary.base}
              borderRadius="$md"
              onPress={goToPractice}
            >
              <Text color="white" fontWeight="600" fontSize={16}>
                {t("backToPractice")}
              </Text>
            </Button>
          </YStack>
        </ScrollView>
        <EditCheckInModal
          visible={showEditModal}
          checkIn={checkIn}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateCheckIn}
        />
      </YStack>
    </SafeAreaView>
  );
}
