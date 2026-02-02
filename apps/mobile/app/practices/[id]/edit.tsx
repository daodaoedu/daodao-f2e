import { ChevronLeft, Pencil } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

export default function PracticeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            編輯實踐
          </Text>
        </XStack>

        {/* Coming Soon */}
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$4">
          <Pencil size={64} color={colors.basic[300]} />
          <YStack alignItems="center" gap="$2">
            <Text fontSize={18} fontWeight="600" color="$color">
              即將推出
            </Text>
            <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
              編輯功能開發中{"\n"}敬請期待
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
