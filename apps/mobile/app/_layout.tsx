import { PortalProvider } from "@tamagui/portal";
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

  // 改用系統字型後不需預載字型檔，掛載後直接隱藏 splash
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === "dark" ? "dark" : "light"}>
        <MobileI18nProvider>
          <AnalyticsProvider>
            <AuthProvider>
              {/* PortalProvider must sit inside the app context providers: Tamagui's
                  native portal (gorhom-based) re-renders teleported Sheet/Dialog
                  content at the host's position, so the host needs Theme and
                  MobileI18nProvider as ancestors or portalled content throws. */}
              <PortalProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
              </PortalProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </MobileI18nProvider>
      </Theme>
    </TamaguiProvider>
  );
}
