import { ArrowLeft, ArrowRight, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

interface ManualStepShellProps {
  step: number;
  totalSteps: number;
  /** 中間標題；不傳或空字串則不顯示（step5 預覽不顯示 Preview） */
  title?: string;
  /** 步驟 2-4 於內容上方顯示的名稱 + 行動描述 */
  name?: string;
  actionDescription?: string;
  showEcho?: boolean;
  hideProgress?: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLabel: string;
  isSubmitting?: boolean;
  children: ReactNode;
}

/** 對齊 product Button size=default → h-10 (40px) */
const FOOTER_BTN_HEIGHT = 40;

/**
 * 手動建立流程的共用外框 — 對齊 product `manual/page.tsx` + `PageHeader`：
 *
 * ```
 * <PageHeader title={step5 ? 預覽 : 建立實踐} rightActionTo="/" />
 * <main>
 *   {step !== 5 && progress}
 *   {step 2-4 && name echo}
 *   {children}
 *   <footer fixed> prev / next </footer>
 * </main>
 * ```
 *
 * PageHeader 要點（apps/product/.../page-header.tsx）：
 * - grid 三欄：左空 | 標題置中 text-lg font-medium | 右關閉
 * - 無實心底、relative 進 document flow（非 sticky 遮罩）
 * - 關閉：ghost icon、text-light-gray + bg-very-light-gray/50
 * - px-5 py-4
 *
 * 因此 header 放進 ScrollView 頂部，step5 裝飾才可像 product 一樣延伸進 header 帶。
 */
export function ManualStepShell({
  step,
  totalSteps,
  title,
  name,
  actionDescription,
  showEcho = false,
  hideProgress = false,
  onPrev,
  onNext,
  nextLabel,
  isSubmitting = false,
  children,
}: ManualStepShellProps) {
  const router = useRouter();
  const t = useMobileTranslation("practice");
  const commonT = useMobileTranslation("common");
  const cyan = colors.logo.cyan;
  const [prevPressed, setPrevPressed] = useState(false);
  const [nextPressed, setNextPressed] = useState(false);

  // product: rightActionTo="/" → 關閉回首頁
  const closeToHome = () => router.replace("/(tabs)");

  // product BackgroundAnimation: bg-very-light-gray
  const pageBg = colors.background.veryLightGray;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: pageBg }} edges={["top", "bottom"]}>
      <YStack flex={1} backgroundColor={pageBg}>
        <ScrollView
          flex={1}
          contentContainerStyle={{
            paddingBottom: 80,
            flexGrow: 1,
          }}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator
        >
          {/*
            對齊 product PageHeader：
            relative grid-cols-3 items-center px-5 py-4
            透明、隨內容捲動（非 fixed 實心底）
          */}
          <XStack
            paddingHorizontal={20}
            paddingVertical={16}
            alignItems="center"
            // 透明：裝飾可延伸到此區（product header 無 bg）
            backgroundColor="transparent"
          >
            {/* Left placeholder — leftAction=null */}
            <YStack flex={1} />

            {/* Center title — text-lg font-medium；空則不渲染 */}
            <YStack flex={2} alignItems="center" justifyContent="center">
              {!!title && (
                <Text
                  fontSize={18}
                  fontWeight="500"
                  color={colors.gray.dark}
                  textAlign="center"
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
            </YStack>

            {/* Right close — text-light-gray bg-very-light-gray/50 */}
            <YStack flex={1} alignItems="flex-end">
              <Pressable
                onPress={closeToHome}
                accessibilityRole="button"
                accessibilityLabel={commonT("close")}
                hitSlop={8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  // product: bg-very-light-gray/50
                  backgroundColor: "rgba(244, 246, 246, 0.5)",
                }}
              >
                <X size={22} color={colors.text.muted} />
              </Pressable>
            </YStack>
          </XStack>

          <YStack paddingHorizontal={20} flexGrow={1}>
            {/* Progress bar：n/total + 分段條（step5 隱藏，對齊 product） */}
            {!hideProgress && (
              <YStack gap={8} marginTop={8} marginBottom={48}>
                <Text fontSize={12} color={colors.text.dark}>
                  {step} / {totalSteps}
                </Text>
                <XStack gap={2}>
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                    <YStack
                      key={s}
                      flex={1}
                      height={4}
                      borderRadius={2}
                      backgroundColor={step >= s ? cyan : colors.gray.light}
                    />
                  ))}
                </XStack>
              </YStack>
            )}

            {/* 名稱 + 行動描述回顯（步驟 2-4） */}
            {showEcho && (
              <YStack gap={4} marginBottom={20}>
                <Text fontSize={20} fontWeight="600" color={colors.text.dark}>
                  {name}
                </Text>
                <Text fontSize={14} color={colors.text.dark}>
                  {actionDescription}
                </Text>
              </YStack>
            )}

            {children}
          </YStack>
        </ScrollView>

        {/* Footer — 對齊 product: fixed bottom gap-6 p-6 border-t bg-very-light-gray */}
        <XStack
          gap={24}
          padding={24}
          borderTopWidth={1}
          borderTopColor={colors.gray.light}
          backgroundColor={colors.background.veryLightGray}
        >
          <Pressable
            onPress={onPrev}
            disabled={isSubmitting}
            onPressIn={() => setPrevPressed(true)}
            onPressOut={() => setPrevPressed(false)}
            style={{
              flex: 1,
              height: FOOTER_BTN_HEIGHT,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: cyan,
              backgroundColor: prevPressed ? cyan : colors.basic.white,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: isSubmitting ? 0.5 : 1,
            }}
            accessibilityRole="button"
            accessibilityLabel={t("manual_prev_step")}
          >
            <ArrowLeft size={18} color={prevPressed ? colors.basic.white : cyan} />
            <Text
              color={prevPressed ? colors.basic.white : colors.text.dark}
              fontWeight="500"
              fontSize={14}
            >
              {t("manual_prev_step")}
            </Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            disabled={isSubmitting}
            onPressIn={() => setNextPressed(true)}
            onPressOut={() => setNextPressed(false)}
            style={{
              flex: 1,
              height: FOOTER_BTN_HEIGHT,
              borderRadius: 999,
              backgroundColor: cyan,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: isSubmitting ? 0.7 : nextPressed ? 0.9 : 1,
              shadowColor: cyan,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: nextPressed ? 0.35 : 0.15,
              shadowRadius: 6,
              elevation: nextPressed ? 3 : 1,
            }}
            accessibilityRole="button"
            accessibilityLabel={nextLabel}
          >
            {isSubmitting ? (
              <Spinner size="small" color={colors.basic.white} />
            ) : (
              <>
                <Text color={colors.basic.white} fontWeight="500" fontSize={14}>
                  {nextLabel}
                </Text>
                {step !== totalSteps && <ArrowRight size={18} color={colors.basic.white} />}
              </>
            )}
          </Pressable>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
