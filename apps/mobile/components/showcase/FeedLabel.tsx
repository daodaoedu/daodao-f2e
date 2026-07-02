import { CalendarCheck, Rss, ThumbsUp } from "@tamagui/lucide-icons";
import { Text, XStack } from "tamagui";
import type { FeedReasonType } from "@/hooks/useFeed";
import { useMobileTranslation } from "@/i18n";

interface FeedLabelProps {
  feedReason: FeedReasonType;
  userName?: string;
  practiceTitle?: string;
  latestActorName?: string;
}

/**
 * Feed 卡片上方的原因標籤，對齊 apps/product 的 FeedLabel
 */
export function FeedLabel({
  feedReason,
  userName,
  practiceTitle,
  latestActorName,
}: FeedLabelProps) {
  const t = useMobileTranslation("app_product");

  if (feedReason === "new_practice") {
    return (
      <XStack
        alignItems="center"
        gap="$1.5"
        marginTop="$4"
        marginBottom="$4"
        paddingHorizontal="$1"
      >
        <ThumbsUp size={14} color="rgba(51,51,51,0.6)" />
        <Text fontSize={12} color="rgba(51,51,51,0.6)">
          {t("showcase_feed_new_practice", { userName: userName ?? t("showcase_someone") })}
        </Text>
      </XStack>
    );
  }

  if (feedReason === "new_release") {
    return (
      <XStack
        alignItems="center"
        gap="$1.5"
        marginTop="$4"
        marginBottom="$4"
        paddingHorizontal="$1"
      >
        <Rss size={14} color="rgba(51,51,51,0.6)" />
        <Text fontSize={12} color="rgba(51,51,51,0.6)">
          {t("showcase_latest_published")}
        </Text>
      </XStack>
    );
  }

  if (feedReason === "checked_in") {
    return (
      <XStack
        alignItems="center"
        gap="$1.5"
        marginTop="$4"
        marginBottom="$4"
        paddingHorizontal="$1"
      >
        <CalendarCheck size={14} color="rgba(51,51,51,0.6)" />
        <Text fontSize={12} color="rgba(51,51,51,0.6)">
          {t("showcase_feed_checked_in", {
            userName: userName ?? t("showcase_someone"),
            practiceTitle: practiceTitle ?? t("showcase_fallback_practice"),
          })}
        </Text>
      </XStack>
    );
  }

  if (feedReason === "cheered") {
    return (
      <XStack
        alignItems="center"
        gap="$1.5"
        marginTop="$4"
        marginBottom="$4"
        paddingHorizontal="$1"
      >
        <ThumbsUp size={14} color="rgba(51,51,51,0.6)" />
        <Text fontSize={12} color="rgba(51,51,51,0.6)">
          {t("showcase_feed_cheered", { actorName: latestActorName ?? t("showcase_someone") })}
        </Text>
      </XStack>
    );
  }

  return null;
}
