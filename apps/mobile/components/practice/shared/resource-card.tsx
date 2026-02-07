import { memo, useState, useCallback } from "react";
import { Pressable, StyleSheet, Linking } from "react-native";
import { XStack, Text, View, Image, Spinner } from "tamagui";
import { Link2, X, BookOpen } from "@tamagui/lucide-icons";
import { colors } from "@/generated/design-tokens";

export interface ResourceCardData {
  id: string | number;
  name: string;
  url?: string;
}

export interface ResourceCardProps {
  resource: ResourceCardData;
  onRemove?: () => void;
}

const ResourceCardComponent = ({ resource, onRemove }: ResourceCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Simple check if URL is an image
  const isImageUrl = resource.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

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

  const shouldShowDefaultIcon = !resource.url || imageError || !isImageUrl;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityLabel={`開啟資源：${resource.name}`}
      accessibilityRole="link"
    >
      {/* Preview Area */}
      <View style={styles.previewContainer}>
        {shouldShowDefaultIcon ? (
          <View style={styles.defaultPreview}>
            {imageLoading && isImageUrl ? (
              <Spinner color={colors.primary.base} />
            ) : (
              <BookOpen size={40} color={colors.primary.base} opacity={0.5} />
            )}
          </View>
        ) : (
          <Image
            source={{ uri: resource.url }}
            style={styles.previewImage}
            resizeMode="cover"
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
          />
        )}
        {onRemove && (
          <Pressable
            onPress={handleRemove}
            style={styles.removeButton}
            accessibilityLabel="移除資源"
            accessibilityRole="button"
          >
            <X size={12} color={colors.basic.white} />
          </Pressable>
        )}
      </View>

      {/* Info Area */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap="$1"
        padding="$2"
      >
        <Text
          fontSize={12}
          color={colors.text.dark}
          numberOfLines={1}
          flex={1}
        >
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
