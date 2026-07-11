import { LinearGradient } from "expo-linear-gradient";
import { MotiText, MotiView } from "moti";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  View as RNView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

// 對齊 product DialogContentWithImage 的 success 插圖（172×172）
const SUCCESS_IMAGE = require("@daodao/assets/images/dialog/success.png");

export interface CheckInSuccessDialogProps {
  open: boolean;
  /** 實踐標題（Step1 逐字動畫 = product SplitText title） */
  practiceTitle: string;
  /** 起始進度 % */
  from: number;
  /** 目標進度 %（此次打卡後） */
  to: number;
  /** 鼓勵語（可選） */
  encouragement?: string;
  /** 點「完成」— 對齊 product value: "complete" */
  onComplete: () => void;
  /** 點遮罩關閉 — 對齊 product dismissible → value: "close" */
  onDismiss?: () => void;
}

// Timing 對齊 product use-check-in-success-dialog
const DIALOG_OPEN_DELAY = 300;
const CHAR_STAGGER = 100;
const CHAR_DURATION = 300;
const PROGRESS_START_DELAY = 300;
const PROGRESS_TOTAL_MS = 600;
const STEP1_HOLD_AFTER_DONE_MS = 1500;
const STEP1_FADE_MS = 350;

const BAR_GRADIENT = [colors.practice.blue, colors.logo.cyan] as const;
const FIREWORK_COLORS = [
  colors.practice.blue,
  colors.logo.cyan,
  colors.logo.cyan,
  colors.logo.orange,
  colors.logo.orange,
  colors.logo.yellow,
];

/** 煙火：對齊 product Fireworks（7 顆、角度 + 距離隨機） */
function Fireworks() {
  const particles = useMemo(() => {
    const count = 7;
    return Array.from({ length: count }, (_, i) => {
      const angleDeg = (360 / count) * i + (Math.random() - 0.5) * 30;
      const angle = (angleDeg * Math.PI) / 180;
      const distance = 30 + Math.random() * 20;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        delay: Math.random() * 200 * (i % 2),
        duration: 600 + Math.random() * 200,
        scale: 1 - Math.random() * 0.5,
      };
    });
  }, []);

  return (
    <>
      {particles.map((p) => (
        <MotiView
          key={p.id}
          from={{ opacity: 1, translateX: 0, translateY: 0, scale: p.scale }}
          animate={{ opacity: 0, translateX: p.x, translateY: p.y, scale: 0 }}
          transition={{ type: "timing", duration: p.duration, delay: p.delay }}
          style={[styles.particle, { backgroundColor: p.color }]}
        />
      ))}
    </>
  );
}

/**
 * 打卡成功 Dialog — 對齊 product `use-check-in-success-dialog` + DialogManager：
 * - 獨立 Modal（非嵌在打卡 form sheet 內）
 * - 成功插圖 172 + 標題「打卡成功」
 * - Step1：實踐名逐字 → 進度 scaleX + 大 % tooltip（含箭頭）+ 煙火 → 淡出
 * - Step2：左對齊鼓勵語
 * - Footer 分隔 + 橘色 Done
 * - 可點遮罩 dismiss
 */
export function CheckInSuccessDialog({
  open,
  practiceTitle,
  from,
  to,
  encouragement,
  onComplete,
  onDismiss,
}: CheckInSuccessDialogProps) {
  const t = useMobileTranslation("mobile.checkIn");
  const { height: windowHeight } = useWindowDimensions();
  const dialogTitle = t("success_title");
  const titleChars = useMemo(
    () => Array.from(practiceTitle.trim() || dialogTitle),
    [practiceTitle, dialogTitle]
  );

  const safeFrom = Math.max(0, Math.min(100, Math.round(from)));
  const safeTo = Math.max(0, Math.min(100, Math.round(to)));
  // product AlwaysOpenTooltip 在 from >= to 時不跑動畫；我們仍要走完 Step1 才能露出 Step2
  const progressEnd = Math.max(safeFrom, safeTo);

  const [showTitle, setShowTitle] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [shouldAnimateProgress, setShouldAnimateProgress] = useState(false);
  const [pct, setPct] = useState(safeFrom);
  const [showFireworks, setShowFireworks] = useState(false);
  const [step1Finished, setStep1Finished] = useState(false);
  const [step1Hidden, setStep1Hidden] = useState(false);
  // 重置 key：每次 open 重跑動畫
  const [runId, setRunId] = useState(0);

  const resetAnimation = useCallback(() => {
    setShowTitle(false);
    setShowProgress(false);
    setShouldAnimateProgress(false);
    setPct(safeFrom);
    setShowFireworks(false);
    setStep1Finished(false);
    setStep1Hidden(false);
  }, [safeFrom]);

  // 標題最後一字完成 → 顯示進度（對齊 SplitText onLetterAnimationComplete）
  const handleTitleComplete = useCallback(() => {
    setShowProgress(true);
  }, []);

  useEffect(() => {
    if (!open) {
      resetAnimation();
      return;
    }
    setRunId((n) => n + 1);
    resetAnimation();
    const openTimer = setTimeout(() => setShowTitle(true), DIALOG_OPEN_DELAY);
    // 後備：若 onDidAnimate 未觸發，仍依字數估時開進度
    const titleMs =
      DIALOG_OPEN_DELAY + Math.max(titleChars.length, 1) * CHAR_STAGGER + CHAR_DURATION + 80;
    const progressTimer = setTimeout(() => setShowProgress(true), titleMs);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(progressTimer);
    };
  }, [open, resetAnimation, titleChars.length]);

  useEffect(() => {
    if (!showProgress || step1Finished) return;
    const timer = setTimeout(() => setShouldAnimateProgress(true), PROGRESS_START_DELAY);
    return () => clearTimeout(timer);
  }, [showProgress, step1Finished]);

  useEffect(() => {
    if (!shouldAnimateProgress) return;

    if (progressEnd <= safeFrom) {
      setPct(progressEnd);
      setShowFireworks(true);
      setStep1Finished(true);
      return;
    }

    const steps = progressEnd - safeFrom;
    const stepMs = PROGRESS_TOTAL_MS / steps;
    let current = safeFrom;
    const interval = setInterval(() => {
      current += 1;
      setPct(current);
      if (current >= progressEnd) {
        clearInterval(interval);
        setShowFireworks(true);
        setStep1Finished(true);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [shouldAnimateProgress, safeFrom, progressEnd]);

  useEffect(() => {
    if (!step1Finished || step1Hidden) return;
    const timer = setTimeout(() => setStep1Hidden(true), STEP1_HOLD_AFTER_DONE_MS);
    return () => clearTimeout(timer);
  }, [step1Finished, step1Hidden]);

  const handleDismiss = () => {
    (onDismiss ?? onComplete)();
  };

  // scaleX 0–1（對齊 product transform scaleX）
  const scaleX = Math.min(Math.max(pct, 0), 100) / 100;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Pressable
          style={[styles.card, { maxHeight: windowHeight * 0.85 }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header — 對齊 DialogTitle */}
          <YStack paddingHorizontal="$5" paddingTop="$5" paddingBottom="$2">
            <Text fontSize={18} fontWeight="700" color={colors.text.dark} textAlign="left">
              {dialogTitle}
            </Text>
          </YStack>

          {/* Content — 對齊 DialogContentWithImage + CheckInSuccessContent */}
          <YStack paddingHorizontal="$5" paddingBottom="$4">
            <Image source={SUCCESS_IMAGE} style={styles.successImage} resizeMode="contain" />

            {/* Stage：Step1 疊在 Step2 上 */}
            <View style={styles.stage}>
              {/* Step2：鼓勵語（左對齊，對齊 product textAlign left） */}
              <YStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                justifyContent="center"
                gap="$1"
                paddingTop={72}
              >
                <Text fontSize={16} fontWeight="500" color={colors.text.dark} textAlign="left">
                  {encouragement || t("success_default_encouragement")}
                </Text>
                <Text fontSize={14} color={colors.text.dark} opacity={0.6} textAlign="left">
                  {t("success_continue_hint")}
                </Text>
              </YStack>

              {/* Step1：實踐標題 + 進度 */}
              <MotiView
                key={runId}
                animate={{ opacity: step1Hidden ? 0 : 1 }}
                transition={{ type: "timing", duration: STEP1_FADE_MS }}
                style={styles.step1}
                pointerEvents={step1Hidden ? "none" : "auto"}
              >
                <YStack flex={1} alignItems="center" paddingTop="$2">
                  {showTitle && (
                    <XStack flexWrap="wrap" justifyContent="center" maxWidth="100%">
                      {titleChars.map((ch, i) => {
                        const isLast = i === titleChars.length - 1;
                        return (
                          <MotiText
                            // biome-ignore lint/suspicious/noArrayIndexKey: 標題字元順序固定
                            key={`${runId}-${ch}-${i}`}
                            from={{ opacity: 0, translateY: 6 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{
                              type: "timing",
                              duration: CHAR_DURATION,
                              delay: i * CHAR_STAGGER,
                            }}
                            onDidAnimate={() => {
                              if (isLast) handleTitleComplete();
                            }}
                            style={styles.practiceTitleChar}
                          >
                            {ch === " " ? " " : ch}
                          </MotiText>
                        );
                      })}
                    </XStack>
                  )}

                  {showProgress && !step1Hidden && (
                    <RNView style={styles.progressWrap}>
                      {/* 軌道 */}
                      <RNView style={styles.progressTrack}>
                        {/* 填充：全寬 + scaleX（對齊 product origin-left） */}
                        <RNView
                          style={[
                            styles.progressFillHost,
                            {
                              transform: [{ scaleX }],
                              // RN 0.81 支援 transformOrigin
                              transformOrigin: "left center",
                            } as object,
                          ]}
                        >
                          <LinearGradient
                            colors={BAR_GRADIENT}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                          />
                        </RNView>
                      </RNView>

                      {/* 前緣 + 煙火 + 大 tooltip（含箭頭） */}
                      <RNView
                        style={[styles.leadingEdge, { left: `${Math.min(pct, 100)}%` }]}
                        pointerEvents="none"
                      >
                        {showFireworks && <Fireworks />}
                        <RNView style={styles.tooltip}>
                          <Text style={styles.tooltipText}>{pct}%</Text>
                          <RNView style={styles.tooltipArrow} />
                        </RNView>
                      </RNView>
                    </RNView>
                  )}
                </YStack>
              </MotiView>
            </View>
          </YStack>

          {/* Footer — 對齊 DialogFooter / SheetFooter */}
          <YStack
            paddingHorizontal="$6"
            paddingVertical="$6"
            borderTopWidth={1}
            borderTopColor={colors.gray.light}
          >
            <Button
              size="$5"
              width="100%"
              backgroundColor={colors.logo.orange}
              pressStyle={{ opacity: 0.85 }}
              onPress={onComplete}
            >
              <Text color={colors.gray.white} fontWeight="600" fontSize={16}>
                {t("success_complete")}
              </Text>
            </Button>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.gray.white,
    borderRadius: 24,
    overflow: "hidden",
  },
  successImage: {
    width: 172,
    height: 172,
    alignSelf: "center",
    marginBottom: 16,
  },
  stage: {
    width: "100%",
    minHeight: 200,
    position: "relative",
  },
  step1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gray.white,
    borderRadius: 16,
    paddingHorizontal: 8,
    zIndex: 10,
  },
  practiceTitleChar: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.dark,
  },
  progressWrap: {
    position: "absolute",
    left: 24,
    right: 24,
    // 對齊 product bottom-[167px] 相對高度感：放在 stage 中上
    top: 100,
    height: 12,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.gray.veryLight,
    overflow: "hidden",
  },
  progressFillHost: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  leadingEdge: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 12,
    marginLeft: -6,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    position: "absolute",
    bottom: 20,
    minWidth: 56,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.logo.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltipText: {
    color: colors.gray.white,
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 34,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.logo.cyan,
  },
  particle: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
