# Review Knowledge — code review 誤判知識庫

AI code review 有兩個來源：**CI**（`code-review.yml`，Workers AI）與**本機**（`review-change` skill，Codex／OMP／OpenCode／Haiku 四引擎）。兩邊都用同一份 `false-positives.jsonl` 與同一支 `.github/scripts/review-knowledge.cjs`。

**2026-10-29 起不再收集新的誤判紀錄**（`record` 已退役、`/fp` 不再匯入）。盤點當時發現 filter 是寫死的樣態規則、prompt-block 每個樣態只取最後一筆當例子，181 筆裡只有 18 筆真的被測試跑到；既有紀錄因此全部轉成回歸測試，之後只靠這些 fixture 守住規則。

```
既有紀錄（凍結）                         消費
  false-positives.jsonl ──────────────┬─ CI  ：prompt-block 進模型輸入 → verify 標註 absent-claim（不刪 finding）
  （fixture／known_gap／no_sample）   └─ 本機：prompt-block 進 review-input.md → filter → verify 套各引擎表格
```

單一來源在 daodao monorepo；`sync-claude-config.yml` 把 jsonl 與腳本同步到各 sub-repo，CI 從 **base ref** 讀取（與 `retrieve-context.sh` 相同的信任邊界，PR head 改不到）。

## 樣態分類

| 代號 | 樣態 | 確定性對策 |
|---|---|---|
| A | absent-claim：對 diff 外的程式碼做「找不到／缺少／未實作」否定斷言，但實作存在 | Context Pack 補脈絡（route middleware、schema）；prompt-block 提醒；**verify 到 head tree `git grep` 查反證**（本機 drop、CI 只標註） |
| B | deletion：舊碼被刪就報回歸，替代實作在同 PR 別的檔案 | prompt-block 提醒；Context Pack 列替代者（待做） |
| C | unverifiable：自己寫「無法確認／被截斷／不確定／diff 看不到／自承未讀／未確認是否存在」卻列成問題 | **filter 直接 drop**；「未確認使用者是否已填」這類程式漏檢查不算（反例 FP-0184、FP-0185） |
| D | hypothetical：「若未來／萬一／可能會」的假設風險，無具體證據 | **filter：High/Medium 降為 Low** |
| E | format：漏行號、括號說明、簡體 | `code-review.yml` normalize 修復器 |
| F | misattribution：path:line 指到別的函式 | 只記錄；回覆時指正 |
| G | reminder：「請確認／需同步／記得更新」的提醒，沒指出哪個位置還是舊的 | **filter 直接 drop**；有指出另一個 `path:line` 就保留。CI prompt 也要求不報這類提醒 |

**高風險類別不套用 C／D／G**：問題或建議欄提到 auth、權限、個資、migration／schema、金流、資料刪除、併發時，filter 一律保留原樣（記在 report 的 `exempted`），交人判斷。歷史上類似的 finding 被放過，不構成自動略過的理由。

規則寫在 `review-knowledge.cjs` 裡（`UNVERIFIABLE_RE`／`HYPOTHETICAL_RE`／`REMINDER_RE`／`HIGH_RISK_RE`；verify 用 `ABSENT_EXIST_RE`／`ABSENT_CHECK_RE`）。**改規則必須同時加一筆帶 `sample` + `expected` 的紀錄**，`node .github/scripts/review-knowledge.cjs test` 會把每筆當 fixture 跑。`expected: "verify-drop"` 表示 filter 保留、verify 要移除，這種紀錄另外帶 `verify_tree`（`{路徑: 內容}`），test 會用它建暫存 git repo 跑 verify（例：FP-0001、FP-0010）；腳本內建的反例（真正缺少的東西）必須保留。

## 回歸測試的三種紀錄

`node .github/scripts/review-knowledge.cjs test` 會檢查每一筆紀錄都屬於下面其中一種，否則失敗：

| 種類 | 欄位 | test 怎麼處理 | 2026-10-29 筆數 |
|---|---|---|---|
| fixture | `sample`＋`expected`（`keep`／`drop`／`downgrade`／`verify-drop`） | 跑 filter（與 verify），結果不符就失敗 | 35 |
| 已知漏網 | fixture 再加 `known_gap: true`、`gap_reason` | 照樣跑；失敗只列進「已知漏網」清單，不讓 test 失敗；通過了會提示移除標記 | 47 |
| 不測 | `no_sample_reason` | 不跑（`action` 是 `none`／`context`，或原文遺失） | 103 |

- `sample_source: "summary"` 表示 sample 是用 `finding` 摘要組成的表格列，不是模型當時的原文（原文沒保存）。
- 已知漏網的主因：B 類沒有文字規則可用；D 類規則只降級不移除；原本就是 Low 無法再降級；「可能導致」這類寫法刻意不收（會過度匹配，見 FP-0025）；A 類多數是語意或跨 repo 判斷，verify 只查識別字定義。
- 改 filter 規則時：直接在 jsonl 尾端加 `pr` 為 0、帶 `sample`＋`expected` 的 fixture，並同時加一筆 `expected: "keep"` 的反例證明不會誤殺真問題（例：FP-0183～FP-0185）。`id` 接現有最大編號。改完 `test` 要綠，known_gap 通過的要拿掉標記。

## 每筆欄位

`id`、`date`、`source`、`engine`、`repo`、`pr`、`pattern`、`severity`、`file`、`finding`（原文摘要）、`why`（為什麼錯，附證據）、`evidence`、`action`，加上 `sample`／`expected`（可帶 `sample_source`、`verify_tree`、`known_gap`／`gap_reason`）或 `no_sample_reason` 其中一組。

## 延伸閱讀

知識庫解不了的三個問題（A 類跨檔案脈絡、記錄靠人、關鍵字過濾脆弱；記錄已於 2026-10-29 停止）在文獻與開源專案的對應解法與落地順序：[docs/automation/review-false-positive-research.md](../../docs/automation/review-false-positive-research.md)。
