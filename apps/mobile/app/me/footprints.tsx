import { useMyFootprints } from "@daodao/api";
import { ChevronLeft, Footprints, RefreshCw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

const PAGE_SIZE = 20;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function FootprintsRoute() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useMyFootprints(page);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const footprints = data?.data ?? [];
  const pagination = data?.pagination;
  const hasNextPage = Boolean(pagination?.hasNextPage);
  const hasPreviousPage = page > 1;
  const pageLabel = useMemo(() => {
    if (!pagination?.totalPages) return `第 ${page} 頁`;
    return `第 ${pagination.currentPage} / ${pagination.totalPages} 頁`;
  }, [page, pagination]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderHeader = () => (
    <XStack padding="$4" alignItems="center" gap="$3">
      <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
        <ChevronLeft size={24} color="$color" />
      </Button>
      <YStack flex={1}>
        <Text fontSize={18} fontWeight="600" color="$color">
          我的足跡
        </Text>
        <Text fontSize={13} color="$color" opacity={0.6}>
          回顧你留下的學習紀錄
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
  );

  const renderEmpty = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$8">
      <YStack
        width={72}
        height={72}
        borderRadius={36}
        backgroundColor={colors.basic[100]}
        alignItems="center"
        justifyContent="center"
      >
        <Footprints size={32} color={colors.primary.base} />
      </YStack>
      <YStack gap="$2" alignItems="center">
        <Text fontSize={17} fontWeight="600" color="$color">
          尚未有任何足跡
        </Text>
        <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
          完成打卡或留下學習紀錄後，足跡會出現在這裡。
        </Text>
      </YStack>
    </YStack>
  );

  const renderError = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$8">
      <Text fontSize={17} fontWeight="600" color="$color">
        載入失敗
      </Text>
      <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
        {error instanceof Error ? error.message : "無法載入足跡，請稍後再試。"}
      </Text>
      <Button backgroundColor={colors.primary.base} borderRadius="$md" onPress={() => mutate()}>
        <Text color="white" fontWeight="600">
          重新整理
        </Text>
      </Button>
    </YStack>
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalItems <= PAGE_SIZE) return null;

    return (
      <XStack alignItems="center" justifyContent="space-between" gap="$3" paddingTop="$2">
        <Button
          flex={1}
          borderRadius="$md"
          borderColor="$borderColor"
          disabled={!hasPreviousPage}
          opacity={hasPreviousPage ? 1 : 0.45}
          onPress={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
        >
          <Text color="$color" fontWeight="600">
            上一頁
          </Text>
        </Button>
        <Text fontSize={13} color="$color" opacity={0.55}>
          {pageLabel}
        </Text>
        <Button
          flex={1}
          borderRadius="$md"
          borderColor="$borderColor"
          disabled={!hasNextPage}
          opacity={hasNextPage ? 1 : 0.45}
          onPress={() => setPage((currentPage) => currentPage + 1)}
        >
          <Text color="$color" fontWeight="600">
            下一頁
          </Text>
        </Button>
      </XStack>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {renderHeader()}

        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
            <Spinner size="large" color={colors.primary.base} />
            <Text fontSize={14} color="$color" opacity={0.65}>
              正在載入足跡...
            </Text>
          </YStack>
        ) : error ? (
          renderError()
        ) : footprints.length === 0 ? (
          renderEmpty()
        ) : (
          <ScrollView
            flex={1}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            <YStack gap="$3">
              {footprints.map((item) => (
                <Card
                  key={item.id}
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                  padding="$4"
                  gap="$3"
                >
                  <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
                    <Text
                      flex={1}
                      fontSize={15}
                      fontWeight="600"
                      color={item.practiceDeleted ? "$color" : colors.text.dark}
                      opacity={item.practiceDeleted ? 0.45 : 1}
                      textDecorationLine={item.practiceDeleted ? "line-through" : "none"}
                      numberOfLines={1}
                      onPress={() => {
                        if (!item.practiceDeleted) router.push(`/practices/${item.practiceId}`);
                      }}
                    >
                      {item.practiceDeleted ? "內容已刪除" : item.practiceTitle}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.5}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </XStack>

                  <Text fontSize={14} color="$color" opacity={0.72} lineHeight={21} numberOfLines={3}>
                    {item.content}
                  </Text>
                </Card>
              ))}

              {renderPagination()}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </SafeAreaView>
  );
}
