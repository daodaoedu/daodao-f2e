import {
  dismissPersonaCarousel,
  submitPersonaAnswer,
  useMutate,
  usePersonaCarouselState,
} from "@daodao/api";
import { ArrowCircleSvg, QuoteFillSvg } from "@daodao/assets";
import { CheckCircle2, Laugh, Lock, RefreshCw } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileI18n, useMobileTranslation } from "@/i18n";

// ── Types ─────────────────────────────────────────────────────────────────────

type CarouselQuestionType = {
  id: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  isNewUserPriority: boolean;
};

// ── Palette helpers ───────────────────────────────────────────────────────────
// text.dark = 41,94,92 ; logo.cyan = 22,185,179 ; gray.dark = 13,48,54
// 這些 rgba 皆為 product 半透明疊色（text-dark/xx、logo-cyan/xx）的忠實近似，
// 屬 brief 允許的「unavoidable rgba overlay」。基底色仍取自 design tokens。
const TEXT_DARK_65 = "rgba(41,94,92,0.65)";
const TEXT_DARK_60 = "rgba(41,94,92,0.6)";
const TEXT_DARK_55 = "rgba(41,94,92,0.55)";
const TEXT_DARK_40 = "rgba(41,94,92,0.4)";
const TEXT_DARK_30 = "rgba(41,94,92,0.3)";
const TEXT_DARK_15 = "rgba(41,94,92,0.15)";
const TEXT_DARK_10 = "rgba(41,94,92,0.1)";
const CYAN_TINT = "rgba(22,185,179,0.1)";
const CYAN_TINT_30 = "rgba(22,185,179,0.3)";
const CYAN_BORDER = "rgba(22,185,179,0.18)";

const CARD_MIN_HEIGHT = 400;

// ── Locked response card (community preview placeholder) ──────────────────────

function LockedResponseCard({ onUnlock }: { onUnlock: () => void }) {
  const t = useMobileTranslation("persona.carousel");

  return (
    <Pressable onPress={onUnlock}>
      <YStack style={styles.lockedCard}>
        {/* Low-opacity skeleton rows — approximates product's CSS blur() (RN 無法廉價 blur 任意內容) */}
        <YStack opacity={0.45} pointerEvents="none">
          <XStack ai="center" gap="$2" mb="$2">
            <YStack width={24} height={24} borderRadius={12} backgroundColor={CYAN_TINT_30} />
            <YStack width={56} height={10} borderRadius={5} backgroundColor={TEXT_DARK_15} />
          </XStack>
          <YStack gap={6}>
            <YStack height={8} borderRadius={4} backgroundColor={TEXT_DARK_10} />
            <YStack height={8} width="80%" borderRadius={4} backgroundColor={TEXT_DARK_10} />
            <YStack height={8} borderRadius={4} backgroundColor={TEXT_DARK_10} />
            <YStack height={8} width="60%" borderRadius={4} backgroundColor={TEXT_DARK_10} />
          </YStack>
        </YStack>

        {/* Lock overlay */}
        <YStack style={styles.lockOverlay} gap="$2">
          <Lock size={16} color={colors.logo.cyan} />
          <Text
            fontSize={11}
            lineHeight={14}
            textAlign="center"
            color={TEXT_DARK_55}
            borderWidth={1}
            borderColor={CYAN_BORDER}
            borderRadius={999}
            paddingHorizontal={12}
            paddingVertical={4}
            backgroundColor={colors.background.light}
          >
            {t("unlockHint")}
          </Text>
        </YStack>
      </YStack>
    </Pressable>
  );
}

// ── Carousel question card ────────────────────────────────────────────────────

interface CarouselQuestionCardProps {
  questionId: number;
  prompt: string;
  questionType: "choice" | "sentence_completion" | "scenario";
  options: string[] | null;
  onAnswered: () => void;
  onSwitch: (questionId: number) => void;
}

function CarouselQuestionCard({
  questionId,
  prompt,
  questionType,
  options,
  onAnswered,
  onSwitch,
}: CarouselQuestionCardProps) {
  const t = useMobileTranslation("persona.carousel");
  const tProfile = useMobileTranslation("persona.myProfile");
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selected, setSelected] = useState("");
  const [textValue, setTextValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const flip = useSharedValue(0);

  const isChoice = questionType === "choice" && options != null && options.length > 0;
  const frontLabel = isChoice ? t("choicePrompt") : t("openPrompt");
  const canSubmit = isChoice ? Boolean(selected) : Boolean(textValue.trim());

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const toggleFlip = (next: boolean) => {
    setIsFlipped(next);
    flip.value = withTiming(next ? 1 : 0, { duration: 500 });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await submitPersonaAnswer(
        isChoice
          ? { questionId, selectedValue: selected }
          : { questionId, textAnswer: textValue.trim() }
      );
      if (res.error) {
        Alert.alert(tProfile("submitError"));
        return;
      }
      setSubmittedAnswer(isChoice ? selected : textValue.trim());
      setSelected("");
      setTextValue("");
      setSubmitted(true);
    } catch {
      Alert.alert(tProfile("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToProfile = () => {
    onAnswered();
    router.push("/persona");
  };

  // Submitted state — actual answer + CTA to my island
  if (submitted) {
    return (
      <YStack style={styles.card} gap="$2">
        <XStack
          ai="center"
          gap="$1.5"
          alignSelf="flex-start"
          borderRadius={999}
          paddingHorizontal={10}
          paddingVertical={4}
          backgroundColor={CYAN_TINT}
        >
          <CheckCircle2 size={12} color={colors.logo.cyan} />
          <Text fontSize={12} fontWeight="500" color={colors.logo.cyan}>
            {t("answered")}
          </Text>
        </XStack>
        <Text fontSize={14} lineHeight={20} color={TEXT_DARK_60}>
          {prompt}
        </Text>
        {submittedAnswer ? (
          <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
            {submittedAnswer}
          </Text>
        ) : null}
        <Pressable onPress={navigateToProfile}>
          <XStack ai="center" gap="$1.5" mt="$1">
            <Text fontSize={14} fontWeight="500" color={colors.primary.darker}>
              {t("submitted.cta")}
            </Text>
            <ArrowCircleSvg width={24} height={24} />
          </XStack>
        </Pressable>
      </YStack>
    );
  }

  return (
    <Animated.View style={[styles.flipContainer, containerStyle]}>
      {/* Front — question + community preview (normal flow, defines card height) */}
      <Pressable
        onPress={() => toggleFlip(true)}
        pointerEvents={isFlipped ? "none" : "auto"}
        style={styles.face}
      >
        <YStack style={styles.card} minHeight={CARD_MIN_HEIGHT}>
          <YStack ai="center" mt="$2" mb="$3">
            <QuoteFillSvg width={56} height={56} color={colors.logo.cyan} />
          </YStack>
          <Text fontSize={22} fontWeight="600" textAlign="center" lineHeight={30} color={colors.text.dark}>
            {prompt}
          </Text>

          <Text fontSize={14} fontWeight="500" color={TEXT_DARK_65} mt="$5" mb="$2">
            {t("communityLabel")}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lockedRow}
          >
            {[0, 1, 2].map((i) => (
              <LockedResponseCard key={i} onUnlock={() => toggleFlip(true)} />
            ))}
          </ScrollView>

          <XStack jc="flex-end" ai="center" gap="$2" mt="$6">
            <Text fontSize={14} fontWeight="500" color={colors.primary.darker}>
              {frontLabel}
            </Text>
            <ArrowCircleSvg width={32} height={32} />
          </XStack>
        </YStack>
      </Pressable>

      {/* Back — answer form (absolute, mirrored, fills front height) */}
      <Animated.View
        pointerEvents={isFlipped ? "auto" : "none"}
        style={[styles.face, styles.back]}
      >
        <YStack style={[styles.card, styles.backCard]} minHeight={CARD_MIN_HEIGHT}>
          <XStack ai="flex-start" gap="$2">
            <Text flex={1} fontSize={14} lineHeight={20} color={colors.primary.darker}>
              {prompt}
            </Text>
            <Pressable onPress={() => onSwitch(questionId)} hitSlop={8}>
              <XStack ai="center" gap="$1" paddingHorizontal={8} paddingVertical={4}>
                <RefreshCw size={12} color={TEXT_DARK_40} />
                <Text fontSize={12} color={TEXT_DARK_40}>
                  {t("switchQuestion")}
                </Text>
              </XStack>
            </Pressable>
          </XStack>

          <YStack flex={1} justifyContent="center" mt="$4">
            {isChoice ? (
              <XStack flexWrap="wrap" justifyContent="space-between" rowGap={8}>
                {options.map((opt) => {
                  const optionSelected = selected === opt;
                  return (
                    <Pressable key={opt} onPress={() => setSelected(opt)} style={styles.optionPressable}>
                      <YStack
                        borderWidth={2}
                        borderRadius={12}
                        paddingVertical={12}
                        paddingHorizontal={12}
                        borderColor={optionSelected ? colors.logo.cyan : CYAN_BORDER}
                        backgroundColor={optionSelected ? CYAN_TINT : "transparent"}
                      >
                        <Text
                          fontSize={14}
                          lineHeight={20}
                          fontWeight={optionSelected ? "500" : "400"}
                          color={optionSelected ? colors.logo.cyan : TEXT_DARK_65}
                        >
                          {opt}
                        </Text>
                      </YStack>
                    </Pressable>
                  );
                })}
              </XStack>
            ) : (
              <TextInput
                value={textValue}
                onChangeText={setTextValue}
                placeholder={tProfile("textPlaceholder")}
                placeholderTextColor={TEXT_DARK_30}
                multiline
                numberOfLines={2}
                maxLength={300}
                style={styles.textInput}
              />
            )}
          </YStack>

          <Button
            mt="$4"
            width="100%"
            paddingVertical={12}
            height="auto"
            backgroundColor={colors.logo.orange}
            opacity={submitting || !canSubmit ? 0.4 : 1}
            disabled={submitting || !canSubmit}
            onPress={handleSubmit}
          >
            <Text fontSize={16} fontWeight="500" color={colors.text.light}>
              {submitting ? tProfile("submitting") : tProfile("submit")}
            </Text>
          </Button>
        </YStack>
      </Animated.View>
    </Animated.View>
  );
}

// ── Carousel container ────────────────────────────────────────────────────────

export function ResonanceCarousel() {
  const t = useMobileTranslation("persona.carousel");
  const { locale } = useMobileI18n();
  const mutate = useMutate();
  const [replaceId, setReplaceId] = useState<number | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);
  const [displayedQuestions, setDisplayedQuestions] = useState<CarouselQuestionType[]>([]);
  const lastProcessedReplaceId = useRef<number | undefined>(undefined);

  const { data, isLoading } = usePersonaCarouselState(replaceId, locale);

  const shouldShow = data?.data?.shouldShow;
  const apiQuestions = data?.data?.questions ?? [];

  // Populate on initial load — first 2 questions become flip cards.
  useEffect(() => {
    if (displayedQuestions.length === 0 && apiQuestions.length > 0) {
      setDisplayedQuestions(apiQuestions.slice(0, 2));
    }
  }, [apiQuestions, displayedQuestions.length]);

  // After switch: replace only the switched card, leave the other unchanged.
  useEffect(() => {
    if (replaceId == null || isLoading || apiQuestions.length === 0) return;
    if (lastProcessedReplaceId.current === replaceId) return;
    lastProcessedReplaceId.current = replaceId;
    const newQuestion = apiQuestions.find((q) => displayedQuestions.every((dq) => dq.id !== q.id));
    if (newQuestion) {
      setDisplayedQuestions((prev) => prev.map((q) => (q.id === replaceId ? newQuestion : q)));
    }
  }, [replaceId, isLoading, apiQuestions, displayedQuestions]);

  if (displayedQuestions.length === 0 && isLoading) return null;
  if (!isLoading && shouldShow === false) return null;
  if (displayedQuestions.length === 0) return null;

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      const res = await dismissPersonaCarousel();
      if (res.error) {
        Alert.alert(t("error"));
        return;
      }
      await mutate(["/api/v1/persona/carousel-state"] as const);
    } catch {
      Alert.alert(t("error"));
    } finally {
      setDismissing(false);
    }
  };

  const handleAnswered = async () => {
    await mutate(["/api/v1/persona/carousel-state"] as const);
  };

  const handleSwitch = (questionId: number) => {
    setReplaceId(questionId);
  };

  return (
    <YStack mb="$4">
      <XStack jc="space-between" ai="center" mb="$3">
        <XStack ai="center" gap="$1.5">
          <Laugh size={14} color={TEXT_DARK_60} />
          <Text fontSize={12} color={TEXT_DARK_60}>
            {t("title")}
          </Text>
        </XStack>
        <Pressable onPress={handleDismiss} disabled={dismissing} hitSlop={8}>
          <Text fontSize={12} color={TEXT_DARK_40}>
            {t("dismiss")}
          </Text>
        </Pressable>
      </XStack>

      <YStack gap="$3">
        {displayedQuestions.map((q) => (
          <CarouselQuestionCard
            key={q.id}
            questionId={q.id}
            prompt={q.prompt}
            questionType={q.questionType}
            options={q.options}
            onAnswered={handleAnswered}
            onSwitch={handleSwitch}
          />
        ))}
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  flipContainer: {
    width: "100%",
  },
  face: {
    width: "100%",
    backfaceVisibility: "hidden",
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ rotateY: "180deg" }],
  },
  card: {
    width: "100%",
    backgroundColor: colors.background.light,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    // 對齊 product 的 tailwind `shadow-sm`：0 1px 2px rgb(0 0 0 / 0.05)。
    // 只有正面掛陰影；背面 shadowOpacity:0，翻面時由正後方的正面提供同一層淡陰影，
    // 兩面狀態都是單層、不會疊成深色帶。
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    overflow: "hidden",
    // 背面用邊框界定（對齊 product），移除陰影：否則翻到背面時前後兩張卡的
    // layer 陰影會疊加，backfaceVisibility 只隱藏內容不隱藏陰影，導致卡片底部
    // 出現奇怪的深色陰影帶。
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowColor: "transparent",
    elevation: 0,
  },
  lockedRow: {
    gap: 12,
    paddingBottom: 4,
  },
  lockedCard: {
    width: 160,
    height: 136,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CYAN_BORDER,
    backgroundColor: colors.background.light,
    padding: 12,
    overflow: "hidden",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  optionPressable: {
    width: "48%",
  },
  textInput: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: colors.logo.cyan,
    fontSize: 16,
    color: colors.text.dark,
    paddingBottom: 4,
    paddingTop: 4,
    textAlignVertical: "top",
  },
});
