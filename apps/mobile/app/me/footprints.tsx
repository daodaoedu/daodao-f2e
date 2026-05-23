import { useMyFootprints } from "@daodao/api";
import { ChevronLeft, Footprints, RefreshCw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileI18n, useMobileTranslation } from "@/i18n";

const PAGE_SIZE = 20;

const formatDate = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function FootprintsRoute() {
  const router = useRouter();
  const { locale } = useMobileI18n();
  const t = useMobileTranslation("mobile.footprints");
  const tCommon = useMobileTranslation("common");
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useMyFootprints(page);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const footprints = data?.data ?? [];
  const pagination = data?.pagination;
  const hasNextPage = Boolean(pagination?.hasNextPage);
  const hasPreviousPage = page > 1;
  const pageLabel = useMemo(() => {
    if (!pagination?.totalPages) return t("page_label", { page });
    return t("page_total_label", {
      page: pagination.currentPage,
      total: pagination.totalPages,
    });
  }, [page, pagination, t]);

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
        <Text fontSize={13} color="$color" opacity={0.6}>
          {t("subtitle")}
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
          {t("empty")}
        </Text>
        <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
          {t("empty_description")}
        </Text>
      </YStack>
    </YStack>
  );

  const renderError = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$8">
      <Text fontSize={17} fontWeight="600" color="$color">
        {t("load_failed")}
      </Text>
      <Text fontSize={14} color="$color" opacity={0.65} textAlign="center" lineHeight={21}>
        {error instanceof Error ? error.message : t("load_failed_description")}
      </Text>
      <Button backgroundColor={colors.primary.base} borderRadius="$md" onPress={() => mutate()}>
        <Text color="white" fontWeight="600">
          {t("refresh")}
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
            {t("previous_page")}
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
            {t("next_page")}
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
              {t("loading")}
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
                      {item.practiceDeleted ? t("deleted_practice") : item.practiceTitle}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.5}>
                      {formatDate(item.createdAt, locale)}
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
