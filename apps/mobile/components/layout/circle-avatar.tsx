import { Image, StyleSheet } from "react-native";
import { Text, View } from "tamagui";

interface CircleAvatarProps {
  uri?: string | null;
  size: number;
  fallbackText: string;
  backgroundColor?: string;
  fallbackTextColor?: string;
  fallbackFontSize?: number;
}

/**
 * 圓形頭像，有圖顯示圖片，無圖顯示名稱首字
 */
export function CircleAvatar({
  uri,
  size,
  fallbackText,
  backgroundColor = "#F3F4F6",
  fallbackTextColor = "#9CA3AF",
  fallbackFontSize,
}: CircleAvatarProps) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.circle, circleStyle, { backgroundColor }]}>
      {uri ? (
        <Image source={{ uri }} style={circleStyle} />
      ) : (
        <Text fontSize={fallbackFontSize ?? size * 0.36} color={fallbackTextColor}>
          {fallbackText.slice(0, 1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
