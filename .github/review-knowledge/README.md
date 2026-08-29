# Review Knowledge — code review 誤判知識庫

AI code review 有兩個來源：**CI**（`code-review.yml`，Workers AI）與**本機**（`code-review` skill，Codex／OMP／OpenCode／Haiku 四引擎）。兩邊的誤判都記在同一份 `false-positives.jsonl`，兩邊也都用同一支 `.github/scripts/review-knowledge.cjs` 消費它——記錄一次，兩處受益。

```
記錄（record）                          消費
  本機 skill 步驟 8 查證為誤判 ──┐        ┌─ CI  ：prompt-block 進模型輸入 → filter 在 strict validator 前
  PR 作者回覆 /fp（collect-pr-  ├─→ jsonl ─┤
  feedback 步驟 3 收割）       ─┘        └─ 本機：prompt-block 進 review-input.md → filter 套各引擎表格
```

單一來源在 daodao monorepo；`sync-claude-config.yml` 把 jsonl 與腳本同步到各 sub-repo，CI 從 **base ref** 讀取（與 `retrieve-context.sh` 相同的信任邊界，PR head 改不到）。

## 樣態分類

| 代號 | 樣態 | 確定性對策 |
|---|---|---|
| A | absent-claim：對 diff 外的程式碼做「找不到／缺少／未實作」否定斷言，但實作存在 | Context Pack 補脈絡（route middleware、schema）；prompt-block 提醒 |
| B | deletion：舊碼被刪就報回歸，替代實作在同 PR 別的檔案 | prompt-block 提醒；Context Pack 列替代者（待做） |
| C | unverifiable：自己寫「無法確認／被截斷／不確定」卻列成問題 | **filter 直接 drop** |
| D | hypothetical：「若未來／萬一／可能會」的假設風險，無具體證據 | **filter：High/Medium 降為 Low** |
| E | format：漏行號、括號說明、簡體 | `code-review.yml` normalize 修復器 |
| F | misattribution：path:line 指到別的函式 | 只記錄；回覆時指正 |

規則寫在 `review-knowledge.cjs` 裡（`UNVERIFIABLE_RE`／`HYPOTHETICAL_RE`）。**改規則必須同時加一筆帶 `sample` + `expected` 的紀錄**，`node .github/scripts/review-knowledge.cjs test` 會把每筆當 fixture 跑。

## 怎麼記一筆

```bash
# 在 daodao monorepo 或其 worktrees/ 底下執行，會自動找到單一來源的 jsonl
node .github/scripts/review-knowledge.cjs record \
  --source local --engine omp --repo daodao-f2e --pr 952 --pattern A \
  --severity High --file 'apps/.../wizard-page.tsx:249' \
  --finding 'template 模式沒走 submitGuard' \
  --why 'handleFinish 不分模式，有 guard 一律走' \
  --evidence 'wizard-page.tsx:249-256' --action none \
  --sample '| High | apps/.../wizard-page.tsx | … | … |' --expected keep
```

- `--source`：`ci` 或 `local`
- `--action`：這筆促成了什麼對策——`drop`／`downgrade`（filter 規則）、`context`（Context Pack 要補的脈絡）、`repair`（修復器）、`none`（只記錄）
- `--sample`／`--expected`：可選，給了就成為 fixture

記完 commit 到 monorepo `main`，sync 會自動派發到各 sub-repo。

### CI 來源：PR 留言收割

PR 作者回覆 bot 的 Code Review 留言時，用一行 `/fp <第幾條> <A-F> <一句為什麼>`，例如：

```
/fp 1 A route 已掛 authenticate，引用行號指到別的函式
/fp 3 C 自承 diff 被截斷
```

`collect-pr-feedback` skill 步驟 3 讀到這種行就呼叫 `record --source ci`；`review-evals.ts` 週報另計各樣態比例（待接）。

## 每筆欄位

`id`、`date`、`source`、`engine`、`repo`、`pr`、`pattern`、`severity`、`file`、`finding`（原文摘要）、`why`（為什麼錯，附證據）、`evidence`、`action`、可選 `sample`／`expected`。

## 延伸閱讀

知識庫解不了的三個問題（A 類跨檔案脈絡、記錄靠人、關鍵字過濾脆弱）在文獻與開源專案的對應解法與落地順序：[docs/automation/review-false-positive-research.md](../../docs/automation/review-false-positive-research.md)。
