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
[Step 1/4] 設定感興趣的主題        ◄──── "我想自己設定" ────┐
  │ "下一步"    │ "給我一些靈感"                              │
  │             ▼                                             │
  │   [Step 1/4] 選擇分類星球 (6 大分類 + 標籤建議) ─────────┘
  │             │ "下一步"
  ◄─────────────┘
  ▼
[Step 2/4] 每日具體行動建議 (進入時觸發 loading 過場動畫)
  │ 顯示 初學/中級/進階 三張卡片 (橫向滑動)
  │ "看起來很棒" or "我想自己設定"
  ▼
[Step 3/4] 行動詳情 + 設定啟動時機
  │ "完成" or "重新選擇" → 返回 Step 2
  ▼
[Result 4/4] 結果卡片頁
  │ "分享" / "再玩一次" / "註冊"
  ▼
[End]
```

### 步驟分段說明

- **Step 1** 包含三個子步驟（暱稱、主題、分類），共用 progress `1/4`
  - Step 1b（主題）↔ Step 1c（分類）為**雙向流程**：「給我一些靈感」前往分類頁，「我想自己設定」返回主題頁
  - 無論從 1b 或 1c 按「下一步」，皆進入 Step 2
- **Step 2** 為行動建議卡片選擇（進入時先顯示 loading 過場，再展示卡片）
- **Step 3** 為行動確認與啟動時機設定（「重新選擇」可返回 Step 2）
- **Step 4** 為結果呈現（對應 final 頁面）

### Progress 與路由對應

| 路由 | Progress 顯示 | 說明 |
|------|-------------|------|
| `/action-maker` | 無 | Intro 頁，不顯示 progress bar |
| `/action-maker/nickname` | 1 / 4 | Step 1a |
| `/action-maker/topic` | 1 / 4 | Step 1b |
| `/action-maker/category` | 1 / 4 | Step 1c |
| `/action-maker/actions` | 2 / 4 | Step 2（含 loading 過場） |
| `/action-maker/detail` | 3 / 4 | Step 3 |
| `/action-maker/result` | 無 | Result 頁，不顯示 progress bar |

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
│   │   └── action-maker-provider.tsx   # React Context Provider (useReducer)
│   ├── hooks/
│   │   ├── use-action-maker.ts         # 消費 context 的 hook
│   │   └── use-generate-actions.ts     # 呼叫後端 API 產生行動建議
│   ├── components/
│   │   ├── action-maker-intro.tsx      # Landing / Intro 頁面
│   │   ├── action-maker-nickname.tsx   # Step 1a: 暱稱輸入
│   │   ├── action-maker-topic.tsx      # Step 1b: 主題設定 (自訂/靈感)
│   │   ├── action-maker-category.tsx   # Step 1c: 分類選擇 (6 星球)
│   │   ├── action-maker-actions.tsx    # Step 2: 行動建議卡片 (含 loading 過場)
│   │   ├── action-maker-detail.tsx     # Step 3: 行動詳情 + 啟動時機
│   │   ├── action-maker-result.tsx     # Step 4: 結果頁
│   │   ├── action-card.tsx             # 行動卡片元件 (初學/中級/進階)
│   │   ├── action-loading.tsx          # Loading 過場動畫 (非路由，元件層級)
│   │   ├── category-star.tsx           # 分類星球元件
│   │   ├── progress-bar.tsx            # 4 步驟進度條
│   │   ├── starry-background.tsx       # 星空背景
│   │   ├── navigation-buttons.tsx      # 主要/次要按鈕組合
│   │   └── styled.tsx                  # 共用 styled components
│   └── utils/
│       ├── store.ts                    # 狀態計算邏輯
│       ├── category-map.ts             # 分類資料映射
│       ├── fallback-actions.ts         # 離線/fallback 靜態行動建議資料
│       ├── tag-suggestions.ts          # 各分類標籤建議
│       └── validation.ts               # 輸入驗證工具
```

### 3.2 Website App 路由

```
apps/website/src/app/[locale]/(without-layout)/action-maker/
├── layout.tsx                          # ActionMakerProvider wrapper + 簡化 header (logo)
├── page.tsx                            # Intro 頁 (ActionMakerIntro)
├── nickname/
│   └── page.tsx                        # Step 1a (ActionMakerNickname)
├── topic/
│   └── page.tsx                        # Step 1b (ActionMakerTopic)
├── category/
│   └── page.tsx                        # Step 1c (ActionMakerCategory)
├── actions/
│   └── page.tsx                        # Step 2 (ActionMakerActions，內含 loading 過場)
├── detail/
│   └── page.tsx                        # Step 3 (ActionMakerDetail)
└── result/
    └── page.tsx                        # Result (ActionMakerResult)
```

> **設計決策**：Loading 過場為 `ActionMakerActions` 頁面的內部狀態（進入頁面時先顯示 `ActionLoading` 元件，API 回應後切換為卡片列表），不設為獨立路由。這避免使用者直接 URL 存取 loading 頁或按上一頁回到 loading 的問題。

### 3.3 行動建議資料來源策略（後端 API）

行動建議根據使用者輸入的**具體主題**動態產生，不使用固定的靜態資料。

#### API 契約

```
POST /api/action-maker/generate

Request Body:
{
  "category": "interest",
  "topic": "學習減脂甜點",
  "tags": ["學會鉤針", "iPad 畫畫"]    // 使用者在分類頁選擇的標籤 (optional)
}

Response:
{
  "actions": [
    {
      "id": "generated-uuid",
      "categoryId": "interest",
      "level": "beginner",
      "title": "探索減脂材料",
      "description": "觀察家中現有的減脂友善食材，並思考它們的取代潛力。",
      "duration": "約 20 分鐘",
      "tip": "幫助你整理現有知識，並從日常生活中發現更多減脂食材的可能性。",
      "rationale": "將行動綁定在舊有的作息後，能大幅增加執行成功的機率。"
    },
    { "level": "intermediate", ... },
    { "level": "advanced", ... }
  ]
}
```

#### 資料流

```
Step 1 完成 (nickname + topic + category)
  │
  ▼ router.push("/actions")
  │
ActionMakerActions 頁面掛載
  │
  ├─ 顯示 ActionLoading 元件 (「你抓住了{分類}之星！正在轉化成每日微習慣」)
  │
  ├─ useGenerateActions hook 呼叫 POST /api/action-maker/generate
  │
  ├─ 成功 → dispatch({ type: "SET_ACTIONS", payload: actions })
  │         → 切換為卡片 carousel 顯示
  │
  └─ 失敗 → 使用 fallback-actions.ts 靜態資料
            → 顯示 toast 提示使用者為離線建議
```

#### `useGenerateActions` hook

```typescript
// hooks/use-generate-actions.ts
export function useGenerateActions(input: {
  category: CategoryType;
  topic: string;
  tags?: string[];
}) {
  const [actions, setActions] = useState<IAction[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    client.POST("/api/action-maker/generate", {
      body: { category: input.category, topic: input.topic, tags: input.tags },
      signal: controller.signal,
    })
      .then((res) => {
        if (res.error) throw new Error("API error");
        setActions(res.data.actions);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err);
          // fallback to static data
          setActions(getFallbackActions(input.category));
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [input.category, input.topic, input.tags]);

  return { actions, isLoading, error };
}
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

/** 行動建議（由後端 API 回傳） */
export interface IAction {
  id: string;
  categoryId: CategoryType;
  level: ActionLevel;
  title: string;            // e.g. "探索減脂材料"
  description: string;      // 具體行動內容
  duration: string;         // e.g. "約 20 分鐘"
  tip: string;              // 說明文字
  rationale: string;        // 為什麼需要這個行動的理由
}

/** 使用者填寫的資料 */
export interface IUserInput {
  nickname: string;
  topic: string;             // 自訂主題文字
  category: CategoryType | null;
  selectedTags: string[];    // 使用者在分類頁選擇的標籤
}

/** 使用者最終選擇 */
export interface IUserSelection {
  action: IAction | null;
  triggerTiming: string;     // 啟動時機 e.g. "晚餐後"
}

/** 後端 API 回傳的行動建議列表 */
export interface IGeneratedActions {
  actions: IAction[];        // 三個等級的行動建議
  isLoading: boolean;
  error: Error | null;
  isFallback: boolean;       // 是否為離線 fallback 資料
}

/** Action Maker 完整狀態 */
export interface IActionMakerState {
  userInput: IUserInput;
  userSelection: IUserSelection;
  generatedActions: IAction[];  // API 回傳的行動建議
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

使用 `useReducer` 管理狀態，避免多個 setter callback 導致 context 職責過重。

### Reducer Action Types

```typescript
// providers/action-maker-provider.tsx

type ActionMakerAction =
  | { type: "SET_NICKNAME"; payload: string }
  | { type: "SET_TOPIC"; payload: string }
  | { type: "SELECT_CATEGORY"; payload: CategoryType }
  | { type: "SET_SELECTED_TAGS"; payload: string[] }
  | { type: "SET_ACTIONS"; payload: IAction[] }
  | { type: "SELECT_ACTION"; payload: IAction }
  | { type: "SET_TRIGGER_TIMING"; payload: string }
  | { type: "RESET" };

function actionMakerReducer(
  state: IActionMakerState,
  action: ActionMakerAction
): IActionMakerState {
  switch (action.type) {
    case "SET_NICKNAME":
      return { ...state, userInput: { ...state.userInput, nickname: action.payload } };
    case "SET_TOPIC":
      return { ...state, userInput: { ...state.userInput, topic: action.payload } };
    case "SELECT_CATEGORY":
      return { ...state, userInput: { ...state.userInput, category: action.payload } };
    case "SET_SELECTED_TAGS":
      return { ...state, userInput: { ...state.userInput, selectedTags: action.payload } };
    case "SET_ACTIONS":
      return { ...state, generatedActions: action.payload };
    case "SELECT_ACTION":
      return { ...state, userSelection: { ...state.userSelection, action: action.payload } };
    case "SET_TRIGGER_TIMING":
      return { ...state, userSelection: { ...state.userSelection, triggerTiming: action.payload } };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
```

### Context API

```typescript
type ActionMakerContextType = {
  state: IActionMakerState;
  result: IActionMakerResult | null;
  dispatch: React.Dispatch<ActionMakerAction>;
  navigateTo: (path: string) => void;  // 支援雙向跳轉，不限線性流程
  reset: () => void;
};
```

> **設計決策**：導航使用 `navigateTo(path)` 而非 `goToNext`/`goBack`，因為 Step 1b ↔ 1c 的雙向流程和 Step 3 → Step 2 的「重新選擇」無法用線性導航表達。各頁面元件自行決定導航目標，Provider 只負責呼叫 `router.push` / `router.replace`。

### Storage 策略

- 使用 `@daodao/shared` 的 `getStorage` + `StorageEnum` (新增 `ActionMaker` 列舉)
- 存入 `sessionStorage`，頁面關閉後清除
- 每次 dispatch 後透過 `useEffect` 自動同步到 storage
- 頁面掛載時從 storage 恢復狀態（若有）

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

> **Token 策略**：以上色彩為 Action Maker 專屬主題色，定義在 feature package 內的 `styled.tsx` 中作為 CSS 變數（`--am-bg`, `--am-gray-blue` 等），不需加入全域 `@daodao/design-tokens`。

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
- 三張卡片橫向滑動瀏覽
- **Carousel 實作方案**：使用 CSS `scroll-snap-type: x mandatory` + `scroll-snap-align: center`（零外部依賴），搭配 `scrollIntoView` 控制初始位置。若需更細緻的滑動控制（如自動對齊、滑動事件回調），可升級為 `embla-carousel-react`（~7KB gzipped）

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

- **Header**：左上角顯示島島阿學 Logo（簡化版 header，僅 logo 無導覽列）。參照 `desktop.png`。
- **標題**：「建立微習慣，抓住你的星」（Lottie 動畫）
- **副標題**：「定好習慣，目標就離你不遠！」
- **說明文字**：
  - 總是覺得規劃新年目標很難嗎
  - 我們陪你一步一步建立小習慣
  - 每天都比昨天更進步一些
- **CTA**：「開始追星」按鈕
- **背景**：星空 + 散落的分類星球圖示 + 流星動畫
- **桌面版**：居中佈局，標題大字體，星球圖示散佈左右
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

### 7.5 Step 2 — 行動建議（含 Loading 過場）

此頁面有兩個內部狀態：**loading** 和 **loaded**。

#### Loading 狀態（進入頁面時）

- **文字**：「你抓住了{分類}之星！正在轉化成每日微習慣」
- **動畫**：進度條 + 「尋找適合的行動...」
- **行為**：`useGenerateActions` hook 呼叫後端 API
- **成功**：自動切換到 loaded 狀態
- **失敗**：使用 `fallback-actions.ts` 資料 + toast 提示

#### Loaded 狀態

- **進度**：2 / 4
- **標題**：「這是你的每日具體行動」
- **副標題**：「{分類}：{主題}」
- **內容**：三張行動卡片 (初學/中級/進階) 橫向滑動 carousel
  - 初學卡片：所有人可見
  - 中級/進階卡片：未登入時顯示鎖定狀態（「這是一顆神秘星球，註冊會員之後即可觀看」+ 快速註冊 CTA）
- **Primary CTA**：「看起來很棒」→ 確認當前滑動到的卡片，導航至 `/detail`
- **Secondary CTA**：「我想自己設定」→ 展開自訂行動表單（見下方）

#### 「我想自己設定」流程

使用者點擊後，在同一頁面內以 slide-up 動畫展開自訂表單：
- **行動標題** input（必填，最多 30 字）
- **具體行動內容** textarea（必填，最多 200 字）
- **預估時間** input（選填，e.g.「約 20 分鐘」）
- **Primary CTA**：「確定」→ 以自訂資料建立 IAction，導航至 `/detail`
- **Secondary CTA**：「返回建議」→ 收合表單，回到 API 建議卡片

### 7.6 Step 3 — 行動詳情

- **進度**：3 / 4
- **顯示**：等級 Badge + 行動標題
- **具體行動內容**：描述文字
- **啟動時機**：Input 輸入框 (placeholder: 「例如：晚餐後、洗澡前、通勤時...」)
- **說明**：顯示 `rationale` 欄位，解釋為什麼需要在特定時機啟動
- **Primary CTA**：「完成」→ 導航至 `/result`
- **Secondary CTA**：「重新選擇」→ 導航回 `/actions`（使用 `router.replace` 避免重複呼叫 API，從 context 中讀取已產生的 actions）

### 7.7 Result 結果頁

- **結果卡片**（參照 `Frame 29.png` 的版面配置）：
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
- **UX 參考**：`image 1.png` 為 Hahow 學習日誌的結果卡片設計參考，可借鑒其資訊摘要排版風格

---

## 8. 資料結構 (Data Maps)

### 8.1 category-map.ts（前端靜態資料）

分類資訊與推薦標籤為前端靜態資料，不需要 API：

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

### 8.2 fallback-actions.ts（離線 / API 失敗時的備用資料）

當後端 API 不可用時的 fallback 靜態資料，每個分類提供一組通用行動建議：

```typescript
export const fallbackActionsMap = new Map<CategoryType, IAction[]>([
  ["interest", [
    {
      id: "interest-beginner-fallback",
      categoryId: "interest",
      level: "beginner",
      title: "探索你的興趣清單",
      description: "花 10 分鐘列出你感興趣但一直沒開始的事，選出最想嘗試的一件。",
      duration: "約 10 分鐘",
      tip: "不需要完美，先列出來就是好的開始。",
      rationale: "將探索綁定在固定作息後（如晚餐後），能大幅提高執行機率。",
    },
    { id: "interest-intermediate-fallback", level: "intermediate", ... },
    { id: "interest-advanced-fallback", level: "advanced", ... },
  ]],
  // ... 其他分類
]);
```

> **注意**：行動建議的主要來源為後端 API（見 Section 3.3），此靜態資料僅為 fallback。API 會根據使用者的具體主題（如「學習減脂甜點」）產生個人化建議。

---

## 9. 開發任務分解

### Phase 0：設計確認（需與設計師對齊）

| # | 確認項目 | 說明 |
|---|---------|------|
| 0.1 | 「我想自己設定」完整流程 | Step 2 自訂行動的表單欄位與驗證規則 |
| 0.2 | 後端 API 契約確認 | 與後端確認 `POST /api/action-maker/generate` 的 request/response 格式 |
| 0.3 | 中級/進階鎖定邏輯 | 確認未登入時僅初學可選，還是三張皆可見但中級/進階內容模糊 |
| 0.4 | Result 頁面完整設計 | `final.png` 上半部為空白區域，確認結果卡片的完整視覺 |

### Phase 1：基礎建設

| # | 任務 | 說明 |
|---|------|------|
| 1.1 | 建立 `packages/features/action-maker/` | package.json, tsconfig.json, src/ 目錄結構 |
| 1.2 | 定義 TypeScript 型別 | `types/index.ts` — 所有 interface 與 type |
| 1.3 | 建立前端靜態資料 | `category-map.ts`, `tag-suggestions.ts`, `fallback-actions.ts` |
| 1.4 | 建立驗證工具 | `validation.ts` — 暱稱、主題字數、分類驗證 |
| 1.5 | 在 `@daodao/shared` 新增 StorageEnum | 新增 `ActionMaker` 列舉值 |
| 1.6 | 將 SVG icons 移入 `@daodao/assets` | 6 個分類 SVG 經 SVGO 壓縮後轉為 React 元件 |
| 1.7 | 將 `title.json` 移入 `@daodao/assets` | Lottie 動畫檔案 |

### Phase 2：狀態管理

| # | 任務 | 說明 |
|---|------|------|
| 2.1 | 實作 `ActionMakerProvider` | useReducer + Context + sessionStorage 持久化 |
| 2.2 | 實作 `useActionMaker` hook | 消費 context 的 custom hook |
| 2.3 | 實作 `useGenerateActions` hook | 後端 API 呼叫 + fallback 邏輯 |
| 2.4 | 實作 `store.ts` | 結果生成邏輯 |

### Phase 3：共用元件

| # | 任務 | 說明 |
|---|------|------|
| 3.1 | `StarryBackground` | 星空背景 + 星光動畫 + 流星 |
| 3.2 | `ProgressBar` | 4 步驟進度條 + aria-label |
| 3.3 | `ActionCard` | 行動卡片（三級 + 鎖定狀態 + 快速註冊 CTA） |
| 3.4 | `ActionLoading` | Loading 過場元件（非路由） |
| 3.5 | `CategoryStar` | 分類星球選擇元件 |
| 3.6 | `NavigationButtons` | Primary / Secondary 按鈕組 |
| 3.7 | `styled.tsx` | 共用樣式（Input, Textarea, CSS 變數） |

### Phase 4：頁面元件

| # | 任務 | 說明 |
|---|------|------|
| 4.1 | `ActionMakerIntro` | Landing 頁面 + Lottie 動畫 + 簡化 header |
| 4.2 | `ActionMakerNickname` | Step 1a 暱稱輸入 |
| 4.3 | `ActionMakerTopic` | Step 1b 主題設定（含字數限制，雙向導航至 1c） |
| 4.4 | `ActionMakerCategory` | Step 1c 分類選擇 + 標籤（雙向導航至 1b） |
| 4.5 | `ActionMakerActions` | Step 2 行動建議（loading → carousel + 自訂表單） |
| 4.6 | `ActionMakerDetail` | Step 3 行動詳情 + 啟動時機 |
| 4.7 | `ActionMakerResult` | Result 結果頁 + 分享 |

### Phase 5：Website 整合

| # | 任務 | 說明 |
|---|------|------|
| 5.1 | 建立路由結構 | `app/[locale]/(without-layout)/action-maker/` 下 7 個 page.tsx |
| 5.2 | 建立 layout.tsx | ActionMakerProvider wrapper + 簡化 header (logo) |
| 5.3 | 設定 metadata | 每頁 SEO metadata |
| 5.4 | RWD 適配 | Desktop / Mobile 響應式排版 |

### Phase 6：進階功能

| # | 任務 | 說明 |
|---|------|------|
| 6.1 | 分享功能 | html2canvas 截圖 + Web Share API |
| 6.2 | 註冊引導 | 中級/進階卡片的鎖定 + `@daodao/auth` useAuth 整合 |
| 6.3 | 結果儲存 API | 登入使用者的結果存入後端 |
| 6.4 | Lottie 動畫整合 | Intro 標題動畫（lazy load） |
| 6.5 | Analytics 追蹤 | 使用 `@daodao/analytics` 追蹤各步驟完成率與跳出率 |

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

1. **與 quiz 的差異**：quiz 是問答選擇題（純前端資料），action-maker 是表單填寫 + 後端 API 產生個人化建議的引導流程
2. **未登入限制**：中級/進階行動卡片需註冊才能查看，使用 `@daodao/auth` 的 `useAuth` 判斷
3. **Storage Key 衝突**：確保新增的 `StorageEnum.ActionMaker` 不與現有 key 衝突
4. **API 依賴**：行動建議主要來源為後端 API，`fallback-actions.ts` 僅為離線備用
5. **Lottie 檔案大小**：`title.json` 為 88KB，需使用 `React.lazy` + `Suspense` 做 lazy loading
6. **SVG 最佳化**：6 個分類 SVG 較大（25-44KB），需透過 SVGO 壓縮後轉為 React 元件
7. **Accessibility**：確保 progress bar 有 `aria-valuenow`/`aria-valuemax`，輸入框有 `<label>` 關聯
8. **「重新選擇」不重複呼叫 API**：Step 3 返回 Step 2 時使用 `router.replace` 並從 context 讀取已生成的 actions，避免重複 API 請求
9. **設計參考圖**：`image 1.png` 為 Hahow 學習日誌設計參考，非 Action Maker 直接設計稿，僅供結果卡片排版借鑑
