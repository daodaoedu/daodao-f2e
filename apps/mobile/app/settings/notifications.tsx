import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Switch, Text, XStack, YStack } from "tamagui";
import useSWR from "swr";
import { api } from "@/services/api-client";
import { colors } from "@/generated/design-tokens";
import { NOTIFICATION_TYPES } from "@/constants/settings";

interface INotificationPref {
  type: string;
  channel: string;
  isEnabled: boolean;
}

type PreferencesMapType = Record<string, { emailEnabled: boolean }>;

const DEFAULT_PREFS: PreferencesMapType = Object.fromEntries(
  NOTIFICATION_TYPES.map((t) => [t.type, { emailEnabled: true }])
);

export default function NotificationSettingsScreen() {
  const router = useRouter();

  const { data: prefsData, mutate } = useSWR<INotificationPref[]>(
    "/notifications/preferences",
    () => api.get<{ data: INotificationPref[] }>("/notifications/preferences").then((r) => r.data),
    { revalidateOnFocus: false }
  );

  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [prefs, setPrefs] = useState<PreferencesMapType>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!prefsData) return;
    const newPrefs: PreferencesMapType = { ...DEFAULT_PREFS };
    for (const p of prefsData) {
      if (p.channel === "N01" && newPrefs[p.type]) {
        newPrefs[p.type] = { emailEnabled: p.isEnabled };
      }
    }
    setPrefs(newPrefs);
  }, [prefsData]);

  const handleGlobalToggle = async (value: boolean) => {
    setGlobalEnabled(value);
    setIsSaving(true);
    try {
      await api.put("/notifications/preferences", { globalEnabled: value });
      mutate();
    } catch {
      setGlobalEnabled(!value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeToggle = async (notificationType: string, emailEnabled: boolean) => {
    const prev = prefs[notificationType];
    setPrefs((p) => ({ ...p, [notificationType]: { emailEnabled } }));
    setIsSaving(true);
    try {
      await api.put("/notifications/preferences", {
        preferences: [{ type: notificationType, channel: "N01", isEnabled: emailEnabled }],
      });
      mutate();
    } catch {
      setPrefs((p) => ({ ...p, [notificationType]: prev ?? { emailEnabled: true } }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">通知設定</Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* 全域開關 */}
            <Card backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor" overflow="hidden">
              <XStack padding="$4" alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} color="$color">通知總開關</Text>
                  <Text fontSize={12} color="$color" opacity={0.5}>
                    關閉後將停止所有 Email 通知，通知中心仍繼續累積
                  </Text>
                </YStack>
                <Switch
                  checked={globalEnabled}
                  onCheckedChange={handleGlobalToggle}
                  backgroundColor={globalEnabled ? colors.primary.base : colors.basic[300]}
                  disabled={isSaving}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>
            </Card>

            {/* Email 通知設定 */}
            <YStack gap="$3">
              <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                Email 通知設定
              </Text>
              <Card backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor" overflow="hidden">
                {NOTIFICATION_TYPES.map((item, index) => {
                  const isEnabled = prefs[item.type]?.emailEnabled ?? true;
                  return (
                    <XStack
                      key={item.type}
                      padding="$4"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottomWidth={index < NOTIFICATION_TYPES.length - 1 ? 1 : 0}
                      borderBottomColor="$borderColor"
                    >
                      <YStack flex={1} gap="$1">
                        <Text fontSize={14} color="$color">{item.label}</Text>
                        <Text fontSize={12} color="$color" opacity={0.5}>{item.description}</Text>
                      </YStack>
                      <Switch
                        checked={isEnabled && globalEnabled}
                        onCheckedChange={(v) => handleTypeToggle(item.type, v)}
                        backgroundColor={isEnabled && globalEnabled ? colors.primary.base : colors.basic[300]}
                        disabled={!globalEnabled || isSaving}
                      >
                        <Switch.Thumb />
                      </Switch>
                    </XStack>
                  );
                })}
              </Card>
            </YStack>

            <Text fontSize={12} color="$color" opacity={0.5} textAlign="center" paddingHorizontal="$4">
              In-App 通知中心（島嶼上的通知鈴）永遠開啟，只有 Email 可以關閉
            </Text>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
