import { PortalProvider } from "@tamagui/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { TamaguiProvider, Theme } from "tamagui";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { MobileI18nProvider } from "../i18n";
import config from "../tamagui.config";

// 防止 splash screen 自動隱藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 載入所有需要的字重，名稱需與 tamagui.config.ts 中的 face 映射一致
  const [loaded, error] = useFonts({
    Inter_400: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
    Inter_500: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    Inter_600: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
    Inter_700: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <PortalProvider>
        <Theme name={colorScheme === "dark" ? "dark" : "light"}>
          <MobileI18nProvider>
            <AnalyticsProvider>
              <AuthProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
              </AuthProvider>
            </AnalyticsProvider>
          </MobileI18nProvider>
        </Theme>
      </PortalProvider>
    </TamaguiProvider>
  );
}
