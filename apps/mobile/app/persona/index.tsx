import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { Button } from "@/components/ui/button";
import { useMobileTranslation } from "@/i18n";

export default function PersonaHomeScreen() {
  const router = useRouter();
  const t = useMobileTranslation("persona");
  const tCommon = useMobileTranslation("common");

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
            {t("tabLabelShort")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <PersonaProfileMe />
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
