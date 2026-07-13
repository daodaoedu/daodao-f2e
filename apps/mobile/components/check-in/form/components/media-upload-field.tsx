import { CHECK_IN_MAX_IMAGES } from "@daodao/shared/lib/check-in-image";
import { Camera, X } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

interface IMediaUploadFieldProps {
  /** 新選取的本地圖片 uri */
  value: string[];
  onChange: (uris: string[]) => void;
  /** 既有圖片 URL（編輯時預填），可移除，對齊 product 的 existingImages */
  existingImages?: string[];
  onExistingImagesChange?: (urls: string[]) => void;
}

/**
 * 媒體上傳欄位組件 (Mobile)
 * 支援既有圖片（編輯）+ 新選取圖片，總數上限 CHECK_IN_MAX_IMAGES
 */
export const MediaUploadField = ({
  value,
  onChange,
  existingImages = [],
  onExistingImagesChange,
}: IMediaUploadFieldProps) => {
  const t = useMobileTranslation("mobile.checkIn");
  const total = existingImages.length + value.length;

  const handlePickImage = useCallback(async () => {
    const remaining = CHECK_IN_MAX_IMAGES - existingImages.length - value.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      // Images only: videos cannot be previewed with the Image component
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => asset.uri);
      onChange([...value, ...newMedia].slice(0, remaining).slice(0, CHECK_IN_MAX_IMAGES));
    }
  }, [value, onChange, existingImages.length]);

  const handleRemoveExisting = useCallback(
    (index: number) => {
      onExistingImagesChange?.(existingImages.filter((_, i) => i !== index));
    },
    [existingImages, onExistingImagesChange]
  );

  const handleRemoveNew = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  return (
    <YStack marginBottom="$8">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
          {t("upload_images")}
        </Text>
        <Text fontSize={14} color={colors.basic["400"]}>
          {t("uploaded_count", { count: total, total: CHECK_IN_MAX_IMAGES })}
        </Text>
      </XStack>

      <XStack gap="$3" flexWrap="wrap">
        {/* 既有圖片（編輯時） */}
        {existingImages.map((uri, index) => (
          <View key={`existing-${uri}`} style={styles.mediaPreview}>
            <View style={styles.thumb}>
              <Image
                source={{ uri }}
                width={80}
                height={80}
                resizeMode="cover"
                alt={t("image_preview_alt", { number: index + 1 })}
              />
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveExisting(index)}
              accessibilityLabel={t("remove_image")}
              accessibilityRole="button"
            >
              <X size={12} color={colors.basic.white} />
            </Pressable>
          </View>
        ))}

        {/* 新選取的圖片預覽 */}
        {value.map((uri, index) => (
          <View key={`new-${uri}`} style={styles.mediaPreview}>
            <View style={styles.thumb}>
              <Image
                source={{ uri }}
                width={80}
                height={80}
                resizeMode="cover"
                alt={t("image_preview_alt", { number: existingImages.length + index + 1 })}
              />
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveNew(index)}
              accessibilityLabel={t("remove_image")}
              accessibilityRole="button"
            >
              <X size={12} color={colors.basic.white} />
            </Pressable>
          </View>
        ))}

        {/* 上傳按鈕 */}
        {total < CHECK_IN_MAX_IMAGES && (
          <Pressable style={styles.uploadButton} onPress={handlePickImage}>
            <Camera size={24} color={colors.basic["400"]} />
            <Text fontSize={12} color={colors.basic["400"]}>
              {t("tap_upload")}
            </Text>
          </Pressable>
        )}
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  mediaPreview: {
    position: "relative",
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.basic["200"],
    backgroundColor: colors.basic["200"],
  },
  removeButton: {
    // 對齊 product：半透明 teal、內縮於預覽圖右上角
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(41, 94, 92, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.basic["300"],
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
