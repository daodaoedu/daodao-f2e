import { Pressable, StyleSheet } from "react-native";
import { Text, XStack, View } from "tamagui";
import { colors } from "@/generated/design-tokens";

export type TabType = "inspire" | "mine";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <XStack borderBottomWidth={1} borderBottomColor="#E5E7EB" marginBottom="$3">
      <Pressable style={styles.tab} onPress={() => onTabChange("inspire")}>
        <Text
          fontSize={14}
          fontWeight="500"
          color={activeTab === "inspire" ? colors.text.dark : "rgba(0,0,0,0.4)"}
          paddingVertical="$2"
        >
          靈感
        </Text>
        {activeTab === "inspire" && <View style={styles.activeIndicator} />}
      </Pressable>
      <Pressable style={styles.tab} onPress={() => onTabChange("mine")}>
        <Text
          fontSize={14}
          fontWeight="500"
          color={activeTab === "mine" ? colors.text.dark : "rgba(0,0,0,0.4)"}
          paddingVertical="$2"
        >
          我的
        </Text>
        {activeTab === "mine" && <View style={styles.activeIndicator} />}
      </Pressable>
    </XStack>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#16B9B3", // logo-cyan
  },
});
