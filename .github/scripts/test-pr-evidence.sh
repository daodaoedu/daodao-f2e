#!/usr/bin/env bash
# Regression tests for check-pr-evidence.sh（PR body 驗證證據閘門）。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECK="$SCRIPT_DIR/check-pr-evidence.sh"
[ -x "$CHECK" ] || chmod +x "$CHECK"

fail() { echo "❌ $1"; exit 1; }

OUT_FILE=$(mktemp)
trap 'rm -f "$OUT_FILE"' EXIT
run() {  # $1=body $2=mode $3=head_ref $4=labels $5=author → exit code；輸出存 $OUT_FILE（$(...) 子 shell 帶不出變數）
  local code=0
  BODY="$1" MODE="${2:-block}" HEAD_REF="${3:-feat/x}" LABELS="${4:-}" AUTHOR="${5:-someone}" bash "$CHECK" >"$OUT_FILE" 2>&1 || code=$?
  echo "$code"
}
out() { cat "$OUT_FILE"; }

expect_pass() {
  local name="$1" code="$2"
  [ "$code" = 0 ] || fail "$name 應通過，實際 exit ${code}：$(out)"
  printf '✅ %s\n' "$name"
}
expect_fail() {
  local name="$1" code="$2" needle="$3" o
  o=$(out)
  [ "$code" = 1 ] || fail "$name 應失敗（exit 1），實際 exit ${code}：$o"
  [[ "$o" == *"$needle"* ]] || fail "$name 訊息應含「${needle}」：$o"
  printf '✅ %s\n' "$name"
}

GOOD='## Summary
x

## 驗證證據
- 驗證報告: [Task 1 驗證報告](https://docs.google.com/document/d/abc/edit)

| ID | 旅程 | 類型 | 輸入 | 預期結果 | 實際 |
|---|---|---|---|---|---|
| J-01 | 建立場次 | 正常 | slug 2026-summer | 201 | ✅ 201 |
| J-02 | 建立場次 | 錯誤路徑 | slug 26-Summer | 400 訊息顯示 | ✅ 400 |

## Test plan
- [x] ok'

code=$(run "$GOOD"); expect_pass "完整證據" "$code"

code=$(run "$(printf '## Summary\nx\n\n## Test plan\n- [x] ok')"); expect_fail "缺區塊" "$code" "缺「## 驗證證據」"

code=$(run "$(printf '## 驗證證據\n- 報告：沒連結\n| J-01 | a | 正常 | i | 201 | ✅ 201 |\n| J-02 | a | 錯誤路徑 | i | 400 | ✅ 400 |\n')")
expect_fail "缺報告連結" "$code" "沒有驗證報告連結"

ONLY_HAPPY=$(printf '%s\n' "$GOOD" | grep -v '錯誤路徑')
code=$(run "$ONLY_HAPPY"); expect_fail "缺錯誤路徑列" "$code" "缺「錯誤路徑」列"

PENDING=$(printf '%s\n' "$GOOD" | sed 's/✅ 400/⬜/')
code=$(run "$PENDING"); expect_fail "有未驗列" "$code" "⬜／❌"

NO_ROWS='## 驗證證據
- 驗證報告: https://docs.google.com/document/d/abc/edit
只有文字沒有表格'
code=$(run "$NO_ROWS"); expect_fail "沒有矩陣列" "$code" "沒有核心旅程矩陣列"

code=$(run "$(printf '## 驗證證據\n核心旅程不適用：純 CSS 對齊，diff 未碰任何 form／mutation／controller\n')")
expect_pass "不適用聲明有原因" "$code"

code=$(run "$(printf '## 驗證證據\n核心旅程不適用：\n')")
expect_fail "不適用聲明沒原因" "$code" "沒有具體原因"

# 實際欄空白／未填（沒有 ✅）不能過：CI 是繞過本機 hook 時的最後一道
BLANK=$(printf '%s\n' "$GOOD" | sed 's/✅ 400/未填/')
code=$(run "$BLANK"); expect_fail "實際欄未填" "$code" "缺 ✅"

# 每條旅程都要成對
UNPAIRED='## 驗證證據
- 驗證報告: https://docs.google.com/document/d/abc/edit
| ID | 旅程 | 類型 | 輸入 | 預期結果 | 實際 |
|---|---|---|---|---|---|
| J-01 | 建立場次 | 正常 | slug 2026-summer | 201 | ✅ 201 |
| J-02 | 刪除場次 | 錯誤路徑 | 非擁有者 | 403 | ✅ 403 |'
code=$(run "$UNPAIRED"); expect_fail "旅程未成對" "$code" "旅程「建立場次」缺「錯誤路徑」列"

# 表格帶前導空白也要讀得到
INDENTED=$(printf '%s\n' "$GOOD" | sed -E 's/^\|/  |/')
code=$(run "$INDENTED"); expect_pass "表格帶前導空白" "$code"

# 真實輸入含 <script> 不算模板佔位列
XSS="$GOOD
| J-03 | 建立場次 | 錯誤路徑 | 名稱 <script>alert(1)</script> | 400 | ✅ 400 |"
code=$(run "$XSS"); expect_pass "含 <script> 的真實輸入列" "$code"
ONLY_PLACEHOLDER='## 驗證證據
- 驗證報告: https://docs.google.com/document/d/abc/edit
| ID | 旅程 | 類型 | 輸入 | 預期結果 | 實際 |
|---|---|---|---|---|---|
| J-01 | <建立 X> | 正常 | <輸入> | <結果> | ⬜ |'
code=$(run "$ONLY_PLACEHOLDER"); expect_fail "只有模板佔位列" "$code" "沒有核心旅程矩陣列"

# 表格列在區塊之外不算（區塊只到下一個 ## 為止）
OUTSIDE='## 驗證證據
- 驗證報告: https://docs.google.com/document/d/abc/edit

## Test plan
| J-01 | a | 正常 | i | 201 | ✅ 201 |
| J-02 | a | 錯誤路徑 | i | 400 | ✅ 400 |'
code=$(run "$OUTSIDE"); expect_fail "表格在區塊外" "$code" "沒有核心旅程矩陣列"

# warn 模式：缺也放行，但印 ::warning
code=$(run "$(printf '## Summary\nx')" warn); expect_pass "warn 模式不阻擋" "$code"
[[ "$(out)" == *"::warning::"* ]] || fail "warn 模式應印 ::warning：$(out)"
printf '✅ %s\n' "warn 模式印 warning"

# 豁免
code=$(run "$(printf '## Summary\nx')" block "docs/update-readme"); expect_pass "docs/ 前綴豁免" "$code"
code=$(run "$(printf '## Summary\nx')" block "feat/x" "bug,evidence-exempt"); expect_pass "evidence-exempt label 豁免" "$code"
code=$(run "$(printf '## Summary\nx')" block "feat/x" "" "dependabot[bot]"); expect_pass "bot 作者豁免" "$code"
code=$(run "$(printf '## Summary\nx')" block "feat/x" "bug"); expect_fail "feat/ 無豁免" "$code" "缺「## 驗證證據」"

echo "✅ pr-evidence-gate regression tests passed"
