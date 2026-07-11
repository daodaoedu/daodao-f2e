import { Globe, Lock, Timer } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

/**
 * 對齊 product `privacy-status-selector.tsx`：私人 / 即時公開 / 完成後分享
 */
export type PrivacyStatus = "private" | "public" | "delayed";

/** product 未選邊框 #E0ECF0 */
const BORDER_UNSELECTED = "#E0ECF0";
/** product 未選 icon 底 #F0F8FA */
const ICON_BG_UNSELECTED = "#F0F8FA";
/** product 選中底 #F5FFFD = colors.background.veryLightBlue */

const PRIVACY_OPTIONS: {
  value: PrivacyStatus;
  icon: typeof Lock;
}[] = [
  { value: "private", icon: Lock },
  { value: "public", icon: Globe },
  { value: "delayed", icon: Timer },
];

interface PrivacyStatusSelectorProps {
  value: PrivacyStatus;
  onChange: (value: PrivacyStatus) => void;
}

/**
 * 實踐隱私設定選擇器 (Mobile)
 *
 * 移植自 product `privacy-status-selector.tsx`，使用 `app_product`
 * 翻譯 key（practice_visibility_*）。
 */
export function PrivacyStatusSelector({ value, onChange }: PrivacyStatusSelectorProps) {
  const t = useMobileTranslation("app_product");

  const privacyText: Record<PrivacyStatus, { label: string; description: string }> = {
    private: {
      label: t("practice_visibility_private"),
      description: t("practice_visibility_private_desc"),
    },
    public: {
      label: t("practice_visibility_public"),
      description: t("practice_visibility_public_desc"),
    },
    delayed: {
      label: t("practice_visibility_delayed"),
      description: t("practice_visibility_delayed_desc"),
    },
  };

  return (
    <YStack gap="$2">
      <Text fontSize={14} fontWeight="500" color={colors.text.dark} marginBottom="$3">
        {t("practice_visibility_question")}
      </Text>
      <YStack gap="$2">
        {PRIVACY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          const text = privacyText[option.value];
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={text.label}
            >
              <XStack
                alignItems="center"
                gap="$3"
                padding="$3"
                borderRadius={12}
                borderWidth={2}
                borderColor={isSelected ? colors.logo.cyan : BORDER_UNSELECTED}
                backgroundColor={isSelected ? colors.background.veryLightBlue : colors.basic.white}
              >
                <YStack
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={isSelected ? colors.logo.cyan : ICON_BG_UNSELECTED}
                >
                  <Icon size={16} color={isSelected ? colors.basic.white : colors.text.muted} />
                </YStack>
                <YStack flex={1}>
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={isSelected ? colors.logo.cyan : colors.text.dark}
                  >
                    {text.label}
                  </Text>
                  <Text fontSize={12} color={colors.text.muted}>
                    {text.description}
                  </Text>
                </YStack>
                {isSelected && (
                  <YStack
                    width={16}
                    height={16}
                    borderRadius={8}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={colors.logo.cyan}
                  >
                    <YStack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={colors.basic.white}
                    />
                  </YStack>
                )}
              </XStack>
            </Pressable>
          );
        })}
      </YStack>
    </YStack>
  );
}
