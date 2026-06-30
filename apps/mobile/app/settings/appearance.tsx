import { Check, ChevronLeft, Moon, Smartphone, Sun } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

type ThemeModeType = "light" | "dark" | "system";

const themeOptions: {
  value: ThemeModeType;
  labelKey: string;
  icon: typeof Sun;
  descriptionKey: string;
}[] = [
  {
    value: "light",
    labelKey: "theme.light.label",
    icon: Sun,
    descriptionKey: "theme.light.description",
  },
  {
    value: "dark",
    labelKey: "theme.dark.label",
    icon: Moon,
    descriptionKey: "theme.dark.description",
  },
  {
    value: "system",
    labelKey: "theme.system.label",
    icon: Smartphone,
    descriptionKey: "theme.system.description",
  },
];

const accentColors = [
  { value: "#4F46E5", labelKey: "accent.indigo" },
  { value: "#7C3AED", labelKey: "accent.purple" },
  { value: "#EC4899", labelKey: "accent.pink" },
  { value: "#059669", labelKey: "accent.green" },
  { value: "#DC2626", labelKey: "accent.red" },
  { value: "#EA580C", labelKey: "accent.orange" },
];

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.appearanceSettings");
  const tCommon = useMobileTranslation("common");
  const systemColorScheme = useColorScheme();

  const [themeMode, setThemeModeType] = useState<ThemeModeType>("system");
  const [accentColor, setAccentColor] = useState("#4F46E5");

  const currentTheme = themeMode === "system" ? systemColorScheme : themeMode;

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
            accessibilityLabel={tCommon("back")}
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            {t("title")}
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Theme Mode */}
            <YStack gap="$3">
              <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                {t("themeMode")}
              </Text>
              <Card
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                overflow="hidden"
              >
                {themeOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isSelected = themeMode === option.value;
                  return (
                    <XStack
                      key={option.value}
                      padding="$4"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottomWidth={index < themeOptions.length - 1 ? 1 : 0}
                      borderBottomColor="$borderColor"
                      backgroundColor={isSelected ? colors.primary.palest : "transparent"}
                      pressStyle={{ backgroundColor: colors.primary.palest }}
                      onPress={() => setThemeModeType(option.value)}
                    >
                      <XStack alignItems="center" gap="$3" flex={1}>
                        <YStack
                          width={40}
                          height={40}
                          backgroundColor={isSelected ? colors.primary.base : colors.basic[200]}
                          borderRadius={20}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon
                            size={20}
                            color={isSelected ? colors.basic.white : colors.basic[500]}
                          />
                        </YStack>
                        <YStack flex={1}>
                          <Text
                            fontSize={15}
                            fontWeight={isSelected ? "600" : "400"}
                            color={isSelected ? colors.primary.darker : "$color"}
                          >
                            {t(option.labelKey)}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.5}>
                            {t(option.descriptionKey)}
                          </Text>
                        </YStack>
                      </XStack>
                      {isSelected && <Check size={20} color={colors.primary.base} />}
                    </XStack>
                  );
                })}
              </Card>
            </YStack>

            {/* Accent Color */}
            <YStack gap="$3">
              <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                {t("accentColor")}
              </Text>
              <Card
                padding="$4"
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <XStack gap="$3" flexWrap="wrap" justifyContent="space-between">
                  {accentColors.map((color) => {
                    const isSelected = accentColor === color.value;
                    return (
                      <YStack key={color.value} alignItems="center" gap="$2">
                        <Button
                          width={48}
                          height={48}
                          borderRadius={24}
                          backgroundColor={color.value}
                          borderWidth={isSelected ? 3 : 0}
                          borderColor={colors.basic.black}
                          pressStyle={{ scale: 0.95 }}
                          onPress={() => setAccentColor(color.value)}
                        >
                          {isSelected && <Check size={20} color={colors.basic.white} />}
                        </Button>
                        <Text fontSize={11} color="$color" opacity={0.6}>
                          {t(color.labelKey)}
                        </Text>
                      </YStack>
                    );
                  })}
                </XStack>
              </Card>
            </YStack>

            {/* Preview */}
            <YStack gap="$3">
              <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                {t("preview")}
              </Text>
              <Card
                padding="$4"
                backgroundColor={`${accentColor}15`}
                borderRadius="$md"
                borderWidth={1}
                borderColor={`${accentColor}30`}
              >
                <YStack alignItems="center" gap="$3">
                  <YStack
                    width={56}
                    height={56}
                    backgroundColor={accentColor}
                    borderRadius={28}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={28} color={colors.basic.white}>
                      ✨
                    </Text>
                  </YStack>
                  <Text fontSize={15} fontWeight="600" color={accentColor}>
                    {t("previewText")}
                  </Text>
                </YStack>
              </Card>
            </YStack>

            {/* Info */}
            <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$2">
              <Text fontSize={13} color="$color" opacity={0.6}>
                {t("currentModeHint", {
                  mode: currentTheme === "dark" ? t("mode.dark") : t("mode.light"),
                })}
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
