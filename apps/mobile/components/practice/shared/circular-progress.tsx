import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  textColor?: string;
  progressColor?: string;
  backgroundColor?: string;
}

/**
 * 圓形進度條組件 (Mobile)
 */
export const CircularProgress = ({
  value,
  size = 60,
  strokeWidth = 4,
  showText = true,
  textColor = colors.primary.base,
  progressColor = colors.primary.base,
  backgroundColor = colors.basic["200"],
}: CircularProgressProps) => {
  const t = useMobileTranslation("practice");
  const { radius, circumference, offset, clampedValue } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = r * 2 * Math.PI;
    const clamped = Math.min(100, Math.max(0, value));
    const o = c - (clamped / 100) * c;
    return { radius: r, circumference: c, offset: o, clampedValue: clamped };
  }, [size, strokeWidth, value]);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={t("progress_accessibility", { progress: Math.round(value) })}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
    >
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      {showText && (
        <View style={styles.textContainer}>
          <Text fontSize={size > 50 ? 16 : 12} fontWeight="600" color={textColor}>
            {Math.round(value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
