---
name: format-commit
description: Use when committing changes - asks user for commit type and Why, auto-generates How from git diff, generates a commit message with Why/How sections, confirms with user, then executes git commit
---

# Format Commit Message

協助產生符合專案格式的 commit message，包含 `## Why is this necessary?` 和 `## How does it address?` 區塊。

## Instructions

### 步驟 1: 分析當前變更

1. 執行 `git status` 查看當前變更的檔案
2. 執行 `git diff --stat --staged` 查看變更統計
3. 簡要總結變更的範圍和影響

### 步驟 2: 引導使用者填寫內容

使用 AskUserQuestion 工具詢問使用者：

**第一個問題 - Commit 類型和範圍：**

- header: "Commit 類型"
- question: "這次的變更屬於哪種類型？"
- options:
  - feat: 新功能
  - fix: 修復 bug
  - refactor: 重構
  - perf: 效能優化
  - docs: 文件更新
  - style: 程式碼格式調整
  - test: 測試相關
  - chore: 建置或輔助工具變更

**第二個問題 - 影響範圍：**

- header: "影響範圍"
- question: "這次變更主要影響哪個模組或功能？（例如：ci/cd, auth, api, ui）"
- 使用 "Other" 選項讓使用者自行輸入

**第三個問題 - 簡短描述：**

- header: "簡短描述"
- question: "請用一句話描述這次的變更（50 字以內）"
- 使用 "Other" 選項讓使用者自行輸入

### 步驟 3: 收集 Why，自動產生 How

**Why — 詢問使用者：**

使用 AskUserQuestion：

- question: "請列出需要這次變更的原因（可以多選或補充）"
- multiSelect: true
- options: 根據 git diff 分析提供常見原因
- 使用 "Other" 讓使用者補充

**How — 從 git diff 自動推導，不詢問使用者：**

執行 `git diff --staged` 分析實際變更內容，自行歸納出 3-5 個具體的解決方式。
How 描述的是「做了什麼」，答案已在 code changes 中，不需要使用者選擇。

### 步驟 4: 生成 Commit Message

根據收集的資訊，生成符合以下格式的 commit message：

```
<type>(<scope>): <簡短描述>

## Why is this necessary?

- <原因 1>
- <原因 2>
- <原因 3>

## How does it address?

- <解決方案 1>
- <解決方案 2>
- <解決方案 3>

```

### 步驟 5: 確認和執行

1. 向使用者展示生成的 commit message
2. 詢問是否需要修改
3. 確認後執行 `git commit -m "$(cat <<'EOF' ... EOF)"`

## 格式規範

### 標題格式

- 使用 `type(scope): 描述` 格式
- 描述使用繁體中文，簡潔明確
- 如需更詳細說明，使用 `—` 分隔：`type(scope): 簡短描述 — 更詳細說明`

### Why 區塊

- 每個項目以 `-` 開頭
- 說明問題點或需求背景
- 使用繁體中文
- 具體且明確，避免模糊描述

### How 區塊

- 每個項目以 `-` 開頭
- 說明具體的解決方案或實作方式
- 可包含技術細節（檔案名、函式名、參數等）
- 使用繁體中文，技術術語保留英文

## 範例

```
feat(ci/cd): 優化 workflow 加入智能檔案變更檢測

## Why is this necessary?

- 目前的 CI/CD 流程無論修改哪個應用，都會 build 和部署所有應用，造成時間浪費
- 只修改 product 相關檔案時，仍會 build 和部署 website，增加 30-50% 的不必要時間
- 部署驗證使用 docker logs 在某些 logging driver 不支援讀取時會失敗

## How does it address?

- CI 新增檔案變更檢測步驟，根據變更路徑決定需要 build 的應用
- 只修改 apps/website 時僅 build website，只修改 apps/product 時僅 build product
- 修改 packages/ 或配置檔時 build 所有應用（共享依賴）
- Verify job 改用 docker inspect 檢查容器狀態，避免 logging driver 問題

```

## 注意事項

1. **分析變更時要仔細**：準確理解程式碼變更才能提供適當的建議
2. **保持簡潔**：Why 和 How 各 3-5 個要點即可，不要過於冗長
3. **技術細節適度**：包含必要的技術細節，但避免過度詳細
4. **使用繁體中文**：除了技術術語外，一律使用繁體中文
