import { useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Image, Spinner, Text, XStack, YStack } from "tamagui";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";
import { oauthService } from "@/services/oauth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mobileLoginImage = require("@/assets/images/mobile-login.png");

function mapOAuthErrorMessage(message: string, t: (key: string) => string) {
  const errorMap: Record<string, string> = {
    "oauth.cancelled": "cancelled",
    "oauth.google_failed": "google_failed",
    "oauth.missing_auth_code": "missing_auth_code",
    "oauth.invalid_server_response": "invalid_server_response",
    "oauth.incomplete_user_data": "incomplete_user_data",
    "oauth.invalid_token": "invalid_token",
    "oauth.invalid_email": "invalid_email",
    "oauth.apple_failed": "apple_failed",
    "oauth.apple_missing_identity_token": "apple_missing_identity_token",
    "oauth.apple_invalid_server_response": "apple_invalid_server_response",
    "oauth.apple_incomplete_user_data": "apple_incomplete_user_data",
  };

  const key = errorMap[message];
  return key ? t(key) : message;
}

export default function LoginScreen() {
  const t = useMobileTranslation("mobile.auth");
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
      const message =
        err instanceof Error ? mapOAuthErrorMessage(err.message, t) : t("google_failed");
      Alert.alert(t("login_failed"), message);
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
      const rawMessage = err instanceof Error ? err.message : t("apple_failed");
      const message = mapOAuthErrorMessage(rawMessage, t);
      if (message !== "The user canceled the authorization attempt") {
        Alert.alert(t("login_failed"), message);
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
              {t("title")}
            </Text>
            <Text fontSize={16} color={colors.basic[600]} textAlign="center">
              {t("subtitle")}
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
                accessibilityLabel={t("apple_accessibility")}
                accessibilityRole="button"
              >
                {loadingProvider === "apple" ? (
                  <Spinner color={colors.basic.white} />
                ) : (
                  <XStack alignItems="center" gap="$2.5">
                    <Text color={colors.basic.white} fontSize={20}></Text>
                    <Text color={colors.basic.white} fontWeight="500" fontSize={16}>
                      {t("apple_login")}
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
              accessibilityLabel={t("google_accessibility")}
              accessibilityRole="button"
            >
              {loadingProvider === "google" ? (
                <Spinner color={colors.primary.base} />
              ) : (
                <XStack alignItems="center" gap="$2.5">
                  <GoogleIcon size={20} />
                  <Text fontWeight="500" fontSize={16} color={colors.basic[500]}>
                    {t("google_login")}
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>

          {/* 服務條款 */}
          <YStack alignItems="center">
            <Text fontSize={13} color={colors.basic[600]} textAlign="center">
              {t("terms_prefix")}
            </Text>
            <XStack gap="$1.5">
              <Text
                fontSize={13}
                color={colors.primary.base}
                textDecorationLine="underline"
                onPress={() => Linking.openURL("https://daodao.so/terms/service")}
              >
                {t("terms")}
              </Text>
              <Text fontSize={13} color={colors.basic[600]}>
                {t("and")}
              </Text>
              <Text
                fontSize={13}
                color={colors.primary.base}
                textDecorationLine="underline"
                onPress={() => Linking.openURL("https://daodao.so/terms/privacy")}
              >
                {t("privacy")}
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* 底部插圖 */}
        <Image source={mobileLoginImage} width="100%" height={290} resizeMode="cover" />
      </YStack>
    </SafeAreaView>
  );
}
