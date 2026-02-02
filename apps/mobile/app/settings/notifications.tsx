import { Bell, ChevronLeft, Clock, MessageSquare, Trophy } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Switch, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { notificationService } from "@/services/notifications";

interface NotificationSetting {
  key: string;
  icon: typeof Bell;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationSettingsScreen() {
  const router = useRouter();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      key: "dailyReminder",
      icon: Clock,
      title: "每日提醒",
      description: "在設定的時間提醒你打卡",
      enabled: true,
    },
    {
      key: "achievements",
      icon: Trophy,
      title: "成就通知",
      description: "達成里程碑時收到通知",
      enabled: true,
    },
    {
      key: "social",
      icon: MessageSquare,
      title: "社群通知",
      description: "有人互動時收到通知",
      enabled: false,
    },
  ]);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkPermission = async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const toggleSetting = (key: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
  };

  const requestPermission = async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
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
            通知設定
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Permission Warning */}
            {hasPermission === false && (
              <Card
                padding="$4"
                backgroundColor={`${colors.semantic.warning}15`}
                borderRadius="$md"
                borderWidth={1}
                borderColor={`${colors.semantic.warning}30`}
              >
                <YStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <Bell size={20} color={colors.semantic.warning} />
                    <Text fontSize={15} fontWeight="600" color={colors.semantic.warning}>
                      通知權限未開啟
                    </Text>
                  </XStack>
                  <Text fontSize={13} color="$color" opacity={0.7}>
                    請開啟通知權限以接收打卡提醒和成就通知
                  </Text>
                  <Button
                    size="$3"
                    backgroundColor={colors.semantic.warning}
                    onPress={requestPermission}
                  >
                    <Text color={colors.basic.white} fontWeight="600" fontSize={13}>
                      開啟通知權限
                    </Text>
                  </Button>
                </YStack>
              </Card>
            )}

            {/* Notification Settings */}
            <Card
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
            >
              {settings.map((setting, index) => {
                const Icon = setting.icon;
                return (
                  <XStack
                    key={setting.key}
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottomWidth={index < settings.length - 1 ? 1 : 0}
                    borderBottomColor="$borderColor"
                  >
                    <XStack alignItems="center" gap="$3" flex={1}>
                      <YStack
                        width={40}
                        height={40}
                        backgroundColor={colors.primary.palest}
                        borderRadius={20}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon size={20} color={colors.primary.base} />
                      </YStack>
                      <YStack flex={1}>
                        <Text fontSize={15} color="$color">
                          {setting.title}
                        </Text>
                        <Text fontSize={12} color="$color" opacity={0.5}>
                          {setting.description}
                        </Text>
                      </YStack>
                    </XStack>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleSetting(setting.key)}
                      backgroundColor={setting.enabled ? colors.primary.base : colors.basic[300]}
                      disabled={hasPermission === false}
                    >
                      <Switch.Thumb />
                    </Switch>
                  </XStack>
                );
              })}
            </Card>

            {/* Info */}
            <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$2">
              <Text fontSize={13} color="$color" opacity={0.6}>
                提示：你可以在系統設定中完全關閉此 App 的通知。
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
