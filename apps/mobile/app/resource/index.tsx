import { useInfiniteResources } from "@daodao/api";
import { BookOpen, ChevronLeft, Eye, MessageCircle, RefreshCw, Search } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Image, Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

const RESOURCE_LIMIT = "10";

const levelLabels = new Map([
  ["beginner", "初級"],
  ["intermediate", "中級"],
  ["expert", "進階"],
  ["all_levels", "不限程度"],
]);

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

export default function ResourceIndexRoute() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const params = useMemo(
    () => ({
      limit: RESOURCE_LIMIT,
      sort: "createdAt" as const,
      order: "desc" as const,
      query: submittedKeyword || undefined,
    }),
    [submittedKeyword]
  );
  const { data, error, isLoading, hasMore, loadMore, mutate, isValidating, totalCount } =
    useInfiniteResources(params);

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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              學習資源
            </Text>
            <Text fontSize={13} color="$color" opacity={0.6}>
              探索多元學習資源
            </Text>
          </YStack>
          <Button
            size="$4"
            circular
            chromeless
            onPress={handleRefresh}
            disabled={isRefreshing}
            accessibilityLabel="重新整理"
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
            <XStack gap="$2" alignItems="center">
              <Input
                flex={1}
                value={keyword}
                onChangeText={setKeyword}
                placeholder="搜尋資源名稱、描述或標籤"
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
                accessibilityLabel="搜尋"
              >
                <Search size={20} color={colors.basic.white} />
              </Button>
            </XStack>

            {typeof totalCount === "number" && (
              <Text fontSize={13} color="$color" opacity={0.55}>
                共 {totalCount} 筆資源
              </Text>
            )}

            {isLoading ? (
              <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$3">
                <Spinner size="large" color={colors.primary.base} />
                <Text fontSize={14} color="$color" opacity={0.55}>
                  載入中...
                </Text>
              </YStack>
            ) : error ? (
              <YStack alignItems="center" paddingVertical="$10" gap="$3">
                <Text fontSize={16} fontWeight="600" color="$color">
                  載入失敗
                </Text>
                <Text fontSize={14} color="$color" opacity={0.6}>
                  請稍後再試。
                </Text>
                <Button backgroundColor={colors.primary.base} borderRadius="$md" onPress={() => mutate()}>
                  <Text color="white" fontWeight="600">
                    重新整理
                  </Text>
                </Button>
              </YStack>
            ) : data.length === 0 ? (
              <YStack alignItems="center" paddingVertical="$10" gap="$3">
                <BookOpen size={40} color={colors.primary.base} />
                <Text fontSize={14} color="$color" opacity={0.55}>
                  這裡目前沒有符合條件的學習資源
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
                        <Text flex={1} fontSize={16} fontWeight="700" color="$color" numberOfLines={1}>
                          {resource.name}
                        </Text>
                        <Text fontSize={12} color={colors.primary.base} fontWeight="600">
                          {levelLabels.get(resource.level) ?? resource.level}
                        </Text>
                      </XStack>
                      <Text fontSize={14} color="$color" opacity={0.68} lineHeight={20} numberOfLines={2}>
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
                      {isValidating ? "載入中..." : "載入更多"}
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
