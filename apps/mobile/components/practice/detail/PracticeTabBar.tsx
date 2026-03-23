import { Pressable, StyleSheet } from "react-native";
import { Text, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

export type PracticeTab = "comments" | "checkins" | "resources";

interface PracticeTabBarProps {
  activeTab: PracticeTab;
  onTabChange: (tab: PracticeTab) => void;
  commentCount?: number;
}

const TABS: { key: PracticeTab; label: string }[] = [
  { key: "comments", label: "留言" },
  { key: "checkins", label: "打卡紀錄" },
  { key: "resources", label: "資源" },
];

export function PracticeTabBar({ activeTab, onTabChange, commentCount }: PracticeTabBarProps) {
  return (
    <XStack borderBottomWidth={1} borderBottomColor="#E5E7EB">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const label = tab.key === "comments" && commentCount != null && commentCount > 0
          ? `${tab.label} (${commentCount})`
          : tab.label;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text
              fontSize={14}
              fontWeight="500"
              color={isActive ? colors.text.dark : "rgba(0,0,0,0.4)"}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#16B9B3",
  },
});
