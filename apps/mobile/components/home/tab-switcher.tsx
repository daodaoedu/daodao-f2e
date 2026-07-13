import { Pressable, StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";

export type TabType = "inspire" | "mine" | "persona";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { key: TabType; labelKey: string }[] = [
  { key: "inspire", labelKey: "tab_inspire" },
  { key: "mine", labelKey: "tab_mine" },
  { key: "persona", labelKey: "tab_persona" },
];

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const t = useMobileTranslation("mobile.home");

  return (
    <XStack borderBottomWidth={1} borderBottomColor="#E5E7EB" marginBottom="$3">
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onTabChange(tab.key)}>
            <Text
              fontSize={14}
              fontWeight="500"
              color={active ? colors.text.dark : "rgba(0,0,0,0.4)"}
              paddingVertical="$2"
            >
              {t(tab.labelKey)}
            </Text>
            {active && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </XStack>
  );
}

const styles = StyleSheet.create({
  tab: { flex: 1, alignItems: "center", position: "relative" },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.logo.cyan,
  },
});
