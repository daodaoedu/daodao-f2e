import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'DaoDao',
  slug: 'daodao',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'daodao',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#16B9B3',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.daodao.app',
    usesAppleSignIn: true,
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSCameraUsageDescription: '用於上傳打卡照片',
      NSPhotoLibraryUsageDescription: '用於選擇打卡照片',
      NSPhotoLibraryAddUsageDescription: '用於儲存打卡分享圖片',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#16B9B3',
    },
    package: 'com.daodao.app',
    googleServicesFile: './google-services.json',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#16B9B3',
      },
    ],
    'expo-secure-store',
    'expo-local-authentication',
    'expo-apple-authentication',
    [
      'expo-media-library',
      {
        photosPermission: '允許應用程式存取您的相簿以儲存打卡分享圖片',
        savePhotosPermission: '允許應用程式將打卡分享圖片儲存到您的相簿',
        isAccessMediaLocationEnabled: true,
      },
    ],
    // Firebase Analytics - native configuration via google-services files
    '@react-native-firebase/app',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
}

export default config
