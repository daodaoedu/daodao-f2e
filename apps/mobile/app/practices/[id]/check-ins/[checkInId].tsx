import { usePracticeCheckIns } from "@daodao/api";
import {
  Calendar,
  ChevronLeft,
  Image as ImageIcon,
  MessageSquare,
  Smile,
  Tag,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import {
  type ApiMoodType,
  MOOD_OPTIONS,
  type MoodType,
  mapApiMoodToMoodType,
} from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { usePractice } from "@/hooks/usePractices";

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
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CheckInsResponse = {
  data?: {
    data?: CheckInDetailRecord[];
  };
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "未提供日期";

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

export default function CheckInDetailScreen() {
  const { id, checkInId } = useLocalSearchParams<{ id: string; checkInId: string }>();
  const router = useRouter();
  const { practice, isLoading: isPracticeLoading, error: practiceError } = usePractice(id);
  const {
    data: checkInsData,
    error: checkInsError,
    isLoading: isCheckInsLoading,
  } = usePracticeCheckIns(id, { limit: 100, include: "images,tags" });

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

  const goToPractice = () => {
    router.push(`/practices/${id}` as `/practices/${string}`);
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
              accessibilityLabel="返回"
            >
              <ChevronLeft size={24} color="$color" />
            </Button>
            <Text fontSize={18} fontWeight="600" color="$color">
              打卡詳情
            </Text>
          </XStack>

          <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$5">
            <Text fontSize={16} fontWeight="600" color="$color">
              {error ? "讀取打卡失敗" : "找不到此打卡"}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
              請返回實踐頁後再試一次
            </Text>
            <Button backgroundColor={colors.primary.base} borderRadius="$md" onPress={goToPractice}>
              <Text color="white" fontWeight="600">
                返回實踐
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
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              打卡詳情
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={1}>
              {practice.title}
            </Text>
          </YStack>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          <YStack gap="$4">
            <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$4">
              <YStack gap="$2">
                <Text fontSize={12} color="$color" opacity={0.6}>
                  主題實踐
                </Text>
                <Text fontSize={20} fontWeight="700" color="$color">
                  {practice.title}
                </Text>
              </YStack>

              <XStack alignItems="center" gap="$2">
                <Calendar size={18} color={colors.primary.base} />
                <Text fontSize={14} color="$color">
                  {formatDateTime(checkIn.createdAt)}
                </Text>
              </XStack>

              {moodOption && (
                <XStack alignItems="center" gap="$2">
                  <Smile size={18} color={colors.primary.base} />
                  <Text fontSize={22}>{moodOption.emoji}</Text>
                  <Text fontSize={14} color="$color">
                    心情{moodOption.label}
                  </Text>
                </XStack>
              )}
            </Card>

            <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$3">
              <XStack alignItems="center" gap="$2">
                <MessageSquare size={18} color={colors.primary.base} />
                <Text fontSize={16} fontWeight="600" color="$color">
                  打卡筆記
                </Text>
              </XStack>
              <Text fontSize={15} lineHeight={24} color="$color" opacity={checkIn.note ? 1 : 0.5}>
                {checkIn.note || "這次打卡沒有留下筆記"}
              </Text>
            </Card>

            {tags.length > 0 && (
              <Card backgroundColor="white" borderRadius={12} padding="$4" gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Tag size={18} color={colors.primary.base} />
                  <Text fontSize={16} fontWeight="600" color="$color">
                    標籤
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
                    圖片
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
                返回實踐
              </Text>
            </Button>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
