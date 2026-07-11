import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { ExpoConfig } from "expo/config";

const iosGoogleServicesFile = "./GoogleService-Info.plist";
const androidGoogleServicesFile = "./google-services.json";
const hasIosGoogleServicesFile = existsSync(resolve(process.cwd(), iosGoogleServicesFile));
const hasAndroidGoogleServicesFile = existsSync(resolve(process.cwd(), androidGoogleServicesFile));

// 環境區分：APP_ENV 由 eas.json 各 build profile 的 env 設定。
// 正式版與測試版用不同 bundle id → 是兩個獨立 app，可同時裝在同一支手機、
// 名稱也區別得出來，測試不會污染正式資料。
// - production（App Store）：com.daodao.so / "Dao Dao"
// - 其他（preview/development，TestFlight/內部測試）：com.daodao.so.dev / "Dao Dao (Dev)"
const IS_PROD = process.env.APP_ENV === "production";
const bundleIdentifier = IS_PROD ? "com.daodao.so" : "com.daodao.so.dev";
const appName = IS_PROD ? "Dao Dao" : "Dao Dao (Dev)";

const config: ExpoConfig = {
  name: appName,
  slug: "daodao",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "daodao",
  userInterfaceStyle: "automatic",
  // SDK 55+：New Architecture 必開，已移除 newArchEnabled 設定
  updates: {
    url: "https://u.expo.dev/f93cc139-a71b-4dfc-abc3-c093889034a8",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  // SDK 56：splash 改由 expo-splash-screen plugin 設定（見 plugins）
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    usesAppleSignIn: true,
    ...(hasIosGoogleServicesFile ? { googleServicesFile: iosGoogleServicesFile } : {}),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: "用於上傳打卡照片",
      NSPhotoLibraryUsageDescription: "用於選擇打卡照片",
      NSPhotoLibraryAddUsageDescription: "用於儲存打卡分享圖片",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#16B9B3",
    },
    package: bundleIdentifier,
    ...(hasAndroidGoogleServicesFile ? { googleServicesFile: androidGoogleServicesFile } : {}),
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    "expo-sharing",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#16B9B3",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#16B9B3",
      },
    ],
    "expo-secure-store",
    "expo-local-authentication",
    "expo-apple-authentication",
    [
      "expo-media-library",
      {
        photosPermission: "允許應用程式存取您的相簿以儲存打卡分享圖片",
        savePhotosPermission: "允許應用程式將打卡分享圖片儲存到您的相簿",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          // SDK 56 最低 iOS 16.4
          deploymentTarget: "16.4",
          extraPods: [
            {
              name: "GoogleUtilities",
              modular_headers: true,
            },
          ],
        },
      },
    ],
    // Firebase Analytics - native configuration via google-services files
    ...(hasIosGoogleServicesFile || hasAndroidGoogleServicesFile
      ? ["@react-native-firebase/app"]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    // monorepo：SDK 55+ 預設開啟 autolinking 解析，明確寫出避免重複原生模組
    autolinkingModuleResolution: true,
  },
  extra: {
    eas: {
      projectId: "f93cc139-a71b-4dfc-abc3-c093889034a8",
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
};

export default config;
