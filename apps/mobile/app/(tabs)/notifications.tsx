import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>通知（建置中）</Text>
      </YStack>
    </SafeAreaView>
  );
}
