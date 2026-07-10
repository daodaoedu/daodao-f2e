import { Download, Share2, X } from "@tamagui/lucide-icons";
import type React from "react";
import { useCallback, useRef } from "react";
import { Alert, type View } from "react-native";
import { Sheet, Spinner, Text, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useShare } from "@/hooks/useShare";
import { useMobileTranslation } from "@/i18n";
import type { IPractice } from "@/types/practice";
import { ShareableCheckInCard } from "./ShareableCheckInCard";

interface ShareCheckInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practice: IPractice | null;
  streakCount: number;
}

export function ShareCheckInSheet({
  open,
  onOpenChange,
  practice,
  streakCount,
}: ShareCheckInSheetProps) {
  const t = useMobileTranslation("mobile.shareCheckIn");
  const cardRef = useRef<View>(null);

  const { viewRef, isCapturing, isSharing, isSaving, share, saveToGallery } = useShare({
    practiceId: practice?.id || "",
    practiceTitle: practice?.title || "",
    streakCount,
  });

  // Sync the refs
  const handleRefChange = useCallback(
    (node: View | null) => {
      cardRef.current = node;
      (viewRef as React.MutableRefObject<View | null>).current = node;
    },
    [viewRef]
  );

  const handleShare = useCallback(async () => {
    const result = await share();
    if (!result.success && result.error) {
      Alert.alert(t("share_failed_title"), result.error);
    }
  }, [share, t]);

  const handleSave = useCallback(async () => {
    const result = await saveToGallery();
    if (result.success) {
      Alert.alert(t("save_success_title"), t("save_success_message"));
    } else if (result.error) {
      Alert.alert(t("save_failed_title"), result.error);
    }
  }, [saveToGallery, t]);

  if (!practice) return null;

  const isLoading = isCapturing || isSharing || isSaving;

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      zIndex={100001}
    >
      <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame
        padding="$4"
        backgroundColor="$background"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
      >
        <Sheet.Handle backgroundColor="$borderColor" />

        <YStack flex={1} gap="$4" paddingTop="$4">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={20} fontWeight="700" color="$color">
              {t("share_result")}
            </Text>
            <Button
              size="$3"
              circular
              chromeless
              onPress={() => onOpenChange(false)}
              accessibilityLabel={t("close")}
            >
              <X size={20} color="$color" />
            </Button>
          </XStack>

          {/* Preview Card */}
          <YStack flex={1} alignItems="center" justifyContent="center">
            <ShareableCheckInCard
              ref={handleRefChange}
              practice={practice}
              streakCount={streakCount}
            />
          </YStack>

          {/* Action Buttons */}
          <YStack gap="$3" paddingBottom="$4">
            <Button
              size="$5"
              backgroundColor={colors.primary.base}
              pressStyle={{ backgroundColor: colors.primary.darker }}
              onPress={handleShare}
              disabled={isLoading}
              accessibilityLabel={t("share_to_social")}
            >
              {isSharing || isCapturing ? (
                <Spinner color={colors.basic.white} />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <Share2 size={20} color={colors.basic.white} />
                  <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                    {t("share_to_social")}
                  </Text>
                </XStack>
              )}
            </Button>

            <Button
              size="$4"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor={colors.primary.base}
              pressStyle={{ backgroundColor: colors.primary.palest }}
              onPress={handleSave}
              disabled={isLoading}
              accessibilityLabel={t("save_to_gallery")}
            >
              {isSaving ? (
                <Spinner color={colors.primary.base} />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <Download size={18} color={colors.primary.base} />
                  <Text color={colors.primary.base} fontWeight="600">
                    {t("save_to_gallery")}
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
