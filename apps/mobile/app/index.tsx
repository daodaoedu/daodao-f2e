import { Redirect } from "expo-router";
import { Spinner, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useAuth } from "@/providers/AuthProvider";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color={colors.primary.base} />
      </YStack>
    );
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}
