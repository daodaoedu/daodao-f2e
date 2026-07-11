import { RefreshCw } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { useReflectionQuestion } from "../hooks/use-reflection-question";

/**
 * 反思提問卡片 (Mobile) — 對齊 product 的 ReflectionQuestion
 * 含開關（預設關閉）、問題顯示、換一題按鈕
 */
export const ReflectionQuestion = () => {
  const t = useMobileTranslation("mobile.checkIn");
  const [enabled, setEnabled] = useState(false);
  const { question, nextQuestion } = useReflectionQuestion();

  return (
    <YStack marginBottom="$3" gap="$3">
      {/* 開關列 */}
      <XStack alignItems="center" gap="$2">
        <Pressable
          onPress={() => setEnabled((v) => !v)}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
          accessibilityLabel={t("reflection_toggle")}
          style={[
            styles.track,
            { backgroundColor: enabled ? colors.logo.gray : colors.basic[200] },
          ]}
        >
          <View
            width={16}
            height={16}
            borderRadius={8}
            backgroundColor={colors.basic.white}
            style={{ transform: [{ translateX: enabled ? 16 : 0 }] }}
          />
        </Pressable>
        <Text fontSize={14} color={colors.basic[400]}>
          {t("reflection_toggle")}
        </Text>
      </XStack>

      {/* 問題卡片 */}
      {enabled && (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$3"
          borderWidth={1}
          borderColor={colors.gray.light}
          backgroundColor={colors.gray.veryLight}
          borderRadius="$md"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <Text flex={1} fontSize={14} color={colors.text.dark}>
            {question}
          </Text>
          <Pressable
            onPress={nextQuestion}
            style={styles.refresh}
            accessibilityRole="button"
            accessibilityLabel={t("reflection_refresh")}
          >
            <RefreshCw size={14} color={colors.basic[400]} />
            <Text fontSize={14} color={colors.basic[400]}>
              {t("reflection_refresh")}
            </Text>
          </Pressable>
        </XStack>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: "center",
  },
  refresh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
