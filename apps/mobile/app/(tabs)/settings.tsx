import {
  AlertCircle,
  Archive,
  Bell,
  BookOpen,
  ChevronRight,
  Footprints,
  Globe,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useSettingsCompletion } from "@/hooks/useSettingsCompletion";
import { type MobileLocale, useMobileI18n, useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";

const LANGUAGE_OPTIONS: { value: MobileLocale; label: string }[] = [
  { value: "zh-TW", label: "中文" },
  { value: "en", label: "English" },
];

interface ISettingItem {
  icon: typeof Settings;
  labelKey: string;
  route: string;
  completionKey?: "preferences" | "account" | "publicInfo";
}

const socialItems: ISettingItem[] = [
  {
    icon: Footprints,
    labelKey: "items.footprints",
    route: "/me/footprints",
  },
  {
    icon: MessagesSquare,
    labelKey: "items.interaction",
    route: "/settings/interaction",
  },
  {
    icon: Telescope,
    labelKey: "items.following",
    route: "/settings/following",
  },
  {
    icon: HeartHandshake,
    labelKey: "items.connections",
    route: "/settings/connections",
  },
];

const settingsItems: ISettingItem[] = [
  {
    icon: BookOpen,
    labelKey: "items.resources",
    route: "/resource",
  },
  {
    icon: LibraryBig,
    labelKey: "items.preferences",
    route: "/settings/preferences",
    completionKey: "preferences",
  },
  {
    icon: Settings,
    labelKey: "items.account",
    route: "/settings/account",
    completionKey: "account",
  },
  {
    icon: SquareUser,
    labelKey: "items.publicInfo",
    route: "/settings/public-info",
    completionKey: "publicInfo",
  },
  {
    icon: Bell,
    labelKey: "items.notifications",
    route: "/settings/notifications",
  },
  {
    icon: Archive,
    labelKey: "items.archived",
    route: "/settings/archived",
  },
];

const settingGroups: { titleKey: string; items: ISettingItem[] }[] = [
  { titleKey: "groups.social", items: socialItems },
  { titleKey: "groups.settings", items: settingsItems },
];

export default function SettingsTab() {
  const router = useRouter();
  const { signOut } = useAuth();
  const t = useMobileTranslation("mobile.settings");
  const { data: settingsCompletion } = useSettingsCompletion();
  const { locale, setLocale } = useMobileI18n();
  const nextLanguage = LANGUAGE_OPTIONS.find((option) => option.value !== locale);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        <XStack padding="$4" alignItems="center">
          <Text fontSize={18} fontWeight="600" color="$color">
            {t("title")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <YStack gap="$5">
            {settingsCompletion && settingsCompletion.completed < settingsCompletion.total && (
              <Card
                backgroundColor="#FFF7ED"
                borderRadius="$md"
                borderWidth={1}
                borderColor="#FED7AA"
                padding="$3"
              >
                <Text fontSize={14} color="#C2410C">
                  {t("completion.prompt")}
                </Text>
              </Card>
            )}

            {settingsCompletion && (
              <Card
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                padding="$3"
              >
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={14} color="$color" opacity={0.7}>
                    {t("completion.label")}
                  </Text>
                  <Text fontSize={14} fontWeight="600" color="$color" marginLeft="auto">
                    {settingsCompletion.completed}/{settingsCompletion.total}
                  </Text>
                </XStack>
              </Card>
            )}

            {settingGroups.map((group) => (
              <YStack key={group.titleKey} gap="$3">
                <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                  {t(group.titleKey)}
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
                    const isIncomplete =
                      item.completionKey !== undefined &&
                      settingsCompletion?.sections[item.completionKey] === false;

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
                            {t(item.labelKey)}
                          </Text>
                        </XStack>
                        {isIncomplete && <AlertCircle size={18} color={colors.logo.orange} />}
                        <ChevronRight size={18} color="$color" opacity={0.4} />
                      </XStack>
                    );
                  })}
                </Card>
              </YStack>
            ))}

            {/* 語系切換 */}
            {nextLanguage && (
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
                  onPress={() => setLocale(nextLanguage.value)}
                >
                  <YStack
                    width={36}
                    height={36}
                    backgroundColor={colors.basic[100]}
                    borderRadius={18}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Globe size={18} color={colors.primary.base} />
                  </YStack>
                  <Text fontSize={15} color="$color" flex={1}>
                    {t("language")}
                  </Text>
                  <Text fontSize={14} color="$color" opacity={0.5}>
                    {nextLanguage.label}
                  </Text>
                  <ChevronRight size={18} color="$color" opacity={0.4} />
                </XStack>
              </Card>
            )}

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
                  Alert.alert(t("logout.title"), t("logout.message"), [
                    { text: t("logout.cancel"), style: "cancel" },
                    {
                      text: t("logout.confirm"),
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
                  {t("logout.title")}
                </Text>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
