# Plan: Feed 修正 (#688)

## 問題描述

Feed 顯示邏輯需符合以下規則：

1. **最新打卡和互動在前面** — 按時間降序排列
2. **自己的互動不會優先出現自己的頁面** — 過濾/降權自己的互動
3. **如果有打卡就不會出現實踐；如果沒有打卡紀錄，就出現實踐** — 打卡/實踐互斥
4. **主題實踐要有一定內容，30 天內有登入：10 則出現一則** — 質量門檻 + 出現頻率
5. **打卡:互動:實踐 數量比例 1:1:1** — feed slot 分配

## 現有架構

### 相關檔案

- `apps/product/src/app/[locale]/(with-layout)/page.tsx` — Feed 主頁，`reorderFeedItems` 函數
- `packages/api/src/services/feed-hooks.ts` — `useFeed` hook，管理 feed 資料
- `packages/api/src/services/showcase-hooks.ts` — Showcase (靈感) API

### 現有排序邏輯

`reorderFeedItems()` 目前已實作：打卡 → 互動 → 實踐 × 3 的循環模式。

## 實作計畫

### Step 1: 自己的互動降權（規則 2）

```typescript
// 在 apiItemToDisplay 或 reorderFeedItems 中
const isOwnInteraction = (item) => item.actor.id === currentUserId && item.type === 'activity';
// 將自己的互動移到 feed 末尾或完全過濾
```

**影響範圍：** `page.tsx` 中的 `reorderFeedItems`，需從 `useAuth` 取得 `currentUserId`。

### Step 2: 打卡/實踐互斥（規則 3）

```typescript
const hasCheckins = checkins.length > 0;
const practicesSlot = hasCheckins ? [] : practices;
```

**影響範圍：** `reorderFeedItems` 函數。

### Step 3: 主題實踐質量門檻（規則 4）

- 主題實踐（`item.feed_reason === 'theme'` 或類似）需：
  - 有足夠內容（檢查 `checkInCount` 或類似欄位 > 0）
  - 創作者 30 天內有登入（需後端 API 提供此資訊）
  - 每 10 則才出現 1 則：每累積 10 個 feed items 才插入 1 個主題實踐

> ⚠️ 後端是否已提供 `lastLoginAt` 欄位？需確認 API schema。

### Step 4: 1:1:1 比例（規則 5）

現有 cycle 已是 [checkin, activity, practice × 3]，需調整為精確 1:1:1：

```
[checkin_1, activity_1, practice_1, checkin_2, activity_2, practice_2, ...]
```

**影響範圍：** `reorderFeedItems` 中的 cycle 邏輯。

## 待確認事項

- [ ] 後端 feed API 是否提供 `lastLoginAt` 或類似欄位
- [ ] 主題實踐的識別方式（`feed_reason`、`source` 或其他欄位）
- [ ] `visual` label：UI 變更需設計師審核

## 受影響檔案

- `apps/product/src/app/[locale]/(with-layout)/page.tsx`（`reorderFeedItems`）
- `packages/api/src/services/feed-hooks.ts`（可能需調整 useFeed 回傳資料）

## 驗收標準

- [ ] 最新打卡和互動在前面
- [ ] 自己的互動不優先出現
- [ ] 有打卡時不顯示實踐；無打卡時顯示
- [ ] 主題實踐每 10 則出現 1 則，且創作者 30 天內有登入
- [ ] 打卡:互動:實踐 = 1:1:1
