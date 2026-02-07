import { useCallback } from "react";
import { Text, TextArea, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

const MAX_LENGTH = 300;

interface IDescriptionFieldProps {
  value: string;
  onChange: (text: string) => void;
}

/**
 * 描述輸入欄位組件 (Mobile)
 */
export const DescriptionField = ({ value, onChange }: IDescriptionFieldProps) => {
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
        <Text fontSize={14} color={colors.text.dark}>
          詳細描述
        </Text>
        <Text fontSize={14} color={colors.basic[400]}>
          {value.length}/{MAX_LENGTH}
        </Text>
      </XStack>
      <TextArea
        size="$4"
        placeholder="簡單紀錄今天的發現，或卡關的地方"
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
