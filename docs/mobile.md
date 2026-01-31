# DaoDao Mobile App 開發規劃文件

> 版本：v1.0
> 建立日期：2026-01-30
> 狀態：規劃階段

---

## 目錄

1. [專案概述](#1-專案概述)
2. [技術選型](#2-技術選型)
3. [Monorepo 架構](#3-monorepo-架構)
4. [Design Tokens 策略](#4-design-tokens-策略)
5. [Tamagui 配置](#5-tamagui-配置)
6. [功能規劃與開發階段](#6-功能規劃與開發階段)
7. [認證策略](#7-認證策略)
8. [頁面結構設計](#8-頁面結構設計)
9. [元件對照表](#9-元件對照表)
10. [程式碼共用策略](#10-程式碼共用策略)
11. [Mobile 專屬功能](#11-mobile-專屬功能)
12. [開發環境設置](#12-開發環境設置)
13. [開發時程](#13-開發時程)
14. [附錄](#14-附錄)

---

## 1. 專案概述

### 1.1 背景

DaoDao 是一個**學習實踐追蹤平台**，目前已有 Web 版本（Next.js），為了提供更好的行動體驗，特別是每日打卡功能，規劃開發 React Native 手機版 App。

### 1.2 目標

- 提供 iOS 與 Android 雙平台原生 App
- 與 Web 版共用 API 層與商業邏輯
- 保持一致的設計語言與使用者體驗
- 支援離線打卡與推播通知

### 1.3 核心功能

| 功能 | 說明 |
|------|------|
| 實踐管理 | 建立、編輯、封存學習實踐 |
| 每日打卡 | 一鍵打卡、紀錄心得 |
| 進度追蹤 | 日曆視圖、統計數據 |
| 個人檔案 | 學習島嶼、社群連結 |
| 性格測驗 | Quiz 完整流程 |
| 推播通知 | 打卡提醒、成就通知 |

---

## 2. 技術選型

### 2.1 核心框架

| 項目 | 選擇 | 版本 | 選用原因 |
|------|------|------|---------|
| **Framework** | Expo | SDK 52+ | 開發效率高、OTA 更新、豐富生態系 |
| **Router** | Expo Router | v4+ | File-based routing，與 Next.js 類似 |
| **UI Library** | Tamagui | v1.x | 跨平台一致性、編譯時優化、完整元件庫 |
| **Language** | TypeScript | 5.7+ | 型別安全、與 Web 版一致 |

### 2.2 狀態管理與資料

| 項目 | 選擇 | 選用原因 |
|------|------|---------|
| **Data Fetching** | SWR | 與 Web 版一致，支援快取與重新驗證 |
| **Form** | React Hook Form + Zod | 與 Web 版共用驗證 schema |
| **Storage** | Expo SecureStore | Token 安全儲存 |
| **Offline** | SWR + AsyncStorage | 離線資料快取 |

### 2.3 原生功能

| 功能 | 套件 |
|------|------|
| 推播通知 | `expo-notifications` |
| 生物辨識 | `expo-local-authentication` |
| 相機 | `expo-camera` / `expo-image-picker` |
| 分享 | `expo-sharing` |
| 深色模式 | `useColorScheme` + Tamagui Theme |

### 2.4 Tamagui 編譯器

Tamagui 編譯器（`@tamagui/static`）在構建時優化樣式：

**優化技術：**

- **靜態提取**：內聯樣式 → 原子 CSS (Web) / 靜態 StyleSheet (Native)
- **樹扁平化**：巢狀元件 → 扁平原生元素
- **部分求值**：編譯時計算確定值
- **程式碼消除**：移除未使用的樣式變體

**效能提升：**

- 30-50% 元件可被扁平化
- ~15% Lighthouse 分數提升

**配置：**

```javascript
// babel.config.js
{
  plugins: [
    ['@tamagui/babel-plugin', {
      components: ['tamagui'],
      config: './tamagui.config.ts',
      disableExtraction: process.env.NODE_ENV === 'development',
    }]
  ]
}
```

---

## 3. Monorepo 架構

### 3.1 目錄結構

```
daodao/
├── apps/
│   ├── product/                 # Web App (Next.js) - 現有
│   ├── website/                 # 行銷網站 - 現有
│   └── mobile/                  # 🆕 React Native App
│       ├── app/                 # Expo Router 頁面
│       │   ├── (auth)/          # 認證相關頁面
│       │   ├── (tabs)/          # 主要 Tab 頁面
│       │   ├── practices/       # 實踐相關頁面
│       │   ├── quiz/            # 測驗頁面
│       │   ├── settings/        # 設定頁面
│       │   └── _layout.tsx      # 根佈局
│       ├── generated/           # 🔄 自動生成（勿手動修改）
│       │   └── design-tokens/   # 從 Web 轉換的 design tokens
│       │       ├── colors.ts
│       │       ├── spacing.ts
│       │       ├── typography.ts
│       │       └── index.ts
│       ├── components/          # App 專用元件
│       ├── hooks/               # App 專用 hooks
│       ├── utils/               # App 專用工具
│       ├── tamagui.config.ts    # Tamagui 配置
│       ├── babel.config.js      # Babel 配置
│       ├── metro.config.js      # Metro 配置
│       └── app.config.ts        # Expo 配置
│
└── packages/
    ├── api/                     # ✅ 共用 - OpenAPI client
    ├── shared/                  # ✅ 共用 - 工具函式、常數
    ├── design-tokens/           # 🆕 Web 主要來源 - 設計 tokens
    │   ├── src/
    │   │   ├── colors.ts
    │   │   ├── spacing.ts
    │   │   ├── typography.ts
    │   │   └── index.ts
    │   ├── scripts/
    │   │   └── generate-mobile.ts  # 轉換腳本：生成 Mobile 版本
    │   └── package.json
    ├── features/
    │   └── quiz/                # 🔄 部分共用 - Quiz 邏輯
    ├── auth/                    # 🔄 部分共用 - 認證邏輯
    └── ui/                      # Web 版 UI (現有)
```

### 3.2 Package 依賴關係

```
┌─────────────────────────────────────────────────────────┐
│                        apps/mobile                       │
└─────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  @daodao/api    │ │ @daodao/shared  │ │ generated/      │
│  (OpenAPI)      │ │ (Utils)         │ │ design-tokens   │
└─────────────────┘ └─────────────────┘ └────────┬────────┘
                                                 │
                                          (腳本轉換)
                                                 │
                                    ┌────────────▼────────────┐
                                    │  @daodao/design-tokens  │
                                    │  (Web 主要來源)          │
                                    └─────────────────────────┘
```

---

## 4. Design Tokens 策略

### 4.1 策略選擇

採用**以 Web 為主 + 腳本轉換**模式：

| 考量 | 說明 |
|------|------|
| 現狀 | Web 版使用 CSS 變數 (`globals.css`) |
| 單一來源 | Web 的 design-tokens 為唯一真實來源 (Single Source of Truth) |
| 自動同步 | 透過腳本自動轉換，避免手動維護兩份 |
| 格式適配 | Web 使用 CSS 變數，Mobile 轉換為 JS 物件供 Tamagui 使用 |
| 彈性 | 未來可升級至 Style Dictionary |

### 4.2 轉換流程

**來源**：`packages/design-tokens/src/` (Web 主要來源)

**輸出**：`apps/mobile/generated/design-tokens/` (Mobile 使用)

```
┌─────────────────────────────┐
│  packages/design-tokens/    │
│  (Web - 主要來源)            │
│  ├── colors.ts              │
│  ├── spacing.ts             │
│  └── typography.ts          │
└──────────────┬──────────────┘
               │
               ▼  pnpm run generate:mobile-tokens
┌──────────────────────────────┐
│  apps/mobile/generated/      │
│  design-tokens/              │
│  ├── colors.ts    (轉換後)   │
│  ├── spacing.ts   (轉換後)   │
│  ├── typography.ts(轉換後)   │
│  └── index.ts                │
└──────────────────────────────┘
```

### 4.3 轉換腳本

#### `packages/design-tokens/scripts/generate-mobile.ts`

```typescript
/**
 * 將 Web design tokens 轉換為 Mobile 格式
 *
 * 主要轉換：
 * - oklch() → hex 色碼（React Native 不支援 oklch）
 * - CSS 變數引用 → 實際值
 * - rem → 數值（React Native 使用 dp）
 */
import * as fs from 'fs'
import * as path from 'path'
import { colors, spacing, typography } from '../src'

const OUTPUT_DIR = path.resolve(__dirname, '../../../apps/mobile/generated/design-tokens')

// oklch 轉 hex 的對照表（預先計算）
const oklchToHex: Record<string, string> = {
  'oklch(0.711 0.12 190.6)': '#16B9B3',
  'oklch(0.445 0.056 192)': '#0D7A77',
  // ... 其他色彩對照
}

function convertColors(colors: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {}

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      // 轉換 oklch 或 CSS 變數
      converted[key] = oklchToHex[value] || value
    } else if (typeof value === 'object') {
      converted[key] = convertColors(value)
    } else {
      converted[key] = value
    }
  }

  return converted
}

function generateMobileTokens() {
  // 確保輸出目錄存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // 轉換並寫入 colors
  const mobileColors = convertColors(colors)
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'colors.ts'),
    `// 自動生成，請勿手動修改\n// 來源: packages/design-tokens\nexport const colors = ${JSON.stringify(mobileColors, null, 2)} as const`
  )

  // spacing 直接複製（數值格式相同）
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'spacing.ts'),
    `// 自動生成，請勿手動修改\nexport const spacing = ${JSON.stringify(spacing, null, 2)} as const`
  )

  // typography 轉換 rem → 數值
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'typography.ts'),
    `// 自動生成，請勿手動修改\nexport const typography = ${JSON.stringify(typography, null, 2)} as const`
  )

  // 生成 index.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.ts'),
    `// 自動生成，請勿手動修改\nexport * from './colors'\nexport * from './spacing'\nexport * from './typography'\n`
  )

  console.log('✅ Mobile design tokens generated at:', OUTPUT_DIR)
}

generateMobileTokens()
```

#### 使用方式

```bash
# 在 packages/design-tokens 執行
pnpm run generate:mobile

# 或在根目錄執行
pnpm --filter @daodao/design-tokens generate:mobile
```

#### `packages/design-tokens/package.json` 腳本

```json
{
  "scripts": {
    "generate:mobile": "tsx scripts/generate-mobile.ts",
    "build": "tsc && pnpm run generate:mobile"
  }
}
```

### 4.4 原始來源定義

從現有 `packages/ui/src/styles/globals.css` 的 CSS 變數轉換：

```css
/* 現有 CSS 變數 (oklch) */
:root {
  --primary-base: oklch(0.711 0.12 190.6);
  --primary-darker: oklch(0.445 0.056 192);
}
```

轉換為：

```typescript
/* 新的 JS tokens (hex) */
export const colors = {
  primary: {
    base: '#16B9B3',
    darker: '#0D7A77',
  }
}
```

### 4.5 Design Tokens 定義（Web 主要來源）

#### `packages/design-tokens/src/colors.ts`

```typescript
/**
 * DaoDao 色彩系統
 * 從 globals.css oklch 值轉換而來
 */
export const colors = {
  // 主色
  primary: {
    palest: '#E6F7F9',
    pale: '#D9F3F5',
    lightest: '#B3E8E6',
    lighter: '#66D4CF',
    base: '#16B9B3',
    darker: '#0D7A77',
  },

  // 灰階
  basic: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#6B7280',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // 吉祥物色彩
  mascot: {
    aqua: '#7DD3E3',
    brightBlue: '#5CC5E8',
  },

  // 語意色彩
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Quiz 島嶼主題色
  quiz: {
    d: { bg: '#E9F3F5', text: '#48809A', accent: '#99ECFF' }, // 探探島
    a: { bg: '#F5F0E9', text: '#9A6948', accent: '#FFA10B' }, // 動動島
    o: { bg: '#E9F5EE', text: '#489A95', accent: '#16B9B3' }, // 構構島
    l: { bg: '#F5EDE9', text: '#CB6738', accent: '#FF6E0B' }, // 跨跨島
    c: { bg: '#F5F4E9', text: '#9D8242', accent: '#F9E41C' }, // 連連島
  },

  // 實踐主題色
  practice: {
    yellow: '#FFD700',
    blue: '#3B82F6',
    pink: '#EC4899',
    green: '#10B981',
  },
} as const

export type Colors = typeof colors
```

#### `packages/design-tokens/src/spacing.ts`

```typescript
/**
 * 間距系統 (基於 4px)
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const

export type Spacing = typeof spacing
```

#### `packages/design-tokens/src/typography.ts`

```typescript
/**
 * 字體系統
 */
export const typography = {
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },

  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const

export type Typography = typeof typography
```

#### `packages/design-tokens/src/radius.ts`

```typescript
/**
 * 圓角系統
 */
export const radius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const

export type Radius = typeof radius
```

---

## 5. Tamagui 配置

### 5.1 主配置檔

#### `apps/mobile/tamagui.config.ts`

```typescript
import { createTamagui, createTokens, createFont } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes as defaultThemes, tokens as defaultTokens } from '@tamagui/config/v3'
// 使用腳本生成的 Mobile 版本 design tokens
import { colors, spacing, radius, typography } from '@/generated/design-tokens'

// 字體配置
// 注意：使用 createFont 而非 createInterFont，以確保 Expo 字體正確映射
const headingFont = createFont({
  family: 'Inter',
  size: {
    1: typography.fontSizes.xs,
    2: typography.fontSizes.sm,
    3: typography.fontSizes.base,
    4: typography.fontSizes.lg,
    5: typography.fontSizes.xl,
    6: typography.fontSizes['2xl'],
    7: typography.fontSizes['3xl'],
    8: typography.fontSizes['4xl'],
  },
  weight: {
    4: typography.fontWeights.normal,
    6: typography.fontWeights.semibold,
    7: typography.fontWeights.bold,
  },
  // face 映射確保原生平台正確渲染不同字重
  face: {
    400: { normal: 'Inter_400' },
    600: { normal: 'Inter_600' },
    700: { normal: 'Inter_700' },
  },
})

const bodyFont = createFont({
  family: 'Inter',
  size: {
    1: typography.fontSizes.xs,
    2: typography.fontSizes.sm,
    3: typography.fontSizes.base,
    4: typography.fontSizes.lg,
  },
  weight: {
    4: typography.fontWeights.normal,
    5: typography.fontWeights.medium,
    6: typography.fontWeights.semibold,
  },
  face: {
    400: { normal: 'Inter_400' },
    500: { normal: 'Inter_500' },
    600: { normal: 'Inter_600' },
  },
})

// Tokens 配置
const tokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Primary
    primaryPalest: colors.primary.palest,
    primaryPale: colors.primary.pale,
    primaryLightest: colors.primary.lightest,
    primaryLighter: colors.primary.lighter,
    primaryBase: colors.primary.base,
    primaryDarker: colors.primary.darker,
    // Basic
    ...Object.fromEntries(
      Object.entries(colors.basic).map(([k, v]) => [`basic${k}`, v])
    ),
    // Semantic
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
    // Mascot
    mascotAqua: colors.mascot.aqua,
    mascotBrightBlue: colors.mascot.brightBlue,
  },
  space: spacing,
  radius: radius,
})

// 主題配置
const lightTheme = {
  background: '#FFFFFF',
  backgroundHover: colors.basic[50],
  backgroundPress: colors.basic[100],
  backgroundFocus: colors.basic[50],
  backgroundStrong: colors.basic[100],
  backgroundTransparent: 'rgba(255,255,255,0)',

  color: colors.basic[900],
  colorHover: colors.basic[800],
  colorPress: colors.basic[700],
  colorFocus: colors.basic[800],
  colorTransparent: 'rgba(0,0,0,0)',

  borderColor: colors.basic[200],
  borderColorHover: colors.basic[300],
  borderColorFocus: colors.primary.base,
  borderColorPress: colors.basic[400],

  primary: colors.primary.base,
  primaryHover: colors.primary.darker,

  shadowColor: 'rgba(0,0,0,0.1)',
  shadowColorHover: 'rgba(0,0,0,0.15)',
}

const darkTheme = {
  background: colors.basic[900],
  backgroundHover: colors.basic[800],
  backgroundPress: colors.basic[700],
  backgroundFocus: colors.basic[800],
  backgroundStrong: colors.basic[800],
  backgroundTransparent: 'rgba(0,0,0,0)',

  color: colors.basic[50],
  colorHover: colors.basic[100],
  colorPress: colors.basic[200],
  colorFocus: colors.basic[100],
  colorTransparent: 'rgba(255,255,255,0)',

  borderColor: colors.basic[700],
  borderColorHover: colors.basic[600],
  borderColorFocus: colors.primary.lighter,
  borderColorPress: colors.basic[500],

  primary: colors.primary.lighter,
  primaryHover: colors.primary.base,

  shadowColor: 'rgba(0,0,0,0.3)',
  shadowColorHover: 'rgba(0,0,0,0.4)',
}

export const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  shorthands,
  defaultFont: 'body',
})

export default config

// 型別宣告
export type AppConfig = typeof config
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
```

### 5.2 Babel 配置

#### `apps/mobile/babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      'react-native-reanimated/plugin', // 必須放最後
    ],
  }
}
```

### 5.3 Metro 配置

#### `apps/mobile/metro.config.js`

```javascript
const { getDefaultConfig } = require('expo/metro-config')
const { withTamagui } = require('@tamagui/metro-plugin')
const path = require('path')

// Monorepo 根目錄
const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot, {
  isCSSEnabled: true,
})

// Monorepo 支援
config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// 支援 package exports
config.resolver.unstable_enablePackageExports = true

module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
  outputCSS: './tamagui-web.css',
})
```

### 5.4 根佈局

#### `apps/mobile/app/_layout.tsx`

```typescript
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import { PortalProvider } from '@tamagui/portal'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import config from '../tamagui.config'

// 防止 splash screen 自動隱藏
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  // 載入所有需要的字重，名稱需與 tamagui.config.ts 中的 face 映射一致
  const [loaded] = useFonts({
    Inter_400: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    Inter_500: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    Inter_600: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    Inter_700: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <PortalProvider>
        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </Theme>
      </PortalProvider>
    </TamaguiProvider>
  )
}
```

---

## 6. 功能規劃與開發階段

### 6.1 Phase 1: MVP 核心功能

**目標**：可上架的最小可用版本

| 功能 | 說明 | 優先級 | 預估 |
|------|------|--------|------|
| 登入/註冊 | Google OAuth + Apple Sign In | P0 | 1 週 |
| 首頁 Dashboard | 進行中/已完成的實踐列表 | P0 | 1 週 |
| 打卡功能 | 一鍵打卡 + 打卡紀錄 | P0 | 1 週 |
| 實踐詳情 | 進度、統計、日曆 | P0 | 1.5 週 |
| 個人檔案 | 基本資訊展示 | P1 | 0.5 週 |

**交付物**：

- 可登入並使用核心打卡功能的 App
- TestFlight / Internal Testing 版本

### 6.2 Phase 2: 完整功能

**目標**：功能完整的正式版本

| 功能 | 說明 | 優先級 | 預估 |
|------|------|--------|------|
| 建立實踐 | 多步驟表單流程 | P1 | 1.5 週 |
| 性格測驗 | Quiz 完整流程 | P1 | 1 週 |
| 推播通知 | 打卡提醒、成就通知 | P1 | 1 週 |
| 設定頁面 | 帳號管理、通知偏好 | P2 | 0.5 週 |
| 封存管理 | 查看已封存實踐 | P2 | 0.5 週 |
| 深色模式 | 主題切換 | P2 | 0.5 週 |

**交付物**：

- App Store / Google Play 正式上架版本

### 6.3 Phase 3: 進階功能

**目標**：提升使用者黏著度

| 功能 | 說明 | 優先級 | 預估 |
|------|------|--------|------|
| 社群探索 | 瀏覽他人實踐 | P2 | 1 週 |
| 資源中心 | 學習資源瀏覽 | P2 | 1 週 |
| 數據分析 | 學習報告、趨勢圖表 | P3 | 1.5 週 |
| 成就系統 | 徽章、連續天數獎勵 | P3 | 1 週 |
| Widget | iOS/Android 桌面小工具 | P3 | 1.5 週 |
| 離線模式 | 離線打卡、同步機制 | P3 | 1 週 |

---

## 7. 認證策略

### 7.1 強制登入模式

Mobile App 採用強制登入模式，與 Web 版保持一致：

```
App 啟動
    ↓
檢查登入狀態（SecureStore）
    ↓
┌─────────────────┬─────────────────┐
│    已登入       │     未登入       │
│    ↓            │       ↓         │
│  主畫面 (tabs)  │   登入頁面       │
└─────────────────┴─────────────────┘
```

**選擇強制登入的理由：**

1. **與 Web 版一致** - 現有 Product App 已採用強制登入，用戶體驗一致
2. **數據完整性** - 打卡是核心功能，必須可靠儲存，避免訪客數據遺失
3. **簡化架構** - 不需處理匿名 → 登入的數據合併，共用現有 `@daodao/auth`
4. **推播通知需求** - 打卡提醒需要 device token 綁定用戶帳號
5. **行動 App 特性** - 用戶已跨越「下載」門檻，登入一次後自動保持狀態

### 7.2 支援的登入方式

| 方式 | 平台 | 說明 |
|------|------|------|
| Google OAuth | iOS / Android | 與 Web 版相同 |
| Apple Sign In | iOS 13+ | App Store 強制要求（提供第三方登入時必須支援） |

> **為什麼只支援這兩種登入方式？**
> - **Google OAuth**: 與 Web 版共用後端認證邏輯，維護成本最低
> - **Apple Sign In**: iOS App Store 規定，若 App 提供第三方登入選項，必須同時支援 Apple Sign In
> - 其他方式（Facebook、Line 等）可視用戶需求在後續版本評估

### 7.3 Token 管理

- **儲存**: `expo-secure-store`（加密儲存）
- **刷新**: 自動 401 攔截刷新
- **持久化**: App 重啟後自動登入

```typescript
// apps/mobile/services/auth-storage.ts
import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export async function saveTokens(accessToken: string, refreshToken: string) {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
  } catch (error) {
    console.error('Failed to save tokens:', error)
    throw error
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to get refresh token:', error)
    return null
  }
}

export async function clearTokens() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Failed to clear tokens:', error)
  }
}
```

### 7.4 可選：生物辨識

支援 Face ID / Touch ID 快速解鎖（Phase 2）：

```typescript
// apps/mobile/hooks/useBiometricUnlock.ts
import * as LocalAuthentication from 'expo-local-authentication'

export async function canUseBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync()
  const isEnrolled = await LocalAuthentication.isEnrolledAsync()
  return hasHardware && isEnrolled
}

export async function authenticateWithBiometrics() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '使用生物辨識解鎖',
    fallbackLabel: '使用密碼',
  })
  return result.success
}
```

---

## 8. 頁面結構設計

### 8.1 路由結構

```
app/
├── _layout.tsx                 # 根佈局 (TamaguiProvider)
├── index.tsx                   # 入口重導向
│
├── (auth)/                     # 認證群組 (未登入)
│   ├── _layout.tsx
│   ├── login.tsx               # 登入頁
│   ├── register.tsx            # 註冊頁
│   ├── forgot-password.tsx     # 忘記密碼
│   └── callback.tsx            # OAuth callback
│
├── (tabs)/                     # 主要 Tab 導航 (已登入)
│   ├── _layout.tsx             # Tab 佈局
│   ├── index.tsx               # 首頁 Dashboard
│   ├── explore.tsx             # 探索/社群
│   ├── create.tsx              # 快速建立入口
│   └── profile.tsx             # 個人檔案
│
├── practices/
│   ├── [id]/
│   │   ├── index.tsx           # 實踐詳情
│   │   ├── check-in.tsx        # 打卡頁面
│   │   ├── calendar.tsx        # 日曆視圖
│   │   └── edit.tsx            # 編輯實踐
│   └── create/
│       ├── index.tsx           # 選擇模板
│       ├── [templateId].tsx    # 模板預覽
│       └── manual/
│           ├── _layout.tsx     # 多步驟表單佈局
│           ├── step-1.tsx      # 標題與描述
│           ├── step-2.tsx      # 頻率與時長
│           ├── step-3.tsx      # 執行時機
│           ├── step-4.tsx      # 標籤與資源
│           └── step-5.tsx      # 確認送出
│
├── quiz/
│   ├── index.tsx               # Quiz 入口/列表
│   ├── [quizId]/
│   │   ├── index.tsx           # Quiz 開始頁
│   │   ├── questions.tsx       # 題目頁
│   │   └── result.tsx          # 結果頁
│
├── settings/
│   ├── index.tsx               # 設定主頁
│   ├── account.tsx             # 帳號設定
│   ├── notifications.tsx       # 通知設定
│   ├── appearance.tsx          # 外觀設定
│   └── archived.tsx            # 已封存實踐
│
└── users/
    └── [id].tsx                # 他人檔案頁
```

### 8.2 導航結構

```
┌─────────────────────────────────────────┐
│              Root Stack                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         Auth Stack              │    │  ← 未登入時顯示
│  │  (login, register, callback)    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         Tab Navigator           │    │  ← 登入後顯示
│  │  ┌─────┬─────┬─────┬─────┐     │    │
│  │  │ 首頁 │ 探索 │  +  │ 我的 │     │    │
│  │  └─────┴─────┴─────┴─────┘     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       Modal Screens             │    │  ← 全螢幕 Modal
│  │  (practice detail, check-in,    │    │
│  │   quiz, settings, create)       │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 9. 元件對照表

### 9.1 基礎元件

| Web (shadcn/ui) | Mobile (Tamagui) | 備註 |
|-----------------|------------------|------|
| `Button` | `Button` | 直接對應 |
| `Input` | `Input` | 直接對應 |
| `Textarea` | `TextArea` | 直接對應 |
| `Checkbox` | `Checkbox` | 直接對應 |
| `RadioGroup` | `RadioGroup` | 直接對應 |
| `Select` | `Select` | 直接對應 |
| `Slider` | `Slider` | 直接對應 |
| `Switch` | `Switch` | 直接對應 |
| `Progress` | `Progress` | 直接對應 |
| `Label` | `Label` | 直接對應 |

### 9.2 複合元件

| Web (shadcn/ui) | Mobile (Tamagui) | 備註 |
|-----------------|------------------|------|
| `Avatar` | `Avatar` | 直接對應 |
| `Badge` | 自訂 `Badge` | 用 Button variant 實作 |
| `Card` | `Card` | 直接對應 |
| `Dialog` | `Dialog` + `Adapt` | 可自動轉 Sheet |
| `Sheet` | `Sheet` | 直接對應 |
| `Popover` | `Popover` | 直接對應 |
| `Tooltip` | `Tooltip` | 直接對應 |
| `Toast` | `Toast` | 直接對應 |
| `Tabs` | `Tabs` | 直接對應 |
| `Accordion` | `Accordion` | 直接對應 |

### 9.3 需自訂實作

| Web 元件 | Mobile 實作方式 |
|---------|----------------|
| `Calendar` | `react-native-calendars` 或自訂 |
| `Carousel` | `react-native-reanimated-carousel` |
| `DatePicker` | `@react-native-community/datetimepicker` |
| `DropdownMenu` | `Popover` + 自訂選單 |
| `FileUpload` | `expo-image-picker` |
| `Chart` | `victory-native` 或 `react-native-chart-kit` |
| `MarkdownRenderer` | `react-native-markdown-display` |

### 9.4 核心自訂元件

```typescript
// 需要開發的 DaoDao 專用元件

// 實踐卡片
export function PracticeCard({ practice, onPress, onCheckIn }) { ... }

// 打卡 Sheet
export function CheckInSheet({ open, practice, onSubmit }) { ... }

// 進度圓環
export function ProgressRing({ progress, size, color }) { ... }

// 日曆視圖
export function CheckInCalendar({ practiceId, month, year }) { ... }

// 標籤選擇器
export function TagSelector({ selected, onChange, options }) { ... }

// 島嶼卡片
export function IslandCard({ island, isSelected }) { ... }

// 統計卡片
export function StatCard({ label, value, icon, trend }) { ... }
```

---

## 10. 程式碼共用策略

### 10.1 共用程度分析

| 類別 | 共用程度 | 說明 |
|------|---------|------|
| **API Client** | 100% | OpenAPI 生成的 fetch client |
| **Zod Schemas** | 100% | 表單驗證、資料型別 |
| **TypeScript Types** | 100% | 來自 API 的型別定義 |
| **Constants** | 100% | 分類、標籤、設定值 |
| **Business Logic** | 80% | Hooks 中的邏輯（需抽離 UI） |
| **Utils** | 70% | 日期處理、格式化（排除 DOM） |
| **UI Components** | 0% | 需用 Tamagui 重新實作 |

### 10.2 API 整合

直接使用現有 `@daodao/api` 套件：

```typescript
// apps/mobile/hooks/usePractices.ts
import { client } from '@daodao/api'
import useSWR from 'swr'

export function usePractices() {
  return useSWR('/practices', () =>
    client.GET('/practices').then(res => res.data)
  )
}

export function useCheckIn(practiceId: string) {
  return useSWRMutation(
    `/practices/${practiceId}/check-ins`,
    (_, { arg }: { arg: { note?: string } }) =>
      client.POST('/practices/{id}/check-ins', {
        params: { path: { id: practiceId } },
        body: arg,
      })
  )
}
```

### 10.3 驗證 Schema 共用

```typescript
// packages/shared/src/schemas/practice.ts
import { z } from 'zod'

export const createPracticeSchema = z.object({
  title: z.string().min(1, '請輸入標題').max(50, '標題最多 50 字'),
  description: z.string().max(500, '描述最多 500 字').optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  tags: z.array(z.string()).max(5, '最多選擇 5 個標籤'),
})

export type CreatePracticeInput = z.infer<typeof createPracticeSchema>
```

```typescript
// apps/mobile/app/practices/create/manual/step-1.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPracticeSchema, type CreatePracticeInput } from '@daodao/shared'

export default function Step1() {
  const form = useForm<CreatePracticeInput>({
    resolver: zodResolver(createPracticeSchema),
  })
  // ...
}
```

---

## 11. Mobile 專屬功能

### 11.1 推播通知

```typescript
// apps/mobile/services/notifications.ts
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// 設定通知處理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// 排程每日打卡提醒
export async function scheduleCheckInReminder(time: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '該打卡囉！',
      body: '今天的實踐完成了嗎？',
      data: { type: 'check-in-reminder' },
    },
    trigger: {
      type: 'daily',
      hour: time.getHours(),
      minute: time.getMinutes(),
    },
  })
}

// 請求通知權限
export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') {
    return false
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  return true
}
```

### 11.2 離線支援

```typescript
// apps/mobile/services/offline-checkin.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { useEffect, useState, useCallback } from 'react'
import { client } from '@daodao/api'

// ============ 型別定義 ============

/** 離線打卡的狀態 */
type PendingStatus = 'pending' | 'syncing' | 'failed'

/** 離線打卡資料結構 */
interface PendingCheckIn {
  id: string                    // 本地 UUID
  practiceId: string            // 實踐 ID
  note?: string                 // 打卡心得
  timestamp: number             // 建立時間戳
  status: PendingStatus         // 同步狀態
  retryCount: number            // 重試次數
  lastError?: string            // 最後一次錯誤訊息
}

/** 同步結果 */
interface SyncResult {
  success: boolean
  syncedCount: number
  failedCount: number
  errors: Array<{ id: string; error: string }>
}

// ============ 常數 ============

const PENDING_CHECKINS_KEY = 'pending_checkins'
const MAX_RETRY_COUNT = 3

// ============ 儲存層函式 ============

/** 取得所有待同步的打卡 */
export async function getPendingCheckIns(): Promise<PendingCheckIn[]> {
  try {
    const data = await AsyncStorage.getItem(PENDING_CHECKINS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get pending check-ins:', error)
    return []
  }
}

/** 儲存待同步打卡列表 */
async function savePendingCheckIns(checkIns: PendingCheckIn[]): Promise<void> {
  await AsyncStorage.setItem(PENDING_CHECKINS_KEY, JSON.stringify(checkIns))
}

/** 新增一筆離線打卡 */
export async function savePendingCheckIn(
  practiceId: string,
  note?: string
): Promise<PendingCheckIn> {
  const pending = await getPendingCheckIns()
  const newCheckIn: PendingCheckIn = {
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    practiceId,
    note,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0,
  }
  pending.push(newCheckIn)
  await savePendingCheckIns(pending)
  return newCheckIn
}

/** 移除已同步的打卡 */
async function removePendingCheckIn(id: string): Promise<void> {
  const pending = await getPendingCheckIns()
  const filtered = pending.filter((item) => item.id !== id)
  await savePendingCheckIns(filtered)
}

/** 更新打卡狀態 */
async function updatePendingCheckIn(
  id: string,
  updates: Partial<PendingCheckIn>
): Promise<void> {
  const pending = await getPendingCheckIns()
  const index = pending.findIndex((item) => item.id === id)
  if (index !== -1) {
    pending[index] = { ...pending[index], ...updates }
    await savePendingCheckIns(pending)
  }
}

// ============ 同步邏輯 ============

/** 同步單筆打卡到伺服器 */
async function syncCheckIn(checkIn: PendingCheckIn): Promise<void> {
  const response = await client.POST('/practices/{id}/check-ins', {
    params: { path: { id: checkIn.practiceId } },
    body: {
      note: checkIn.note,
      // 傳送原始時間戳，讓後端知道實際打卡時間
      createdAt: new Date(checkIn.timestamp).toISOString(),
    },
  })

  if (response.error) {
    throw new Error(response.error.message || 'Sync failed')
  }
}

/** 批次同步所有待處理的打卡 */
export async function syncAllPendingCheckIns(): Promise<SyncResult> {
  const pending = await getPendingCheckIns()
  const result: SyncResult = {
    success: true,
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  }

  for (const checkIn of pending) {
    // 跳過已超過重試次數的項目
    if (checkIn.retryCount >= MAX_RETRY_COUNT) {
      result.failedCount++
      result.errors.push({ id: checkIn.id, error: 'Max retry exceeded' })
      continue
    }

    try {
      // 更新狀態為同步中
      await updatePendingCheckIn(checkIn.id, { status: 'syncing' })

      // 執行同步
      await syncCheckIn(checkIn)

      // 同步成功，移除項目
      await removePendingCheckIn(checkIn.id)
      result.syncedCount++
    } catch (error) {
      // 同步失敗，更新重試次數
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await updatePendingCheckIn(checkIn.id, {
        status: 'failed',
        retryCount: checkIn.retryCount + 1,
        lastError: errorMessage,
      })
      result.failedCount++
      result.errors.push({ id: checkIn.id, error: errorMessage })
      result.success = false
    }
  }

  return result
}

// ============ React Hooks ============

/** 監聽網路狀態並自動同步 */
export function useSyncPendingCheckIns() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  const sync = useCallback(async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncAllPendingCheckIns()
      setLastSyncResult(result)
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  useEffect(() => {
    // 網路狀態監聽
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        await sync()
      }
    })

    // 初始同步（如果有網路）
    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable) {
        sync()
      }
    })

    return unsubscribe
  }, [sync])

  return { isSyncing, lastSyncResult, manualSync: sync }
}

/** 取得待同步數量 */
export function usePendingCheckInsCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const loadCount = async () => {
      const pending = await getPendingCheckIns()
      setCount(pending.length)
    }

    loadCount()

    // 可考慮加入定期更新或事件監聽
    const interval = setInterval(loadCount, 5000)
    return () => clearInterval(interval)
  }, [])

  return count
}
```

**離線同步 UI 整合範例：**

```typescript
// apps/mobile/components/SyncStatusBanner.tsx
import { XStack, Text } from 'tamagui'
import { Cloud, CloudOff, Loader } from '@tamagui/lucide-icons'
import { useSyncPendingCheckIns, usePendingCheckInsCount } from '../services/offline-checkin'

export function SyncStatusBanner() {
  const { isSyncing, lastSyncResult } = useSyncPendingCheckIns()
  const pendingCount = usePendingCheckInsCount()

  if (pendingCount === 0) return null

  return (
    <XStack
      backgroundColor={isSyncing ? '$warning' : '$info'}
      padding="$2"
      alignItems="center"
      justifyContent="center"
      gap="$2"
    >
      {isSyncing ? (
        <Loader size={16} color="white" />
      ) : (
        <CloudOff size={16} color="white" />
      )}
      <Text color="white" fontSize="$2">
        {isSyncing
          ? '同步中...'
          : `${pendingCount} 筆打卡待同步`}
      </Text>
    </XStack>
  )
}
```

### 11.3 生物辨識

```typescript
// apps/mobile/hooks/useBiometricAuth.ts
import * as LocalAuthentication from 'expo-local-authentication'

export function useBiometricAuth() {
  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    if (!hasHardware) return false

    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    if (!isEnrolled) return false

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: '驗證身份',
      fallbackLabel: '使用密碼',
    })

    return result.success
  }

  return { authenticate }
}
```

### 11.4 Widget（iOS）

使用 `expo-widgets` (experimental) 或原生模組：

```typescript
// 待 expo-widgets 穩定後實作
// 顯示今日待打卡實踐數量
// 快速打卡按鈕
```

---

## 12. 開發環境設置

### 12.1 初始化步驟

```bash
# 1. 建立 Expo 專案
cd apps
npx create-expo-app mobile -t expo-template-blank-typescript
cd mobile

# 2. 安裝 Tamagui 相關套件
pnpm add tamagui @tamagui/config @tamagui/font-inter @tamagui/lucide-icons
pnpm add @tamagui/portal @tamagui/toast
pnpm add -D @tamagui/babel-plugin @tamagui/metro-plugin

# 3. 安裝 Expo Router
pnpm add expo-router expo-linking expo-constants expo-status-bar

# 4. 安裝動畫庫
pnpm add react-native-reanimated

# 5. 安裝資料層套件
pnpm add swr react-hook-form @hookform/resolvers zod

# 6. 安裝原生功能套件
pnpm add expo-secure-store expo-notifications expo-local-authentication
pnpm add expo-image-picker expo-sharing

# 7. 安裝 Monorepo 內部套件
pnpm add @daodao/api @daodao/shared

# 8. 安裝 Apple Sign In 套件（iOS App Store 強制要求）
pnpm add expo-apple-authentication

# 9. 生成 Mobile design tokens（從 Web 轉換）
pnpm --filter @daodao/design-tokens generate:mobile

# 10. 安裝其他工具
pnpm add @react-native-async-storage/async-storage
pnpm add @react-native-community/netinfo
pnpm add react-native-calendars
```

### 12.2 Expo 配置

#### `apps/mobile/app.config.ts`

```typescript
import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'DaoDao',
  slug: 'daodao',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'daodao',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#16B9B3',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.daodao.app',
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription: '用於上傳打卡照片',
      NSPhotoLibraryUsageDescription: '用於選擇打卡照片',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#16B9B3',
    },
    package: 'com.daodao.app',
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#16B9B3',
      },
    ],
    'expo-secure-store',
    'expo-local-authentication',
    'expo-apple-authentication',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
}

export default config
```

### 12.3 TypeScript 配置

#### `apps/mobile/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@daodao/api": ["../../packages/api/src"],
      "@daodao/shared": ["../../packages/shared/src"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

### 12.4 開發指令

```json
// apps/mobile/package.json
{
  "scripts": {
    "dev": "expo start",
    "dev:ios": "expo start --ios",
    "dev:android": "expo start --android",
    "build:dev": "eas build --profile development",
    "build:preview": "eas build --profile preview",
    "build:production": "eas build --profile production",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 13. 開發時程

### 13.1 總覽

| 階段 | 內容 | 時程 | 人力 |
|------|------|------|------|
| Phase 0 | 環境建置 | 2 週 | 1 人 |
| Phase 1 | MVP 核心功能 | 5 週 | 1-2 人 |
| Phase 2 | 完整功能 | 5 週 | 1-2 人 |
| Phase 3 | 進階功能 | 6 週 | 1-2 人 |
| **總計** | | **18 週** | |

### 13.2 詳細時程

```
Week 1-2: Phase 0 - 環境建置
├── Monorepo 設定
├── design-tokens 轉換腳本建立
├── Mobile design tokens 生成機制
├── Tamagui 配置
├── Expo Router 設定
└── CI/CD 基礎建置（含 tokens 自動生成）

Week 3-7: Phase 1 - MVP
├── Week 3: 認證流程
│   ├── 登入/註冊 UI
│   ├── Google OAuth 整合
│   ├── Apple Sign In 整合
│   └── Token 管理
├── Week 4: 首頁 Dashboard
│   ├── Tab 導航
│   ├── 實踐列表
│   └── 統計卡片
├── Week 5: 打卡功能
│   ├── 打卡 Sheet
│   ├── 打卡紀錄
│   └── 進度更新
├── Week 6: 實踐詳情
│   ├── 詳情頁面
│   ├── 日曆視圖
│   └── 統計圖表
└── Week 7: 個人檔案 + QA
    ├── 個人資訊
    ├── 島嶼展示
    └── Bug 修復

Week 8-12: Phase 2 - 完整功能
├── Week 8-9: 建立實踐
│   ├── 模板選擇
│   ├── 多步驟表單
│   └── 表單驗證
├── Week 10: 性格測驗
│   ├── Quiz 流程
│   └── 結果頁面
├── Week 11: 推播通知
│   ├── 權限請求
│   ├── 提醒排程
│   └── 通知處理
└── Week 12: 設定 + 上架
    ├── 設定頁面
    ├── 深色模式
    └── App Store / Play Store 送審

Week 13-18: Phase 3 - 進階功能
├── Week 13-14: 社群功能
├── Week 15: 數據分析
├── Week 16: 成就系統
├── Week 17: Widget
└── Week 18: 離線模式 + 優化
```

### 13.3 里程碑

| 里程碑 | 日期 | 交付物 |
|--------|------|--------|
| M1: 環境就緒 | Week 2 | 可執行的空專案 + CI |
| M2: Alpha | Week 7 | 內部測試版 (TestFlight) |
| M3: Beta | Week 12 | 公開測試版 |
| M4: Launch | Week 12 | App Store / Play Store 上架 |
| M5: v1.1 | Week 18 | 進階功能更新 |

---

## 14. 附錄

### 14.1 參考資源

**官方文件：**

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Tamagui Documentation](https://tamagui.dev/docs/intro/introduction)
- [Tamagui UI Components](https://tamagui.dev/ui/intro)

**設定指南：**

- [Tamagui Expo Guide](https://tamagui.dev/docs/guides/expo)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)

**相關工具：**

- [Style Dictionary](https://styledictionary.com/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### 14.2 相關檔案

| 檔案 | 位置 | 說明 |
|------|------|------|
| Web CSS 變數 | `packages/ui/src/styles/globals.css` | 現有設計 tokens |
| Design Tokens (Web) | `packages/design-tokens/src/` | Web 主要來源 |
| 轉換腳本 | `packages/design-tokens/scripts/generate-mobile.ts` | Web → Mobile 轉換 |
| Design Tokens (Mobile) | `apps/mobile/generated/design-tokens/` | 自動生成，勿手動修改 |
| Quiz 主題色 | `packages/features/quiz/src/utils/theme-map.ts` | 島嶼色彩定義 |
| API Client | `packages/api/` | OpenAPI 生成的 client |
| 共用 Schemas | `packages/shared/` | Zod 驗證 schemas |

### 14.3 決策記錄

| 決策 | 選擇 | 原因 |
|------|------|------|
| UI 框架 | Tamagui | 跨平台一致性、編譯優化、完整元件 |
| Design Tokens | Web 為主 + 腳本轉換 | 單一來源、自動同步、避免維護兩份 |
| 路由 | Expo Router | File-based、與 Next.js 類似 |
| 狀態管理 | SWR | 與 Web 版一致、簡單高效 |
| 認證策略 | 強制登入 | 與 Web 版一致、數據完整、架構簡化 |
| 登入方式 | Google + Apple | Google 與 Web 共用、Apple 為 iOS 強制要求 |

---

## 變更記錄

| 版本 | 日期 | 變更內容 |
|------|------|---------|
| v1.0 | 2026-01-30 | 初版建立 |
