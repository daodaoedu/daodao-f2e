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

type Translator = ReturnType<typeof useMobileTranslation>;

function getFeedLabelContent(
  feedReason: FeedReasonType,
  userName: string | undefined,
  practiceTitle: string | undefined,
  latestActorName: string | undefined,
  t: Translator
) {
  switch (feedReason) {
    case "new_practice":
      return {
        Icon: ThumbsUp,
        text: t("showcase_feed_new_practice", { userName: userName ?? t("showcase_someone") }),
      };
    case "new_release":
      return { Icon: Rss, text: t("showcase_latest_published") };
    case "checked_in":
      return {
        Icon: CalendarCheck,
        text: t("showcase_feed_checked_in", {
          userName: userName ?? t("showcase_someone"),
          practiceTitle: practiceTitle ?? t("showcase_fallback_practice"),
        }),
      };
    case "cheered":
      return {
        Icon: ThumbsUp,
        text: t("showcase_feed_cheered", { actorName: latestActorName ?? t("showcase_someone") }),
      };
    default:
      return null;
  }
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
  const content = getFeedLabelContent(feedReason, userName, practiceTitle, latestActorName, t);

  if (!content) return null;

  const { Icon, text } = content;
  return (
    <XStack alignItems="center" gap="$1.5" marginTop="$4" marginBottom="$4" paddingHorizontal="$1">
      <Icon size={14} color="rgba(51,51,51,0.6)" />
      <Text fontSize={12} color="rgba(51,51,51,0.6)">
        {text}
      </Text>
    </XStack>
  );
}
