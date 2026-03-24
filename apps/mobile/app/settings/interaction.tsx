import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Switch, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/services/api-client";

export default function InteractionSettingsScreen() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  const serverIsOpenProfile = (user as { isOpenProfile?: boolean })?.isOpenProfile ?? true;
  const [localIsOpenProfile, setLocalIsOpenProfile] = useState<boolean | null>(null);
  const isOpenProfile = localIsOpenProfile ?? serverIsOpenProfile;
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (value: boolean) => {
    setLocalIsOpenProfile(value);
    setIsSaving(true);
    try {
      await api.put("/users/me", { isOpenProfile: value });
    } catch {
      setLocalIsOpenProfile(null);
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
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            互動設定
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
                  公開我的實踐
                </Text>
                <Text fontSize={12} color="$color" opacity={0.5}>
                  開啟後，你的實踐將可以被搜尋展示
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
