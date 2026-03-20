import { useMyPractices, useMyPracticeStats, useShowcaseFeed } from "@daodao/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView as RNScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { PracticeCard } from "@/components";
import { colors } from "@/generated/design-tokens";
import { authStorage } from "@/services/auth-storage";

type HomeTab = "mine" | "explore";

function MineTab() {
  const router = useRouter();
  const { data: practicesData, isLoading, mutate } = useMyPractices();
  const { data: statsData } = useMyPracticeStats();

  const allPractices = (practicesData?.data as any[]) ?? [];
  const inProgress = allPractices.filter(
    (p: any) =>
      p.status === "active" ||
      p.status === "draft" ||
      p.status === "not_started" ||
      p.status === "in-progress" ||
      p.status === "not-started"
  );
  const completed = allPractices.filter((p: any) => p.status === "completed");
  const stats = (statsData?.data as any) ?? null;

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={colors.primary.base} />
      </YStack>
    );
  }

  return (
    <RNScrollView
      style={{ flex: 1, backgroundColor: "transparent" }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleRefresh}
          tintColor={colors.primary.base}
        />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {stats && (
        <XStack paddingHorizontal="$5" paddingVertical="$3" gap="$4">
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={colors.primary.base}>
              {stats.currentStreak ?? 0}
            </Text>
            <Text fontSize={11} color={colors.text.muted}>
              連續登入天數
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={colors.primary.base}>
              {stats.totalCheckIns ?? 0}
            </Text>
            <Text fontSize={11} color={colors.text.muted}>
              總打卡次數
            </Text>
          </YStack>
        </XStack>
      )}

      <YStack paddingTop="$3" gap="$3">
        <XStack paddingHorizontal="$5">
          <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
            進行中
          </Text>
        </XStack>
        {inProgress.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {inProgress.map((practice: any) => (
              <PracticeCard
                key={practice.id}
                practice={practice as any}
                onPress={() => router.push(`/practices/${practice.id}`)}
                variant="gradient"
              />
            ))}
          </ScrollView>
        ) : (
          <YStack
            marginHorizontal="$5"
            padding="$6"
            alignItems="center"
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={14} color="$color" opacity={0.5}>
              還沒有進行中的實踐
            </Text>
          </YStack>
        )}
      </YStack>

      {completed.length > 0 && (
        <YStack paddingTop="$4" gap="$3" paddingHorizontal="$5">
          <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
            已完成
          </Text>
          {completed.map((practice: any) => (
            <PracticeCard
              key={practice.id}
              practice={practice as any}
              onPress={() => router.push(`/practices/${practice.id}`)}
              showCheckInButton={false}
              variant="completed"
            />
          ))}
        </YStack>
      )}
    </RNScrollView>
  );
}

function ExploreTab() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");
  const { practices, isLoading, hasMore, loadMore } = useShowcaseFeed({
    keyword: keyword || undefined,
    accessToken,
  });

  useEffect(() => {
    authStorage.getAccessToken().then((token) => {
      setAccessToken(token ?? undefined);
    });
  }, []);

  if (isLoading && practices.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={colors.primary.base} />
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      <XStack paddingHorizontal="$4" paddingVertical="$2">
        <Input
          flex={1}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜尋靈感..."
          fontSize={14}
          borderColor="$borderColor"
          focusStyle={{ borderColor: colors.primary.base }}
        />
      </XStack>
      <FlatList
        data={practices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/practices/${item.id}`)}>
            <YStack
              padding="$4"
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text
                fontSize={15}
                fontWeight="500"
                color={colors.text.dark}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {item.user?.name && (
                <Text fontSize={12} color={colors.text.muted} marginTop="$1">
                  {item.user.name}
                </Text>
              )}
            </YStack>
          </Pressable>
        )}
        onEndReached={() => {
          if (hasMore) loadMore();
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <YStack padding="$8" alignItems="center">
            <Text fontSize={14} color="$color" opacity={0.5}>
              沒有靈感內容
            </Text>
          </YStack>
        }
      />
    </YStack>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<HomeTab>("mine");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F8" }} edges={["top"]}>
      <XStack
        paddingHorizontal="$5"
        paddingVertical="$3"
        backgroundColor="#F7F8F8"
        borderBottomWidth={1}
        borderBottomColor="#E5E7EB"
      >
        <XStack backgroundColor="#EEEEEE" borderRadius={8} padding={2}>
          {(["mine", "explore"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.segmentButton, activeTab === tab && styles.segmentButtonActive]}
            >
              <Text
                fontSize={14}
                fontWeight={activeTab === tab ? "600" : "400"}
                color={activeTab === tab ? colors.text.dark : colors.text.muted}
              >
                {tab === "mine" ? "我的" : "靈感"}
              </Text>
            </Pressable>
          ))}
        </XStack>
      </XStack>
      {activeTab === "mine" ? <MineTab /> : <ExploreTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  segmentButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
