import StampWhiteSvg from "@daodao/assets/images/dashboard/stamp-white.svg";
import DialogOutlineSvg from "@daodao/assets/images/icon/dialog-outline.svg";
import FlagOutlineSvg from "@daodao/assets/images/icon/flag-outline.svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Linking, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { CheckInCard } from "@/components/check-in/display/check-in-card";
import { CircleAvatar } from "@/components/layout/circle-avatar";
import { DropdownMenu } from "@/components/layout/dropdown-menu";
import { CommentSheet } from "@/components/persona/CommentSheet";
import { CommentSection } from "@/components/practice/detail/CommentSection";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import { Button } from "@/components/ui/button";
import { MOOD_EMOJI_SVG, MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { IShowcaseCheckIn } from "@/hooks/useFeed";
import {
  removeReaction,
  upsertReaction,
  useReactions,
  useReactionsList,
} from "@/hooks/useReactions";
import { useMobileTranslation } from "@/i18n";
import { runWithErrorAlert } from "@/utils/api-error";

const TALLY_REPORT_URL = "https://tally.so/r/BzGQy4";

/** colors.primary.base (#16B9B3) 的 0 alpha 版本，供封面漸層起頭用（避免經過透明黑）。 */
const COVER_GRADIENT_TRANSPARENT = "rgba(22, 185, 179, 0)";

type CheckInShowcaseCardProps = IShowcaseCheckIn;

/**
 * 打卡 Feed 卡片，對齊 apps/product 的 CheckInShowcaseCard
 */
export function CheckInShowcaseCard({
  id,
  checkin_date,
  mood,
  note,
  tags,
  image_urls,
  practice,
  user,
  comment_count,
  comment_preview,
}: CheckInShowcaseCardProps) {
  const t = useMobileTranslation("common");
  const checkInT = useMobileTranslation("check_in");
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const {
    currentUserReaction,
    totalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("checkin", id);
  const { firstReactorName } = useReactionsList("checkin", id);

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      await runWithErrorAlert(
        async () => {
          const isSelected = currentUserReaction === type;
          if (isSelected) {
            await removeReaction("checkin", id);
          } else {
            await upsertReaction("checkin", id, type);
          }
          await mutateReactions();
        },
        { title: t("errorTitle"), fallbackMessage: t("operationFailed") }
      );
    },
    [currentUserReaction, id, mutateReactions, t]
  );

  const frontendMood = mapApiMoodToMoodType(mood);
  const moodOption = frontendMood ? MOOD_OPTIONS.find((m) => m.id === frontendMood) : null;
  const MoodEmojiSvg = frontendMood ? MOOD_EMOJI_SVG[frontendMood] : null;
  const moodLabel = moodOption ? checkInT(`moods.${moodOption.id}`) : null;
  const hasContent = !!(note || (image_urls && image_urls.length > 0) || tags?.length);
  const isOwnCard = !!currentUser?.id && user?.id === currentUser.id;

  const dateParts = checkin_date.replace(/\./g, "-").split("-");
  const stampYear = dateParts[0] ?? "";
  const stampMonthDay = dateParts.slice(1).join("/");

  const handlePress = useCallback(() => {
    router.push(`/practices/${practice.id}/check-ins/${id}`);
  }, [router, practice.id, id]);

  const handleReport = useCallback(() => {
    setMenuOpen(false);
    Linking.openURL(TALLY_REPORT_URL);
  }, []);

  const preview = comment_preview?.slice(-2) ?? [];

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      {/* 封面區 */}
      <View backgroundColor={colors.primary.base} overflow="hidden" style={styles.cover}>
        {image_urls && image_urls.length > 0 ? (
          <Image
            source={{ uri: image_urls[0] }}
            style={styles.coverImage}
            resizeMode="cover"
            accessibilityLabel={t("checkin_cover")}
          />
        ) : hasContent ? (
          <View maxHeight={240} overflow="hidden" paddingTop="$4" pointerEvents="none">
            <CheckInCard
              taskTitle={practice.title}
              date={checkin_date}
              mood={frontendMood}
              content={note}
              tags={tags ?? []}
              images={[]}
              titleColor={colors.basic.white}
            />
          </View>
        ) : (
          <YStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$8">
            <Text
              color={colors.basic.white}
              fontWeight="600"
              fontSize={16}
              textAlign="center"
              paddingHorizontal="$6"
              numberOfLines={2}
            >
              {practice.title}
            </Text>
            {MoodEmojiSvg ? (
              <MoodEmojiSvg width={64} height={64} />
            ) : (
              <View width={64} height={64} />
            )}
            {moodLabel && (
              <Text color="rgba(255,255,255,0.7)" fontSize={12}>
                {moodLabel}
              </Text>
            )}
            <View
              position="absolute"
              right={12}
              bottom={12}
              width={100}
              height={100}
              opacity={0.8}
              pointerEvents="none"
            >
              <StampWhiteSvg width={100} height={100} />
              <View
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                alignItems="center"
                justifyContent="center"
              >
                <YStack alignItems="center" style={styles.stampDate}>
                  <Text fontSize={12} fontWeight="700" color={colors.basic.white}>
                    {stampYear}
                  </Text>
                  <Text fontSize={12} fontWeight="700" color={colors.basic.white}>
                    {stampMonthDay}
                  </Text>
                </YStack>
              </View>
            </View>
          </YStack>
        )}

        {/* 底部漸層：透明 → primary，讓封面內容平滑融入卡片底色。
            用 primary 的 0 alpha（非 "transparent"）起頭：expo-linear-gradient 的
            "transparent" 是透明「黑」(rgba(0,0,0,0))，插值到不透明 teal 會經過半透明黑，
            中段出現髒黑色帶。改用同色 0 alpha，只有 alpha 變化、不會經過黑色。 */}
        <LinearGradient
          colors={[COVER_GRADIENT_TRANSPARENT, colors.primary.base]}
          style={styles.coverGradient}
          pointerEvents="none"
        />
      </View>

      {/* 社群資訊區 */}
      <YStack
        backgroundColor={colors.basic.white}
        paddingHorizontal="$5"
        paddingTop="$4"
        paddingBottom="$5"
        gap="$4"
        style={styles.info}
      >
        <XStack alignItems="flex-start" gap="$4" position="relative">
          <CircleAvatar uri={user?.photo_url} size={64} fallbackText={user?.name ?? "?"} />

          {/* 心情 badge（疊在頭像右下角，相對於整行容器定位） */}
          {MoodEmojiSvg && (
            <View position="absolute" left={45} top={40} zIndex={10}>
              <MoodEmojiSvg width={24} height={24} />
            </View>
          )}

          <YStack flex={1} gap="$2">
            <Text fontSize={14} color={colors.text.muted}>
              {checkin_date}
            </Text>
            {note ? (
              <Text fontSize={16} color={colors.text.dark} numberOfLines={2}>
                {note}
              </Text>
            ) : (
              <Text fontSize={14} color={colors.text.muted}>
                {t("completed_checkin")}
              </Text>
            )}
          </YStack>

          {!isOwnCard && (
            <DropdownMenu
              open={menuOpen}
              onToggle={() => setMenuOpen((v) => !v)}
              items={[
                {
                  key: "report",
                  icon: <FlagOutlineSvg width={20} height={20} color={colors.primary.darker} />,
                  label: t("report"),
                  onPress: handleReport,
                },
              ]}
            />
          )}
        </XStack>

        <View borderTopWidth={1} borderTopColor={colors.basic["200"]} />

        <XStack alignItems="center" justifyContent="space-between">
          <ReactionPickerButton
            selectedReaction={currentUserReaction}
            onToggle={handleReactionToggle}
            variant="summary"
            totalCount={totalCount}
            displayReactions={displayReactions}
            firstReactorName={firstReactorName}
          />
          <Button chromeless onPress={() => setCommentsOpen(true)} paddingHorizontal={0}>
            <XStack alignItems="center" gap="$1.5">
              <DialogOutlineSvg width={24} height={24} color={colors.text.muted} />
              {(comment_count ?? 0) > 0 && (
                <Text fontSize={14} fontWeight="500" color={colors.text.muted}>
                  {comment_count}
                </Text>
              )}
            </XStack>
          </Button>
        </XStack>

        {preview.length > 0 && (
          <YStack gap="$2" borderTopWidth={1} borderTopColor={colors.basic["200"]} paddingTop="$3">
            {preview.map((comment) => {
              const commentUserName = comment.user?.name ?? t("anonymous");
              return (
                <XStack key={comment.id} alignItems="flex-start" gap="$2">
                  <CircleAvatar
                    uri={comment.user?.photo_url}
                    size={24}
                    fallbackText={commentUserName}
                    backgroundColor="#E8FAF9"
                    fallbackTextColor="#295E5C"
                    fallbackFontSize={10}
                  />
                  <XStack flex={1} flexWrap="wrap" alignItems="baseline" gap="$1">
                    <Text fontSize={12} fontWeight="600" color="#295E5C">
                      {commentUserName}
                    </Text>
                    <Text fontSize={12} color={colors.text.dark} numberOfLines={1} flexShrink={1}>
                      {comment.content}
                    </Text>
                  </XStack>
                </XStack>
              );
            })}
          </YStack>
        )}
      </YStack>

      <CommentSheet open={commentsOpen} onOpenChange={setCommentsOpen} title={t("comments")}>
        <CommentSection targetType="checkin" targetId={id} />
      </CommentSheet>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  cover: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  info: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  coverImage: {
    width: "100%",
    height: 240,
  },
  coverGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  stampDate: {
    transform: [{ rotate: "15deg" }],
  },
});
