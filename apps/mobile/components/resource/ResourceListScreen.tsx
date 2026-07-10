import { type IGetResourceListParams, useInfiniteResources } from "@daodao/api";
import {
  BookOpen,
  ChevronLeft,
  Eye,
  MessageCircle,
  RefreshCw,
  Search,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Image, Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_SUBCATEGORIES,
  type ResourceCategory,
} from "@/constants/resource";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

const RESOURCE_LIMIT = "10";

type ResourceListScreenProps = {
  title?: string;
  subtitle?: string;
  params?: Omit<IGetResourceListParams, "cursor" | "limit" | "query">;
  showMajorCategories?: boolean;
  subcategories?: ResourceCategory[];
};

function ResourceImage({ uri, name }: { uri?: string | null; name: string }) {
  if (!uri) {
    return (
      <YStack
        aspectRatio={320 / 180}
        borderRadius="$md"
        backgroundColor={colors.background.lightCyan}
        alignItems="center"
        justifyContent="center"
      >
        <BookOpen size={40} color={colors.primary.base} />
      </YStack>
    );
  }

  return (
    <Image
      source={{ uri }}
      accessibilityLabel={name}
      aspectRatio={320 / 180}
      borderRadius="$md"
      resizeMode="cover"
    />
  );
}

function CategoryCard({ category, onPress }: { category: ResourceCategory; onPress: () => void }) {
  return (
    <Card
      width="48%"
      minHeight={76}
      borderRadius="$md"
      overflow="hidden"
      pressStyle={{ opacity: 0.86 }}
      onPress={onPress}
      backgroundColor={colors.primary.base}
    >
      {category.image ? (
        <Image
          source={{ uri: category.image }}
          position="absolute"
          width="100%"
          height="100%"
          resizeMode="cover"
        />
      ) : null}
      <YStack
        flex={1}
        minHeight={76}
        alignItems="center"
        justifyContent="center"
        padding="$3"
        backgroundColor="rgba(0, 147, 154, 0.62)"
      >
        <Text color={colors.basic.white} fontSize={15} fontWeight="700" textAlign="center">
          {category.label}
        </Text>
      </YStack>
    </Card>
  );
}

export function ResourceListScreen({
  title,
  subtitle,
  params,
  showMajorCategories = true,
  subcategories,
}: ResourceListScreenProps) {
  const router = useRouter();
  const t = useMobileTranslation("mobile.resources");
  const tCommon = useMobileTranslation("common");
  const tOrValue = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === `mobile.resources.${key}` ? fallback : translated;
  };
  const effectiveTitle = title ?? t("title");
  const effectiveSubtitle = subtitle ?? t("description");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const listParams = useMemo(
    () => ({
      ...params,
      limit: RESOURCE_LIMIT,
      sort: "createdAt" as const,
      order: "desc" as const,
      query: submittedKeyword || undefined,
    }),
    [params, submittedKeyword]
  );
  const { data, error, isLoading, hasMore, loadMore, mutate, isValidating, totalCount } =
    useInfiniteResources(listParams);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = () => {
    setSubmittedKeyword(keyword.trim());
  };

  const visibleSubcategories =
    subcategories && subcategories.length > 0
      ? subcategories
      : params?.majorCategory
        ? (RESOURCE_SUBCATEGORIES[params.majorCategory] ?? [])
        : [];

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
              {effectiveTitle}
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6}>
              {effectiveSubtitle}
            </Text>
          </YStack>
          <Button
            size="$4"
            circular
            chromeless
            onPress={handleRefresh}
            disabled={isRefreshing}
            accessibilityLabel={t("refresh")}
          >
            <RefreshCw size={20} color="$color" />
          </Button>
        </XStack>

        <ScrollView
          flex={1}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          <YStack gap="$4">
            {showMajorCategories && (
              <YStack gap="$3">
                <Text fontSize={15} fontWeight="700" color="$color">
                  {t("categories")}
                </Text>
                <XStack flexWrap="wrap" gap="$3" justifyContent="space-between">
                  {RESOURCE_CATEGORIES.map((category) => (
                    <CategoryCard
                      key={category.value}
                      category={category}
                      onPress={() => router.push(`/resource/categories/${category.value}` as never)}
                    />
                  ))}
                </XStack>
              </YStack>
            )}

            {visibleSubcategories.length > 0 && (
              <YStack gap="$3">
                <Text fontSize={15} fontWeight="700" color="$color">
                  {t("subcategories")}
                </Text>
                <XStack flexWrap="wrap" gap="$2">
                  {visibleSubcategories.map((category) => {
                    const isSelected = params?.subCategory === category.value;
                    return (
                      <Button
                        key={category.value}
                        size="$3"
                        borderRadius="$lg"
                        backgroundColor={isSelected ? colors.primary.base : colors.primary.palest}
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() =>
                          router.push(
                            `/resource/categories/${params?.majorCategory}/${category.value}` as never
                          )
                        }
                      >
                        <Text
                          fontSize={13}
                          color={isSelected ? colors.basic.white : colors.primary.base}
                          fontWeight="600"
                        >
                          {category.label}
                        </Text>
                      </Button>
                    );
                  })}
                </XStack>
              </YStack>
            )}

            <XStack gap="$2" alignItems="center">
              <Input
                flex={1}
                value={keyword}
                onChangeText={setKeyword}
                placeholder={t("search_full_placeholder")}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                borderRadius="$md"
              />
              <Button
                width={48}
                height={48}
                borderRadius="$md"
                backgroundColor={colors.primary.base}
                onPress={handleSearch}
                accessibilityLabel={t("search")}
              >
                <Search size={20} color={colors.basic.white} />
              </Button>
            </XStack>

            {typeof totalCount === "number" && (
              <Text fontSize={13} color="$color" opacity={0.55}>
                {t("total_count", { count: totalCount })}
              </Text>
            )}

            {isLoading ? (
              <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$3">
                <Spinner size="large" color={colors.primary.base} />
                <Text fontSize={14} color="$color" opacity={0.55}>
                  {t("loading")}
                </Text>
              </YStack>
            ) : error ? (
              <YStack alignItems="center" paddingVertical="$10" gap="$3">
                <Text fontSize={16} fontWeight="600" color="$color">
                  {t("load_failed")}
                </Text>
                <Text fontSize={14} color="$color" opacity={0.6}>
                  {t("retry_later")}
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
            ) : data.length === 0 ? (
              <YStack alignItems="center" paddingVertical="$10" gap="$3">
                <BookOpen size={40} color={colors.primary.base} />
                <Text fontSize={14} color="$color" opacity={0.55}>
                  {t("empty_filtered")}
                </Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {data.map((resource) => (
                  <Card
                    key={resource.id}
                    backgroundColor="$background"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    padding="$3"
                    gap="$3"
                    pressStyle={{ opacity: 0.85 }}
                    onPress={() => router.push(`/resource/${resource.id}` as never)}
                  >
                    <ResourceImage uri={resource.imageUrl} name={resource.name} />
                    <YStack gap="$2">
                      <XStack alignItems="center" justifyContent="space-between" gap="$2">
                        <Text
                          flex={1}
                          fontSize={16}
                          fontWeight="700"
                          color="$color"
                          numberOfLines={1}
                        >
                          {resource.name}
                        </Text>
                        <Text fontSize={12} color={colors.primary.base} fontWeight="600">
                          {tOrValue(`level_${resource.level}`, resource.level)}
                        </Text>
                      </XStack>
                      <Text
                        fontSize={14}
                        color="$color"
                        opacity={0.68}
                        lineHeight={20}
                        numberOfLines={2}
                      >
                        {resource.description}
                      </Text>
                      {resource.tags.length > 0 && (
                        <XStack gap="$2" flexWrap="wrap">
                          {resource.tags.slice(0, 3).map((tag) => (
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
                      )}
                      <XStack gap="$4" alignItems="center">
                        <XStack gap="$1.5" alignItems="center">
                          <Eye size={14} color={colors.text.light} />
                          <Text fontSize={12} color="$color" opacity={0.55}>
                            {resource.viewCount}
                          </Text>
                        </XStack>
                        <XStack gap="$1.5" alignItems="center">
                          <MessageCircle size={14} color={colors.text.light} />
                          <Text fontSize={12} color="$color" opacity={0.55}>
                            {resource.reviewCount}
                          </Text>
                        </XStack>
                      </XStack>
                    </YStack>
                  </Card>
                ))}

                {hasMore && (
                  <Button
                    borderRadius="$md"
                    borderColor="$borderColor"
                    disabled={isValidating}
                    onPress={() => loadMore()}
                  >
                    <Text color="$color" fontWeight="600">
                      {isValidating ? t("loading") : t("load_more")}
                    </Text>
                  </Button>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
