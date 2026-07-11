# Mobile 首頁對齊 product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `apps/mobile` 首頁在視覺與結構上對齊 `apps/product` 首頁（吉祥物 banner、三 tab、間距對齊、flip-card 認識你卡）。

**Architecture:** 逐元件移植 product 首頁到 React Native / tamagui。Banner 為 overlay + Reanimated 滾動漸淡；認識你卡用 Reanimated `rotateY` 做 3D flip；quiz slogan 透過 features-quiz 新增的 subpath export 共用純資料。

**Tech Stack:** Expo / React Native, tamagui, react-native-reanimated, lottie-react-native, react-native-svg, `@daodao/api`, `@daodao/assets`, `@daodao/features-quiz`。

## Global Constraints

- 互動與註解用繁體中文；程式碼註解英文或繁中皆可。
- UI 一律用 tamagui / `@/components/ui`，不新增原生 HTML（此為 RN，無此問題）。
- 顏色一律用 `@/generated/design-tokens` 的 `colors`；需要 product 專屬色時對照 token：`colors.logo.cyan`=#16B9B3、`colors.logo.orange`=#FFA10E、`colors.primary.darker`=#295E5C、`colors.text.dark`=#295E5C。
- 日期用 `date-fns`；禁原生 Date 方法。
- API 呼叫走 `@daodao/api`；`response.error` 必檢查。
- 禁止手改生成物（`packages/assets/generated/*`、`apps/mobile/generated/*`）。
- 無單元測試框架：每個 task 的驗證循環 = `pnpm run lint` + `pnpm run typecheck` + iOS 模擬器實跑首頁目視（用 run-mobile-ios skill）。
- 每個 task 完成後 commit（依專案 commit 流程：pre-commit-check → format-commit → 使用者確認）。

---

### Task 1: features-quiz subpath export + mobile 依賴

**Files:**
- Modify: `packages/features/quiz/package.json`
- Modify: `apps/mobile/package.json`

**Interfaces:**
- Produces: `import { resultDetailMap } from "@daodao/features-quiz/result-detail-map"`（`Map<string, IResultDetail>`，`IResultDetail.slogan: string`）供 Task 3 Banner 使用。

- [ ] **Step 1: 加 subpath export**

`packages/features/quiz/package.json` 的 `exports` 由：
```jsonc
"exports": { ".": "./src/index.ts" }
```
改為：
```jsonc
"exports": {
  ".": "./src/index.ts",
  "./result-detail-map": "./src/utils/result-detail-map.ts"
}
```
（若該 package 另有 `main`/`types` 欄位對應 barrel，維持不動；只加 subpath。）

- [ ] **Step 2: mobile 加依賴**

`apps/mobile/package.json` 的 `dependencies` 加一行（依字母序插入）：
```jsonc
"@daodao/features-quiz": "workspace:*",
```

- [ ] **Step 3: 安裝**

Run: `pnpm install`
Expected: 成功，無 peer 衝突錯誤。

- [ ] **Step 4: 驗證可解析**

在 `apps/mobile` 暫時建立 `scratch-check.ts`：
```typescript
import { resultDetailMap } from "@daodao/features-quiz/result-detail-map";
console.log(resultDetailMap.get("A")?.slogan);
```
Run: `cd apps/mobile && pnpm run typecheck`
Expected: PASS（無「Cannot find module」）。驗證後刪除 `scratch-check.ts`。

- [ ] **Step 5: Commit**（依專案 commit 流程）
```bash
git add packages/features/quiz/package.json apps/mobile/package.json pnpm-lock.yaml
```
commit type：`feat`，Why：mobile banner 需要共用 quiz slogan 對照表。

---

### Task 2: TabSwitcher 三 tab + i18n + 首頁 persona 分支

**Files:**
- Modify: `apps/mobile/components/home/tab-switcher.tsx`
- Modify: `packages/i18n/src/locales/zh-TW.json`
- Modify: `packages/i18n/src/locales/en.json`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Interfaces:**
- Produces: `TabType = "inspire" | "mine" | "persona"`（供首頁 activeTab 使用）。

- [ ] **Step 1: 加 i18n key**

`packages/i18n/src/locales/zh-TW.json` 內 `mobile.home` 物件加：
```json
"tab_persona": "人物誌"
```
`packages/i18n/src/locales/en.json` 內 `mobile.home` 物件加：
```json
"tab_persona": "Persona"
```

- [ ] **Step 2: TabSwitcher 擴充為三 tab**

改寫 `apps/mobile/components/home/tab-switcher.tsx`：
```tsx
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
```

- [ ] **Step 3: 首頁加 persona 分支**

`apps/mobile/app/(tabs)/index.tsx`：
1. import 既有 persona 元件：
```tsx
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
```
2. 在 Mine tab 的 return 之前，加 persona 分支（放在 `if (activeTab === "inspire") { ... }` 與 Mine `return` 之間）：
```tsx
if (activeTab === "persona") {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack paddingHorizontal="$4" paddingTop="$4">
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        </YStack>
        <YStack paddingHorizontal="$4">
          <PersonaProfileMe />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 4: 驗證**

Run: `pnpm run lint && pnpm run typecheck`
Expected: PASS。
iOS 模擬器：首頁出現三顆 tab，點「人物誌」顯示 PersonaProfileMe，切回 inspire/mine 正常。

- [ ] **Step 5: Commit**（type `feat`，Why：首頁補齊人物誌 tab 對齊 product）

---

### Task 3: Banner 元件 + 掛載（B2 滾動漸淡）

**Files:**
- Create: `apps/mobile/components/home/banner.tsx`
- Modify: `apps/mobile/components/home/index.ts`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Interfaces:**
- Consumes: `resultDetailMap`（Task 1）。
- Produces: `<HomeBanner scrollY={SharedValue<number>} />`（`scrollY` 為 Reanimated shared value，來自首頁 FlatList onScroll）。

- [ ] **Step 1: 建立 Banner 元件**

`apps/mobile/components/home/banner.tsx`：
```tsx
import { getLatestQuizResult } from "@daodao/api";
import { MobileBannerSvg } from "@daodao/assets";
import { resultDetailMap } from "@daodao/features-quiz/result-detail-map";
import LottieView from "lottie-react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Text, View } from "tamagui";
import { useMobileTranslation } from "@/i18n";

// quiz 類型 → Lottie JSON（-2 版，與 product 一致）
const LOTTIE_BY_TYPE: Record<string, object> = {
  A: require("@daodao/assets/images/quiz/active-shaper-2.json"),
  O: require("@daodao/assets/images/quiz/order-builder-2.json"),
  D: require("@daodao/assets/images/quiz/deep-explorer-2.json"),
  L: require("@daodao/assets/images/quiz/liquid-integrator-2.json"),
  C: require("@daodao/assets/images/quiz/community-connector-2.json"),
};

const FADE_THRESHOLD = 167;

export function HomeBanner({ scrollY }: { scrollY: SharedValue<number> }) {
  const t = useMobileTranslation("app_product");
  const [resultType, setResultType] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await getLatestQuizResult();
      if (res.error) {
        console.error("Failed to fetch quiz result:", res.error);
        return;
      }
      const type = res.data?.data?.resultType?.toUpperCase();
      if (alive && type) setResultType(type);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const slogan = useMemo(() => {
    const fallback = t("banner_default_slogan");
    return resultType ? resultDetailMap.get(resultType)?.slogan ?? fallback : fallback;
  }, [resultType, t]);

  const lottie = LOTTIE_BY_TYPE[resultType ?? "A"] ?? LOTTIE_BY_TYPE.A;

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, FADE_THRESHOLD], [1, 0.3], "clamp"),
  }));

  return (
    <Animated.View style={[styles.wrap, fadeStyle]} pointerEvents="none">
      <MobileBannerSvg width="100%" />
      <View style={styles.bubble}>
        <Text fontSize={14} color={colorsTextDark} textAlign="center">
          {slogan}
        </Text>
        <View style={styles.lottie}>
          <LottieView source={lottie} autoPlay loop style={{ width: "100%", height: "100%" }} />
        </View>
      </View>
    </Animated.View>
  );
}

const colorsTextDark = "#295E5C";

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  bubble: {
    position: "absolute",
    alignSelf: "center",
    bottom: "18%",
    maxWidth: "80%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  lottie: { position: "absolute", left: "100%", bottom: -32, width: 96, height: 96 },
});
```
> 註：`bottom`/`lottie` 位置為初值，Step 4 目視時對照 product 微調（banner SVG 比例固定 195:73）。若某 quiz 類型的 `-2.json` 不存在，於 `LOTTIE_BY_TYPE` 只保留實際存在者，缺者 fallback 到 `A`。實作前先 `ls packages/assets/images/quiz/*-2.json` 確認清單。

- [ ] **Step 2: barrel export**

`apps/mobile/components/home/index.ts` 加：
```ts
export { HomeBanner } from "./banner";
```

- [ ] **Step 3: 首頁掛載 + 滾動 handler（只在 inspire tab）**

`apps/mobile/app/(tabs)/index.tsx`：
1. import：
```tsx
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { HomeBanner } from "@/components/home";
```
2. 建立 `AnimatedFlatList`（模組層級，檔案頂端）：
```tsx
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
```
3. 在 `HomeScreen` 內建立 shared value 與 handler：
```tsx
const scrollY = useSharedValue(0);
const onScroll = useAnimatedScrollHandler((e) => {
  scrollY.value = e.contentOffset.y;
});
```
4. inspire tab 的 `return` 改為：banner 疊在最上層（overlay），FlatList 換成 `AnimatedFlatList` 並綁 `onScroll`，`ListHeaderComponent` 頂端保留 banner 高度的間距。做法：把 `HomeBanner` 放在 `SafeAreaView` 內、FlatList 之上（absolute），並在 `renderShowcaseHeader` 最上方加一個佔位 `YStack`（高度 = banner 高，約 `width * 73/195`）。
```tsx
return (
  <SafeAreaView style={styles.container} edges={["top"]}>
    <RNView style={styles.bannerOverlay} pointerEvents="box-none">
      <HomeBanner scrollY={scrollY} />
    </RNView>
    <AnimatedFlatList
      data={orderedFeedItems}
      keyExtractor={feedItemKey}
      renderItem={renderFeedItem}
      ListHeaderComponent={renderShowcaseHeader}
      ListFooterComponent={renderFeedFooter}
      ListEmptyComponent={renderFeedEmpty}
      contentContainerStyle={styles.feedContent}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={() => { if (hasMore && !isValidating) loadMore(); }}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl
          refreshing={isValidating}
          onRefresh={() => mutateShowcase()}
          tintColor={colors.primary.base}
        />
      }
    />
  </SafeAreaView>
);
```
5. `renderShowcaseHeader` 最上方加佔位（banner 高度）：
```tsx
<YStack height={bannerHeight} />
```
其中 `const bannerHeight = Math.round(Dimensions.get("window").width * 73 / 195);`（import `Dimensions`）。
6. `styles` 加：
```ts
bannerOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 },
```
> 佔位 `YStack` 保留在 header 內，讓 banner 底下的 tab/search 不被遮住；banner overlay 隨 scrollY 漸淡。

- [ ] **Step 4: 驗證**

Run: `pnpm run lint && pnpm run typecheck`
Expected: PASS。
iOS 模擬器：inspire tab 頂端出現 banner + slogan + Lottie 吉祥物；往下捲時 banner 漸淡到約 0.3；tab/search 不被遮住。對照 product 微調 bubble/lottie 位置。

- [ ] **Step 5: Commit**（type `feat`，Why：首頁補上吉祥物 banner 對齊 product）

---

### Task 4: ResonanceCarousel 完整 flip-card 移植

**Files:**
- Rewrite: `apps/mobile/components/persona/ResonanceCarousel.tsx`

**Interfaces:**
- Consumes: `usePersonaCarouselState`, `submitPersonaAnswer`, `dismissPersonaCarousel`, `useMutate`（`@daodao/api`，既有）。
- i18n：`persona.carousel.*`、`persona.myProfile.*`（既有，勿新增）。

- [ ] **Step 1: 重寫元件（對照 product `resonance-carousel.tsx`）**

以 product `apps/product/src/components/persona/resonance-carousel.tsx` 為忠實度目標，逐元素翻成 RN：

結構：
- `ResonanceCarousel` 容器：header（`Laugh` icon from `@tamagui/lucide-icons` + `persona.carousel.title` + `dismiss` 文字按鈕），下方垂直 `YStack gap="$3"` 堆疊前 2 題的 `CarouselQuestionCard`。沿用 product 的 `displayedQuestions` / `replaceId` / 換題邏輯。
- `CarouselQuestionCard`：`react-native-reanimated` 做 flip。
  - 容器 `perspective`（`Animated.View` transform `[{ perspective: 1000 }, { rotateY: interpolate(flip, [0,1],['0deg','180deg']) }]`），`flip` 為 `useSharedValue(0)`，點卡切換 `withTiming`。
  - 正面（`backfaceVisibility: "hidden"`）：`QuoteFillSvg`（`@daodao/assets`，native 變體）置中 → prompt（`fontSize:22, fontWeight:600, textAlign:center, color text.dark`）→ `communityLabel`（`persona.carousel.communityLabel`）→ 橫向 `ScrollView horizontal` 內 3 張 `LockedResponseCard` → footer CTA（`frontLabel` = choice 時 `choicePrompt` 否則 `openPrompt`，+ `ArrowCircleSvg`）。
  - 背面（絕對定位、`rotateY:180deg`、`backfaceVisibility:"hidden"`）：頂部 prompt + 換一題（`RefreshCw` + `persona.carousel.switchQuestion`）；choice 時 2 欄選項（選中 `colors.logo.cyan` 邊框/文字），否則多行 `TextInput`（底線 `colors.logo.cyan`）；底部橘色 submit（`colors.logo.orange`，disabled 時降透明度），文字 `persona.myProfile.submit`/`submitting`。
  - submitted 狀態：勾勾 badge（`CheckCircle2` + `persona.carousel.answered`）+ 答案 + 前往小島 CTA（`persona.carousel.submitted.cta` + `ArrowCircleSvg`，`onPress` 導到既有 persona 頁：`router.push("/persona")`）。
- `LockedResponseCard`：`width:160, height:136` 卡，內含低透明度骨架列（近似 product 的 blur）+ 置中 `Lock` icon + `persona.carousel.unlockHint` pill；`onPress` 觸發翻面。
- 提交流程沿用 product：`submitPersonaAnswer` → 檢查 `res.error`（用 `Alert.alert(tProfile("submitError"))`）→ 設 `submitted`。

顏色一律走 `colors`（`text.dark`、`logo.cyan`、`logo.orange`、`primary.darker`）。移除舊版固定 `width={280}` 與 `px="$1"`。

> 實作提示：flip 用兩個絕對疊放的面 + 單一 `rotateY` 驅動；正面 `rotateY:0deg`、背面 `rotateY:180deg`，容器旋轉 0↔180；`backfaceVisibility:"hidden"` 於兩面。若 Android/iOS backface 表現不佳，退而用「按下切換 front/back 顯示 + `withTiming` opacity」淡入淡出（仍達成互動與外觀對齊，僅無 3D 感）——此為允許的 RN fallback。

- [ ] **Step 2: 驗證**

Run: `pnpm run lint && pnpm run typecheck`
Expected: PASS。
iOS 模擬器：認識你卡為 flip 卡；正面有引號/prompt/locked 卡/CTA；點擊翻面出現選項或輸入框 + 橘色 submit；送出後顯示已回答狀態；換一題可換題；今天不再顯示可關閉。

- [ ] **Step 3: Commit**（type `feat`，Why：認識你卡 flip 移植對齊 product）

---

### Task 5: 間距對齊收尾 + 全頁目視驗證

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`（如仍有殘留不一致）

- [ ] **Step 1: 檢查左緣基準**

確認 inspire / mine / persona 三 tab 下，tabs、search、carousel、feed 的左緣都切齊 `paddingHorizontal="$4"`（16）。Banner 佔位/overlay 不影響左緣。移除任何殘留的 `px="$1"`、固定 width。

- [ ] **Step 2: 全頁目視**

iOS 模擬器逐項對照 product：
- inspire：banner → 三 tab → search → 認識你 flip 卡 → feed，左緣一致、滾動漸淡正常。
- mine：三 tab、dashboard、任務區塊正常。
- persona：三 tab、PersonaProfileMe 正常。

Run: `pnpm run lint && pnpm run typecheck`
Expected: PASS。

- [ ] **Step 3: Commit**（若有變更；type `style`/`fix`，Why：首頁間距對齊 product）

---

## Self-Review

**Spec coverage：**
- Banner 完整移植（含 A2 slogan、B2 漸淡）→ Task 1 + Task 3 ✅
- 三 tab（含人物誌頁內 tab、i18n）→ Task 2 ✅
- 間距對齊 → Task 2/3/5 ✅
- ResonanceCarousel flip 移植 → Task 4 ✅
- features-quiz subpath export → Task 1 ✅

**Placeholder scan：** Banner 的 bubble/lottie 位置與 flip fallback 為「實作時目視微調」而非 TODO 佔位，已明確給出初值與判準。Task 4 因為是「對照 product 逐元素翻譯」的忠實移植，以結構清單 + RN 特化技法 + fallback 指示取代逐行貼上（product 原檔約 450 行，逐行複製反易失真）。

**Type consistency：** `TabType` 於 Task 2 定義並於 Task 3/首頁沿用；`HomeBanner` props `{ scrollY: SharedValue<number> }` 於 Task 3 定義並自用；`resultDetailMap` 於 Task 1 產出、Task 3 消費，型別一致。

## 風險提醒（實作時優先驗證）
1. `@daodao/features-quiz/result-detail-map` subpath 在 Metro 下解析（Task 1 Step 4 已含驗證）。
2. Lottie `-2.json` 檔案清單（Task 3 Step 1 前先 `ls`）。
3. Reanimated `createAnimatedComponent(FlatList)` + `onScroll` 與 `RefreshControl` 並存。
4. flip `backfaceVisibility` 跨平台表現（Task 4 已給 fallback）。
