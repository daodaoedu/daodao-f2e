/**
 * ShowcaseFeed
 *
 * 靈感頁的 Inspire Tab FlatList 包裝元件。
 * 封裝 footer/empty/skeleton 等重複邏輯，供首頁與靈感頁共用。
 */
import { useCallback } from "react";
import { FlatList, RefreshControl, View as RNView, StyleSheet } from "react-native";
import { Text, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { IShowcasePractice } from "@/hooks/useShowcaseFeed";
import { useMobileTranslation } from "@/i18n";

interface ShowcaseFeedProps {
  practices: IShowcasePractice[];
  isLoading: boolean;
  isValidating: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onRefresh: () => void;
  renderItem: ({ item }: { item: IShowcasePractice }) => React.ReactElement | null;
  renderHeader: () => React.ReactElement;
}

export function ShowcaseFeed({
  practices,
  isLoading,
  isValidating,
  hasMore,
  loadMore,
  onRefresh,
  renderItem,
  renderHeader,
}: ShowcaseFeedProps) {
  const t = useMobileTranslation("mobile.home");
  const renderFooter = useCallback(
    () =>
      isValidating ? (
        <Text textAlign="center" paddingVertical="$4" color="rgba(0,0,0,0.5)" fontSize={14}>
          {t("loading")}
        </Text>
      ) : null,
    [isValidating, t]
  );

  const renderEmpty = useCallback(
    () =>
      !isLoading ? (
        <YStack alignItems="center" paddingVertical="$8">
          <Text color="rgba(0,0,0,0.5)" fontSize={14}>
            {t("empty_showcase")}
          </Text>
        </YStack>
      ) : null,
    [isLoading, t]
  );

  if (isLoading && practices.length === 0) {
    return (
      <>
        {renderHeader()}
        <YStack paddingHorizontal="$4" gap="$3">
          {[1, 2, 3].map((i) => (
            <RNView key={i} style={styles.skeleton} />
          ))}
        </YStack>
      </>
    );
  }

  return (
    <FlatList
      data={practices}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 100 }}
      onEndReached={() => {
        if (hasMore && !isValidating) loadMore();
      }}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl refreshing={isValidating} onRefresh={onRefresh} tintColor={colors.primary.base} />
      }
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    height: 192,
    borderWidth: 1,
    borderColor: "#E8F8FF",
    opacity: 0.6,
  },
});
