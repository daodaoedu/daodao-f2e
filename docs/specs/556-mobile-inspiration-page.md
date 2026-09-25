# Spec: 靈感頁 Mobile 版實作 (#556)

## Status

**已實作完成**。本 spec 為事後補充的架構文件，供 code review 與 spec-merged 追蹤使用。

## 功能範圍（Tasks 11.1–11.5）

### 11.1 Showcase Tab 頁面

**實作位置**：`apps/mobile/app/(tabs)/showcase.tsx`

- 包含「靈感（inspire）」與「我的（mine）」兩個子 Tab
- 透過 `TabSwitcher` component 切換
- 靈感 Tab：使用 `useShowcaseFeed` hook 取得廣場 feed，支援無限滾動
- 我的 Tab：使用 `usePractices` hook 取得個人實踐，支援狀態篩選

### 11.2 PracticeShowcaseCard

**實作位置**：`apps/mobile/components/showcase/PracticeShowcaseCard.tsx`

- 繼承 `ShowcaseCard` base component
- 支援 Brewing Card：當 `is_brewing === true` 時，打卡內容以毛玻璃 overlay 遮罩
- 整合 `expo-haptics` 提供反應互動的觸覺回饋
- 顯示：標題、頭像、行動描述、頻率資訊、emoji 反應列、留言數

### 11.3 搜尋框

**實作位置**：`apps/mobile/components/home/ShowcaseSearchBar`（via `components/home` barrel export）

- 使用 React Native `TextInput` + `FlatList`
- 搜尋觸發後更新 `useShowcaseFeed` 的 `keyword` 參數
- 支援的 feed 篩選參數（`IShowcaseFeedParams`）：
  - `keyword?: string`
  - `tags?: string[]`
  - `sort_by?: string`（預設 `newest_updated`）
  - cursor 分頁（`end` cursor 接龍）
- **注意**：搜尋建議（`GET /api/v1/users/practices/suggestions`）尚未在此實作，可留待後續

### 11.4 反應互動（Haptic Feedback）

**實作位置**：
- `apps/mobile/components/showcase/PracticeShowcaseCard.tsx` — `expo-haptics` 觸發
- `apps/mobile/hooks/useReactions.ts` — 呼叫 Node.js backend `POST /api/v1/reactions`

**資料流**：
1. 使用者點擊 emoji 反應
2. `expo-haptics.impactAsync()` 觸發 haptic
3. Optimistic update：即時更新卡片顯示
4. 呼叫 `upsertReaction(targetType, targetId, reactionType)` → `POST /api/v1/reactions`
5. 失敗時回滾 optimistic state

**ReactionType enum**：`encourage / touched / fire / useful / sameHere / curious`（共用 `packages/api` 型別）

### 11.5 隱私狀態選擇

**實作位置**：
- 編輯頁：`apps/mobile/app/practices/[id]/edit.tsx`
- 建立頁：`apps/mobile/app/practices/create/manual/step5.tsx`

**選項**：
- `private`（私人）
- `public`（公開）
- `delayed`（延遲分享）

透過 `PATCH /api/v1/practices/:id`（body 含 `privacy_status`）儲存。

---

## API 依賴

| API | 方向 | 說明 |
|-----|------|------|
| `GET /api/v1/users/practices` | AI backend | 廣場 Feed，支援 keyword/tags/sort_by/cursor |
| `POST /api/v1/reactions` | Node.js backend | 新增/切換反應 |
| `PATCH /api/v1/practices/:id` | Node.js backend | 更新 privacy_status |

## 已知待補項目

- 搜尋建議 API（`GET /api/v1/users/practices/suggestions`）尚未整合至 Mobile 搜尋框
- 搜尋建議下拉列表 UX 尚未實作
