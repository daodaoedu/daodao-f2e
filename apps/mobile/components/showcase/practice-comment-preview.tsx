import { Image, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import type { Comment } from "@/hooks/useComments";
import { useComments } from "@/hooks/useComments";
import { useMobileTranslation } from "@/i18n";
import { formatRelativeTime } from "@/utils/format-time";

interface PracticeCommentPreviewProps {
  practiceId: string;
}

/**
 * 顯示最新 2 則留言預覽，對齊 product PracticeShowcaseCard 的留言預覽區塊
 */
export function PracticeCommentPreview({ practiceId }: PracticeCommentPreviewProps) {
  const commonT = useMobileTranslation("common");
  const { comments } = useComments("practice", practiceId);

  const preview: Comment[] = comments.slice(-2);
  if (preview.length === 0) {
    return null;
  }

  return (
    <YStack gap="$2" borderTopWidth={1} borderTopColor="#E4EAE9" paddingTop="$3" marginTop="$3">
      {preview.map((comment) => {
        const commentUserName = comment.user?.name ?? commonT("anonymous");
        return (
          <XStack key={comment.id} alignItems="flex-start" gap="$2">
            <View style={styles.avatar}>
              {comment.user?.photoURL ? (
                <Image source={{ uri: comment.user.photoURL }} style={styles.avatarImage} />
              ) : (
                <Text fontSize={10} fontWeight="500" color={"#295E5C"}>
                  {commentUserName.slice(0, 1)}
                </Text>
              )}
            </View>
            <XStack flex={1} flexWrap="wrap" alignItems="baseline" gap="$1">
              <Text fontSize={12} fontWeight="600" color="#295E5C">
                {commentUserName}
              </Text>
              <Text fontSize={12} color={"#333333"} numberOfLines={1} flexShrink={1}>
                {comment.content}
              </Text>
            </XStack>
            <Text fontSize={11} color="#9FB5B8">
              {formatRelativeTime(comment.createdAt)}
            </Text>
          </XStack>
        );
      })}
    </YStack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8FAF9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 2,
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
