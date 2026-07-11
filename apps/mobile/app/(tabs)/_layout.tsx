import BellOutlineSvg from "@daodao/assets/images/icon/bell-outline.svg";
import BellSolidSvg from "@daodao/assets/images/icon/bell-solid.svg";
import HomeOutlineSvg from "@daodao/assets/images/icon/home-outline.svg";
import HomeSolidSvg from "@daodao/assets/images/icon/home-solid.svg";
import SettingOutlineSvg from "@daodao/assets/images/icon/setting-outline.svg";
import SettingSolidSvg from "@daodao/assets/images/icon/setting-solid.svg";
import UserOutlineSvg from "@daodao/assets/images/icon/user-outline.svg";
import UserSolidSvg from "@daodao/assets/images/icon/user-solid.svg";
import { Plus } from "@tamagui/lucide-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/generated/design-tokens";
import { useNotifications } from "@/hooks/useNotifications";
import { useMobileTranslation } from "@/i18n";

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useMobileTranslation("mobile.tabs");
  const { unreadCount } = useNotifications();

  // 對齊 product：通知未讀數徽章（上限顯示 99+）
  const notificationBadge = unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined;

  const handleAddPractice = () => {
    router.push("/practices/create");
  };

  // 只在首頁顯示 FAB
  const showFab = pathname === "/" || pathname === "/index";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary.base,
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarShowLabel: false, // Product 只顯示圖標
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
        {/* 對齊 product：底部導覽只顯示 Home / Notifications / My Island / Settings 四個 */}
        <Tabs.Screen
          name="index"
          options={{
            title: t("home"),
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <HomeSolidSvg width={36} height={36} color={color} />
              ) : (
                <HomeOutlineSvg width={36} height={36} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: t("notifications"),
            tabBarBadge: notificationBadge,
            tabBarBadgeStyle: styles.notificationBadge,
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <BellSolidSvg width={36} height={36} color={color} />
              ) : (
                <BellOutlineSvg width={36} height={36} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile"),
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <UserSolidSvg width={36} height={36} color={color} />
              ) : (
                <UserOutlineSvg width={36} height={36} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings"),
            tabBarIcon: ({ color, focused }) =>
              focused ? (
                <SettingSolidSvg width={36} height={36} color={color} />
              ) : (
                <SettingOutlineSvg width={36} height={36} color={color} />
              ),
          }}
        />
        {/* 隱藏的頁面 - 保留路由但不在 Tab 顯示 */}
        <Tabs.Screen
          name="showcase"
          options={{
            href: null, // 對齊 product：靈感頁不在底部導覽，改由 explore 頁進入
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            href: null, // 對齊 product：社交/人脈改由 設定 → 連結 進入
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null, // 隱藏此 Tab
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            href: null, // 隱藏此 Tab，改用 FAB 進入
          }}
        />
      </Tabs>

      {/* FAB 按鈕 - 放在 Tab 層級以顯示在最上層 */}
      {showFab && (
        <Pressable
          style={styles.fab}
          onPress={handleAddPractice}
          accessibilityRole="button"
          accessibilityLabel={t("createPractice")}
        >
          <Plus size={24} color="white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notificationBadge: {
    backgroundColor: "#FF6E0B",
    color: colors.basic.white,
    fontSize: 10,
    fontWeight: "600",
  },
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
