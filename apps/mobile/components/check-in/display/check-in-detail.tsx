import { YStack, Button, XStack, Text } from "tamagui";
import { Share2 } from "@tamagui/lucide-icons";
import { colors } from "@/generated/design-tokens";
import type { ICheckInDisplayData } from "../types";
import { CheckInCard } from "./check-in-card";

interface ICheckInDetailProps {
  checkInData: ICheckInDisplayData;
  onShare?: () => void;
  onImagePress?: (index: number) => void;
}

/**
 * 打卡詳情組件 (Mobile)
 * 顯示完整的打卡內容和分享按鈕
 */
export const CheckInDetail = ({
  checkInData,
  onShare,
  onImagePress,
}: ICheckInDetailProps) => {
  const { date, mood, content, tags, images, practiceTitle } = checkInData;

  return (
    <YStack width={350} marginHorizontal="auto">
      <CheckInCard
        taskTitle={practiceTitle}
        date={date}
        mood={mood}
        content={content}
        tags={tags}
        images={images}
        onImagePress={onImagePress}
      />

      {/* 分享按鈕 */}
      {onShare && (
        <YStack alignItems="center" gap="$4">
          <Button
            backgroundColor={colors.basic.white}
            borderRadius="$full"
            paddingHorizontal="$6"
            pressStyle={{ opacity: 0.8 }}
            onPress={onShare}
          >
            <XStack alignItems="center" gap="$2">
              <Share2 size={16} color={colors.text.dark} />
              <Text color={colors.text.dark} fontWeight="500">
                分享這篇打卡
              </Text>
            </XStack>
          </Button>
        </YStack>
      )}
    </YStack>
  );
};
