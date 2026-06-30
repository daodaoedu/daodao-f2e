import { ArrowRight, Home } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

function getPracticeId(practiceId: string | string[] | undefined): string {
  return Array.isArray(practiceId) ? (practiceId[0] ?? "") : (practiceId ?? "");
}

export default function PracticeCreateSuccessScreen() {
  const router = useRouter();
  const { practiceId } = useLocalSearchParams<{ practiceId?: string | string[] }>();
  const id = getPracticeId(practiceId);
  const t = useMobileTranslation("mobile.practiceSuccess");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack
        flex={1}
        backgroundColor="$background"
        padding="$5"
        justifyContent="center"
        alignItems="center"
        gap="$5"
      >
        <Card
          width="100%"
          padding="$5"
          borderRadius="$lg"
          backgroundColor={colors.background.light}
          borderWidth={1}
          borderColor={colors.border.light}
          gap="$4"
          alignItems="center"
        >
          <YStack
            width={72}
            height={72}
            borderRadius={36}
            backgroundColor={colors.primary.palest}
            alignItems="center"
            justifyContent="center"
          >
            <ArrowRight size={32} color={colors.primary.base} />
          </YStack>
          <YStack alignItems="center" gap="$2">
            <Text fontSize={26} fontWeight="700" color="$color" textAlign="center">
              {t("create_title")}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.68} textAlign="center">
              {t("create_description")}
            </Text>
          </YStack>
          <YStack width="100%" gap="$3">
            <Button
              size="$5"
              backgroundColor={colors.primary.base}
              onPress={() =>
                id ? router.replace(`/practices/${id}` as never) : router.replace("/" as never)
              }
            >
              <XStack alignItems="center" gap="$2">
                <ArrowRight size={18} color={colors.basic.white} />
                <Text color={colors.basic.white} fontWeight="600">
                  {t("start")}
                </Text>
              </XStack>
            </Button>
            <Button size="$5" chromeless onPress={() => router.replace("/" as never)}>
              <XStack alignItems="center" gap="$2">
                <Home size={18} color="$color" />
                <Text color="$color">{t("back_home")}</Text>
              </XStack>
            </Button>
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
}
