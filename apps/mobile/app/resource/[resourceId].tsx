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
import { useMobileTranslation } from "@/i18n";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
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
  const t = useMobileTranslation("mobile.resources");
  const tCommon = useMobileTranslation("common");
  const tOrValue = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === `mobile.resources.${key}` ? fallback : translated;
  };
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
        <Text fontSize={18} fontWeight="600" color="$color" numberOfLines={1}>
          {t("detail_title")}
        </Text>
        <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={1}>
          {resource?.name ?? t("title")}
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
              {t("loading")}
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
              {t("not_found")}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.65} textAlign="center">
              {t("not_found_description")}
            </Text>
            <Button
              backgroundColor={colors.primary.base}
              borderRadius="$md"
              onPress={() => mutate()}
            >
              <Text color="white" fontWeight="600">
                {t("refresh")}
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
                  {tOrValue(`level_${resource.level}`, resource.level)}
                </Text>
                <Text
                  fontSize={12}
                  color={colors.primary.base}
                  backgroundColor={colors.primary.palest}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$lg"
                >
                  {tOrValue(`type_${resource.type}`, resource.type)}
                </Text>
                <Text
                  fontSize={12}
                  color={colors.primary.base}
                  backgroundColor={colors.primary.palest}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$lg"
                >
                  {tOrValue(`cost_${resource.cost}`, resource.cost)}
                </Text>
              </XStack>

              <XStack gap="$4" alignItems="center">
                <Metric
                  icon={<Eye size={16} color={colors.text.light} />}
                  value={resource.viewCount}
                />
                <Metric
                  icon={<Heart size={16} color={colors.text.light} />}
                  value={resource.favoriteCount}
                />
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
                  {t("categories")}
                </Text>
                <XStack gap="$2" flexWrap="wrap" alignItems="center">
                  {majorCategory && (
                    <Button
                      size="$3"
                      borderRadius="$lg"
                      backgroundColor={colors.primary.palest}
                      onPress={() =>
                        router.push(`/resource/categories/${majorCategory.value}` as never)
                      }
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
              <Button
                flex={1}
                backgroundColor={colors.primary.base}
                borderRadius="$md"
                onPress={openResource}
              >
                <XStack gap="$2" alignItems="center">
                  <ExternalLink size={18} color={colors.basic.white} />
                  <Text color="white" fontWeight="600">
                    {t("open_resource")}
                  </Text>
                </XStack>
              </Button>
              <Button
                width={52}
                borderRadius="$md"
                borderColor="$borderColor"
                onPress={shareResource}
              >
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
                {t("introduction")}
              </Text>
              <Text fontSize={14} color="$color" opacity={0.72} lineHeight={22}>
                {resource.description}
              </Text>
              <XStack justifyContent="flex-end" gap="$2" alignItems="center">
                <Calendar size={14} color={colors.text.light} />
                <Text fontSize={12} color="$color" opacity={0.55}>
                  {t("updated_at", { date: formatDate(resource.updatedAt ?? resource.createdAt) })}
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
                  {t("reviews")}
                </Text>
                <Text fontSize={13} color="$color" opacity={0.55}>
                  {t("review_count", { count: resource.reviewCount || 0 })}
                </Text>
              </XStack>
              <Text
                fontSize={14}
                color="$color"
                opacity={0.65}
                textAlign="center"
                paddingVertical="$5"
              >
                {t("reviews_unavailable")}
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
                  {t("tags")}
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
                  {t("contributor")}
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
