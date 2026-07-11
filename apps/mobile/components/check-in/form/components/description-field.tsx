import { useCallback } from "react";
import { Text, TextArea, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

const MAX_LENGTH = 600;

interface IDescriptionFieldProps {
  value: string;
  onChange: (text: string) => void;
}

/**
 * 描述輸入欄位組件 (Mobile)
 */
export const DescriptionField = ({ value, onChange }: IDescriptionFieldProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const handleChange = useCallback(
    (text: string) => {
      // 限制最大長度
      onChange(text.slice(0, MAX_LENGTH));
    },
    [onChange]
  );

  return (
    <YStack marginBottom="$6">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
        <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
          {t("description_label")}
        </Text>
        <Text fontSize={14} color={colors.basic[400]}>
          {value.length}/{MAX_LENGTH}
        </Text>
      </XStack>
      <TextArea
        size="$4"
        placeholder={t("description_placeholder")}
        value={value}
        onChangeText={handleChange}
        numberOfLines={4}
        borderColor={colors.basic[200]}
        focusStyle={{ borderColor: colors.primary.base }}
        minHeight={100}
      />
    </YStack>
  );
};
