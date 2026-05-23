import { useUserMutations } from "@daodao/api";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Switch, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMobileTranslation } from "@/i18n";

function assertSuccessfulResponse(response: { error?: unknown }) {
  if (!response.error) return;

  const error = response.error as { error?: { message?: string }; message?: string };
  throw new Error(error.error?.message ?? error.message ?? "Update failed. Please try again later.");
}

export default function InteractionSettingsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.interactionSettings");
  const tCommon = useMobileTranslation("common");
  const { user, isLoading } = useCurrentUser();
  const { updateCurrentUser } = useUserMutations();

  const serverIsOpenProfile = (user as { isOpenProfile?: boolean })?.isOpenProfile ?? true;
  const [localIsOpenProfile, setLocalIsOpenProfile] = useState<boolean | null>(null);
  const isOpenProfile = localIsOpenProfile ?? serverIsOpenProfile;
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (value: boolean) => {
    setLocalIsOpenProfile(value);
    setIsSaving(true);
    try {
      const response = await updateCurrentUser({ isOpenProfile: value });
      assertSuccessfulResponse(response);
    } catch (error) {
      setLocalIsOpenProfile(null);
      Alert.alert(
        t("errorTitle"),
        error instanceof Error ? error.message : t("saveError")
      );
    } finally {
      setIsSaving(false);
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
          <Card
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
          >
            <XStack padding="$4" alignItems="center" justifyContent="space-between">
              <YStack flex={1} gap="$1">
                <Text fontSize={15} color="$color">
                  {t("openProfileTitle")}
                </Text>
                <Text fontSize={12} color="$color" opacity={0.5}>
                  {t("openProfileDescription")}
                </Text>
              </YStack>
              <Switch
                checked={isOpenProfile}
                onCheckedChange={handleToggle}
                backgroundColor={isOpenProfile ? colors.primary.base : colors.basic[300]}
                disabled={isLoading || isSaving}
              >
                <Switch.Thumb />
              </Switch>
            </XStack>
          </Card>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
