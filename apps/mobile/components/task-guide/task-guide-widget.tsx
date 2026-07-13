import { Check, ChevronRight, ClipboardList, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import {
  type OnboardingTaskItem,
  type OnboardingTaskKey,
  useOnboardingProgress,
} from "@/hooks/useOnboardingProgress";
import { useMobileTranslation } from "@/i18n";

const WEBSITE_URL = process.env.EXPO_PUBLIC_WEBSITE_URL ?? "https://daodao.so";

// 各任務的 fallback CTA（API 有回 ctaHref 時以其為主）
const TASK_PATHS: Record<OnboardingTaskKey, string> = {
  A: `${WEBSITE_URL}/quiz`, // 學習風格測驗（website）
  B: "/settings", // 公開資訊 / 帳號 / 領域偏好
  C: "/practices/create/manual/step1", // 建立第一個實踐
  D: "/", // 完成第一次打卡（首頁進實踐）
  E: "/", // 靈感頁留言
};

/**
 * 新手入門任務浮動小工具 — 對齊 product TaskGuideWidget。
 * 收合時只顯示浮動圓鈕（含進度），展開後列出 A–E 任務與 CTA。
 */
export function TaskGuideWidget() {
  const router = useRouter();
  const t = useMobileTranslation("onboarding.taskGuide");
  const { taskList, completedTasks, isLoading } = useOnboardingProgress();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || taskList.length === 0) return null;

  const total = taskList.length;
  const allCompleted = completedTasks >= total;

  const handleTaskPress = (task: OnboardingTaskItem) => {
    if (task.done) return;
    const href = task.ctaHref ?? TASK_PATHS[task.taskKey];
    setExpanded(false);
    if (href.startsWith("http")) {
      Linking.openURL(href).catch((error) => console.error("Failed to open task URL:", error));
    } else {
      router.push(href as never);
    }
  };

  return (
    <>
      {/* 展開面板 */}
      {expanded ? (
        <YStack style={styles.panel}>
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
            <Text
              fontSize={16}
              fontWeight="600"
              color={colors.text.dark}
              flex={1}
              numberOfLines={1}
            >
              {t("title")}
            </Text>
            <Pressable
              onPress={() => setExpanded(false)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("ariaCollapse")}
            >
              <X size={20} color={colors.text.muted} />
            </Pressable>
          </XStack>

          <Text fontSize={13} color={colors.logo.cyan} fontWeight="500" marginBottom="$2">
            {t("progress", { completed: completedTasks, total })}
          </Text>

          <YStack>
            {taskList.map((task) => {
              const showDesc = task.taskKey === "B" && !task.done;
              return (
                <Pressable
                  key={task.taskKey}
                  onPress={() => handleTaskPress(task)}
                  disabled={task.done}
                  accessibilityRole="button"
                  accessibilityLabel={t(`tasks.${task.taskKey}`)}
                >
                  <XStack alignItems="flex-start" gap="$3" paddingVertical="$2.5">
                    <YStack
                      width={22}
                      height={22}
                      borderRadius={11}
                      alignItems="center"
                      justifyContent="center"
                      marginTop={1}
                      backgroundColor={task.done ? colors.primary.base : "transparent"}
                      borderWidth={task.done ? 0 : 1.5}
                      borderColor={colors.border.light}
                    >
                      {task.done ? <Check size={14} color={colors.basic.white} /> : null}
                    </YStack>
                    <YStack flex={1}>
                      <Text
                        fontSize={14}
                        color={colors.text.dark}
                        opacity={task.done ? 0.5 : 1}
                        textDecorationLine={task.done ? "line-through" : "none"}
                      >
                        {t(`tasks.${task.taskKey}`)}
                      </Text>
                      {showDesc ? (
                        <Text fontSize={12} color={colors.text.muted} marginTop="$1">
                          {t("taskDescriptions.B")}
                        </Text>
                      ) : null}
                    </YStack>
                    {!task.done ? <ChevronRight size={18} color={colors.text.muted} /> : null}
                  </XStack>
                </Pressable>
              );
            })}
          </YStack>
        </YStack>
      ) : null}

      {/* 浮動觸發鈕 */}
      <Pressable
        style={styles.trigger}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={t("ariaOpen")}
      >
        <ClipboardList size={26} color={colors.basic.white} />
        {!allCompleted ? (
          <YStack style={styles.badge}>
            <Text fontSize={11} fontWeight="700" color={colors.basic.white}>
              {completedTasks}/{total}
            </Text>
          </YStack>
        ) : null}
      </Pressable>
    </>
  );
}

const TRIGGER_BOTTOM = Platform.OS === "ios" ? 152 : 142;

const styles = StyleSheet.create({
  trigger: {
    position: "absolute",
    bottom: TRIGGER_BOTTOM,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.base,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 998,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 28,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#FF6E0B",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    position: "absolute",
    bottom: TRIGGER_BOTTOM + 68,
    right: 20,
    left: 20,
    maxWidth: 360,
    alignSelf: "flex-end",
    backgroundColor: colors.background.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 999,
  },
});
