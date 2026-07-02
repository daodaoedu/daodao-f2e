import { BarChart3, Flag, MoreHorizontal, Telescope } from "@tamagui/lucide-icons";
import { useCallback, useState } from "react";
import { Linking } from "react-native";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { BrowseActivitySheet } from "@/components/practice/detail/BrowseActivitySheet";
import { colors } from "@/generated/design-tokens";
import { useComments } from "@/hooks/useComments";
import { followTarget, unfollowTarget, useFollowStatus } from "@/hooks/useFollow";
import { useReactionsList } from "@/hooks/useReactions";
import { useMobileTranslation } from "@/i18n";

const TALLY_REPORT_URL = "https://tally.so/r/BzGQy4";

interface PracticeMenuButtonProps {
  practiceId: string;
}

/**
 * 實踐卡片「更多」選單（檢舉/追蹤/瀏覽活動），對齊 PublicPracticeView 的既有實作
 */
export function PracticeMenuButton({ practiceId }: PracticeMenuButtonProps) {
  const t = useMobileTranslation("mobile.practiceDetail");
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseActivityOpen, setBrowseActivityOpen] = useState(false);

  const { isFollowing, mutate: mutateFollow } = useFollowStatus("practice", practiceId);
  const { comments } = useComments("practice", practiceId);
  const { items: reactors } = useReactionsList("practice", practiceId);

  const handleReport = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL(TALLY_REPORT_URL);
  }, []);

  const handleToggleFollow = useCallback(async () => {
    try {
      if (isFollowing) {
        await unfollowTarget("practice", practiceId);
      } else {
        await followTarget("practice", practiceId);
      }
      await mutateFollow();
    } catch {
      // 忽略錯誤，維持選單關閉即可，不中斷卡片瀏覽
    }
    setMenuOpen(false);
  }, [isFollowing, practiceId, mutateFollow]);

  const handleBrowseActivity = useCallback(() => {
    setMenuOpen(false);
    setBrowseActivityOpen(true);
  }, []);

  return (
    <View style={{ position: "relative" }}>
      <Button size="$3" circular chromeless hitSlop={8} onPress={() => setMenuOpen((v) => !v)}>
        <MoreHorizontal size={18} color="#9CA3AF" />
      </Button>

      {menuOpen && (
        <YStack
          position="absolute"
          right={0}
          top="100%"
          marginTop={4}
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
          <Button
            chromeless
            onPress={handleReport}
            justifyContent="flex-start"
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <XStack gap="$3" alignItems="center">
              <Flag size={18} color="#295E5C" />
              <Text fontSize={14} color="#295E5C">
                {t("report")}
              </Text>
            </XStack>
          </Button>
          <Button
            chromeless
            onPress={handleToggleFollow}
            justifyContent="flex-start"
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <XStack gap="$3" alignItems="center">
              <Telescope size={18} color={isFollowing ? colors.primary.base : "#295E5C"} />
              <Text fontSize={14} color={isFollowing ? colors.primary.base : "#295E5C"}>
                {isFollowing ? t("unfollow") : t("follow")}
              </Text>
            </XStack>
          </Button>
          <Button
            chromeless
            onPress={handleBrowseActivity}
            justifyContent="flex-start"
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <XStack gap="$3" alignItems="center">
              <BarChart3 size={18} color="#295E5C" />
              <Text fontSize={14} color="#295E5C">
                {t("browse_activity")}
              </Text>
            </XStack>
          </Button>
        </YStack>
      )}

      <BrowseActivitySheet
        open={browseActivityOpen}
        onOpenChange={setBrowseActivityOpen}
        commentCount={comments.length}
        reactors={reactors}
      />
    </View>
  );
}
