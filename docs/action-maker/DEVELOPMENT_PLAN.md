# Action Maker 開發規劃文件

> **建立微習慣，抓住你的星** — 幫助使用者建立每日微習慣的互動式工具
> 放置於 website app，架構參照 quiz feature package 模式

---

## 1. 功能概述

Action Maker 是一個多步驟的互動式引導工具（類似 quiz 的 hook 工具），協助使用者：

1. 輸入暱稱
2. 選擇感興趣的主題分類（或自訂）
3. 由系統產生每日具體行動建議（初學／中級／進階三級）
4. 使用者確認行動並設定啟動時機
5. 產出個人化結果卡片，可分享或重玩

### 六大分類

| 分類 | 英文 Key | Icon SVG |
|------|---------|----------|
| 興趣 | interest | `type=興趣.svg` |
| 人際 | social | `type=人際.svg` |
| 健康 | health | `type=健康.svg` |
| 學業 | academic | `type=學業.svg` |
| 工作 | work | `type=工作.svg` |
| 金錢 | finance | `type=金錢.svg` |

### 三級行動等級

| 等級 | 中文 | Badge 顏色 | 權限 |
|------|------|-----------|------|
| beginner | 初學 | 綠色 | 所有人 |
| intermediate | 中級 | 藍色 | 需註冊 |
| advanced | 進階 | 棕/橘色 | 需註冊 |

---

## 2. 使用者流程 (User Flow)

```
[Intro 頁面]
  │ "開始追星"
  ▼
[Step 1/4] 寫下暱稱
  │ "下一步"
  ▼
[Step 1/4] 設定感興趣的主題
  │ "下一步" or "給我一些靈感"
  ▼
[Step 1/4] 選擇分類星球 (6 大分類 + 標籤建議)
  │ "下一步" or "我想自己設定"
  ▼
[Loading] 正在轉化成每日微習慣...
  │ (尋找適合的行動)
  ▼
[Step 2/4] 每日具體行動建議
  │ 顯示 初學/中級/進階 三張卡片 (橫向滑動)
  │ "看起來很棒" or "我想自己設定"
  ▼
[Step 3/4] 行動詳情 + 設定啟動時機
  │ "完成" or "重新選擇"
  ▼
[Result] 結果卡片頁
  │ "分享" / "再玩一次" / "註冊"
  ▼
[End]
```

### 步驟分段說明

- **Step 1** 包含三個子步驟（暱稱、主題、分類），共用 progress `1/4`
- **Step 2** 為行動建議卡片選擇
- **Step 3** 為行動確認與啟動時機設定
- **Step 4** 為結果呈現（對應 final 頁面）

---

## 3. 技術架構

### 3.1 Monorepo 結構 (仿 quiz 模式)

```
packages/features/action-maker/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                        # barrel exports
│   ├── types/
│   │   └── index.ts                    # 所有 TypeScript 型別定義
│   ├── providers/
│   │   ├── index.ts
│   │   └── action-maker-provider.tsx   # React Context Provider
│   ├── hooks/
│   │   └── use-action-maker.ts         # 消費 context 的 hook
│   ├── components/
│   │   ├── action-maker-intro.tsx      # Landing / Intro 頁面
│   │   ├── action-maker-nickname.tsx   # Step 1a: 暱稱輸入
│   │   ├── action-maker-topic.tsx      # Step 1b: 主題設定 (自訂/靈感)
│   │   ├── action-maker-category.tsx   # Step 1c: 分類選擇 (6 星球)
│   │   ├── action-maker-loading.tsx    # Loading 過場動畫
│   │   ├── action-maker-actions.tsx    # Step 2: 行動建議卡片
│   │   ├── action-maker-detail.tsx     # Step 3: 行動詳情 + 啟動時機
│   │   ├── action-maker-result.tsx     # Step 4: 結果頁
│   │   ├── action-card.tsx             # 行動卡片元件 (初學/中級/進階)
│   │   ├── category-star.tsx           # 分類星球元件
│   │   ├── progress-bar.tsx            # 4 步驟進度條
│   │   ├── starry-background.tsx       # 星空背景
│   │   ├── navigation-buttons.tsx      # 主要/次要按鈕組合
│   │   └── styled.tsx                  # 共用 styled components
│   └── utils/
│       ├── store.ts                    # 狀態計算邏輯
│       ├── category-map.ts             # 分類資料映射
│       ├── action-map.ts               # 行動建議資料映射
│       ├── tag-suggestions.ts          # 各分類標籤建議
│       └── validation.ts               # 輸入驗證工具
```

### 3.2 Website App 路由

```
apps/website/src/app/[locale]/(without-layout)/action-maker/
├── layout.tsx                          # ActionMakerProvider wrapper
├── page.tsx                            # Intro 頁 (ActionMakerIntro)
├── nickname/
│   └── page.tsx                        # Step 1a (ActionMakerNickname)
├── topic/
│   └── page.tsx                        # Step 1b (ActionMakerTopic)
├── category/
│   └── page.tsx                        # Step 1c (ActionMakerCategory)
├── loading-screen/
│   └── page.tsx                        # Loading 過場
├── actions/
│   └── page.tsx                        # Step 2 (ActionMakerActions)
├── detail/
│   └── page.tsx                        # Step 3 (ActionMakerDetail)
└── result/
    └── page.tsx                        # Step 4 (ActionMakerResult)
```

---

## 4. 型別定義 (Types)

```typescript
// types/index.ts

/** 六大分類 */
export type CategoryType =
  | "interest"
  | "social"
  | "health"
  | "academic"
  | "work"
  | "finance";

/** 行動等級 */
export type ActionLevel = "beginner" | "intermediate" | "advanced";

/** 分類資訊 */
export interface ICategory {
  id: CategoryType;
  label: string;           // 中文名稱 e.g. "興趣"
  icon: React.FC;          // SVG 元件
  tags: string[];           // 推薦標籤
}

/** 行動建議 */
export interface IAction {
  id: string;
  categoryId: CategoryType;
  level: ActionLevel;
  title: string;            // e.g. "探索減脂材料"
  description: string;      // 具體行動內容
  duration: string;         // e.g. "約 20 分鐘"
  tip: string;              // 💡 說明文字
  whyExplanation: string;   // 為什麼需要這個
}

/** 使用者填寫的資料 */
export interface IUserInput {
  nickname: string;
  topic: string;             // 自訂主題文字
  category: CategoryType | null;
}

/** 使用者最終選擇 */
export interface IUserSelection {
  action: IAction | null;
  triggerTiming: string;     // 啟動時機 e.g. "晚餐後"
}

/** Action Maker 完整狀態 */
export interface IActionMakerState {
  userInput: IUserInput;
  userSelection: IUserSelection;
  currentStep: number;       // 1-4
}

/** 結果資料 */
export interface IActionMakerResult {
  nickname: string;
  category: CategoryType;
  categoryLabel: string;
  action: IAction;
  triggerTiming: string;
}
```

---

## 5. State Management (Context Provider)

```typescript
// providers/action-maker-provider.tsx 核心設計

type ActionMakerContextType = {
  // 狀態
  state: IActionMakerState;
  result: IActionMakerResult | null;

  // Step 1 actions
  setNickname: (nickname: string) => void;
  setTopic: (topic: string) => void;
  selectCategory: (category: CategoryType) => void;

  // Step 2 actions
  selectAction: (action: IAction) => void;

  // Step 3 actions
  setTriggerTiming: (timing: string) => void;
  confirmAction: () => void;

  // Navigation
  goToNext: () => void;
  goBack: () => void;
  reset: () => void;
};
```

### Storage 策略

- 使用 `@daodao/shared` 的 `getStorage` + `StorageEnum` (新增 `ActionMaker` 列舉)
- 存入 `sessionStorage`，頁面關閉後清除
- 每步驟更新後自動存入 storage，重新整理可恢復進度

---

## 6. 元件設計規格

### 6.1 色彩系統

| Token | Hex | 用途 |
|-------|-----|------|
| `background` | `#18215E` | 星空主背景 |
| `gray-blue` | `#7B9FC4` | 次要文字、提示 |
| `light-blue` | `#BCD5EE` | 卡片邊框、裝飾 |
| `very-light-blue` | `#E1F0FB` | 輸入框背景 |
| `white` | `#FFFFFF` | 主要文字 |

### 6.2 StarryBackground 星空背景

- 全頁深藍漸層背景 (#18215E)
- CSS 動畫星光閃爍效果
- 流星動畫裝飾
- 六大分類的彩色星球圖示散落於背景

### 6.3 ProgressBar 進度條

- 4 個節點，以線段連接
- 當前步驟以光暈圓點標示
- 已完成步驟為實心小圓點
- 未完成步驟為空心小圓點
- 左上顯示 `n / 4` 文字

### 6.4 ActionCard 行動卡片

- 卡片背景：半透明深藍 + 邊框
- 左上角等級 Badge（初學=綠、中級=藍、進階=棕橘）
- 右上角顯示預估時間
- 卡片內容：標題 + 描述 + 💡 提示
- 未登入的中級/進階卡片顯示鎖定狀態（神秘星球 + 快速註冊 CTA）
- 三張卡片橫向滑動瀏覽 (carousel / swiper)

### 6.5 NavigationButtons 導航按鈕

兩種按鈕風格：
- **Primary**：漸層白藍色填充按鈕（default / hover / disabled 三態）
- **Secondary**：透明底 + 白色邊框 outline 按鈕（可帶 refresh icon）

### 6.6 Input 輸入框

- 深藍背景 + 淺藍邊框
- States：default（placeholder 灰藍色）、focus（邊框高亮）、filled（白色文字）
- 主題 textarea 有字數限制 (0/100)

### 6.7 Lottie Title 動畫

- 使用 `title.json` Lottie 檔案
- 用於 Intro 頁面的「建立微習慣，抓住你的星」標題動畫
- 可使用 `lottie-react` 或 `@lottiefiles/react-lottie-player` 套件

---

## 7. 頁面詳細規格

### 7.1 Intro 頁面

- **標題**：「建立微習慣，抓住你的星」（Lottie 動畫）
- **副標題**：「定好習慣，目標就離你不遠！」
- **說明文字**：
  - 總是覺得規劃新年目標很難嗎
  - 我們陪你一步一步建立小習慣
  - 每天都比昨天更進步一些
- **CTA**：「開始追星」按鈕
- **背景**：星空 + 散落的分類星球圖示
- **桌面版**：居中佈局，標題大字體
- **手機版**：全螢幕星空，垂直排列

### 7.2 Step 1a — 暱稱

- **進度**：1 / 4
- **標題**：「寫下你的暱稱」
- **Input placeholder**：「向你許願的星留下你的大名」
- **CTA**：「下一步」

### 7.3 Step 1b — 主題設定

- **進度**：1 / 4
- **標題**：「設定你感興趣的主題」
- **副標題**：「新的一年，我想要...」
- **Textarea placeholder**：「例如：閱讀原子習慣、學會鉤針、開始存美股...」
- **字數限制**：0 / 100
- **Primary CTA**：「下一步」
- **Secondary CTA**：「給我一些靈感」→ 跳到 Step 1c 分類選擇

### 7.4 Step 1c — 分類選擇

- **進度**：1 / 4
- **標題**：「新的一年，你想抓住哪顆星？」
- **顯示**：6 個分類星球（興趣、人際、健康、學業、工作、金錢）
- **選擇後**：顯示該分類的推薦標籤（可多選或點擊）
- **Primary CTA**：「下一步」
- **Secondary CTA**：「我想自己設定」→ 跳回 Step 1b

### 7.5 Loading 過場

- **文字**：「你抓住了{分類}之星！正在轉化成每日微習慣」
- **動畫**：進度條 + 「尋找適合的行動...」
- **自動跳轉**：載入完成後自動進入 Step 2
- **用途**：可在此呼叫 API 取得行動建議，或使用本地資料搭配延遲效果

### 7.6 Step 2 — 行動建議

- **進度**：2 / 4
- **標題**：「這是你的每日具體行動」
- **副標題**：「{分類}：{主題}」
- **內容**：三張行動卡片 (初學/中級/進階) 橫向滑動
- **Primary CTA**：「看起來很棒」→ 確認選擇的卡片
- **Secondary CTA**：「我想自己設定」

### 7.7 Step 3 — 行動詳情

- **進度**：3 / 4
- **顯示**：等級 Badge + 行動標題
- **具體行動內容**：描述文字
- **啟動時機**：Input 輸入框 (placeholder: 「例如：晚餐後、洗澡前、通勤時...」)
- **💡 說明**：為什麼需要這個設定的解釋
- **Primary CTA**：「完成」
- **Secondary CTA**：「重新選擇」→ 返回 Step 2

### 7.8 Result 結果頁

- **結果卡片**：
  - 「{暱稱}，你抓住了{分類}之星！」
  - 等級 Badge + 行動標題
  - 具體行動內容
  - 預估時間
  - 啟動時機
- **可截圖分享的區域**（用於 OG image 或 canvas 截圖）
- **Primary CTA**：「分享」
- **Secondary CTA**：「再玩一次」→ reset 後回 Intro
- **引導文案**：引導使用者註冊
- **CTA**：「註冊」按鈕（非會員顯示）

---

## 8. 資料結構 (Data Maps)

### 8.1 category-map.ts

```typescript
export const categoryMap = new Map<CategoryType, ICategory>([
  ["interest", {
    id: "interest",
    label: "興趣",
    icon: InterestIcon,
    tags: ["學會鉤針", "登上百岳", "畫出油畫作品", "研究子彈筆記",
           "iPhone 攝影技巧", "一週一影評", "韓系化妝進階班",
           "寫小說", "學烏克麗麗", "iPad 畫畫", "動手做便當"],
  }],
  ["social",    { id: "social",    label: "人際", icon: SocialIcon,    tags: [...] }],
  ["health",    { id: "health",    label: "健康", icon: HealthIcon,    tags: [...] }],
  ["academic",  { id: "academic",  label: "學業", icon: AcademicIcon,  tags: [...] }],
  ["work",      { id: "work",      label: "工作", icon: WorkIcon,      tags: [...] }],
  ["finance",   { id: "finance",   label: "金錢", icon: FinanceIcon,   tags: [...] }],
]);
```

### 8.2 action-map.ts

每個分類對應三個等級的行動建議：

```typescript
export const actionMap = new Map<string, IAction[]>([
  ["interest", [
    {
      id: "interest-beginner",
      categoryId: "interest",
      level: "beginner",
      title: "探索減脂材料",
      description: "觀察家中現有的減脂友善食材，並思考它們的取代潛力。",
      duration: "約 20 分鐘",
      tip: "幫助你整理現有知識，並從日常生活中發現更多減脂食材的可能性。",
      whyExplanation: "雖然這不是要養成永久習慣，但在這段探索期間，將行動綁定在舊有的作息後，能大幅增加執行成功的機率。",
    },
    { id: "interest-intermediate", level: "intermediate", ... },
    { id: "interest-advanced", level: "advanced", ... },
  ]],
  // ... 其他分類
]);
```

---

## 9. 開發任務分解

### Phase 1：基礎建設

| # | 任務 | 說明 |
|---|------|------|
| 1.1 | 建立 `packages/features/action-maker/` | package.json, tsconfig.json, src/ 目錄結構 |
| 1.2 | 定義 TypeScript 型別 | `types/index.ts` — 所有 interface 與 type |
| 1.3 | 建立資料映射 | `category-map.ts`, `action-map.ts`, `tag-suggestions.ts` |
| 1.4 | 建立驗證工具 | `validation.ts` — 暱稱、主題字數、分類驗證 |
| 1.5 | 在 `@daodao/shared` 新增 StorageEnum | 新增 `ActionMaker` 列舉值 |
| 1.6 | 將 SVG icons 移入 `@daodao/assets` | 6 個分類 SVG 轉為 React 元件 |
| 1.7 | 將 `title.json` 移入 `@daodao/assets` | Lottie 動畫檔案 |

### Phase 2：狀態管理

| # | 任務 | 說明 |
|---|------|------|
| 2.1 | 實作 `ActionMakerProvider` | Context + state + sessionStorage 持久化 |
| 2.2 | 實作 `useActionMaker` hook | 消費 context 的 custom hook |
| 2.3 | 實作 `store.ts` | 狀態計算、結果生成邏輯 |

### Phase 3：共用元件

| # | 任務 | 說明 |
|---|------|------|
| 3.1 | `StarryBackground` | 星空背景 + 星光動畫 + 流星 |
| 3.2 | `ProgressBar` | 4 步驟進度條 |
| 3.3 | `ActionCard` | 行動卡片 (三級 + 鎖定狀態) |
| 3.4 | `CategoryStar` | 分類星球選擇元件 |
| 3.5 | `NavigationButtons` | Primary / Secondary 按鈕組 |
| 3.6 | `styled.tsx` | 共用樣式 (Input, Textarea 等) |

### Phase 4：頁面元件

| # | 任務 | 說明 |
|---|------|------|
| 4.1 | `ActionMakerIntro` | Landing 頁面 + Lottie 動畫 |
| 4.2 | `ActionMakerNickname` | Step 1a 暱稱輸入 |
| 4.3 | `ActionMakerTopic` | Step 1b 主題設定 (含字數限制) |
| 4.4 | `ActionMakerCategory` | Step 1c 分類選擇 + 標籤 |
| 4.5 | `ActionMakerLoading` | Loading 過場動畫 |
| 4.6 | `ActionMakerActions` | Step 2 行動建議卡片 carousel |
| 4.7 | `ActionMakerDetail` | Step 3 行動詳情 + 啟動時機 |
| 4.8 | `ActionMakerResult` | Step 4 結果頁 + 分享 |

### Phase 5：Website 整合

| # | 任務 | 說明 |
|---|------|------|
| 5.1 | 建立路由結構 | `app/[locale]/(without-layout)/action-maker/` 下所有 page.tsx |
| 5.2 | 建立 layout.tsx | ActionMakerProvider wrapper + 字體載入 |
| 5.3 | 設定 metadata | 每頁 SEO metadata |
| 5.4 | generateStaticParams | 靜態生成設定 |

### Phase 6：進階功能

| # | 任務 | 說明 |
|---|------|------|
| 6.1 | 分享功能 | Canvas/html2canvas 截圖 + Web Share API |
| 6.2 | 註冊引導 | 中級/進階卡片的鎖定 + 快速註冊 CTA |
| 6.3 | 結果儲存 API | 登入使用者的結果存入後端 |
| 6.4 | RWD 適配 | Desktop / Mobile 響應式排版 |
| 6.5 | Lottie 動畫整合 | Intro 標題動畫 + Loading 動畫 |
| 6.6 | Analytics 追蹤 | 使用 `@daodao/analytics` 追蹤各步驟完成率 |

---

## 10. 依賴套件

```json
{
  "dependencies": {
    "@daodao/api": "workspace:*",
    "@daodao/assets": "workspace:*",
    "@daodao/auth": "workspace:*",
    "@daodao/i18n": "workspace:*",
    "@daodao/shared": "workspace:*",
    "@daodao/ui": "workspace:*",
    "lottie-react": "^2.4.0"
  },
  "devDependencies": {
    "@daodao/config": "workspace:*",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "react": "catalog:",
    "typescript": "catalog:"
  },
  "peerDependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  }
}
```

新增外部依賴：
- `lottie-react` — Lottie 動畫播放（用於 title.json）
- 若需截圖分享：`html2canvas` 或 `@vercel/og`

---

## 11. 響應式設計

### Desktop (>= 768px)

- 參照 `desktop.png`
- 居中佈局，最大寬度 1200px
- 標題大字體 + 左右分佈的星球裝飾
- 行動卡片三張橫向並排

### Mobile (< 768px)

- 參照 `mobile-*.png`
- 全螢幕垂直排列
- 行動卡片橫向滑動 (carousel)
- 固定底部按鈕區

---

## 12. 注意事項

1. **與 quiz 的差異**：quiz 是問答選擇題，action-maker 是表單填寫 + 系統建議的引導流程
2. **未登入限制**：中級/進階行動卡片需註冊才能查看，使用 `@daodao/auth` 的 `useAuth` 判斷
3. **Storage Key 衝突**：確保新增的 `StorageEnum.ActionMaker` 不與現有 key 衝突
4. **可擴展性**：action-map 資料結構設計成可由後端 API 動態提供，Phase 1 先用靜態資料
5. **Lottie 檔案大小**：`title.json` 為 88KB，需考慮 lazy loading
6. **SVG 最佳化**：6 個分類 SVG 較大（25-44KB），可透過 SVGO 壓縮後轉為 React 元件
7. **Accessibility**：確保 progress bar 有 aria-label，輸入框有 label 關聯
