import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "tamagui";
import { colors } from "@/generated/design-tokens";

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
  const { radius, circumference, offset } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = r * 2 * Math.PI;
    const o = c - (value / 100) * c;
    return { radius: r, circumference: c, offset: o };
  }, [size, strokeWidth, value]);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`進度 ${Math.round(value)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
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
          <Text
            fontSize={size > 50 ? 16 : 12}
            fontWeight="600"
            color={textColor}
          >
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
