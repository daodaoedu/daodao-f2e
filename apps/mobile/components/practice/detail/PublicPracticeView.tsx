import { useCallback, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, RefreshControl, StyleSheet } from "react-native";
import {
  ChevronLeft,
  Flag,
  MoreHorizontal,
  Telescope,
  BarChart3,
  Tag,
} from "@tamagui/lucide-icons";
import { Button, Card, ScrollView, Text, View, XStack, YStack } from "tamagui";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/generated/design-tokens";
import { getStatusConfig } from "@/constants/task-status";
import { useReactions, useReactionsList, upsertReaction, removeReaction } from "@/hooks/useReactions";
import { useComments } from "@/hooks/useComments";
import { useFollowStatus, followTarget, unfollowTarget } from "@/hooks/useFollow";
import { useCheckIns } from "@/hooks/usePractices";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import { CommentSection } from "./CommentSection";
import { BrowseActivitySheet } from "./BrowseActivitySheet";
import { PracticeTabBar, type PracticeTab } from "./PracticeTabBar";
import { CheckInList } from "@/components";
import type { ReactionTypeType } from "@/constants/reaction-type";

interface PublicPracticeViewProps {
  practice: {
    id: string;
    title: string;
    status: string;
    description?: string;
    practiceAction?: string;
    startDate?: string | null;
    endDate?: string | null;
    tags?: string[];
    frequencyMinDays?: number | null;
    frequencyMaxDays?: number | null;
    sessionDurationMinutes?: number | null;
    user?: {
      id: string;
      name: string;
      photoUrl?: string | null;
    };
  };
  onRefresh: () => Promise<void>;
}

const TALLY_REPORT_URL = "https://tally.so/r/BzGQy4";

export function PublicPracticeView({ practice, onRefresh }: PublicPracticeViewProps) {
  const router = useRouter();
  const {
    id, title, status, description, practiceAction,
    startDate, endDate, tags,
    frequencyMinDays, frequencyMaxDays, sessionDurationMinutes,
    user,
  } = practice;

  const [activeTab, setActiveTab] = useState<PracticeTab>("comments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseActivityOpen, setBrowseActivityOpen] = useState(false);

  const { currentUserReaction, totalCount, displayReactions, mutate: mutateReactions } =
    useReactions("practice", id);
  const { items: reactors, firstReactorName } = useReactionsList("practice", id);
  const { comments } = useComments("practice", id);
  const { isFollowing, mutate: mutateFollow } = useFollowStatus("practice", id);
  const { checkIns, error: checkInsError } = useCheckIns(id);

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      if (isSelected) {
        await removeReaction("practice", id);
      } else {
        await upsertReaction("practice", id, type);
      }
      await mutateReactions();
    },
    [currentUserReaction, id, mutateReactions]
  );

  const handleToggleFollow = useCallback(async () => {
    try {
      if (isFollowing) {
        await unfollowTarget("practice", id);
      } else {
        await followTarget("practice", id);
      }
      await mutateFollow();
    } catch {
      Alert.alert("錯誤", "操作失敗，請稍後再試");
    }
    setMenuOpen(false);
  }, [isFollowing, id, mutateFollow]);

  const handleReport = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL(TALLY_REPORT_URL);
  }, []);

  const handleBrowseActivity = useCallback(() => {
    setMenuOpen(false);
    setBrowseActivityOpen(true);
  }, []);

  const taskStatus = status === "active" ? "in-progress" : "completed";
  const statusInfo = getStatusConfig(taskStatus);
  const formatDate = (d?: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  };
  const startFmt = formatDate(startDate);
  const endFmt = formatDate(endDate);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        flex={1}
        backgroundColor="$background"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={colors.primary.base}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <XStack padding="$4" justifyContent="space-between" alignItems="center">
          <Button size="$4" circular chromeless onPress={() => router.back()}>
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={16} fontWeight="500" color="$color">主題實踐</Text>
          <Button size="$4" circular chromeless onPress={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal size={20} color="$color" />
          </Button>
        </XStack>

        {menuOpen && (
          <YStack
            position="absolute"
            right={16}
            top={60}
            zIndex={20}
            backgroundColor="white"
            borderRadius={16}
            paddingVertical="$2"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.15}
            shadowRadius={8}
            elevation={5}
            minWidth={140}
          >
            <Button chromeless onPress={handleReport} justifyContent="flex-start" paddingHorizontal="$4" paddingVertical="$3">
              <XStack gap="$3" alignItems="center">
                <Flag size={18} color="#295E5C" />
                <Text fontSize={14} color="#295E5C">檢舉</Text>
              </XStack>
            </Button>
            <Button chromeless onPress={handleToggleFollow} justifyContent="flex-start" paddingHorizontal="$4" paddingVertical="$3">
              <XStack gap="$3" alignItems="center">
                <Telescope size={18} color={isFollowing ? colors.primary.base : "#295E5C"} />
                <Text fontSize={14} color={isFollowing ? colors.primary.base : "#295E5C"}>
                  {isFollowing ? "取消關注" : "關注"}
                </Text>
              </XStack>
            </Button>
            <Button chromeless onPress={handleBrowseActivity} justifyContent="flex-start" paddingHorizontal="$4" paddingVertical="$3">
              <XStack gap="$3" alignItems="center">
                <BarChart3 size={18} color="#295E5C" />
                <Text fontSize={14} color="#295E5C">瀏覽活動</Text>
              </XStack>
            </Button>
          </YStack>
        )}

        <YStack paddingHorizontal="$5" gap="$4">
          <YStack alignItems="center" gap="$2">
            <XStack
              backgroundColor={taskStatus === "completed" ? "#6B7280" : colors.primary.base}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$sm"
            >
              <Text fontSize={12} color="white" fontWeight="500">{statusInfo?.label}</Text>
            </XStack>
            <Text fontSize={18} fontWeight="600" color="$color" textAlign="center" numberOfLines={2}>
              {title}
            </Text>
          </YStack>

          <Card backgroundColor="white" borderRadius={12} padding="$4" bordered>
            {startFmt && endFmt && (
              <Text fontSize={12} color="rgba(0,0,0,0.5)" marginBottom="$2">
                {startFmt} ▶ {endFmt}
              </Text>
            )}

            <XStack gap="$3" alignItems="flex-start" marginBottom="$3">
              {user && (
                <View style={styles.avatar}>
                  {user.photoUrl ? (
                    <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text fontSize={20} color="#9CA3AF">{(user.name ?? "?")[0]}</Text>
                  )}
                </View>
              )}
              <YStack flex={1}>
                {user && (
                  <Text fontSize={14} fontWeight="600" color="#295E5C" marginBottom="$1">
                    {user.name}
                  </Text>
                )}
                {(practiceAction || description) && (
                  <Text fontSize={14} color="rgba(0,0,0,0.8)" numberOfLines={3}>
                    {practiceAction || description}
                  </Text>
                )}
              </YStack>
            </XStack>

            {(frequencyMinDays || frequencyMaxDays || sessionDurationMinutes) && (
              <XStack gap="$4" marginBottom="$3">
                {(frequencyMinDays || frequencyMaxDays) && (
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="#16B9B3">
                      {frequencyMinDays === frequencyMaxDays
                        ? frequencyMinDays
                        : `${frequencyMinDays}-${frequencyMaxDays}`}
                    </Text>
                    <Text fontSize={14} color="rgba(0,0,0,0.6)" marginLeft={2}>天/週</Text>
                  </XStack>
                )}
                {sessionDurationMinutes && (
                  <XStack alignItems="center">
                    <Text fontSize={14} fontWeight="600" color="#16B9B3">{sessionDurationMinutes}</Text>
                    <Text fontSize={14} color="rgba(0,0,0,0.6)" marginLeft={2}>分鐘/次</Text>
                  </XStack>
                )}
              </XStack>
            )}

            {tags && tags.length > 0 && (
              <XStack flexWrap="wrap" gap="$2">
                {tags.map((tag) => (
                  <XStack
                    key={tag}
                    backgroundColor="#E0F4FF"
                    paddingHorizontal="$2"
                    paddingVertical={4}
                    borderRadius="$sm"
                    alignItems="center"
                    gap="$1"
                  >
                    <Tag size={14} color={colors.primary.lighter} />
                    <Text fontSize={12} color="$color">{tag}</Text>
                  </XStack>
                ))}
              </XStack>
            )}
          </Card>

          <Card backgroundColor="white" borderRadius={12} padding="$3" bordered>
            <ReactionPickerButton
              selectedReaction={currentUserReaction}
              onToggle={handleReactionToggle}
              variant="card"
              totalCount={totalCount}
              displayReactions={displayReactions}
              firstReactorName={firstReactorName}
            />
          </Card>

          <PracticeTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            commentCount={comments.length}
          />

          {activeTab === "comments" && (
            <CommentSection targetType="practice" targetId={id} />
          )}

          {activeTab === "checkins" && (
            checkInsError ? (
              <YStack alignItems="center" paddingVertical="$8">
                <Text color="rgba(0,0,0,0.4)" fontSize={14}>無法載入打卡紀錄</Text>
              </YStack>
            ) : (
              <CheckInList checkIns={checkIns || []} emptyText="尚無打卡紀錄" />
            )
          )}

          {activeTab === "resources" && (
            <YStack alignItems="center" paddingVertical="$8">
              <Text color="rgba(0,0,0,0.4)" fontSize={14}>尚無資源</Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      </KeyboardAvoidingView>

      <BrowseActivitySheet
        open={browseActivityOpen}
        onOpenChange={setBrowseActivityOpen}
        commentCount={comments.length}
        reactors={reactors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
