import {
  Archive,
  Bell,
  ChevronRight,
  HeartHandshake,
  LibraryBig,
  LogOut,
  MessagesSquare,
  Settings,
  SquareUser,
  Telescope,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

interface SettingItem {
  icon: typeof Settings;
  label: string;
  route: string;
}

const socialItems: SettingItem[] = [
  {
    icon: MessagesSquare,
    label: "互動設定",
    route: "/settings/interaction",
  },
  {
    icon: Telescope,
    label: "關注設定",
    route: "/settings/following",
  },
  {
    icon: HeartHandshake,
    label: "連結的夥伴",
    route: "/settings/connections",
  },
];

const settingsItems: SettingItem[] = [
  {
    icon: LibraryBig,
    label: "領域偏好設定",
    route: "/settings/preferences",
  },
  {
    icon: Settings,
    label: "帳號設定",
    route: "/settings/account",
  },
  {
    icon: SquareUser,
    label: "公開資訊設定",
    route: "/settings/public-info",
  },
  {
    icon: Bell,
    label: "通知設定",
    route: "/settings/notifications",
  },
  {
    icon: Archive,
    label: "已封存的內容",
    route: "/settings/archived",
  },
];

const settingGroups: { title: string; items: SettingItem[] }[] = [
  { title: "社交", items: socialItems },
  { title: "設定", items: settingsItems },
];

export default function SettingsTab() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center">
          <Text fontSize={18} fontWeight="600" color="$color">
            設定
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <YStack gap="$5">
            {settingGroups.map((group) => (
              <YStack key={group.title} gap="$3">
                <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                  {group.title}
                </Text>
                <Card
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                  overflow="hidden"
                >
                  {group.items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <XStack
                        key={item.route}
                        padding="$4"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottomWidth={index < group.items.length - 1 ? 1 : 0}
                        borderBottomColor="$borderColor"
                        pressStyle={{ backgroundColor: "$backgroundHover" }}
                        onPress={() => router.push(item.route as `${string}:${string}`)}
                      >
                        <XStack alignItems="center" gap="$3" flex={1}>
                          <YStack
                            width={36}
                            height={36}
                            backgroundColor={colors.basic[100]}
                            borderRadius={18}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon size={18} color={colors.primary.base} />
                          </YStack>
                          <Text fontSize={15} color="$color" flex={1}>
                            {item.label}
                          </Text>
                        </XStack>
                        <ChevronRight size={18} color="$color" opacity={0.4} />
                      </XStack>
                    );
                  })}
                </Card>
              </YStack>
            ))}

            {/* 登出 */}
            <Card
              backgroundColor="$background"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
            >
              <XStack
                padding="$4"
                alignItems="center"
                gap="$3"
                pressStyle={{ backgroundColor: "$backgroundHover" }}
                onPress={() => {
                  Alert.alert("登出", "確定要登出嗎？", [
                    { text: "取消", style: "cancel" },
                    {
                      text: "登出",
                      style: "destructive",
                      onPress: () => {
                        signOut();
                      },
                    },
                  ]);
                }}
              >
                <YStack
                  width={36}
                  height={36}
                  backgroundColor={`${colors.semantic.error}15`}
                  borderRadius={18}
                  alignItems="center"
                  justifyContent="center"
                >
                  <LogOut size={18} color={colors.semantic.error} />
                </YStack>
                <Text fontSize={15} color={colors.semantic.error}>
                  登出
                </Text>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
