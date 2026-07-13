import { useExtractOgImage } from "@daodao/api";
import BookSvg from "@daodao/assets/images/dashboard/book.svg";
import { Link2, X } from "@tamagui/lucide-icons";
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

/**
 * 對齊 product `practice/shared/resource-card.tsx`：
 * - border logo-cyan、rounded-lg、白底
 * - 預覽區 aspect 169/93、無 og 時 light-cyan + BookSvg
 * - 底部 name + Link2
 */
const ResourceCardComponent = ({ resource, onRemove }: ResourceCardProps) => {
  const t = useMobileTranslation("practice");
  const [imageError, setImageError] = useState(false);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);

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

  // 對齊 product：無 url / loading / error / 無 og → 預設書本圖
  const shouldShowDefaultIcon = !resource.url || imageError || isLoading || !ogImageUrl;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityLabel={t("resource_open_accessibility", { name: resource.name })}
      accessibilityRole="link"
    >
      {/* Preview — aspect-169/93 */}
      <View style={styles.previewContainer}>
        {shouldShowDefaultIcon ? (
          <View style={styles.defaultPreview}>
            {isLoading ? (
              <Spinner color={colors.logo.cyan} />
            ) : (
              // product: <BookSvg width={100} height={95} className="opacity-50" />
              <View style={{ opacity: 0.5 }}>
                <BookSvg width={100} height={95} />
              </View>
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

      {/* Info — text-xs p-2 */}
      <XStack alignItems="center" justifyContent="space-between" gap={4} padding={8}>
        <Text fontSize={12} color={colors.text.dark} numberOfLines={1} flex={1}>
          {resource.name}
        </Text>
        {resource.url && <Link2 size={16} color={colors.logo.cyan} />}
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
    // product: rounded-lg border border-logo-cyan bg-white
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.logo.cyan,
    backgroundColor: colors.basic.white,
    overflow: "hidden",
    width: "100%",
  },
  cardPressed: {
    opacity: 0.85,
  },
  previewContainer: {
    position: "relative",
    // product: aspect-169/93
    aspectRatio: 169 / 93,
    backgroundColor: colors.background.gray,
    overflow: "hidden",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  defaultPreview: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    // product: bg-light-cyan
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
