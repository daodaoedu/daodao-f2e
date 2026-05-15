import { Camera, X } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

const MAX_FILES = 3;

interface IMediaUploadFieldProps {
  value: string[];
  onChange: (uris: string[]) => void;
}

/**
 * 媒體上傳欄位組件 (Mobile)
 */
export const MediaUploadField = ({ value, onChange }: IMediaUploadFieldProps) => {
  const handlePickImage = useCallback(async () => {
    if (value.length >= MAX_FILES) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_FILES - value.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => asset.uri);
      onChange([...value, ...newMedia].slice(0, MAX_FILES));
    }
  }, [value, onChange]);

  const handleRemoveMedia = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  return (
    <YStack marginBottom="$8">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
        <Text fontSize={16} fontWeight="500" color={colors.text.dark}>
          上傳照片
        </Text>
        <Text fontSize={14} color={colors.basic["400"]}>
          已上傳 {value.length}/{MAX_FILES} 張
        </Text>
      </XStack>

      <XStack gap="$3" flexWrap="wrap">
        {/* 已上傳的媒體預覽 */}
        {value.map((uri, index) => (
          <View key={uri} style={styles.mediaPreview}>
            <View
              width={80}
              height={80}
              borderRadius="$sm"
              overflow="hidden"
              backgroundColor={colors.basic["200"]}
            >
              <Image source={{ uri }} width={80} height={80} resizeMode="cover" />
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemoveMedia(index)}
              accessibilityLabel="移除媒體"
              accessibilityRole="button"
            >
              <X size={12} color={colors.basic.white} />
            </Pressable>
          </View>
        ))}

        {/* 上傳按鈕 */}
        {value.length < MAX_FILES && (
          <Pressable style={styles.uploadButton} onPress={handlePickImage}>
            <Camera size={24} color={colors.basic["400"]} />
            <Text fontSize={12} color={colors.basic["400"]}>
              點擊上傳
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
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.semantic.error,
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
