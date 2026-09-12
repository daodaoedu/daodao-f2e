---
name: format-commit
description: Use when committing changes - drafts a Why/How commit message from git diff and conversation context, shows it once for approval, then executes git commit. Only asks the user when the reasoning genuinely can't be inferred.
---

# Format Commit Message

協助產生符合專案格式的 commit message，包含 `## Why is this necessary?` 和 `## How does it address?` 區塊。**先起草、一次給使用者確認**，不要逐項發問。

## Instructions

### 步驟 1: 分析當前變更

1. 執行 `git status` 查看當前變更的檔案
2. 執行 `git diff --staged` 讀完整內容（不是只看 stat）——type、scope、Why、How 都要從這裡推導

### 步驟 2: i18n 健康檢查（條件式）

只在 staged 變更包含 UI 原始檔（`.tsx`/`.jsx`/`.vue`/`.svelte`）或 locale 檔案時才執行；純後端、設定、CI、文件類 commit 直接跳過，不要輸出任何 i18n 相關文字。

觸發時檢查：

1. **locale 同步**：2 個以上 locale 檔案時，比較 top-level key 是否一致
2. **硬編碼字串**：從 `git diff --staged` 新增行（`+` 開頭）找可疑的硬編碼 UI 文字（`>文字<`、`label="..."` 等），排除 import、console.log、type/interface 宣告、URL、className、測試 fixture
3. **未同步警告**：UI 檔案有異動但沒有對應 locale 異動

只有查到問題才輸出：

```
⚠️  i18n 檢查結果
───────────────────────────────
[locale 同步] zh-TW.json 缺少 key：settings.title、settings.save
[硬編碼字串] src/components/Header.tsx +23：<h1>Settings</h1>
[未更新警告] UI 檔案有變更（Header.tsx），但 i18n 檔案未異動
```

沒問題就完全不提。這是警告性質，使用者可以忽略繼續 commit。

### 步驟 3: 起草 Why 和 How

**Why（為什麼需要這個改動）**：優先從當前對話脈絡推導——使用者通常已經講過要解決什麼問題、加什麼功能。只有在 diff 和對話都推不出動機時，才用一句話直接問使用者，不要開整個選單。

**How（做了什麼）**：從 `git diff --staged` 分析實際變更內容，自行歸納 3-5 個具體要點。答案已經在程式碼變更裡，不需要問使用者。

**Type / scope / 一句話描述**：從變更的檔案路徑、內容、對話脈絡直接推導，不要另外用 AskUserQuestion 詢問——這些是機械推導，不是只有使用者才知道的決策。

### 步驟 4: 生成並展示 Commit Message

根據推導結果，直接把完整草稿寫出來給使用者看：

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

使用者這時可以：直接說可以 → 執行；指出要改的地方 → 改完再貼一次不用重問已確定的部分；若對話中已有明確指示（commit type、要強調的原因）直接採用。

確認後執行 `git commit -m "$(cat <<'EOF' ... EOF)"`。

## 何時才用 AskUserQuestion

只有在 diff 和對話都推不出「為什麼要做這個改動」時，才問一個問題請使用者補充 Why。不要為了 type、scope、一句話描述另外發問。

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

1. **分析變更時要仔細**：準確理解程式碼變更才能起草出正確的 Why/How
2. **保持簡潔**：Why 和 How 各 3-5 個要點即可，不要過於冗長
3. **能推導就不要問**：type、scope、描述、How 都是機械推導；只有 Why 在推不出來時才問，而且只問一次
4. **使用繁體中文**：除了技術術語外，一律使用繁體中文
