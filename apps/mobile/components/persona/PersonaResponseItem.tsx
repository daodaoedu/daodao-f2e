import type { PersonaQuestionAnswerItem } from "@daodao/api";
import { MessageCircle } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable } from "react-native";
import { Card, Text, View, XStack, YStack } from "tamagui";
import { CommentSection } from "@/components/practice/detail/CommentSection";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { useComments } from "@/hooks/useComments";
import { removeReaction, upsertReaction, useReactions } from "@/hooks/useReactions";
import { useMobileTranslation } from "@/i18n";
import { runWithErrorAlert } from "@/utils/api-error";
import { CommentSheet } from "./CommentSheet";

const AVATAR_COLORS = ["#F5A93E", "#16B9B3", "#9B8FE0", "#5BA58C", "#E07B7B", "#F5C842", "#7BB8E0"];

function getAvatarColor(name: string) {
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? "#16B9B3";
}

interface PersonaResponseItemProps {
  item: PersonaQuestionAnswerItem;
}

export function PersonaResponseItem({ item }: PersonaResponseItemProps) {
  const t = useMobileTranslation("persona.detail");
  const commonT = useMobileTranslation("common");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const answerId = String(item.answerId);
  const answerText = item.selectedValue ?? item.textAnswer ?? "";
  const displayName = item.name ?? t("anonymousUser");
  const initial = displayName.slice(0, 1);
  const isLong = answerText.length > 70;
  const avatarColor = item.isSelf ? colors.primary.base : getAvatarColor(displayName);
  const profileLink = item.customId || item.userId;

  const {
    currentUserReaction,
    totalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("persona_answer", answerId);
  const { comments } = useComments("persona_answer", answerId);

  const handleReactionToggle = async (type: ReactionTypeType) => {
    await runWithErrorAlert(
      async () => {
        const isSelected = currentUserReaction === type;
        if (isSelected) {
          await removeReaction("persona_answer", answerId);
        } else {
          await upsertReaction("persona_answer", answerId, type);
        }
        await mutateReactions();
      },
      { title: commonT("errorTitle"), fallbackMessage: commonT("operationFailed") }
    );
  };

  const handlePressAvatar = () => {
    if (item.userId && profileLink) {
      router.push(`/users/${profileLink}`);
    }
  };

  return (
    <Card
      backgroundColor={item.isSelf ? `${colors.primary.base}0F` : "$background"}
      borderWidth={1}
      borderColor={item.isSelf ? `${colors.primary.base}33` : colors.gray.light}
      borderRadius="$md"
      padding="$3"
    >
      <XStack gap="$3" alignItems="flex-start">
        <Pressable onPress={handlePressAvatar}>
          <View
            width={36}
            height={36}
            borderRadius={18}
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            backgroundColor={avatarColor}
          >
            {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={{ width: 36, height: 36 }} />
            ) : (
              <Text color="white" fontSize={14} fontWeight="700">
                {initial}
              </Text>
            )}
          </View>
        </Pressable>

        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2">
            <Pressable onPress={handlePressAvatar}>
              <Text
                fontSize={14}
                fontWeight="600"
                color={item.isSelf ? colors.primary.base : "$color"}
              >
                {displayName}
              </Text>
            </Pressable>
            {item.isSelf && (
              <Text
                fontSize={10}
                color={colors.primary.base}
                backgroundColor={colors.primary.palest}
                borderRadius="$lg"
                paddingHorizontal="$2"
                paddingVertical={2}
              >
                {t("myAnswer")}
              </Text>
            )}
          </XStack>

          <Text
            fontSize={14}
            color="$color"
            opacity={0.75}
            numberOfLines={expanded ? undefined : 2}
          >
            {answerText}
          </Text>

          {isLong && (
            <Pressable onPress={() => setExpanded((v) => !v)}>
              <Text fontSize={12} color={colors.primary.base}>
                {expanded ? t("collapse") : t("expand")}
              </Text>
            </Pressable>
          )}
        </YStack>
      </XStack>

      <XStack
        marginTop="$3"
        paddingTop="$2"
        borderTopWidth={1}
        borderTopColor={colors.gray.light}
        justifyContent="space-around"
        alignItems="center"
      >
        <ReactionPickerButton
          selectedReaction={currentUserReaction}
          onToggle={handleReactionToggle}
          variant="card"
          totalCount={totalCount}
          displayReactions={displayReactions}
        />
        <Pressable onPress={() => setCommentsOpen(true)}>
          <XStack alignItems="center" gap="$1.5" paddingHorizontal="$3" paddingVertical="$1">
            <MessageCircle size={20} color={colors.text.dark} />
            {comments.length > 0 && (
              <Text fontSize={14} fontWeight="500" color={colors.text.dark}>
                {comments.length}
              </Text>
            )}
          </XStack>
        </Pressable>
      </XStack>

      <CommentSheet open={commentsOpen} onOpenChange={setCommentsOpen} title={t("commentsTitle")}>
        <CommentSection targetType="persona_answer" targetId={answerId} />
      </CommentSheet>
    </Card>
  );
}
