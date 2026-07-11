import { ArrowRight, Edit3 } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";
import type { IPractice } from "@/types/practice";

function getPracticeId(practiceId: string | string[] | undefined): string {
  return Array.isArray(practiceId) ? (practiceId[0] ?? "") : (practiceId ?? "");
}

export default function PracticeCopySuccessScreen() {
  const router = useRouter();
  const { practiceId } = useLocalSearchParams<{ practiceId?: string | string[] }>();
  const id = getPracticeId(practiceId);
  const t = useMobileTranslation("mobile.practiceSuccess");
  const { data: practice, isLoading } = useSWR<IPractice>(
    id ? `/practices/${id}` : null,
    () => api.get<IPractice>(`/practices/${id}`),
    { revalidateOnFocus: false }
  );

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
        >
          <YStack alignItems="center" gap="$2">
            <Text fontSize={26} fontWeight="700" color="$color" textAlign="center">
              {t("copy_title")}
            </Text>
            <Text fontSize={14} color="$color" opacity={0.68} textAlign="center">
              {t("copy_description")}
            </Text>
          </YStack>

          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$3">
              <Spinner color={colors.primary.base} />
            </YStack>
          ) : practice ? (
            <YStack
              padding="$3"
              borderRadius="$md"
              borderWidth={1}
              borderColor={colors.border.light}
              backgroundColor={colors.background.veryLightGray}
              gap="$2"
            >
              <Text fontSize={16} fontWeight="600" color="$color">
                {practice.title}
              </Text>
              {practice.description ? (
                <Text fontSize={13} color="$color" opacity={0.62} numberOfLines={2}>
                  {practice.description}
                </Text>
              ) : null}
            </YStack>
          ) : null}

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
            <Button
              size="$5"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor={colors.border.light}
              onPress={() =>
                id ? router.replace(`/practices/${id}/edit` as never) : router.replace("/" as never)
              }
            >
              <XStack alignItems="center" gap="$2">
                <Edit3 size={18} color="$color" />
                <Text color="$color">{t("edit")}</Text>
              </XStack>
            </Button>
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
}
