import { Bell, Plus, Settings } from "@tamagui/lucide-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { HomeIcon, UserIcon } from "@/components/icons";
import { colors } from "@/generated/design-tokens";

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const handleAddPractice = () => {
    router.push("/practices/create");
  };

  // FAB 在 Home tab 顯示（pathname === "/" 涵蓋兩個 sub-tabs）
  const showFab = pathname === "/";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary.base,
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarShowLabel: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "rgba(249, 254, 255, 0.9)",
            borderTopWidth: 2,
            borderTopColor: "#C1ECFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: Platform.OS === "ios" ? 70 : 60,
            paddingTop: 0,
            paddingBottom: Platform.OS === "ios" ? 16 : 8,
            paddingHorizontal: 40,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              },
              android: {
                elevation: 8,
              },
            }),
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "主頁",
            tabBarIcon: ({ color, focused }) => (
              <HomeIcon size={32} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "通知",
            tabBarIcon: ({ color }) => <Bell size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "我的小島",
            tabBarIcon: ({ color, focused }) => (
              <UserIcon size={32} color={color} filled={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "設定",
            tabBarIcon: ({ color }) => <Settings size={28} color={color} />,
          }}
        />
      </Tabs>

      {/* FAB - 在 Home tab 顯示 */}
      {showFab && (
        <Pressable
          style={styles.fab}
          onPress={handleAddPractice}
          accessibilityRole="button"
          accessibilityLabel="建立主題實踐"
        >
          <Plus size={24} color="white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 82 : 72,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#16B9B3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 999,
  },
});
