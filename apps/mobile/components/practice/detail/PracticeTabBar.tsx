import { Pressable, StyleSheet } from "react-native";
import { Text, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

export type PracticeTab = "comments" | "checkins" | "resources";

interface PracticeTabBarProps {
  activeTab: PracticeTab;
  onTabChange: (tab: PracticeTab) => void;
  commentCount?: number;
  checkinCount?: number;
  resourceCount?: number;
}

const TABS: { key: PracticeTab; label: string }[] = [
  { key: "comments", label: "留言" },
  { key: "checkins", label: "打卡紀錄" },
  { key: "resources", label: "使用資源" },
];

export function PracticeTabBar({
  activeTab,
  onTabChange,
  commentCount,
  checkinCount,
  resourceCount,
}: PracticeTabBarProps) {
  const countMap: Record<PracticeTab, number | undefined> = {
    comments: commentCount,
    checkins: checkinCount,
    resources: resourceCount,
  };

  return (
    <XStack borderBottomWidth={1} borderBottomColor="#E5E7EB">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = countMap[tab.key];
        const label = count != null && count > 0 ? `${tab.label}(${count})` : tab.label;
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
