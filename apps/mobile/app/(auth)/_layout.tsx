import { Stack } from "expo-router";
import { YStack } from "tamagui";

export default function AuthLayout() {
  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Stack.Screen name="login" />
      </Stack>
    </YStack>
  );
}
