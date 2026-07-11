import { Search, X } from "@tamagui/lucide-icons";
import { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { Text, View, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useShowcaseSuggestions } from "@/hooks/useShowcaseSuggestions";
import { useMobileTranslation } from "@/i18n";

interface ShowcaseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

// 對齊 product ShowcaseSearchBar：預設收合成圓形圖示鈕，聚焦或有輸入時展開成滿版膠囊。
const COLLAPSED_SIZE = 40;
const ICON_COLOR_COLLAPSED = "rgba(41,94,92,0.6)"; // text.dark / 60
const ICON_COLOR_EXPANDED = "rgba(41,94,92,0.4)"; // text.dark / 40

export function ShowcaseSearchBar({ value, onChange, onSearch }: ShowcaseSearchBarProps) {
  const t = useMobileTranslation("mobile.home");
  const [focused, setFocused] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const inputRef = useRef<TextInput>(null);

  const expanded = focused || !!value;

  const { data: suggestionsData } = useShowcaseSuggestions(focused && !value);
  const suggestions = suggestionsData?.data;
  const trendingKeywords = suggestions?.trending_keywords ?? [];
  const interestTags = suggestions?.interest_tags ?? [];
  const allSuggestions = [...new Set([...trendingKeywords, ...interestTags])];

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const handleExpand = useCallback(() => {
    if (expanded) return;
    setFocused(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [expanded]);

  const handleClear = useCallback(() => {
    onChange("");
    onSearch("");
    inputRef.current?.focus();
  }, [onChange, onSearch]);

  const handleSubmit = useCallback(() => {
    onSearch(value);
    Keyboard.dismiss();
  }, [onSearch, value]);

  const handleSuggestionPress = useCallback(
    (keyword: string) => {
      onChange(keyword);
      onSearch(keyword);
      setFocused(false);
      Keyboard.dismiss();
    },
    [onChange, onSearch]
  );

  return (
    <View style={{ position: "relative", zIndex: 10 }} onLayout={handleLayout}>
      <XStack
        animation="medium"
        animateOnly={["width", "borderColor"]}
        onPress={handleExpand}
        width={expanded ? (containerWidth ?? "100%") : COLLAPSED_SIZE}
        height={COLLAPSED_SIZE}
        alignItems="center"
        justifyContent={expanded ? "flex-start" : "center"}
        backgroundColor="white"
        borderWidth={1}
        borderColor={expanded ? colors.gray.mid : colors.gray.light}
        borderRadius={COLLAPSED_SIZE / 2}
        paddingHorizontal={expanded ? 16 : 0}
        overflow="hidden"
      >
        <Search
          size={expanded ? 16 : 18}
          color={expanded ? ICON_COLOR_EXPANDED : ICON_COLOR_COLLAPSED}
          marginRight={expanded ? 8 : 0}
        />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          style={[styles.input, expanded ? styles.inputExpanded : styles.inputCollapsed]}
          pointerEvents={expanded ? "auto" : "none"}
          placeholder={t("search_placeholder")}
          placeholderTextColor={ICON_COLOR_EXPANDED}
        />
        {expanded && value ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={16} color={ICON_COLOR_EXPANDED} />
          </Pressable>
        ) : null}
      </XStack>

      {/* Suggestions dropdown */}
      {focused && !value && allSuggestions.length > 0 && (
        <View style={styles.dropdown}>
          {trendingKeywords.length > 0 && (
            <>
              <Text
                fontSize={12}
                color="rgba(0,0,0,0.5)"
                fontWeight="500"
                paddingHorizontal="$3"
                paddingVertical="$1"
              >
                {t("recent_hot")}
              </Text>
              {trendingKeywords.map((kw) => (
                <Pressable
                  key={kw}
                  onPress={() => handleSuggestionPress(kw)}
                  style={styles.suggestionItem}
                >
                  <Text fontSize={14} color={colors.text.dark}>
                    {kw}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
          {interestTags.length > 0 && (
            <>
              <Text
                fontSize={12}
                color="rgba(0,0,0,0.5)"
                fontWeight="500"
                paddingHorizontal="$3"
                paddingVertical="$1"
                marginTop="$1"
              >
                {t("your_interests")}
              </Text>
              {interestTags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => handleSuggestionPress(tag)}
                  style={styles.suggestionItem}
                >
                  <Text fontSize={14} color={colors.text.dark}>
                    #{tag}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    color: colors.text.dark,
    padding: 0,
  },
  inputExpanded: {
    flex: 1,
    opacity: 1,
  },
  inputCollapsed: {
    width: 0,
    opacity: 0,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#C1ECFF",
    borderRadius: 12,
    paddingVertical: 8,
    maxHeight: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
