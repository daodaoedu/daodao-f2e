import { Check, ChevronLeft, Moon, Smartphone, Sun } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ScrollView, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

type ThemeModeType = "light" | "dark" | "system";

const themeOptions: { value: ThemeModeType; label: string; icon: typeof Sun; description: string }[] = [
  {
    value: "light",
    label: "淺色模式",
    icon: Sun,
    description: "始終使用淺色主題",
  },
  {
    value: "dark",
    label: "深色模式",
    icon: Moon,
    description: "始終使用深色主題",
  },
  {
    value: "system",
    label: "跟隨系統",
    icon: Smartphone,
    description: "根據系統設定自動切換",
  },
];

const accentColors = [
  { value: "#4F46E5", label: "靛藍" },
  { value: "#7C3AED", label: "紫色" },
  { value: "#EC4899", label: "粉紅" },
  { value: "#059669", label: "綠色" },
  { value: "#DC2626", label: "紅色" },
  { value: "#EA580C", label: "橘色" },
];

export default function AppearanceSettingsScreen() {
  const router = useRouter();
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
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            外觀設定
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {/* Theme Mode */}
            <YStack gap="$3">
              <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                主題模式
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
                            {option.label}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.5}>
                            {option.description}
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
                主題顏色
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
                          {color.label}
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
                預覽
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
                    這是你選擇的主題顏色
                  </Text>
                </YStack>
              </Card>
            </YStack>

            {/* Info */}
            <YStack padding="$4" backgroundColor={colors.basic[100]} borderRadius="$md" gap="$2">
              <Text fontSize={13} color="$color" opacity={0.6}>
                提示：目前顯示模式為{currentTheme === "dark" ? "深色" : "淺色"}模式
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
