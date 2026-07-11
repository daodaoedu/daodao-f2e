import ArrowRightOutlineSvg from "@daodao/assets/images/icon/arrow-right-outline.svg";
import featureHappyJson from "@daodao/assets/images/quiz/feature-happy.json";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

const AUTO_REDIRECT_SECONDS = 11;

function getPracticeId(practiceId: string | string[] | undefined): string {
  return Array.isArray(practiceId) ? (practiceId[0] ?? "") : (practiceId ?? "");
}

export default function PracticeCreateSuccessScreen() {
  const router = useRouter();
  const { practiceId } = useLocalSearchParams<{ practiceId?: string | string[] }>();
  const id = getPracticeId(practiceId);
  const t = useMobileTranslation("mobile.practiceSuccess");
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);

  const goHome = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);

  const goStart = useCallback(() => {
    if (id) {
      router.replace(`/practices/${id}`);
    } else {
      goHome();
    }
  }, [id, router, goHome]);

  // 對齊 product：倒數後自動回到首頁
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      goHome();
    }
  }, [countdown, goHome]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.basic.white }}
      edges={["top", "bottom"]}
    >
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$5" gap="$2">
        {/* 標題 */}
        <Text fontSize={28} fontWeight="600" color={colors.text.dark} textAlign="center">
          {t("create_title")}
        </Text>
        <Text fontSize={14} color={colors.text.dark} textAlign="center">
          {t("create_description")}
        </Text>

        {/* 角色動畫 */}
        <LottieView source={featureHappyJson} autoPlay loop style={styles.lottie} />

        {/* 鼓勵文字 */}
        <YStack alignItems="center" gap="$1" marginBottom="$5">
          <Text fontSize={14} color={colors.logo.cyan} textAlign="center">
            {t("progress")}
          </Text>
          <Text fontSize={14} color={colors.logo.cyan} textAlign="center">
            {t("next")}
          </Text>
        </YStack>

        {/* 主要 CTA */}
        <Button
          size="$5"
          width="100%"
          maxWidth={288}
          backgroundColor={colors.logo.orange}
          pressStyle={{ opacity: 0.85 }}
          onPress={goStart}
        >
          <XStack alignItems="center" gap="$2">
            <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
              {t("start")}
            </Text>
            <ArrowRightOutlineSvg width={18} height={18} color={colors.basic.white} />
          </XStack>
        </Button>

        {/* 次要：回到主頁 */}
        <Button size="$4" chromeless onPress={goHome}>
          <XStack alignItems="center" gap="$2">
            <Text color={colors.text.dark}>{t("back_home")}</Text>
            <ArrowRightOutlineSvg width={16} height={16} color={colors.text.dark} />
          </XStack>
        </Button>

        {/* 倒數提示 */}
        <Text fontSize={13} color={colors.text.muted}>
          {t("countdown", { count: countdown })}
        </Text>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 300,
    height: 220,
  },
});
