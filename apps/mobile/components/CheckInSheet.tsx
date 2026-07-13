import { getTagPromptsByTags } from "@daodao/api";
import { Check, X } from "@tamagui/lucide-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, ScrollView as RNScrollView } from "react-native";
import { Sheet, Spinner, Text, XStack, YStack } from "tamagui";
import { CheckInSuccessDialog } from "@/components/check-in/CheckInSuccessDialog";
import { DescriptionField } from "@/components/check-in/form/components/description-field";
import { MediaUploadField } from "@/components/check-in/form/components/media-upload-field";
import { MoodSelector } from "@/components/check-in/form/components/mood-selector";
import { ReflectionQuestion } from "@/components/check-in/form/components/reflection-question";
import { TagSelector } from "@/components/check-in/form/components/tag-selector";
import { Button } from "@/components/ui/button";
import type { MoodType } from "@/constants/mood";
import { colors } from "@/generated/design-tokens";
import { useMobileI18n, useMobileTranslation } from "@/i18n";
import { analyticsService } from "@/services/analytics";
import type { IPractice } from "@/types/practice";

// 心情類型定義（沿用共用 MoodType，對外 re-export 維持相容）
export type { MoodType };

export interface ICheckInData {
  mood: MoodType;
  tags: string[];
  description: string;
  media: string[];
}

interface ICheckInResult {
  success: boolean;
  error?: string;
  practiceProgressPercentage?: number;
  encouragement?: string;
}

interface CheckInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practice: IPractice | null;
  onCheckIn: (data: ICheckInData) => Promise<ICheckInResult>;
  onShare?: () => void;
}

/** 實踐進度 %（與詳情頁進度環同一算法：優先 progressPercentage，否則以天數估算） */
function getPracticeProgress(p: IPractice): number {
  if (typeof p.progressPercentage === "number") return Math.round(p.progressPercentage);
  return p.targetDays > 0 ? Math.round((p.completedDays / p.targetDays) * 100) : 0;
}

export function CheckInSheet({ open, onOpenChange, practice, onCheckIn }: CheckInSheetProps) {
  const t = useMobileTranslation("mobile.checkIn");
  const { locale } = useMobileI18n();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 成功 Dialog 獨立於 form sheet（對齊 product DialogManager）
  const [successOpen, setSuccessOpen] = useState(false);
  const [successFrom, setSuccessFrom] = useState(0);
  const [successTo, setSuccessTo] = useState(0);
  const [successEncouragement, setSuccessEncouragement] = useState<string | undefined>();
  const [successTitle, setSuccessTitle] = useState("");

  // Reset form when sheet closes（成功 Modal 不依賴 sheet open）
  useEffect(() => {
    if (!open) {
      setSelectedMood(null);
      setSelectedTags([]);
      setDescription("");
      setMedia([]);
    }
  }, [open]);

  // 選中標籤且「自動填入」開關開啟時，取得該標籤引導句並帶入 description（對齊 product）
  const handleTagPrompt = useCallback(
    async (tagName: string) => {
      try {
        const apiLocale = locale === "en" ? "en-US" : "zh-TW";
        const response = await getTagPromptsByTags({
          tags: tagName,
          usageType: "practice_checkin",
          locale: apiLocale,
        });
        const promptsData = response.data?.data;
        const promptText =
          Array.isArray(promptsData) && promptsData.length > 0 ? promptsData[0]?.prompt : undefined;
        if (promptText) {
          setDescription((cur) => (cur.trim() ? `${cur}\n${promptText}` : promptText));
        }
      } catch (error) {
        console.log("取得標籤引導句失敗:", error);
      }
    },
    [locale]
  );

  const isFormValid = useMemo(() => {
    return selectedMood !== null && selectedTags.length > 0 && description.trim().length > 0;
  }, [selectedMood, selectedTags, description]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !practice || !isFormValid || !selectedMood) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const result = await onCheckIn({
        mood: selectedMood,
        tags: selectedTags,
        description: description.trim(),
        media,
      });

      if (result.success) {
        analyticsService.trackCheckIn({
          practice_id: practice.id,
          streak_count: practice.currentStreak + 1,
          has_note: true,
        });
        // 動畫起點 = 打卡前進度；終點優先 API practiceProgressPercentage
        const fromPct = getPracticeProgress(practice);
        const toPct =
          typeof result.practiceProgressPercentage === "number"
            ? Math.round(result.practiceProgressPercentage)
            : fromPct;
        setSuccessFrom(fromPct);
        setSuccessTo(toPct);
        setSuccessEncouragement(result.encouragement);
        setSuccessTitle(practice.title);
        // 關閉 form sheet，改開獨立成功 Dialog（對齊 product）
        onOpenChange(false);
        setSuccessOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    practice,
    isFormValid,
    selectedMood,
    selectedTags,
    description,
    media,
    onCheckIn,
    onOpenChange,
  ]);

  const closeSuccess = useCallback(() => {
    setSuccessOpen(false);
  }, []);

  if (!practice && !successOpen) return null;

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={[90]}
        dismissOnSnapToBottom
        zIndex={100000}
      >
        <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Frame
          backgroundColor="$background"
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
        >
          <Sheet.Handle backgroundColor="$borderColor" />

          {practice ? (
            <YStack flex={1}>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                padding="$4"
                borderBottomWidth={1}
                borderBottomColor="$borderColor"
              >
                <Text fontSize={20} fontWeight="700" color="$color">
                  {t("title")}
                </Text>
                <Button size="$3" circular chromeless onPress={() => onOpenChange(false)}>
                  <X size={20} color="$color" />
                </Button>
              </XStack>

              <RNScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <Text
                  fontSize={16}
                  lineHeight={32}
                  fontWeight="500"
                  color={colors.background.dark}
                  marginBottom="$6"
                >
                  {practice.title}
                </Text>

                <MoodSelector value={selectedMood} onChange={setSelectedMood} />

                <TagSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  onTagSelected={handleTagPrompt}
                />

                <DescriptionField
                  value={description}
                  onChange={setDescription}
                  beforeTextArea={<ReflectionQuestion />}
                />

                <MediaUploadField value={media} onChange={setMedia} />
              </RNScrollView>

              <YStack
                paddingHorizontal="$6"
                paddingVertical="$6"
                borderTopWidth={1}
                borderTopColor="$borderColor"
                backgroundColor="$background"
              >
                <Button
                  size="$5"
                  backgroundColor={isFormValid ? colors.logo.orange : colors.basic[300]}
                  pressStyle={{ opacity: 0.8 }}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner color="white" />
                  ) : (
                    <XStack alignItems="center" gap="$2">
                      <Check size={18} color="white" />
                      <Text color="white" fontWeight="600" fontSize={16}>
                        {t("submit")}
                      </Text>
                    </XStack>
                  )}
                </Button>
              </YStack>
            </YStack>
          ) : null}
        </Sheet.Frame>
      </Sheet>

      {/* 獨立成功 Dialog — 對齊 product DialogManager */}
      <CheckInSuccessDialog
        open={successOpen}
        practiceTitle={successTitle}
        from={successFrom}
        to={successTo}
        encouragement={successEncouragement}
        onComplete={closeSuccess}
        onDismiss={closeSuccess}
      />
    </>
  );
}
