import { useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Image, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useAuth } from "@/providers/AuthProvider";
import { oauthService } from "@/services/oauth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mobileLoginImage = require("@/assets/images/mobile-login.png");

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
      await signIn(tokens, user, "google");
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
      await signIn(tokens, user, "apple");
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
      <YStack flex={1} justifyContent="space-between">
        {/* 上半部：標題 + 按鈕 */}
        <YStack paddingHorizontal="$5" paddingTop="$10" gap="$8">
          {/* 標題區域 */}
          <YStack alignItems="center" gap="$2">
            <Text fontSize={28} fontWeight="500" color={colors.basic.black}>
              歡迎回來島島阿學!
            </Text>
            <Text fontSize={16} color={colors.basic[600]} textAlign="center">
              建立你的學習小島，與社群夥伴一同成長
            </Text>
          </YStack>

          {/* 登入按鈕 */}
          <YStack gap="$3">
            {/* Apple Sign In - iOS only */}
            {Platform.OS === "ios" && isAppleAvailable && (
              <Button
                size="$5"
                backgroundColor={colors.basic.black}
                borderRadius={12}
                pressStyle={{ opacity: 0.8 }}
                onPress={handleAppleLogin}
                disabled={isLoading}
                accessibilityLabel="使用 Apple 登入"
                accessibilityRole="button"
              >
                {loadingProvider === "apple" ? (
                  <Spinner color={colors.basic.white} />
                ) : (
                  <XStack alignItems="center" gap="$2.5">
                    <Text color={colors.basic.white} fontSize={20}>

                    </Text>
                    <Text
                      color={colors.basic.white}
                      fontWeight="500"
                      fontSize={16}
                    >
                      Apple 帳號註冊 / 登入
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
              borderRadius={12}
              pressStyle={{ backgroundColor: colors.basic[50] }}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              accessibilityLabel="使用 Google 帳號登入"
              accessibilityRole="button"
            >
              {loadingProvider === "google" ? (
                <Spinner color={colors.primary.base} />
              ) : (
                <XStack alignItems="center" gap="$2.5">
                  <GoogleIcon size={20} />
                  <Text fontWeight="500" fontSize={16} color={colors.basic[800]}>
                    Google 帳號註冊 / 登入
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>

          {/* 服務條款 */}
          <YStack alignItems="center">
            <Text fontSize={13} color={colors.basic[600]} textAlign="center">
              註冊即代表您同意島島阿學的
            </Text>
            <XStack gap="$1.5">
              <Text
                fontSize={13}
                color={colors.primary.base}
                textDecorationLine="underline"
                onPress={() => Linking.openURL("https://daodao.so/terms/service")}
              >
                服務條款
              </Text>
              <Text fontSize={13} color={colors.basic[600]}>
                與
              </Text>
              <Text
                fontSize={13}
                color={colors.primary.base}
                textDecorationLine="underline"
                onPress={() => Linking.openURL("https://daodao.so/terms/privacy")}
              >
                隱私權政策
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* 底部插圖 */}
        <Image
          source={mobileLoginImage}
          width="100%"
          height={290}
          resizeMode="cover"
        />
      </YStack>
    </SafeAreaView>
  );
}
