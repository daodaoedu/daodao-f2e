import { useCallback, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";
import { ThumbsUp } from "@tamagui/lucide-icons";
import {
  PICKER_REACTIONS,
  REACTION_CONFIG,
  type ReactionTypeType,
} from "@/constants/reaction-type";

const LONG_PRESS_DELAY = 400;

interface ReactionPickerButtonProps {
  selectedReaction: ReactionTypeType | null;
  onToggle: (type: ReactionTypeType) => void;
  variant?: "summary" | "card";
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
  const hasReactions = displayReactions.length > 0 || selectedReaction != null;

  const summaryText = (() => {
    if (totalCount <= 0) return null;
    if (firstReactorName) {
      return totalCount > 1
        ? `${firstReactorName} 與其他 ${totalCount - 1} 人`
        : firstReactorName;
    }
    return `${totalCount} 人`;
  })();

  return (
    <View style={isSummary ? styles.summaryContainer : styles.cardContainer}>
      {pickerOpen && (
        <Pressable style={[StyleSheet.absoluteFill, { zIndex: 5 }]} onPress={closePicker} />
      )}

      {pickerOpen && (
        <Animated.View style={[styles.picker, { opacity: fadeAnim }]}>
          {PICKER_REACTIONS.map((type) => {
            const config = REACTION_CONFIG[type];
            const isSelected = selectedReaction === type;
            return (
              <Pressable
                key={type}
                onPress={() => handleSelect(type)}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
              >
                <Text fontSize={24}>{config.emoji}</Text>
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
              <XStack alignItems="center">
                {(displayReactions.length > 0
                  ? displayReactions.slice(0, 2)
                  : selectedReaction
                    ? [selectedReaction]
                    : []
                ).map((type, i) => (
                  <View
                    key={type}
                    style={[
                      styles.emojiCircle,
                      selectedReaction === type && styles.emojiCircleSelected,
                      i > 0 && { marginLeft: -6 },
                    ]}
                  >
                    <Text fontSize={14}>{REACTION_CONFIG[type]?.emoji ?? "👍"}</Text>
                  </View>
                ))}
              </XStack>
            ) : (
              <ThumbsUp size={20} color="#9FB5B8" />
            )}
            {summaryText && (
              <Text fontSize={13} color="#295E5C">{summaryText}</Text>
            )}
          </XStack>
        ) : (
          <XStack alignItems="center" justifyContent="center" gap="$2" width="100%">
            {displayReactions.length > 0 ? (
              <XStack alignItems="center">
                {displayReactions.slice(0, 2).map((type, i) => (
                  <View key={type} style={[{ marginLeft: i > 0 ? -4 : 0 }]}>
                    <Text fontSize={18}>{REACTION_CONFIG[type]?.emoji ?? "👍"}</Text>
                  </View>
                ))}
              </XStack>
            ) : selectedReaction ? (
              <Text fontSize={18}>{REACTION_CONFIG[selectedReaction]?.emoji ?? "👍"}</Text>
            ) : (
              <ThumbsUp size={20} color="#9FB5B8" />
            )}
            {totalCount > 0 && (
              <Text fontSize={14} fontWeight="500" color="#295E5C">{totalCount}</Text>
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
  emojiCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EAF7FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  emojiCircleSelected: {
    backgroundColor: "#E8FAF9",
  },
});
