import { useResourceById } from "@daodao/api";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Image, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { getResourceCategory, getResourceSubcategory } from "@/constants/resource";
import { colors } from "@/generated/design-tokens";

const levelLabels = new Map([
  ["beginner", "初級"],
  ["intermediate", "中級"],
  ["expert", "進階"],
  ["all_levels", "不限程度"],
]);

const typeLabels = new Map([
  ["learning_platform_app", "學習平台 / App"],
  ["learning_tools", "學習工具"],
  ["books_articles", "書籍 / 文章"],
  ["video_content", "影音內容"],
  ["podcast_content", "Podcast"],
  ["workshops_courses", "工作坊 / 課程"],
  ["professional_certificates", "專業證照"],
  ["community_organization", "社群 / 組織"],
  ["other", "其他"],
]);

const costLabels = new Map([
  ["free", "免費"],
  ["paid", "付費"],
  ["partial_free", "部分免費"],
]);

const formatDate = (value?: string | null) => {
  if (!value) return "未知日期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function ResourceDetailRoute() {
  const router = useRouter();
  const { resourceId } = useLocalSearchParams<{ resourceId?: string | string[] }>();
  const id = Array.isArray(resourceId) ? resourceId[0] : resourceId;
  const { data, error, isLoading, mutate } = useResourceById(id ?? "");
  const resource = data?.data;
  const majorCategory = getResourceCategory(resource?.majorCategory);
  const subCategory = getResourceSubcategory(resource?.majorCategory, resource?.subCategory);

  const openResource = async () => {
    if (!resource?.url) return;
    const canOpen = await Linking.canOpenURL(resource.url);
    if (canOpen) await Linking.openURL(resource.url);
  };

  const shareResource = async () => {
    if (!resource) return;
    await Share.share({
      title: resource.name,
      message: `${resource.name}\n${resource.url}`,
      url: resource.url,
    });
  };

  const renderHeader = () => (
    <XStack padding="$4" alignItems="center" gap="$3">
      <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
        <ChevronLeft size={24} color="$color" />
      </Button>
      <YStack flex={1}>
        <Text fontSize={18} fontWeight="600" color="$color" numberOfLines={1}>
          資源詳情
        </Text>
        <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={1}>
          {resource?.name ?? "學習資源"}
        </Text>
      </YStack>
    </XStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
            <Spinner size="large" color={colors.primary.base} />
            <Text fontSize={14} color="$color" opacity={0.6}>
              載入中...
            </Text>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !resource) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} backgroundColor="$background">
          {renderHeader()}
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
            <BookOpen size={40} color={colors.primary.base} />
            <Text fontSize={16} fontWeight="600" color="$color">
              找不到資源
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center">
              資源可能已下架，或目前無法載入。
            </Text>
            <Button backgroundColor={colors.primary.base} borderRadius="$md" onPress={() => mutate()}>
              <Text color="white" fontWeight="600">
                重新整理
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
        {renderHeader()}
        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <YStack gap="$4">
            {resource.imageUrl ? (
              <Image
                source={{ uri: resource.imageUrl }}
                aspectRatio={320 / 180}
                borderRadius="$md"
                resizeMode="cover"
                accessibilityLabel={resource.name}
              />
            ) : (
              <YStack
                aspectRatio={320 / 180}
                borderRadius="$md"
                backgroundColor={colors.background.lightCyan}
                alignItems="center"
                justifyContent="center"
              >
                <BookOpen size={48} color={colors.primary.base} />
              </YStack>
            )}

            <YStack gap="$3">
              <Text fontSize={24} fontWeight="700" color="$color" lineHeight={31}>
                {resource.name}
              </Text>

              <XStack gap="$2" flexWrap="wrap">
                <Text
                  fontSize={12}
                  color={colors.primary.base}
                  backgroundColor={colors.primary.palest}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$lg"
                >
                  {levelLabels.get(resource.level) ?? resource.level}
                </Text>
                <Text
                  fontSize={12}
                  color={colors.primary.base}
                  backgroundColor={colors.primary.palest}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$lg"
                >
                  {typeLabels.get(resource.type) ?? resource.type}
                </Text>
                <Text
                  fontSize={12}
                  color={colors.primary.base}
                  backgroundColor={colors.primary.palest}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$lg"
                >
                  {costLabels.get(resource.cost) ?? resource.cost}
                </Text>
              </XStack>

              <XStack gap="$4" alignItems="center">
                <Metric icon={<Eye size={16} color={colors.text.light} />} value={resource.viewCount} />
                <Metric icon={<Heart size={16} color={colors.text.light} />} value={resource.favoriteCount} />
                <Metric
                  icon={<MessageCircle size={16} color={colors.text.light} />}
                  value={resource.reviewCount}
                />
              </XStack>
            </YStack>

            {(majorCategory || subCategory) && (
              <Card
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$4"
                gap="$3"
              >
                <Text fontSize={16} fontWeight="700" color="$color">
                  分類
                </Text>
                <XStack gap="$2" flexWrap="wrap" alignItems="center">
                  {majorCategory && (
                    <Button
                      size="$3"
                      borderRadius="$lg"
                      backgroundColor={colors.primary.palest}
                      onPress={() => router.push(`/resource/categories/${majorCategory.value}` as never)}
                    >
                      <Text fontSize={13} color={colors.primary.base} fontWeight="600">
                        {majorCategory.label}
                      </Text>
                    </Button>
                  )}
                  {subCategory && (
                    <Button
                      size="$3"
                      borderRadius="$lg"
                      backgroundColor={colors.primary.palest}
                      onPress={() =>
                        router.push(
                          `/resource/categories/${majorCategory?.value}/${subCategory.value}` as never
                        )
                      }
                    >
                      <Text fontSize={13} color={colors.primary.base} fontWeight="600">
                        {subCategory.label}
                      </Text>
                    </Button>
                  )}
                </XStack>
              </Card>
            )}

            <XStack gap="$2">
              <Button flex={1} backgroundColor={colors.primary.base} borderRadius="$md" onPress={openResource}>
                <XStack gap="$2" alignItems="center">
                  <ExternalLink size={18} color={colors.basic.white} />
                  <Text color="white" fontWeight="600">
                    查看資源
                  </Text>
                </XStack>
              </Button>
              <Button width={52} borderRadius="$md" borderColor="$borderColor" onPress={shareResource}>
                <Share2 size={18} color="$color" />
              </Button>
            </XStack>

            <Card
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <Text fontSize={16} fontWeight="700" color="$color">
                資源介紹
              </Text>
              <Text fontSize={14} color="$color" opacity={0.72} lineHeight={22}>
                {resource.description}
              </Text>
              <XStack justifyContent="flex-end" gap="$2" alignItems="center">
                <Calendar size={14} color={colors.text.light} />
                <Text fontSize={12} color="$color" opacity={0.55}>
                  更新於 {formatDate(resource.updatedAt ?? resource.createdAt)}
                </Text>
              </XStack>
            </Card>

            <Card
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$4"
              gap="$3"
            >
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize={16} fontWeight="700" color="$color">
                  心得
                </Text>
                <Text fontSize={13} color="$color" opacity={0.55}>
                  {resource.reviewCount || 0} 則
                </Text>
              </XStack>
              <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" paddingVertical="$5">
                心得分享功能尚未開放
              </Text>
            </Card>

            {resource.tags.length > 0 && (
              <Card
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$4"
                gap="$3"
              >
                <Text fontSize={16} fontWeight="700" color="$color">
                  標籤
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {resource.tags.map((tag) => (
                    <Text
                      key={tag}
                      fontSize={12}
                      color={colors.primary.base}
                      backgroundColor={colors.primary.palest}
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$lg"
                    >
                      #{tag}
                    </Text>
                  ))}
                </XStack>
              </Card>
            )}

            {resource.user && (
              <Card
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$4"
                gap="$2"
              >
                <Text fontSize={16} fontWeight="700" color="$color">
                  貢獻者
                </Text>
                <Text
                  fontSize={14}
                  color={colors.primary.base}
                  fontWeight="600"
                  onPress={() => router.push(`/users/${resource.user.id}`)}
                >
                  {resource.user.name}
                </Text>
              </Card>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

function Metric({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <XStack gap="$1.5" alignItems="center">
      {icon}
      <Text fontSize={13} color="$color" opacity={0.6}>
        {value}
      </Text>
    </XStack>
  );
}
