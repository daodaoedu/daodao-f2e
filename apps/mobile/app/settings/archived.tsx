import { useMyPractices, useUnarchivePractice } from "@daodao/api";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { useMobileTranslation } from "@/i18n";

interface IArchivedPractice {
  id: string;
  title: string;
  practiceAction?: string;
}

export default function ArchivedContentScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.archivedSettings");
  const tCommon = useMobileTranslation("common");
  const [unarchivingIds, setUnarchivingIds] = useState<Set<string>>(new Set());
  const { unarchivePractice } = useUnarchivePractice();

  const {
    data: practicesData,
    isLoading,
    error,
    mutate,
  } = useMyPractices({ status: "archived", limit: 100 });

  const items = (practicesData?.data ?? []) as IArchivedPractice[];

  const handleUnarchive = async (practiceId: string) => {
    if (unarchivingIds.has(practiceId)) return;
    setUnarchivingIds((prev) => new Set(prev).add(practiceId));
    try {
      await unarchivePractice(practiceId);
      await mutate();
    } catch {
      Alert.alert(t("errorTitle"), t("unarchiveError"));
    } finally {
      setUnarchivingIds((prev) => {
        const next = new Set(prev);
        next.delete(practiceId);
        return next;
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel={tCommon("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            {t("title")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                {t("loading")}
              </Text>
            </YStack>
          ) : error ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                {t("loadError")}
              </Text>
            </YStack>
          ) : items.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$8">
              <Text fontSize={14} color="$color" opacity={0.5}>
                {t("empty")}
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              <Text fontSize={15} fontWeight="600" color="$color" paddingLeft="$1">
                {t("practiceSection")}
              </Text>
              {items.map((practice) => (
                <Card
                  key={practice.id}
                  padding="$4"
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack alignItems="center" gap="$3">
                    <YStack flex={1}>
                      <Text fontSize={15} fontWeight="500" color="$color" numberOfLines={1}>
                        {practice.title}
                      </Text>
                      {practice.practiceAction && (
                        <Text fontSize={12} color="$color" opacity={0.5} numberOfLines={1}>
                          {practice.practiceAction}
                        </Text>
                      )}
                    </YStack>
                    <Button
                      size="$3"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={() => handleUnarchive(practice.id)}
                      disabled={unarchivingIds.has(practice.id)}
                    >
                      <Text fontSize={12} color="$color">
                        {unarchivingIds.has(practice.id) ? t("processing") : t("unarchive")}
                      </Text>
                    </Button>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
