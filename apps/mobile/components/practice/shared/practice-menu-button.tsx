import { BarChart3, Flag, Telescope } from "@tamagui/lucide-icons";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import { DropdownMenu } from "@/components/layout/dropdown-menu";
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
  const { comments = [] } = useComments("practice", practiceId);
  const { items: reactors = [] } = useReactionsList("practice", practiceId);

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
      Alert.alert(t("error_title"), t("operation_failed"));
    }
    setMenuOpen(false);
  }, [isFollowing, practiceId, mutateFollow, t]);

  const handleBrowseActivity = useCallback(() => {
    setMenuOpen(false);
    setBrowseActivityOpen(true);
  }, []);

  return (
    <>
      <DropdownMenu
        open={menuOpen}
        onToggle={() => setMenuOpen((v) => !v)}
        items={[
          {
            key: "report",
            icon: <Flag size={18} color="#295E5C" />,
            label: t("report"),
            onPress: handleReport,
          },
          {
            key: "follow",
            icon: <Telescope size={18} color={isFollowing ? colors.primary.base : "#295E5C"} />,
            label: isFollowing ? t("unfollow") : t("follow"),
            color: isFollowing ? colors.primary.base : undefined,
            onPress: handleToggleFollow,
          },
          {
            key: "browse",
            icon: <BarChart3 size={18} color="#295E5C" />,
            label: t("browse_activity"),
            onPress: handleBrowseActivity,
          },
        ]}
      />

      <BrowseActivitySheet
        open={browseActivityOpen}
        onOpenChange={setBrowseActivityOpen}
        commentCount={comments.length}
        reactors={reactors}
      />
    </>
  );
}
