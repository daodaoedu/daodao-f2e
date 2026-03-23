import { useCallback, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, TextInput } from "react-native";
import { Send, Pencil, Trash2 } from "@tamagui/lucide-icons";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import {
  type Comment,
  useComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/hooks/useComments";
import { useAuth } from "@/providers/AuthProvider";
import { formatRelativeTime } from "@/utils/format-time";

interface CommentSectionProps {
  targetType: string;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, mutate } = useComments(targetType, targetId);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

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
      Alert.alert("錯誤", editingId ? "編輯留言失敗" : "留言失敗，請稍後再試");
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, editingId, targetType, targetId, mutate]);

  const handleEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id);
    setInputValue(comment.content);
  }, []);

  const handleDelete = useCallback(
    (commentId: string) => {
      Alert.alert("刪除留言", "確定要刪除此留言嗎？", [
        { text: "取消", style: "cancel" },
        {
          text: "刪除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              await mutate();
            } catch {
              Alert.alert("錯誤", "刪除留言失敗");
            }
          },
        },
      ]);
    },
    [mutate]
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
            <Text color="rgba(0,0,0,0.4)" fontSize={14}>還沒有留言</Text>
          </YStack>
        ) : (
          comments.map((comment) => {
            const isOwner = user?.id === comment.user?.id;
            return (
              <XStack key={comment.id} gap="$2" alignItems="flex-start">
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
                      {comment.user?.name ?? "匿名"}
                    </Text>
                    <Text fontSize={11} color="#9FB5B8">
                      {formatRelativeTime(comment.createdAt)}
                    </Text>
                  </XStack>
                  <Text fontSize={14} color={colors.text.dark} marginTop={2}>
                    {comment.content}
                  </Text>
                </YStack>
                {isOwner && (
                  <XStack gap="$2">
                    <Pressable onPress={() => handleEdit(comment)} hitSlop={8}>
                      <Pencil size={14} color="#9FB5B8" />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(comment.id)} hitSlop={8}>
                      <Trash2 size={14} color="#9FB5B8" />
                    </Pressable>
                  </XStack>
                )}
              </XStack>
            );
          })
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
            <Text fontSize={12} color={colors.primary.base}>取消</Text>
          </Pressable>
        )}
        <TextInput
          style={styles.input}
          placeholder={editingId ? "編輯留言..." : "寫留言..."}
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
