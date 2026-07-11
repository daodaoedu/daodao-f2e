import { useExtractOgImage } from "@daodao/api";
import BookSvg from "@daodao/assets/images/dashboard/book.svg";
import { useCallback, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";
import { Spinner, Text, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import type { IPracticeResource } from "@/types/practice";

interface PracticeResourceListCardProps {
  resource: IPracticeResource;
}

/**
 * 使用資源列表卡片 (Mobile)
 * 對齊 product：橫向卡片（左側 100px 縮圖 + 右側名稱/連結），縮圖優先用 og:image，否則 BookSvg。
 */
export function PracticeResourceListCard({ resource }: PracticeResourceListCardProps) {
  const [imageError, setImageError] = useState(false);
  const { data: ogImageData, isLoading } = useExtractOgImage(resource.url);
  const ogImageUrl = ogImageData?.ogImageUrl ?? null;
  const showDefault = !resource.url || imageError || isLoading || !ogImageUrl;

  const handlePress = useCallback(async () => {
    if (!resource.url) return;
    try {
      if (await Linking.canOpenURL(resource.url)) {
        await Linking.openURL(resource.url);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  }, [resource.url]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="link"
    >
      <View style={styles.thumb}>
        {showDefault ? (
          <View style={styles.thumbDefault}>
            {isLoading ? (
              <Spinner color={colors.primary.base} />
            ) : (
              <BookSvg width={56} height={56} opacity={0.5} />
            )}
          </View>
        ) : (
          <Image
            source={{ uri: ogImageUrl }}
            style={styles.thumbImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
      </View>

      <YStack flex={1} paddingVertical={4} justifyContent="center">
        <Text fontSize={14} fontWeight="600" color="#295E5C" numberOfLines={2}>
          {resource.name}
        </Text>
        {resource.url ? (
          <Text fontSize={12} color={colors.logo.cyan} numberOfLines={2} marginTop={6}>
            {resource.url}
          </Text>
        ) : null}
      </YStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4EAE9",
    backgroundColor: "white",
    padding: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  thumb: {
    width: 100,
    height: 72,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#D4E8E6",
  },
  thumbDefault: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.lightCyan,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
