import LikeOutlineSvg from "@daodao/assets/images/icon/like-outline.svg";
import { useCallback, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";
import { PICKER_REACTIONS, type ReactionTypeType } from "@/constants/reaction-type";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { LottieEmoji } from "./LottieEmoji";

const LONG_PRESS_DELAY = 400;

// ── ReactionEmojiStack — 疊加 emoji 圓圈（共用） ──

interface ReactionEmojiStackProps {
  reactions: ReactionTypeType[];
  selectedReaction?: ReactionTypeType | null;
  emojiSize: number;
  overlap: number;
  showCircle?: boolean;
  /** 有色圓的 box 尺寸（含 border）。summary=32、comment=22（對齊 product size-7 / size-5） */
  circleSize?: number;
  /** 白環寬度（RN border 內縮）。summary=2、comment=1 */
  circleBorderWidth?: number;
}

function ReactionEmojiStack({
  reactions,
  selectedReaction,
  emojiSize,
  overlap,
  showCircle,
  circleSize = 32,
  circleBorderWidth = 2,
}: ReactionEmojiStackProps) {
  return (
    <XStack alignItems="center">
      {reactions.slice(0, PICKER_REACTIONS.length).map((type, i) => (
        <View
          key={type}
          style={[
            showCircle && {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: selectedReaction === type ? "#E8FAF9" : "#EAF7FF",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: circleBorderWidth,
              borderColor: "white",
            },
            i > 0 && { marginLeft: overlap },
          ]}
        >
          <LottieEmoji type={type} size={emojiSize} play={false} />
        </View>
      ))}
    </XStack>
  );
}

interface ReactionPickerButtonProps {
  selectedReaction: ReactionTypeType | null;
  onToggle: (type: ReactionTypeType) => void;
  /**
   * "summary" — 卡片摘要列，大圓 emoji 泡泡 + 「X 與其他 N 人」文字
   * "card"    — 卡片層級大按鈕
   * "comment" — 留言層級小按鈕（size-5 圓 / emoji 14 + 總數），對齊 product
   */
  variant?: "summary" | "card" | "comment";
  totalCount?: number;
  displayReactions?: ReactionTypeType[];
  firstReactorName?: string;
}

export function ReactionPickerButton({
  selectedReaction,
  onToggle,
  variant = "summary",
  totalCount = 0,
  displayReactions = [],
  firstReactorName,
}: ReactionPickerButtonProps) {
  const t = useMobileTranslation("mobile.reactions");
  const [pickerOpen, setPickerOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openPicker = useCallback(() => {
    setPickerOpen(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const closePicker = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setPickerOpen(false));
  }, [fadeAnim]);

  const handleSelect = useCallback(
    (type: ReactionTypeType) => {
      onToggle(type);
      closePicker();
    },
    [onToggle, closePicker]
  );

  const isSummary = variant === "summary";
  const isComment = variant === "comment";
  const hasReactions = displayReactions.length > 0 || selectedReaction != null;
  const commentAccent = selectedReaction != null ? colors.logo.cyan : "#9FB5B8";

  const summaryText = (() => {
    if (totalCount <= 0) return null;
    if (firstReactorName) {
      return totalCount > 1
        ? t("with_others", { name: firstReactorName, count: totalCount - 1 })
        : firstReactorName;
    }
    return t("people_count", { count: totalCount });
  })();

  return (
    <View style={isSummary ? styles.summaryContainer : styles.cardContainer}>
      {pickerOpen && (
        <Pressable style={[StyleSheet.absoluteFill, { zIndex: 5 }]} onPress={closePicker} />
      )}

      {pickerOpen && (
        <Animated.View style={[styles.picker, { opacity: fadeAnim }]}>
          {PICKER_REACTIONS.map((type) => {
            const isSelected = selectedReaction === type;
            return (
              <Pressable
                key={type}
                onPress={() => handleSelect(type)}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
              >
                <LottieEmoji type={type} size={24} play />
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      <Pressable
        onLongPress={openPicker}
        onPress={() => {
          if (pickerOpen) {
            closePicker();
          }
        }}
        delayLongPress={LONG_PRESS_DELAY}
        style={styles.trigger}
      >
        {isSummary ? (
          <XStack alignItems="center" gap="$2">
            {hasReactions ? (
              <ReactionEmojiStack
                reactions={
                  displayReactions.length > 0
                    ? displayReactions
                    : selectedReaction
                      ? [selectedReaction]
                      : []
                }
                selectedReaction={selectedReaction}
                emojiSize={18}
                overlap={-10}
                showCircle
              />
            ) : (
              <LikeOutlineSvg width={24} height={24} color="#9FB5B8" />
            )}
            {summaryText && (
              <Text fontSize={14} color="#295E5C">
                {summaryText}
              </Text>
            )}
          </XStack>
        ) : isComment ? (
          <XStack alignItems="center" gap="$1">
            {hasReactions ? (
              <ReactionEmojiStack
                reactions={
                  displayReactions.length > 0
                    ? displayReactions
                    : selectedReaction
                      ? [selectedReaction]
                      : []
                }
                selectedReaction={selectedReaction}
                emojiSize={14}
                overlap={-4}
                showCircle
                circleSize={22}
                circleBorderWidth={1}
              />
            ) : (
              <LikeOutlineSvg width={20} height={20} color="#9FB5B8" />
            )}
            {totalCount > 0 && (
              <Text fontSize={12} fontWeight="500" color={commentAccent}>
                {totalCount}
              </Text>
            )}
          </XStack>
        ) : (
          <XStack alignItems="center" justifyContent="center" gap="$2" width="100%">
            {displayReactions.length > 0 ? (
              <ReactionEmojiStack
                reactions={displayReactions}
                selectedReaction={selectedReaction}
                emojiSize={18}
                overlap={-4}
              />
            ) : selectedReaction ? (
              <LottieEmoji type={selectedReaction} size={18} play={false} />
            ) : (
              <LikeOutlineSvg width={20} height={20} color="#9FB5B8" />
            )}
            {totalCount > 0 && (
              <Text fontSize={14} fontWeight="500" color="#295E5C">
                {totalCount}
              </Text>
            )}
          </XStack>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    position: "relative",
  },
  cardContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  trigger: {
    zIndex: 1,
  },
  picker: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    marginBottom: 8,
    flexDirection: "row",
    gap: 4,
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E4EAE9",
    zIndex: 10,
  },
  pickerItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerItemSelected: {
    backgroundColor: "#E8FAF9",
  },
});
