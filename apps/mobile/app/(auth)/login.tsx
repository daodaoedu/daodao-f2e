import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useAuth } from "@/providers/AuthProvider";
import { oauthService } from "@/services/oauth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    oauthService.isAppleSignInAvailable().then(setIsAppleAvailable);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("google");

    try {
      const { tokens, user } = await oauthService.signInWithGoogle();
      await signIn(tokens, user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google 登入失敗";
      Alert.alert("登入失敗", message);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("apple");

    try {
      const { tokens, user } = await oauthService.signInWithApple();
      await signIn(tokens, user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Apple 登入失敗";
      if (message !== "The user canceled the authorization attempt") {
        Alert.alert("登入失敗", message);
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.light }}>
      <YStack flex={1} padding="$5" justifyContent="center">
        {/* Logo 區域 */}
        <YStack alignItems="center" marginBottom="$10">
          <Text fontSize={42} fontWeight="700" color={colors.primary.base} fontFamily="$heading">
            島島阿學
          </Text>
          <Text fontSize={16} color="$color" marginTop="$3" opacity={0.7} textAlign="center">
            每天一小步，成就大進步
          </Text>
        </YStack>

        {/* 登入按鈕 */}
        <YStack gap="$4" marginBottom="$8">
          {/* Apple Sign In - iOS only */}
          {Platform.OS === "ios" && isAppleAvailable && (
            <Button
              size="$5"
              backgroundColor={colors.basic.black}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleAppleLogin}
              disabled={isLoading}
              accessibilityLabel="使用 Apple 登入"
              accessibilityRole="button"
            >
              {loadingProvider === "apple" ? (
                <Spinner color={colors.basic.white} />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <Text color={colors.basic.white} fontSize={18}></Text>
                  <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                    使用 Apple 登入
                  </Text>
                </XStack>
              )}
            </Button>
          )}

          {/* Google Sign In */}
          <Button
            size="$5"
            backgroundColor={colors.basic.white}
            borderWidth={1}
            borderColor={colors.basic[200]}
            pressStyle={{ backgroundColor: colors.basic[50] }}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            accessibilityLabel="使用 Google 登入"
            accessibilityRole="button"
          >
            {loadingProvider === "google" ? (
              <Spinner color={colors.primary.base} />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Text fontSize={18} fontWeight="600" color="#4285F4">
                  G
                </Text>
                <Text fontWeight="600" fontSize={16}>
                  使用 Google 登入
                </Text>
              </XStack>
            )}
          </Button>
        </YStack>

        {/* 說明文字 */}
        <Text fontSize={12} color="$color" opacity={0.5} textAlign="center" paddingHorizontal="$4">
          登入即表示您同意我們的服務條款和隱私政策
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
