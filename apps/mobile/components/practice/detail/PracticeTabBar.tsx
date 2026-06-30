import { Pressable, StyleSheet } from "react-native";
import { Text, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

export type PracticeTab = "comments" | "checkins" | "resources";

interface PracticeTabBarProps {
  activeTab: PracticeTab;
  onTabChange: (tab: PracticeTab) => void;
  commentCount?: number;
  checkinCount?: number;
  resourceCount?: number;
}

const TABS: { key: PracticeTab; labelKey: string }[] = [
  { key: "comments", labelKey: "tab_comments" },
  { key: "checkins", labelKey: "tab_checkins" },
  { key: "resources", labelKey: "tab_resources" },
];

export function PracticeTabBar({
  activeTab,
  onTabChange,
  commentCount,
  checkinCount,
  resourceCount,
}: PracticeTabBarProps) {
  const t = useMobileTranslation("mobile.practiceDetail");
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
        const tabLabel = t(tab.labelKey);
        const label = count != null && count > 0 ? `${tabLabel}(${count})` : tabLabel;
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
