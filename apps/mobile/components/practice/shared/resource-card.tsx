import { useExtractOgImage } from "@daodao/api";
import { BookOpen, Link2, X } from "@tamagui/lucide-icons";
import { memo, useCallback, useState } from "react";
import { Linking, Pressable, StyleSheet } from "react-native";
import { Image, Spinner, Text, View, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

export interface IResourceCardData {
  id: string | number;
  name: string;
  url?: string;
}

export interface ResourceCardProps {
  resource: IResourceCardData;
  onRemove?: () => void;
}

const ResourceCardComponent = ({ resource, onRemove }: ResourceCardProps) => {
  const t = useMobileTranslation("practice");
  const [imageError, setImageError] = useState(false);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);

  // 決定顯示的圖片：優先使用 og:image，如果沒有或載入失敗則顯示預設圖示
  const ogImageUrl = ogImageData?.ogImageUrl ?? null;

  const handlePress = useCallback(async () => {
    if (resource.url) {
      try {
        const canOpen = await Linking.canOpenURL(resource.url);
        if (canOpen) {
          await Linking.openURL(resource.url);
        }
      } catch (error) {
        console.error("Failed to open URL:", error);
      }
    }
  }, [resource.url]);

  const handleRemove = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove]
  );

  const shouldShowDefaultIcon = !resource.url || imageError || isLoading || !ogImageUrl;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityLabel={t("resource_open_accessibility", { name: resource.name })}
      accessibilityRole="link"
    >
      {/* Preview Area */}
      <View style={styles.previewContainer}>
        {shouldShowDefaultIcon ? (
          <View style={styles.defaultPreview}>
            {isLoading ? (
              <Spinner color={colors.primary.base} />
            ) : (
              <BookOpen size={40} color={colors.primary.base} opacity={0.5} />
            )}
          </View>
        ) : (
          <Image
            source={{ uri: ogImageUrl }}
            style={styles.previewImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
        {onRemove && (
          <Pressable
            onPress={handleRemove}
            style={styles.removeButton}
            accessibilityLabel={t("resource_remove_accessibility")}
            accessibilityRole="button"
          >
            <X size={12} color={colors.basic.white} />
          </Pressable>
        )}
      </View>

      {/* Info Area */}
      <XStack alignItems="center" justifyContent="space-between" gap="$1" padding="$2">
        <Text fontSize={12} color={colors.text.dark} numberOfLines={1} flex={1}>
          {resource.name}
        </Text>
        {resource.url && <Link2 size={16} color={colors.primary.base} />}
      </XStack>
    </Pressable>
  );
};

export const ResourceCard = memo(ResourceCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.resource.id === nextProps.resource.id &&
    prevProps.resource.name === nextProps.resource.name &&
    prevProps.resource.url === nextProps.resource.url
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.base,
    backgroundColor: colors.basic.white,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.8,
  },
  previewContainer: {
    position: "relative",
    aspectRatio: 169 / 93,
    backgroundColor: colors.basic["200"],
  },
  defaultPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.lightCyan,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(41, 94, 92, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});
