# Better Agent Terminal — 把 AI Agent、終端機、開發工具全裝進一個視窗

## 前言

隨著 AI Coding Agent（Claude Code、Gemini CLI、GitHub Copilot 等）逐漸成為開發者日常工具，一個新的痛點浮現：**視窗太多了**。你需要一個終端機跑 Agent、另一個跑 dev server、再開 IDE 看程式碼、還要切 Git GUI 看 diff——光是在視窗之間切換就消耗了大量注意力。

[Better Agent Terminal（BAT）](https://github.com/tony1223/better-agent-terminal) 試圖解決這個問題。它是一個跨平台桌面應用，將多專案終端機、AI Agent 面板、檔案瀏覽器、Git 視覺化工具整合在單一視窗中，讓開發者不必離開 context 就能完成大部分工作。

目前版本 v2.1.21，GitHub 上已有超過 260 顆星。值得一提的是，這個專案本身就是用 Claude Code 開發的。

---

## 核心理念：一個視窗搞定所有開發 Context

BAT 的設計哲學是**減少 context switch**。傳統開發流程中，你可能同時需要：

- 終端機跑指令
- AI Agent 對話
- 檔案導覽器找程式碼
- Git 工具看變更紀錄

BAT 把這些全部整合在一個應用程式裡，透過 Workspace 概念將不同專案隔離，每個 Workspace 綁定一個目錄，擁有獨立的終端機、Agent session、檔案樹和 Git 面板。

---

## 功能亮點

### 1. Workspace 多專案管理

BAT 以 Workspace 為核心組織單位，每個 Workspace 綁定一個專案目錄：

- **拖放排序**：自由調整 sidebar 中的 Workspace 順序
- **分組篩選**：將 Workspace 分類到不同群組，透過下拉選單快速切換
- **獨立環境變數**：每個 Workspace 可設定專屬的環境變數
- **可拆離視窗**：將 Workspace 彈出為獨立視窗，重啟後自動歸位
- **活動指示器**：sidebar 上以視覺圓點標示哪些 Workspace 有活躍的終端機程序
- **Profile 切換**：儲存多組 Workspace 設定檔，支援本機與遠端 Profile

### 2. 終端機 — 分割面板設計

BAT 的終端機基於 xterm.js，採用獨特的分割面板佈局：

- **70% 主區域 + 30% 縮圖列**：主要操作區佔大部分畫面，右側縮圖列可捲動瀏覽所有開啟的終端機
- **多終端機**：每個 Workspace 可開啟多個終端機
- **完整 Unicode/CJK 支援**：繁中、日文等字元正常顯示
- **Agent Presets**：內建預設角色，包括 Claude Code、Gemini CLI、Codex、GitHub Copilot 和純終端機模式

### 3. 內建 Claude Code Agent

這是 BAT 最核心的差異化功能——直接在 app 裡透過 SDK 跑 Claude Agent，不需要另開終端機：

- **訊息串流**：即時顯示 Agent 回應，支援可收合的 Extended Thinking 區塊
- **權限控制**：每個工具呼叫都會攔截，可逐一核准、全部放行（bypass mode）或計劃模式（plan mode）自動核准
- **Subagent 追蹤**：顯示子任務的進度指示器，並偵測停滯狀態
- **Session 持久化**：對話持久儲存，跨重啟恢復，支援從任意節點分支（fork）
- **Rest/Wake**：暫停與喚醒 Agent session，節省資源
- **Statusline**：即時顯示 token 用量、費用、context window 使用率、模型名稱、Git branch、回合數與 session 時長
- **用量監控**：透過 Anthropic OAuth 追蹤 API rate limit（5 小時與 7 天窗口）
- **Context 用量面板**：以視覺化方式顯示 token 使用分佈（程式碼、對話、工具、記憶等類別）
- **圖片附件**：拖放或按鈕上傳，每則訊息最多 5 張圖片
- **可點擊路徑**：Agent 輸出中的檔案路徑可點擊預覽，支援語法高亮與搜尋（Ctrl+F）
- **檔案選取器**：Ctrl+P 模糊搜尋專案檔案，將檔案附加到對話 context

### 4. Git Worktree 隔離

這是一個值得特別說明的安全設計：BAT 會將 Claude Agent 生成（spawn）在獨立的 Git Worktree 中，而非主工作目錄。這意味著即使 Agent 執行了破壞性操作（例如刪除檔案、reset 等），也不會影響你正在開發的主分支。

這個設計對於讓 AI Agent 自主操作程式碼特別重要——你可以放心讓 Agent 嘗試各種方案，最壞情況只需要清除 worktree 即可。

### 5. 檔案瀏覽器與 Git 面板

不需要離開 BAT 就能完成基本的程式碼導覽和版本控制操作：

- **檔案瀏覽器**：搜尋、導覽、語法高亮預覽（基於 highlight.js）
- **Git 面板**：commit log、diff 檢視器、branch 顯示、未追蹤檔案列表、GitHub 連結偵測

### 6. Snippet 管理器

內建程式碼片段管理工具，以 SQLite 儲存：

- 分類與收藏功能
- 搜尋與快速貼上
- 透過 `/snippet` 指令讓 Claude Agent 管理你的 Snippets

---

## 鍵盤快捷鍵

| 快捷鍵 | 功能 |
|---------|------|
| `Ctrl+\`` / `Cmd+\`` | 在 Agent 終端機與一般終端機之間切換 |
| `Ctrl+←/→` / `Cmd+←/→` | 切換 Workspace 分頁（Terminal / Files / Git） |
| `Ctrl+↑/↓` / `Cmd+↑/↓` | 切換上一個 / 下一個 Workspace |
| `Ctrl+P` / `Cmd+P` | 檔案選取器（搜尋並附加到 Agent context） |
| `Ctrl+N` / `Cmd+N` | 開新視窗 |
| `Shift+Tab` | 切換 Terminal 與 Agent 模式 |
| `Enter` | 送出訊息 |
| `Shift+Enter` | 插入換行（多行輸入） |
| `Escape` | 停止串流 / 關閉 modal |

---

## Slash 指令

| 指令 | 說明 |
|------|------|
| `/resume` | 從歷史紀錄恢復之前的 Claude session |
| `/model` | 切換可用的 Claude 模型 |
| `/new` / `/clear` | 重置 session（清除對話，全新開始） |
| `/snippet` | 顯示 Snippets 讓 Claude 管理 |
| `/login` | 登入 Claude（切換帳號） |
| `/logout` | 登出 Claude |
| `/whoami` | 顯示目前帳號資訊與用量 |

---

## 遠端存取（實驗性功能）

BAT 內建 WebSocket server，允許其他 BAT 實例或行動裝置遠端控制：

### 運作方式

1. Host 端在 Settings → Remote Access 啟動 WebSocket server（預設 port 9876）
2. 啟動時自動產生 32 字元的 hex Connection Token 用於認證
3. Client 端透過 Remote Profile 輸入 host IP、port 和 token 連線
4. 連線後，Client 可操控 Host 上的所有終端機、Agent session、Workspace

### 連線方式

- **BAT-to-BAT**：在 Client 端建立 Remote Profile，輸入連線資訊
- **行動裝置**：Host 端產生 QR Code，手機掃描即可取得連線資訊

### Tailscale 整合

若 Host 和 Client 不在同一區域網路（例如從家裡連到公司電腦），BAT 建議使用 Tailscale 建立安全的 P2P VPN：

- 免費方案支援最多 100 台裝置
- 不需要 port forwarding 或額外伺服器設定
- 每台裝置取得穩定的 `100.x.x.x` IP 位址
- BAT 會自動偵測 Tailscale IP 並優先使用

> **安全提醒**：啟用 Remote Server 後，擁有 token 的任何裝置都能完全控制 Host 上的 BAT，包括執行終端機指令和存取檔案系統。請勿在不信任的網路上啟動 server，建議搭配 Tailscale 使用。

---

## 技術架構

### Tech Stack

| 技術 | 用途 |
|------|------|
| React 18 + TypeScript | 前端 UI |
| xterm.js + node-pty | 終端機模擬 |
| Electron 28 | 桌面應用框架 |
| @anthropic-ai/claude-agent-sdk | AI Agent 整合 |
| Vite 5 + electron-builder | 建置工具 |
| better-sqlite3 | 本機資料儲存（Snippets、Session） |
| ws + qrcode | WebSocket 遠端連線 |
| highlight.js | 語法高亮 |

### 架構分層

BAT 遵循典型的 Electron 雙行程架構：

**Main Process（Node.js）**：
- `main.ts` — App 進入點、IPC handlers、視窗管理
- `pty-manager.ts` — PTY 程序生命週期、多視窗廣播
- `claude-agent-manager.ts` — Claude SDK session 管理
- `worktree-manager.ts` — Git worktree 建立、移除、rehydration
- `snippet-db.ts` — SQLite snippet 儲存
- `remote/` — WebSocket server/client、handler registry、broadcast hub、tunnel 管理

**Renderer Process（React）**：
- `App.tsx` — Root component、佈局、Profile 調度
- Components — Sidebar、WorkspaceView、ClaudeAgentPanel、TerminalPanel、GitPanel、FileTree、SnippetPanel 等
- Stores — workspace-store（pub/sub 狀態管理）、settings-store（設定持久化）

關鍵設計模式包括：IPC 跨行程通訊、Pub/Sub 響應式狀態更新、統一 handler registry 同時支援 IPC 與 WebSocket 協定。

---

## 安裝方式

### macOS（Homebrew）

```bash
brew tap tonyq-org/tap
brew install --cask better-agent-terminal
```

### 直接下載

至 [GitHub Releases](https://github.com/tony1223/better-agent-terminal/releases) 下載：
- **Windows**：NSIS installer 或 .zip
- **macOS**：.dmg（universal binary）
- **Linux**：.AppImage

### 從原始碼建置

前置條件：Node.js 18+、Claude Code CLI 已安裝並認證。

```bash
git clone https://github.com/tony1223/better-agent-terminal.git
cd better-agent-terminal
npm install
npm run dev    # 開發模式
npm run build  # 生產建置
```

macOS 需要先安裝 Xcode Command Line Tools：

```bash
xcode-select --install
```

---

## 適合誰用？

- **重度使用 AI Coding Agent 的開發者**：不需要在多個終端機和視窗之間切換
- **同時管理多專案的工程師**：Workspace 概念讓多專案管理更有條理
- **想要 Git Worktree 安全網的團隊**：讓 AI Agent 在隔離環境中操作，降低風險
- **遠端工作者**：透過 Remote Access 從行動裝置或其他電腦控制開發環境

---

## 結語

Better Agent Terminal 代表了一個有趣的趨勢：隨著 AI Agent 成為開發流程的核心，開發工具需要重新思考「整合」的意義。不只是 IDE 加外掛，而是從零開始設計一個以 Agent 為中心的開發環境。

BAT 目前仍在積極開發中，作為一個 MIT 授權的開源專案，值得關注它接下來的演進方向。

> 專案連結：https://github.com/tony1223/better-agent-terminal
> 授權：MIT
> 作者：TonyQ (@tony1223)
