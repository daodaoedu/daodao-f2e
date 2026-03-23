import { Image, StyleSheet } from "react-native";
import { Sheet, Text, View, XStack, YStack } from "tamagui";
import { REACTION_CONFIG } from "@/constants/reaction-type";
import { formatRelativeTime } from "@/utils/format-time";

interface Reactor {
  userId: string;
  name: string;
  photoURL?: string | null;
  reactionType: string;
  reactedAt: string;
}

interface BrowseActivitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentCount: number;
  reactors: Reactor[];
}

export function BrowseActivitySheet({
  open,
  onOpenChange,
  commentCount,
  reactors,
}: BrowseActivitySheetProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[60]}
      dismissOnSnapToBottom
      zIndex={100001}
    >
      <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame
        padding="$4"
        backgroundColor="$background"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
      >
        <Sheet.Handle backgroundColor="$borderColor" />

        <Text fontSize={18} fontWeight="600" marginBottom="$4">瀏覽活動</Text>

        <XStack gap="$6" marginBottom="$4">
          <YStack>
            <Text fontSize={12} color="rgba(0,0,0,0.5)">留言數</Text>
            <Text fontSize={20} fontWeight="600">{commentCount}</Text>
          </YStack>
          <YStack>
            <Text fontSize={12} color="rgba(0,0,0,0.5)">反應數</Text>
            <Text fontSize={20} fontWeight="600">{reactors.length}</Text>
          </YStack>
        </XStack>

        <YStack gap="$3">
          {reactors.map((reactor) => {
            const config = REACTION_CONFIG[reactor.reactionType as keyof typeof REACTION_CONFIG];
            return (
              <XStack key={`${reactor.userId}-${reactor.reactionType}`} alignItems="center" gap="$3">
                <View style={styles.avatar}>
                  {reactor.photoURL ? (
                    <Image source={{ uri: reactor.photoURL }} style={styles.avatarImage} />
                  ) : (
                    <Text fontSize={12} fontWeight="500" color="#295E5C">
                      {reactor.name.slice(0, 1)}
                    </Text>
                  )}
                </View>
                <Text fontSize={14} color="#1a1a1a" flex={1}>{reactor.name}</Text>
                <Text fontSize={16}>{config?.emoji ?? "👍"}</Text>
                <Text fontSize={12} color="#9FB5B8">{formatRelativeTime(reactor.reactedAt)}</Text>
              </XStack>
            );
          })}
          {reactors.length === 0 && (
            <Text textAlign="center" color="rgba(0,0,0,0.4)" fontSize={14} paddingVertical="$4">
              尚無活動紀錄
            </Text>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8FAF9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
