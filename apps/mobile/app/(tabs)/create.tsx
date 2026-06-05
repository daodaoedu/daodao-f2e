import { useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

export default function CreateScreen() {
  const router = useRouter();
  const t = useMobileTranslation("practice");

  useEffect(() => {
    router.replace("/practices/create");
  }, [router]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap="$3"
        backgroundColor="$background"
      >
        <Spinner color={colors.primary.base} />
        <Text fontSize={14} color="$color" opacity={0.7}>
          {t("loading")}
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
