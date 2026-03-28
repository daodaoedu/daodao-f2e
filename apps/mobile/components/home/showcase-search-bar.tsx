import { Search, X } from "@tamagui/lucide-icons";
import { useCallback, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput } from "react-native";
import { Text, View, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useShowcaseSuggestions } from "@/hooks/useShowcaseSuggestions";

interface ShowcaseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export function ShowcaseSearchBar({ value, onChange, onSearch }: ShowcaseSearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { data: suggestionsData } = useShowcaseSuggestions(focused && !value);
  const suggestions = suggestionsData?.data;
  const trendingKeywords = suggestions?.trending_keywords ?? [];
  const interestTags = suggestions?.interest_tags ?? [];
  const allSuggestions = [...new Set([...trendingKeywords, ...interestTags])];

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
    <View style={{ position: "relative", zIndex: 10 }}>
      <XStack
        alignItems="center"
        gap="$2"
        backgroundColor="white"
        borderWidth={1}
        borderColor={focused ? "#9CA3AF" : "#D1D5DB"}
        borderRadius={12}
        paddingHorizontal="$3"
        paddingVertical="$2.5"
      >
        <Search size={16} color="rgba(0,0,0,0.4)" />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          style={styles.input}
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
        {value ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={16} color="rgba(0,0,0,0.4)" />
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
                近期熱門
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
                你的興趣
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
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    padding: 0,
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
