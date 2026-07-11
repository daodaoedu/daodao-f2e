import { parseTextLinks } from "@daodao/shared/lib/parse-text-links";
import { ChevronDown, Pencil, Send, Trash2 } from "@tamagui/lucide-icons";
import { useCallback, useMemo, useState } from "react";
import { Alert, Image, Linking, Pressable, StyleSheet, TextInput } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { ReactionPickerButton } from "@/components/reactions/ReactionPickerButton";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import {
  type Comment,
  createComment,
  deleteComment,
  updateComment,
  useComments,
} from "@/hooks/useComments";
import { removeReaction, upsertReaction, useReactions } from "@/hooks/useReactions";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { formatRelativeTime } from "@/utils/format-time";

interface CommentSectionProps {
  targetType: string;
  targetId: string;
}

/** 預設先顯示的留言數，超過才出現「顯示更多」 */
const PREVIEW_COUNT = 2;

type TranslateFn = ReturnType<typeof useMobileTranslation>;

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  t: TranslateFn;
}

function CommentItem({ comment, isOwner, onEdit, onDelete, t }: CommentItemProps) {
  const {
    currentUserReaction,
    totalCount,
    displayReactions,
    mutate: mutateReactions,
  } = useReactions("comment", comment.id);

  const contentSegments = useMemo(() => parseTextLinks(comment.content), [comment.content]);

  const handleOpenLink = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  }, []);

  const handleReactionToggle = useCallback(
    async (type: ReactionTypeType) => {
      const isSelected = currentUserReaction === type;
      if (isSelected) {
        await removeReaction("comment", comment.id);
      } else {
        await upsertReaction("comment", comment.id, type);
      }
      await mutateReactions();
    },
    [currentUserReaction, comment.id, mutateReactions]
  );

  return (
    <XStack gap="$2" alignItems="flex-start">
      <View style={styles.avatar}>
        {comment.user?.photoURL ? (
          <Image source={{ uri: comment.user.photoURL }} style={styles.avatarImage} />
        ) : (
          <Text fontSize={12} fontWeight="500" color="#295E5C">
            {(comment.user?.name ?? "?").slice(0, 1)}
          </Text>
        )}
      </View>
      <YStack flex={1}>
        <XStack alignItems="center" gap="$1.5">
          <Text fontSize={13} fontWeight="600" color="#295E5C">
            {comment.user?.name ?? t("anonymous")}
          </Text>
          <Text fontSize={11} color="#9FB5B8">
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </XStack>
        <Text fontSize={14} color={colors.text.dark} marginTop={2}>
          {contentSegments.map((segment, index) =>
            segment.type === "url" ? (
              <Text
                key={`url-${index}-${segment.value}`}
                color={colors.logo.cyan}
                textDecorationLine="underline"
                onPress={() => handleOpenLink(segment.value)}
              >
                {segment.value}
              </Text>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: 純文字片段，順序不會變動
              <Text key={`text-${index}`}>{segment.value}</Text>
            )
          )}
        </Text>
        <XStack marginTop="$1.5">
          <ReactionPickerButton
            selectedReaction={currentUserReaction}
            onToggle={handleReactionToggle}
            variant="summary"
            totalCount={totalCount}
            displayReactions={displayReactions}
          />
        </XStack>
      </YStack>
      {isOwner && (
        <XStack gap="$2">
          <Pressable onPress={() => onEdit(comment)} hitSlop={8}>
            <Pencil size={14} color="#9FB5B8" />
          </Pressable>
          <Pressable onPress={() => onDelete(comment.id)} hitSlop={8}>
            <Trash2 size={14} color="#9FB5B8" />
          </Pressable>
        </XStack>
      )}
    </XStack>
  );
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const t = useMobileTranslation("mobile.comments");
  const { user } = useAuth();
  const { comments, mutate } = useComments(targetType, targetId);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasMoreComments = comments.length > PREVIEW_COUNT;
  const visibleComments =
    hasMoreComments && !expanded ? comments.slice(0, PREVIEW_COUNT) : comments;

  const handleSubmit = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    setIsSending(true);
    try {
      if (editingId) {
        await updateComment(editingId, content);
        setEditingId(null);
      } else {
        await createComment(targetType, targetId, content);
      }
      setInputValue("");
      await mutate();
    } catch {
      Alert.alert(t("error_title"), editingId ? t("edit_failed") : t("create_failed"));
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, editingId, targetType, targetId, mutate, t]);

  const handleEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id);
    setInputValue(comment.content);
  }, []);

  const handleDelete = useCallback(
    (commentId: string) => {
      Alert.alert(t("delete_title"), t("delete_message"), [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete_confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              await mutate();
            } catch {
              Alert.alert(t("error_title"), t("delete_failed"));
            }
          },
        },
      ]);
    },
    [mutate, t]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setInputValue("");
  }, []);

  return (
    <YStack flex={1}>
      <YStack gap="$3" paddingVertical="$3">
        {comments.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$8">
            <Text color="rgba(0,0,0,0.4)" fontSize={14}>
              {t("empty")}
            </Text>
          </YStack>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={user?.id === comment.user?.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                t={t}
              />
            ))}
            {hasMoreComments && (
              <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
                <XStack alignItems="center" justifyContent="center" gap="$1" paddingVertical="$1">
                  <Text fontSize={13} color="#9FB5B8">
                    {expanded ? t("show_less") : t("show_more")}
                  </Text>
                  <View style={expanded ? styles.chevronUp : undefined}>
                    <ChevronDown size={16} color="#9FB5B8" />
                  </View>
                </XStack>
              </Pressable>
            )}
          </>
        )}
      </YStack>

      <XStack
        borderTopWidth={1}
        borderTopColor="#E4EAE9"
        paddingVertical="$2"
        gap="$2"
        alignItems="center"
      >
        {editingId && (
          <Pressable onPress={cancelEdit}>
            <Text fontSize={12} color={colors.primary.base}>
              {t("cancel")}
            </Text>
          </Pressable>
        )}
        <TextInput
          style={styles.input}
          placeholder={editingId ? t("edit_placeholder") : t("placeholder")}
          placeholderTextColor="#9CA3AF"
          value={inputValue}
          onChangeText={setInputValue}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!inputValue.trim() || isSending}
          style={{ opacity: inputValue.trim() ? 1 : 0.4 }}
        >
          <Send size={20} color={colors.primary.base} />
        </Pressable>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8FAF9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 2,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  chevronUp: {
    transform: [{ rotate: "180deg" }],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F7F7F7",
    borderRadius: 20,
    maxHeight: 80,
  },
});
