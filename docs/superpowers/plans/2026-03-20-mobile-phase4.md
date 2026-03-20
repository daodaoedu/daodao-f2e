# Mobile Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Navigation 重構（4 tabs）、Home tab 我的/靈感兩頁籤接真實資料、Profile tab 真實資料、Notifications tab with mark as read、Practice CRUD 完善（封存/刪除/恢復/編輯）。

**Architecture:** 以 `@daodao/api` hooks 為資料層，Mobile 端不再維護自己的 API client 邏輯（Plans 1-3 前置工作）。`showcase-hooks.ts` 需擴充以支援 mobile 的 Bearer token auth（目前只支援 cookie）。Navigation 改為 4 tabs，舊的 `create.tsx` / `explore.tsx` 移除，FAB 提升至 tab layout 層。

**Tech Stack:** Expo Router (file-based routing), Tamagui (UI), @daodao/api hooks, react-native-safe-area-context, lottie-react-native

**Prerequisites:** Plan 1 (Auth Bridge) 和 Plan 2 (Hooks Migration) 必須先完成。Plan 3 不是必要前提但 notifications 路由結構會參考其設計。

---

## 檔案變更清單

### 新增
- `apps/mobile/app/(tabs)/notifications.tsx` — Notifications tab 頁面
- `apps/mobile/app/(tabs)/settings.tsx` — Settings tab 頁面（stub，導向 /settings）

### 修改
- `packages/api/src/services/showcase-hooks.ts` — 支援 mobile Bearer token auth + EXPO_PUBLIC_AI_API_URL env var
- `apps/mobile/app/(tabs)/_layout.tsx` — 4 tabs (Home/Notifications/Profile/Settings) + FAB 顯示條件更新
- `apps/mobile/app/(tabs)/index.tsx` — 我的/靈感 segment switcher，接 @daodao/api 真實資料
- `apps/mobile/app/(tabs)/profile.tsx` — 接真實資料（useCurrentUser + useUserPractices）
- `apps/mobile/app/practices/[id]/index.tsx` — 補上封存/刪除真實 API
- `apps/mobile/app/settings/archived.tsx` — 補上恢復/刪除真實 API（改用 @daodao/api hooks）
- `apps/mobile/app/practices/[id]/edit.tsx` — 接 updatePractice 真實 API

### 刪除
- `apps/mobile/app/(tabs)/create.tsx`
- `apps/mobile/app/(tabs)/explore.tsx`

---

## Task 1: 擴充 notification-hooks.ts 匯出 markNotificationRead

`markNotificationRead(id)` 和 `markAllNotificationsRead()` 已在 `notification.ts` 實作，但沒有從 `notification-hooks.ts` 匯出。

**Files:**
- Modify: `packages/api/src/services/notification-hooks.ts`

- [ ] **Step 1: 確認 markNotificationRead 在 notification.ts 的簽名**

```bash
grep -n "markNotificationRead\|markAllNotificationsRead" packages/api/src/services/notification.ts
```

Expected output: 看到兩個函數定義（PATCH /api/v1/notifications/{id}/read 和 PATCH /api/v1/notifications/read-all）

- [ ] **Step 2: 在 notification-hooks.ts 加上 re-export**

在 `packages/api/src/services/notification-hooks.ts` 最頂部的 import 區域找到 notification.ts 的 import（若無則新增），加上這兩個函數的 re-export：

```typescript
// 在現有 import 後加上（或找到 notification.ts 的既有 import 並補充）
export { markNotificationRead, markAllNotificationsRead } from "./notification";
```

若 notification-hooks.ts 沒有從 notification.ts 引入，則在檔案底部加上上述 export 行。

- [ ] **Step 3: 驗證 build 無錯誤**

```bash
cd /path/to/worktree && pnpm --filter @daodao/api build 2>&1 | tail -20
```

Expected: build 成功，無 TypeScript 錯誤

- [ ] **Step 4: Commit**

```bash
git add packages/api/src/services/notification-hooks.ts
git commit -m "feat(api): export markNotificationRead from notification-hooks"
```

---

## Task 2: 修改 showcase-hooks.ts 支援 Mobile

目前 `fetchAiBackend` 硬寫 `getRequiredEnv("NEXT_PUBLIC_AI_API_URL")` 與 `credentials: "include"`（cookie），在 React Native 環境下兩者都無法運作。需要：
1. 改用 `process.env.NEXT_PUBLIC_AI_API_URL ?? process.env.EXPO_PUBLIC_AI_API_URL` 解析 base URL
2. `useShowcaseFeed` 接受可選的 `accessToken` 參數，有 token 時改用 `Authorization: Bearer` header

**Files:**
- Modify: `packages/api/src/services/showcase-hooks.ts`

- [ ] **Step 1: 讀取現有 showcase-hooks.ts 的 fetchAiBackend 和 useShowcaseFeed 完整實作**

```bash
cat -n packages/api/src/services/showcase-hooks.ts
```

- [ ] **Step 2: 修改 fetchAiBackend 簽名，接受可選 accessToken**

找到 `fetchAiBackend` 函數，修改如下：

```typescript
async function fetchAiBackend<T>(path: string, options?: { accessToken?: string }): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_AI_API_URL ??
    process.env.EXPO_PUBLIC_AI_API_URL ??
    (() => { throw new Error("AI_API_URL env var is not set"); })();

  const headers: Record<string, string> = {};
  if (options?.accessToken) {
    headers["Authorization"] = `Bearer ${options.accessToken}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    credentials: options?.accessToken ? "omit" : "include",
    headers,
  });
  if (!res.ok) throw new Error(`AI backend error: ${res.status}`);
  return res.json() as Promise<T>;
}
```

移除 `import { getRequiredEnv } from "@daodao/config"` 若 fetchAiBackend 是唯一使用者（先 grep 確認）。

- [ ] **Step 3: 更新 IShowcaseFeedParams 加入 accessToken**

```typescript
export interface IShowcaseFeedParams {
  keyword?: string;
  tags?: string[];
  duration_min?: number;
  duration_max?: number;
  status?: "active" | "completed";
  sort_by?: string;
  limit?: number;
  accessToken?: string;  // 新增：mobile 傳入 Bearer token
}
```

- [ ] **Step 4: 在 useShowcaseFeed 的 fetcher 中傳入 accessToken**

找到 `useShowcaseFeed` 中呼叫 `fetchAiBackend` 的地方（通常在 `getKey` 對應的 fetcher），將 `accessToken` 從 params 傳下去：

```typescript
// 在 fetcher 函數內
const data = await fetchAiBackend<AIResponse<IShowcasePractice[]>>(url, {
  accessToken: params?.accessToken,
});
```

- [ ] **Step 5: 確認 getRequiredEnv import 是否還需要**

```bash
grep -n "getRequiredEnv" packages/api/src/services/showcase-hooks.ts
```

若無其他使用，移除該 import 行。

- [ ] **Step 6: Build 驗證**

```bash
pnpm --filter @daodao/api build 2>&1 | tail -20
```

- [ ] **Step 7: Commit**

```bash
git add packages/api/src/services/showcase-hooks.ts
git commit -m "feat(api): support Bearer token auth in useShowcaseFeed for mobile"
```

---

## Task 3: Navigation 重構 — 4 tabs + FAB

**Files:**
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/notifications.tsx` （stub，Task 4 完成完整實作）
- Create: `apps/mobile/app/(tabs)/settings.tsx` （stub，導向 /settings）
- Delete: `apps/mobile/app/(tabs)/create.tsx`
- Delete: `apps/mobile/app/(tabs)/explore.tsx`

- [ ] **Step 1: 建立 notifications.tsx stub（先建立才能設定 tab）**

```typescript
// apps/mobile/app/(tabs)/notifications.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>通知（建置中）</Text>
      </YStack>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 建立 settings.tsx stub（導向 /settings）**

Settings tab 點擊時直接 push 到 `/settings` route，不需要獨立頁面。建立一個立即重導向的 stub：

```typescript
// apps/mobile/app/(tabs)/settings.tsx
import { Redirect } from "expo-router";

export default function SettingsTab() {
  return <Redirect href="/settings" />;
}
```

- [ ] **Step 3: 更新 _layout.tsx**

完整替換 `apps/mobile/app/(tabs)/_layout.tsx`：

```typescript
import { Bell, Home, Plus, Settings, User } from "@tamagui/lucide-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/generated/design-tokens";

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const handleAddPractice = () => {
    router.push("/practices/create");
  };

  // FAB 在 Home tab 顯示（pathname === "/" 涵蓋兩個 sub-tabs，因為兩個都在 index 路由下）
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
            tabBarIcon: ({ color }) => <Home size={28} color={color} />,
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
            tabBarIcon: ({ color }) => <User size={28} color={color} />,
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
```

**注意**：`HomeIcon` / `UserIcon` 使用自定義 icon 組件（來自 `@/components/icons`），若有自定義版本可保留；這裡改用 lucide-icons 的標準版本以簡化。若 `@/components/icons` 有 `BellIcon` / `SettingsIcon` 則優先使用。

- [ ] **Step 4: 刪除舊 tab 檔案**

```bash
rm apps/mobile/app/(tabs)/create.tsx
rm apps/mobile/app/(tabs)/explore.tsx
```

- [ ] **Step 5: 確認 app 可以啟動，4 個 tab 正確顯示**

```bash
# 在 apps/mobile 目錄啟動 Expo
pnpm expo start
```

手動確認：4 個 tab icon 出現，Home / Notifications / Profile / Settings，FAB 在 Home tab 顯示。

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/app/(tabs)/
git commit -m "feat(mobile/nav): 重構為 4 tabs (Home/Notifications/Profile/Settings)"
```

---

## Task 4: Notifications Tab 完整實作

使用 `useNotifications` + `markNotificationRead`。每 30 秒 polling，點擊通知 mark as read 並導航。

**Files:**
- Modify: `apps/mobile/app/(tabs)/notifications.tsx`

Hook API（來自 `@daodao/api`）：
- `useNotifications({ limit: 50 })` → `{ data, error, isLoading, mutate }` where `data?.data` 是通知陣列
- `markNotificationRead(id: number)` → PATCH `/api/v1/notifications/{id}/read`

- [ ] **Step 1: 確認 useNotifications 的回傳型別**

```bash
grep -n "useNotifications\|INotification\b" packages/api/src/services/notification-hooks.ts | head -30
```

注意 `data?.data` 的結構（通知物件有 `id`, `title`, `body`, `isRead`, `createdAt`, `resourceType`, `resourceId` 等欄位）。

- [ ] **Step 2: 確認 Notification 型別定義**

```bash
grep -n "Notification\b" packages/api/src/services/notification-hooks.ts | head -20
```

- [ ] **Step 3: 實作 notifications.tsx**

```typescript
// apps/mobile/app/(tabs)/notifications.tsx
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Alert, Pressable, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { markNotificationRead, useNotifications } from "@daodao/api";
import { colors } from "@/generated/design-tokens";

const POLL_INTERVAL_MS = 30_000;

function getResourceRoute(notification: {
  resourceType?: string | null;
  resourceId?: string | null;
}): string | null {
  if (!notification.resourceType || !notification.resourceId) return null;
  switch (notification.resourceType) {
    case "practice":
      return `/practices/${notification.resourceId}`;
    case "check_in":
      return `/check-ins/${notification.resourceId}`;
    case "user":
      return `/users/${notification.resourceId}`;
    default:
      return null;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useNotifications({ limit: 50 });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 30 秒 polling
  useEffect(() => {
    pollRef.current = setInterval(() => {
      mutate();
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [mutate]);

  const handleNotificationPress = useCallback(
    async (notification: { id: number; isRead: boolean; resourceType?: string | null; resourceId?: string | null }) => {
      // Mark as read（fire-and-forget，不阻擋導航）
      if (!notification.isRead) {
        markNotificationRead(notification.id).catch(() => {
          // 靜默失敗，不影響導航體驗
        });
        // 樂觀更新
        mutate();
      }

      const route = getResourceRoute(notification);
      if (route) {
        router.push(route as Parameters<typeof router.push>[0]);
      }
    },
    [router, mutate]
  );

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const notifications = data?.data ?? [];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text color="$color" opacity={0.6} textAlign="center">
            載入通知失敗
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F8" }} edges={["top"]}>
      <YStack flex={1}>
        {/* Header */}
        <XStack paddingHorizontal="$5" paddingVertical="$4">
          <Text fontSize={22} fontWeight="600" color={colors.text.dark}>
            通知
          </Text>
        </XStack>

        {/* 通知列表 */}
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary.base}
            />
          }
        >
          {notifications.length === 0 ? (
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" gap="$3">
              <Text fontSize={16} color="$color" opacity={0.5} textAlign="center">
                目前沒有通知
              </Text>
            </YStack>
          ) : (
            <YStack paddingBottom={100}>
              {notifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <XStack
                    paddingHorizontal="$5"
                    paddingVertical="$4"
                    backgroundColor={notification.isRead ? "transparent" : "#EBF9F9"}
                    borderBottomWidth={1}
                    borderBottomColor="#F0F0F0"
                    alignItems="center"
                    gap="$3"
                  >
                    {/* 未讀指示點 */}
                    <YStack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={notification.isRead ? "transparent" : colors.primary.base}
                      flexShrink={0}
                    />
                    <YStack flex={1} gap="$1">
                      <Text
                        fontSize={15}
                        fontWeight={notification.isRead ? "400" : "600"}
                        color={colors.text.dark}
                        numberOfLines={2}
                      >
                        {notification.title}
                      </Text>
                      {notification.body && (
                        <Text fontSize={13} color={colors.text.muted} numberOfLines={2}>
                          {notification.body}
                        </Text>
                      )}
                      <Text fontSize={11} color={colors.basic[400]} marginTop="$1">
                        {new Date(notification.createdAt).toLocaleDateString("zh-TW", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </YStack>
                  </XStack>
                </Pressable>
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
```

**注意**：需在頂部加上 `import { Pressable, ScrollView } from "react-native";`（或用 Tamagui 的 ScrollView，但 RefreshControl 需要 RN 的 ScrollView）。確認 import 正確。

- [ ] **Step 4: 確認 `useNotifications` 接受 `limit` 參數**

```bash
grep -n "useNotifications" packages/api/src/services/notification-hooks.ts | head -5
```

若不接受 params，直接呼叫 `useNotifications()` 即可。

- [ ] **Step 5: 確認 Notification 物件有 `isRead`、`resourceType`、`resourceId` 欄位**

若欄位名稱不同（如 `is_read`），調整 `getResourceRoute` 和模板。

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/app/(tabs)/notifications.tsx
git commit -m "feat(mobile): 實作 Notifications tab with mark as read"
```

---

## Task 5: Home Tab — 我的/靈感 Segment Switcher + 真實資料

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

Data hooks（來自 `@daodao/api`）：
- `useMyPractices(params?)` → 我的實踐列表
- `useMyPracticeStats()` → `{ data }` where `data?.data?.currentStreak`, `data?.data?.totalCheckIns`
- `useShowcaseFeed(params)` → `{ practices, isLoading, hasMore, loadMore }` （需傳 `accessToken`）

關鍵：取得 accessToken 的方法需與 Plan 1 的 auth bridge 對齊。查找 mobile app 中儲存 token 的位置（通常是 `useAuthStore` 或 `SecureStore`）。

- [ ] **Step 1: 找到 mobile app 取得 accessToken 的方式**

```bash
grep -rn "accessToken\|getToken\|useAuthStore\|SecureStore" apps/mobile/hooks/ apps/mobile/store/ apps/mobile/context/ 2>/dev/null | head -20
grep -rn "accessToken\|getToken\|useAuthStore" apps/mobile/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | head -20
```

確認如何在 component 中拿到 token（可能是 `useAuthStore(state => state.accessToken)` 或類似）。

- [ ] **Step 2: 確認 useMyPractices 回傳 practice 的狀態欄位**

```bash
grep -n "IGetMyPracticesParams\|status" packages/api/src/services/practice-hooks.ts | head -20
```

「我的」頁籤需過濾：in-progress → `active | draft | not_started`，completed → `completed`。確認 API 的 status 值。

- [ ] **Step 3: 確認 useMyPracticeStats 回傳欄位**

```bash
# 查看 stats 的型別
grep -n "practice-stats\|PracticeStats\|currentStreak\|totalCheckIns" packages/api/src/services/practice-hooks.ts | head -20
```

- [ ] **Step 4: 確認 useShowcaseFeed 的 accessToken 參數在 Task 2 後正確存在**

```bash
grep -n "accessToken" packages/api/src/services/showcase-hooks.ts
```

- [ ] **Step 5: 實作新的 index.tsx（我的頁籤 + 靈感頁籤）**

完整替換 `apps/mobile/app/(tabs)/index.tsx`：

```typescript
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView as RNScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import {
  useMyPractices,
  useMyPracticeStats,
  useShowcaseFeed,
} from "@daodao/api";

// NOTE: MineTab 的垂直外層 ScrollView 使用 react-native 的 RNScrollView，
// 因為 Tamagui 的 ScrollView 不接受 RefreshControl prop。
// 靈感 tab 的 FlatList 也來自 react-native。
import { PracticeCard } from "@/components";
import { colors } from "@/generated/design-tokens";
// TODO: 替換成 Plan 1 提供的 token hook
// import { useAuthStore } from "@/store/auth";

type HomeTab = "mine" | "explore";

// ============================================================================
// 我的頁籤
// ============================================================================

function MineTab() {
  const router = useRouter();
  const { data: practicesData, isLoading, mutate } = useMyPractices();
  const { data: statsData } = useMyPracticeStats();

  const allPractices = practicesData?.data ?? [];
  const inProgress = allPractices.filter(
    (p) => p.status === "active" || p.status === "draft" || p.status === "not_started"
  );
  const completed = allPractices.filter((p) => p.status === "completed");

  const stats = statsData?.data;

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={colors.primary.base} />
      </YStack>
    );
  }

  return (
    <RNScrollView
      style={{ flex: 1, backgroundColor: "transparent" }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleRefresh}
          tintColor={colors.primary.base}
        />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* 統計資訊 */}
      {stats && (
        <XStack paddingHorizontal="$5" paddingVertical="$3" gap="$4">
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={colors.primary.base}>
              {stats.currentStreak ?? 0}
            </Text>
            <Text fontSize={11} color={colors.text.muted}>連續登入天數</Text>
          </YStack>
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={colors.primary.base}>
              {stats.totalCheckIns ?? 0}
            </Text>
            <Text fontSize={11} color={colors.text.muted}>總打卡次數</Text>
          </YStack>
        </XStack>
      )}

      {/* 進行中 */}
      <YStack paddingTop="$3" gap="$3">
        <XStack paddingHorizontal="$5" justifyContent="space-between" alignItems="center">
          <Text fontSize={16} fontWeight="500" color={colors.text.dark}>進行中</Text>
        </XStack>
        {inProgress.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {inProgress.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                onPress={() => router.push(`/practices/${practice.id}`)}
                variant="gradient"
              />
            ))}
          </ScrollView>
        ) : (
          <YStack
            marginHorizontal="$5"
            padding="$6"
            alignItems="center"
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={14} color="$color" opacity={0.5}>
              還沒有進行中的實踐
            </Text>
          </YStack>
        )}
      </YStack>

      {/* 已完成 */}
      {completed.length > 0 && (
        <YStack paddingTop="$4" gap="$3" paddingHorizontal="$5">
          <Text fontSize={16} fontWeight="500" color={colors.text.dark}>已完成</Text>
          {completed.map((practice) => (
            <PracticeCard
              key={practice.id}
              practice={practice}
              onPress={() => router.push(`/practices/${practice.id}`)}
              showCheckInButton={false}
              variant="completed"
            />
          ))}
        </YStack>
      )}
    </RNScrollView>
  );
}

// ============================================================================
// 靈感頁籤
// ============================================================================

function ExploreTab() {
  const router = useRouter();
  // const accessToken = useAuthStore(state => state.accessToken);
  const accessToken = undefined; // TODO: 從 Plan 1 auth store 取得
  const [keyword, setKeyword] = useState("");

  const { practices, isLoading, hasMore, loadMore } = useShowcaseFeed({
    keyword: keyword || undefined,
    accessToken,
  });

  if (isLoading && practices.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color={colors.primary.base} />
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {/* SearchBar */}
      <XStack paddingHorizontal="$4" paddingVertical="$2">
        <Input
          flex={1}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜尋靈感..."
          fontSize={14}
          borderColor="$borderColor"
          focusStyle={{ borderColor: colors.primary.base }}
        />
      </XStack>
      <FlatList
      data={practices}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 12 }}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/practices/${item.id}`)}>
          <YStack
            padding="$4"
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={15} fontWeight="500" color={colors.text.dark} numberOfLines={2}>
              {item.title}
            </Text>
            {item.user?.name && (
              <Text fontSize={12} color={colors.text.muted} marginTop="$1">
                {item.user.name}
              </Text>
            )}
          </YStack>
        </Pressable>
      )}
      onEndReached={() => {
        if (hasMore) loadMore();
      }}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={
        <YStack padding="$8" alignItems="center">
          <Text fontSize={14} color="$color" opacity={0.5}>沒有靈感內容</Text>
        </YStack>
      }
    />
    </YStack>
  );
}

// ============================================================================
// Home Screen
// ============================================================================

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<HomeTab>("mine");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F8" }} edges={["top"]}>
      {/* Segment Control */}
      <XStack
        paddingHorizontal="$5"
        paddingVertical="$3"
        backgroundColor="#F7F8F8"
        borderBottomWidth={1}
        borderBottomColor="#E5E7EB"
      >
        <XStack
          backgroundColor="#EEEEEE"
          borderRadius={8}
          padding={2}
        >
          {(["mine", "explore"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.segmentButton,
                activeTab === tab && styles.segmentButtonActive,
              ]}
            >
              <Text
                fontSize={14}
                fontWeight={activeTab === tab ? "600" : "400"}
                color={activeTab === tab ? colors.text.dark : colors.text.muted}
              >
                {tab === "mine" ? "我的" : "靈感"}
              </Text>
            </Pressable>
          ))}
        </XStack>
      </XStack>

      {/* Tab Content */}
      {activeTab === "mine" ? <MineTab /> : <ExploreTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  segmentButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
```

**注意：**
- `PracticeCard` 接受的 `practice` 型別可能與 `@daodao/api` 回傳的不完全一致。Plan 2 完成後 PracticeCard 應已接受 API 格式；若還是本地型別，需對應轉換或等 Plan 2 完成後再接。
- `TODO: accessToken` — 在 Plan 1 的 auth bridge 完成後，找到儲存 token 的 store 並取得。
- 靈感頁籤的 `ShowcaseCard` 元件目前用最簡單的 YStack 實作。若 `@/components` 有 `ShowcaseCard` 或 `PracticeShowcaseCard` 元件，優先使用。

- [ ] **Step 6: 確認 BrewingCard / PracticeShowcaseCard 是否存在**

```bash
grep -rn "BrewingCard\|ShowcaseCard\|PracticeShowcaseCard" apps/mobile/components/ 2>/dev/null | head -10
```

若找到，在 `ExploreTab` 的 `renderItem` 中使用：
```typescript
renderItem={({ item }) =>
  item.is_brewing ? (
    <BrewingCard practice={item} onPress={() => router.push(`/practices/${item.id}`)} />
  ) : (
    <PracticeShowcaseCard practice={item} onPress={() => router.push(`/practices/${item.id}`)} />
  )
}
```
若不存在，保留 YStack 簡版（acceptable fallback）。

- [ ] **Step 7: 確認 PracticeCard 接受的 practice 型別**

```bash
grep -n "practice:" apps/mobile/components/PracticeCard.tsx 2>/dev/null | head -10
grep -rn "PracticeCard\b" apps/mobile/components/ --include="*.tsx" | head -5
```

若 PracticeCard 仍用本地 `Practice` 型別，此步驟留 TODO comment，等 Plan 2 完成。

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/app/(tabs)/index.tsx
git commit -m "feat(mobile): Home tab 我的/靈感 segment switcher 接真實資料"
```

---

## Task 6: Profile Tab — 真實資料

**Files:**
- Modify: `apps/mobile/app/(tabs)/profile.tsx`

目前 `profile.tsx` 已有完整的 UI 結構（IslandHeader with Lottie 動畫 + scroll fade effect + UserInfoCard + PracticeSection）。這些 UI 元素**已經存在且不需要重建**。本 Task 只做資料層替換：將 mock 資料換成 `useCurrentUser()` + `useUserPractices(userId)` 的真實 API 資料。

Hooks（來自 `@daodao/api`）：
- `useCurrentUser()` → `{ data }` where `data?.data` 是使用者資料
- `useUserPractices(userId)` → `{ data }` where `data?.data` 是實踐陣列

- [ ] **Step 1: 確認 useCurrentUser 回傳的 user 欄位**

```bash
grep -n "IUser\b\|UserResponse\|data.*user" packages/api/src/services/user-hooks.ts | head -20
```

確認欄位名稱：`name`、`customId`（用作 identifier）、`location`、`bio`、`photoUrl`、`socialLinks` 的格式。

- [ ] **Step 2: 確認 useUserPractices 回傳欄位**

```bash
grep -n "useUserPractices\|IGetUserPractices" packages/api/src/services/practice-hooks.ts | head -10
```

- [ ] **Step 3: 在 profile.tsx 替換 mock 資料為真實 API**

找到 profile.tsx 中的 mock 資料區段（約第 135-175 行）和下方的 `displayUser = mockUser`，替換為：

```typescript
// 替換 mock 資料和舊的 useCurrentUser() 呼叫
import { useCurrentUser, useUserPractices } from "@daodao/api";

// 在 component 內：
const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
const currentUser = currentUserData?.data;
const userId = currentUser?.id ?? "";

const { data: practicesData, isLoading: practicesLoading } = useUserPractices(userId, {
  // 若 API 支援 includeCompleted 參數則使用，否則 client-side filter
});
```

**欄位對應（API → UI 顯示）：**
- `currentUser?.name` → displayUser.name
- `currentUser?.photoUrl` → displayUser.avatar（注意欄位名，可能是 `photo_url` 或 `photoUrl`）
- `currentUser?.location` → displayUser.location
- `currentUser?.bio` → displayUser.bio
- `currentUser?.socialLinks` → socialLinks（注意格式，可能是 `{ website?, github?, facebook?, instagram?, ... }`）

若 API 的 socialLinks 是物件格式（`{ facebook: url, instagram: url }`）而非陣列格式（`[{ platform, url }]`），需轉換：

```typescript
const socialLinks = currentUser ? Object.entries({
  facebook: currentUser.socialLinks?.facebook,
  instagram: currentUser.socialLinks?.instagram,
  line: currentUser.socialLinks?.line,
  linkedin: currentUser.socialLinks?.linkedin,
  threads: currentUser.socialLinks?.threads,
  discord: currentUser.socialLinks?.discord,
})
  .filter(([, url]) => !!url)
  .map(([platform, url]) => ({ platform, url: url! })) : [];
```

- [ ] **Step 4: 替換 mock practices 為真實資料**

找到 `displayedPractices` 的計算，替換為：

```typescript
const allPractices = practicesData?.data ?? [];
const displayedPractices = includeCompleted
  ? allPractices
  : allPractices.filter((p) => p.status !== "completed");
```

注意 API practice 的 status 欄位名稱可能與本地型別不同（`active` vs `in-progress` 等）。確認後調整 `getStatusBadge` 函數的對應。

- [ ] **Step 5: 更新 Loading 狀態處理**

若 `userLoading` 為 true 顯示 Spinner（與其他頁面一致）。

- [ ] **Step 6: 刪除所有 mock 資料定義（mockUser, mockSocialLinks, mockPractices）**

確保沒有 unused variable。

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/app/(tabs)/profile.tsx
git commit -m "feat(mobile): Profile tab 接 useCurrentUser + useUserPractices 真實資料"
```

---

## Task 7: Practice Detail — 封存/刪除真實 API

**Files:**
- Modify: `apps/mobile/app/practices/[id]/index.tsx`

目前 `handleArchive` 和 `handleDelete` 都是 `/* TODO */`。

Hooks（來自 `@daodao/api`）：
- `useArchivePractice(practiceId)` → `{ archivePractice }` — throws on error
- `useDeletePractice(practiceId)` → `{ deletePractice }` — throws on error

- [ ] **Step 1: 讀取 practices/[id]/index.tsx 的 handleArchive 和 handleDelete（約第 63-100 行）**

```bash
sed -n '1,15p' apps/mobile/app/practices/\[id\]/index.tsx
grep -n "handleArchive\|handleDelete\|TODO\|useArchive\|useDelete" apps/mobile/app/practices/\[id\]/index.tsx
```

- [ ] **Step 2: 在 PracticeDetailScreen 中加入 hooks 和 loading state**

在 component 頂部加入：

```typescript
import {
  useArchivePractice,
  useDeletePractice,
} from "@daodao/api";

// 在 component 內（id 已有）:
const { archivePractice } = useArchivePractice(id ?? "");
const { deletePractice } = useDeletePractice(id ?? "");
const [isArchiving, setIsArchiving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

- [ ] **Step 3: 替換 handleArchive 的 TODO**

```typescript
const handleArchive = useCallback(() => {
  Alert.alert("封存實踐", "確定要封存此實踐嗎？", [
    { text: "取消", style: "cancel" },
    {
      text: "封存",
      onPress: async () => {
        setIsArchiving(true);
        try {
          await archivePractice();
          router.back();
        } catch (e) {
          Alert.alert("封存失敗", e instanceof Error ? e.message : "請稍後再試");
        } finally {
          setIsArchiving(false);
        }
      },
    },
  ]);
}, [archivePractice, router]);
```

- [ ] **Step 4: 替換 handleDelete 的 TODO**

```typescript
const handleDelete = useCallback(() => {
  Alert.alert("刪除實踐", "確定要刪除此實踐嗎？此操作無法復原。", [
    { text: "取消", style: "cancel" },
    {
      text: "刪除",
      style: "destructive",
      onPress: async () => {
        setIsDeleting(true);
        try {
          await deletePractice();
          router.replace("/");
        } catch (e) {
          Alert.alert("刪除失敗", e instanceof Error ? e.message : "請稍後再試");
        } finally {
          setIsDeleting(false);
        }
      },
    },
  ]);
}, [deletePractice, router]);
```

- [ ] **Step 5: 在封存/刪除按鈕上加 disabled + spinner**

找到觸發 handleArchive 和 handleDelete 的 Button 元件，加上：

```typescript
disabled={isArchiving || isDeleting}
opacity={isArchiving || isDeleting ? 0.6 : 1}
// 按鈕內若有文字，可在 isArchiving/isDeleting 時顯示 Spinner
```

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/app/practices/\[id\]/index.tsx
git commit -m "feat(mobile): practice detail 封存/刪除接真實 API"
```

---

## Task 8: Archived Settings — 恢復/刪除真實 API

**Files:**
- Modify: `apps/mobile/app/settings/archived.tsx`

目前使用本地 `usePractices()` hook（Plan 2 遷移後的版本），handleRestore 和 handleDelete 都是 TODO。

Hooks（來自 `@daodao/api`）：
- `useMyPractices({ status: "archived" })` → 封存中實踐列表（若 API 支援此 status filter）
- `useUnarchivePractice()` → `{ unarchivePractice(practiceId) }` — throws on error
- `useDeletePractice(practiceId)` → `{ deletePractice }` — 需在每個 item 的 handler 中建立

**注意**：規格 section 4 的 CRUD 表格寫 `useDeletePractice(practiceId).deletePractice()`，但在列表頁面每個 item 都有不同 id，不能在 component top level 呼叫 hook（違反 Rules of Hooks）。**此處改用直接函數 `deletePractice(id)`**（同樣在 `practice-hooks.ts` export，內部呼叫相同 API）。這是有意的架構決定。

查看 practice-hooks.ts 中是否有 `deletePractice` 的 non-hook export（有：`export const deletePractice = async (id: string) => ...`）。

- [ ] **Step 1: 確認 archived status filter 是否可用**

```bash
grep -n "status.*archived\|archived.*status" packages/api/src/services/practice-hooks.ts | head -10
```

若 `useMyPractices({ status: "archived" })` 支援，使用此 API filter。若不支援，改用 `useMyPractices()` 後 client-side filter。

- [ ] **Step 2: 確認 deletePractice 非 hook export**

```bash
grep -n "^export const deletePractice" packages/api/src/services/practice-hooks.ts
```

- [ ] **Step 3: 更新 archived.tsx 的 imports 和 data 來源**

```typescript
// 移除舊的 local hook import
// import { usePractices } from "@/hooks/usePractices";

// 新的 imports
import {
  deletePractice,  // 直接函數，非 hook
  useMyPractices,
  useUnarchivePractice,
} from "@daodao/api";

// 在 component 內：
const { data, mutate } = useMyPractices({ status: "archived" });
const archivedPractices = data?.data ?? [];
const { unarchivePractice } = useUnarchivePractice();
```

- [ ] **Step 4: 實作真實 handleRestore**

```typescript
const handleRestore = (practice: { id: string; title: string }) => {
  Alert.alert("恢復實踐", `確定要恢復「${practice.title}」嗎？`, [
    { text: "取消", style: "cancel" },
    {
      text: "恢復",
      onPress: async () => {
        try {
          await unarchivePractice(practice.id);
          await mutate();
        } catch (e) {
          Alert.alert("恢復失敗", e instanceof Error ? e.message : "請稍後再試");
        }
      },
    },
  ]);
};
```

- [ ] **Step 5: 實作真實 handleDelete**

```typescript
const handleDelete = (practice: { id: string; title: string }) => {
  Alert.alert("永久刪除", `確定要永久刪除「${practice.title}」嗎？此操作無法復原。`, [
    { text: "取消", style: "cancel" },
    {
      text: "刪除",
      style: "destructive",
      onPress: async () => {
        try {
          await deletePractice(practice.id);
          await mutate();
        } catch (e) {
          Alert.alert("刪除失敗", e instanceof Error ? e.message : "請稍後再試");
        }
      },
    },
  ]);
};
```

- [ ] **Step 6: 更新 practice 型別（移除本地 Practice 型別 import）**

移除 `import type { Practice } from "@/types/practice";`，改用 API 回傳的型別（inline 或從 `@daodao/api` 取得）。

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/app/settings/archived.tsx
git commit -m "feat(mobile): archived settings 恢復/刪除接真實 API"
```

---

## Task 9: Practice Edit — 接 updatePractice

**Files:**
- Modify: `apps/mobile/app/practices/[id]/edit.tsx`

目前 `edit.tsx` 顯示「即將推出」placeholder。需實作完整的編輯表單。

Function（來自 `@daodao/api`）：
- `updatePractice(id, data)` → `PUT /api/v1/practices/{id}`
- `usePractice(id)` → 取得現有資料（Plan 2 後應從 `@daodao/api` 的 `usePractice` 取得）

- [ ] **Step 1: 確認 UpdatePracticeRequestType 的欄位**

```bash
grep -n "UpdatePracticeRequestType\|UpdatePractice" packages/api/src/services/practice-hooks.ts | head -10
grep -n "UpdatePracticeRequest\b" packages/api/src/generated/schema.d.ts 2>/dev/null | head -5
```

確認可編輯欄位：`title`、`description`（或 `practiceAction`？）、`targetDays`、`privacy_status`、`tags`。

- [ ] **Step 2: 確認 usePracticeById 的 import 路徑和回傳型別**

`usePracticeById` 在 `@daodao/api` 中（verified：`packages/api/src/services/practice-hooks.ts:134`）。
回傳值是 SWR useQuery 格式：`{ data, error, isLoading, mutate }` where `data?.data` 是 practice 物件。

```bash
grep -n "usePracticeById\|export.*usePracticeById" packages/api/src/services/practice-hooks.ts | head -5
# 確認 @daodao/api 的 index.ts 有 export usePracticeById
grep -n "usePracticeById" packages/api/src/index.ts 2>/dev/null | head -5
```

- [ ] **Step 3: 實作 edit.tsx 基本表單**

```typescript
// apps/mobile/app/practices/[id]/edit.tsx
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { updatePractice, usePracticeById } from "@daodao/api";
import { colors } from "@/generated/design-tokens";

export default function PracticeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = usePracticeById(id ?? "");
  const practice = data?.data;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 當資料載入後初始化表單
  useEffect(() => {
    if (practice) {
      setTitle(practice.title ?? "");
      setDescription(practice.practiceAction ?? "");
    }
  }, [practice]);

  const handleSave = async () => {
    if (!id || !title.trim()) {
      Alert.alert("請填寫標題");
      return;
    }
    setIsSaving(true);
    try {
      const response = await updatePractice(id, {
        title: title.trim(),
        practiceAction: description.trim() || undefined,
      });
      if (response.error) {
        throw new Error("更新失敗");
      }
      router.back();
    } catch (e) {
      Alert.alert("儲存失敗", e instanceof Error ? e.message : "請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$2">
            <Button size="$4" circular chromeless onPress={() => router.back()} accessibilityLabel="返回">
              <ChevronLeft size={24} color="$color" />
            </Button>
            <Text fontSize={18} fontWeight="600" color="$color">編輯實踐</Text>
          </XStack>
          <Button
            size="$3"
            backgroundColor={colors.primary.base}
            borderRadius="$md"
            disabled={isSaving}
            onPress={handleSave}
            pressStyle={{ opacity: 0.8 }}
          >
            {isSaving ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text color="white" fontWeight="500">儲存</Text>
            )}
          </Button>
        </XStack>

        <ScrollView flex={1} padding="$4" contentContainerStyle={{ gap: 16 }}>
          {/* 標題 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color={colors.text.dark}>標題</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="實踐標題"
              fontSize={16}
              borderColor="$borderColor"
              focusStyle={{ borderColor: colors.primary.base }}
            />
          </YStack>

          {/* 描述 */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color={colors.text.dark}>實踐行動</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="描述你的實踐行動"
              multiline
              numberOfLines={4}
              fontSize={14}
              borderColor="$borderColor"
              focusStyle={{ borderColor: colors.primary.base }}
            />
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
```

**注意**：
- `updatePractice` 使用 `openapi-fetch` 的 `client.PUT()`，確實回傳 `{ data, error }`，所以 `response.error` 的寫法是正確的。
- `usePracticeById` 回傳 `{ data, error, isLoading, mutate }`，`data?.data` 是 practice 物件。
- `practiceAction` 是 API schema 中的欄位名（`PUT /api/v1/practices/{id}` 的 body）；驗證時確認 UpdatePracticeRequestType 的欄位。

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/practices/\[id\]/edit.tsx
git commit -m "feat(mobile): practice edit 接 updatePractice 真實 API"
```

---

## Task 10: 最終驗收

- [ ] **Step 1: 確認 TypeScript 編譯無錯誤**

```bash
pnpm --filter @daodao/api tsc --noEmit 2>&1 | tail -30
cd apps/mobile && npx tsc --noEmit 2>&1 | tail -30
```

- [ ] **Step 2: 確認 Expo app 可以啟動**

```bash
pnpm --filter mobile expo start
```

- [ ] **Step 3: 手動驗收清單**

- [ ] 4 個 tab（Home / Notifications / Profile / Settings）正確顯示
- [ ] Home tab 可以在「我的」和「靈感」切換
- [ ] 「我的」頁籤載入真實 practices
- [ ] 「靈感」頁籤嘗試載入（若 accessToken TODO 尚未補完則顯示 loading 或空）
- [ ] Notifications tab 顯示通知列表，點擊後 mark as read
- [ ] Profile tab 顯示真實使用者名稱
- [ ] Practice detail 頁的封存/刪除按鈕可以呼叫 API
- [ ] Archived settings 頁的恢復/刪除按鈕可以呼叫 API
- [ ] Practice edit 頁有表單，可以儲存

- [ ] **Step 4: Commit 任何最後調整**

```bash
git add -p
# 根據 format-commit skill 建立 commit
```

---

## 注意事項（執行前必讀）

### 依賴 Plan 2 的地方
- `index.tsx` (「我的」頁籤) 使用 `PracticeCard` — Plan 2 完成後 PracticeCard 應接受 API 格式 practice
- `archived.tsx` 使用 `useMyPractices` — 需要 Plan 2 的 `@daodao/api` client 初始化完成

### accessToken TODO
`ExploreTab` 中的 `accessToken = undefined` 是有意的 TODO。完成 Plan 1 後，找到 mobile app 的 auth store（可能是 zustand store 或 context），取出 accessToken 替換。

### PracticeCard 型別相容性
若 Plan 2 尚未完成，`PracticeCard` 可能仍接受本地 `Practice` 型別。「我的」頁籤的 `inProgress.map(practice => <PracticeCard practice={practice} ...>)` 可能有 TypeScript 錯誤。解法：先用 `as any` 暫時繞過，等 Plan 2 完成後移除。

### usePractice in edit.tsx
`usePractice(id)` 在 Plan 2 完成後從 `@daodao/api` import。若 Plan 2 未完成，仍使用 `@/hooks/usePractices`。
