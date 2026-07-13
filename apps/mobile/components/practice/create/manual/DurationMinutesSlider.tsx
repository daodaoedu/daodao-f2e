import { useCallback, useMemo, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  type NativeTouchEvent,
  PanResponder,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { DURATION_MINUTES_OPTIONS } from "./schema";

const THUMB = 22;
const TRACK_H = 6;

interface DurationMinutesSliderProps {
  value: number;
  onChange: (value: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 離散分鐘滑桿（15 / 30 / 45 / 60），對齊 product step-3 Slider。
 * 支援：拖曳 thumb、點軌道、點下方標籤。
 */
export function DurationMinutesSlider({ value, onChange, style }: DurationMinutesSliderProps) {
  const t = useMobileTranslation("practice");
  const cyan = colors.logo.cyan;
  const trackRef = useRef<View>(null);
  const trackPageX = useRef(0);
  const trackWidth = useRef(0);
  const [width, setWidth] = useState(0);

  const values = useMemo(() => DURATION_MINUTES_OPTIONS.map((o) => o.value), []);
  const lastIndex = values.length - 1;

  const indexOfValue = useCallback(
    (v: number) => {
      const i = values.findIndex((opt) => opt === v);
      return i >= 0 ? i : 0;
    },
    [values]
  );

  const valueFromPageX = useCallback(
    (pageX: number) => {
      const w = trackWidth.current;
      if (w <= 0) return values[0];
      const x = pageX - trackPageX.current;
      const ratio = Math.max(0, Math.min(1, x / w));
      const idx = Math.round(ratio * lastIndex);
      return values[idx] ?? values[0];
    },
    [lastIndex, values]
  );

  const measureAndApply = useCallback(
    (evt: NativeTouchEvent) => {
      trackRef.current?.measureInWindow((x, _y, w) => {
        trackPageX.current = x;
        trackWidth.current = w;
        onChange(valueFromPageX(evt.pageX));
      });
    },
    [onChange, valueFromPageX]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (e) => {
          measureAndApply(e.nativeEvent);
        },
        onPanResponderMove: (e) => {
          // grant 時已 measure；move 用快取的 pageX / width
          if (trackWidth.current <= 0) {
            measureAndApply(e.nativeEvent);
            return;
          }
          onChange(valueFromPageX(e.nativeEvent.pageX));
        },
      }),
    [measureAndApply, onChange, valueFromPageX]
  );

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const index = indexOfValue(value);
  const pct = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
  // thumb 中心對齊：用像素而非 %，避免半寬卡片誤差
  const thumbLeft =
    width > 0 ? (index / lastIndex) * width - THUMB / 2 : `${pct}%`;

  return (
    <YStack gap="$3" style={style}>
      <View
        ref={trackRef}
        style={styles.hitArea}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel={t("form_session_duration")}
        accessibilityValue={{
          min: values[0],
          max: values[lastIndex],
          now: value,
        }}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: cyan }]} />
        </View>
        <View
          style={[
            styles.thumb,
            {
              left: thumbLeft as number | `${number}%`,
              backgroundColor: cyan,
              borderColor: colors.basic.white,
            },
          ]}
        />
      </View>

      <XStack justifyContent="space-between">
        {DURATION_MINUTES_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Text
              key={option.value}
              fontSize={14}
              fontWeight={selected ? "600" : "400"}
              color={selected ? cyan : colors.text.muted}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              {t(option.labelKey)}
            </Text>
          );
        })}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    height: THUMB + 16,
    justifyContent: "center",
    // 擴大可點區域，拖曳更順
    paddingVertical: 8,
  },
  track: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: colors.basic[200],
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position: "absolute",
    top: 8,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
    // 讓 thumb 看起來浮在軌道上
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
