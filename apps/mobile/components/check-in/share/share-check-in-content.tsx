import { Download, Share2 } from "@tamagui/lucide-icons";
import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useCallback } from "react";
import { Alert, Linking, Share } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { ICheckInFormData } from "../types";

interface IShareCheckInContentProps {
  taskTitle: string;
  checkInData: ICheckInFormData & { date: string; images?: string[] };
  onDownloadSuccess?: () => void;
  onShareSuccess?: () => void;
}

/**
 * 分享打卡內容組件 (Mobile)
 * 用於顯示分享選項和打卡圖片
 */
export const ShareCheckInContent = ({
  taskTitle,
  checkInData,
  onDownloadSuccess,
  onShareSuccess,
}: IShareCheckInContentProps) => {
  const t = useMobileTranslation("mobile.shareCheckIn");
  const { description, images } = checkInData;
  const imageUrl = images?.[0];

  // 準備分享內容
  const shareText = `${taskTitle}\n${description || ""}\n\n${t("share_hashtag")}`;

  // 處理分享
  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: shareText,
        title: taskTitle,
      });

      if (result.action === Share.sharedAction) {
        onShareSuccess?.();
      }
    } catch (_error) {
      Alert.alert(t("share_failed_title"), t("share_failed_message"));
    }
  }, [shareText, taskTitle, onShareSuccess, t]);

  // 處理下載打卡圖片到相簿
  const handleDownloadImage = useCallback(async () => {
    if (!imageUrl) {
      Alert.alert(t("download_unavailable_title"), t("download_unavailable_message"));
      return;
    }

    try {
      // 請求相簿權限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("permission_title"), t("permission_message"), [
          { text: t("cancel"), style: "cancel" },
          { text: t("open_settings"), onPress: () => Linking.openSettings() },
        ]);
        return;
      }

      let localUri = imageUrl;

      // 如果是遠端 URL，先下載到本地
      if (!imageUrl.startsWith("file://") && !imageUrl.startsWith("content://")) {
        const cacheDir = new Directory(Paths.cache);
        const downloadedFile = await File.downloadFileAsync(imageUrl, cacheDir, {
          idempotent: true,
        });
        localUri = downloadedFile.uri;
      }

      // 儲存到相簿
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert(t("save_success_title"), t("save_success_message"));
      onDownloadSuccess?.();
    } catch (_error) {
      Alert.alert(t("save_failed_title"), t("save_failed_message"));
    }
  }, [imageUrl, onDownloadSuccess, t]);

  return (
    <YStack paddingHorizontal="$6" flex={1}>
      <YStack flex={1} gap="$6">
        {/* 標題 */}
        <Text fontSize={20} fontWeight="500" color={colors.text.dark}>
          {taskTitle}
        </Text>

        {/* 打卡圖片預覽 */}
        {imageUrl && (
          <View
            width={350}
            height={192}
            borderRadius="$md"
            overflow="hidden"
            alignSelf="center"
            backgroundColor={colors.basic.white}
          >
            <Image source={{ uri: imageUrl }} width="100%" height="100%" resizeMode="contain" />
          </View>
        )}

        {/* 分享按鈕 */}
        <YStack gap="$4" alignItems="center">
          <Text fontSize={16} fontWeight="500" color={colors.text.dark} textAlign="center">
            {t("share_to_social")}
          </Text>

          <Button
            size="$5"
            backgroundColor={colors.primary.base}
            pressStyle={{ backgroundColor: colors.primary.darker }}
            onPress={handleShare}
            width="100%"
          >
            <XStack alignItems="center" gap="$2">
              <Share2 size={20} color={colors.basic.white} />
              <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                {t("share")}
              </Text>
            </XStack>
          </Button>
        </YStack>
      </YStack>

      {/* 下載按鈕 */}
      <YStack
        borderTopWidth={1}
        borderTopColor={colors.basic["200"]}
        paddingVertical="$4"
        marginTop="$4"
      >
        <Button
          size="$4"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={colors.basic["300"]}
          pressStyle={{ backgroundColor: colors.basic["100"] }}
          onPress={handleDownloadImage}
          width="100%"
        >
          <XStack alignItems="center" gap="$2">
            <Download size={18} color={colors.text.dark} />
            <Text color={colors.text.dark} fontWeight="500">
              {t("download_image")}
            </Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  );
};
