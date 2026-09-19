#!/usr/bin/env bash
# PR body 驗證證據閘門（CI 版；本機 hook 版是 .claude/hooks/pre-pr-gate.sh 閘門 5）
#
# 讀 PR body 的「## 驗證證據」區塊，要求：
#   1. 區塊存在
#   2. 含驗證報告連結（https://…）或一行「核心旅程不適用：<具體原因>」
#   3. 非不適用時，核心旅程摘要表至少一列「正常」+ 一列「錯誤路徑」，且沒有 ⬜／❌
#
# 為什麼要在 CI 再檢一次：本機 hook 只在 Claude 的 Bash 工具觸發，Codex／手動 gh／pipeline runner 都繞得過。
# #171 Phase A 的 PR 在 task.md verify 未勾的狀態下發出並 merge，四天後 #188「無法建立場次」。
#
# 環境變數：
#   BODY      PR body（必填）
#   HEAD_REF  head branch 名（chore/docs/ci/build/test/dependabot/renovate 前綴豁免）
#   LABELS    逗號分隔 label（含 evidence-exempt 豁免）
#   AUTHOR    PR 作者（*[bot] 豁免）
#   MODE      block（缺就 exit 1）| warn（預設；只印 ::warning）
set -euo pipefail

BODY="${BODY:-}"
HEAD_REF="${HEAD_REF:-}"
LABELS="${LABELS:-}"
AUTHOR="${AUTHOR:-}"
MODE="${MODE:-warn}"

exempt() {
  echo "pr-evidence-gate: 豁免（$1）"
  exit 0
}

case "$HEAD_REF" in
  chore/*|docs/*|ci/*|build/*|test/*|dependabot/*|renovate/*) exempt "分支前綴 ${HEAD_REF%%/*}/" ;;
esac
case ",$LABELS," in *,evidence-exempt,*) exempt "label evidence-exempt" ;; esac
case "$AUTHOR" in *"[bot]") exempt "bot 作者 $AUTHOR" ;; esac

problems=()

if ! printf '%s\n' "$BODY" | grep -q '^## 驗證證據'; then
  problems+=("PR body 缺「## 驗證證據」區塊（驗證報告連結 + 核心旅程矩陣摘要，或「核心旅程不適用：<原因>」）")
else
  section=$(printf '%s\n' "$BODY" | awk '/^## 驗證證據/{f=1; next} f && /^## /{exit} f')
  na_line=$(printf '%s\n' "$section" | grep -m1 -E '核心旅程不適用[：:]' || true)
  if [ -n "$na_line" ]; then
    reason=$(printf '%s' "$na_line" | sed -E 's/.*核心旅程不適用[：:][[:space:]]*//')
    if [ -z "$reason" ] || printf '%s' "$reason" | grep -qE '^<.*>$'; then
      problems+=("「核心旅程不適用」沒有具體原因")
    fi
  else
    printf '%s\n' "$section" | grep -qE 'https?://' \
      || problems+=("「## 驗證證據」沒有驗證報告連結（https://…）")
    rows=$(printf '%s\n' "$section" | sed -E 's/^[[:space:]]+//' | grep -E '^\|' | grep -vE '^\|[[:space:]]*(ID|-+)[[:space:]]*\|' | grep -vE '^\|[[:space:]-]*\|[[:space:]-]*\|' | LC_ALL=C grep -vE '<([^>|]*[^ -~][^>|]*|file:line)>' || true)
    if [ -z "$rows" ]; then
      problems+=("「## 驗證證據」沒有核心旅程矩陣列（| J-01 | 旅程 | 正常／錯誤路徑 | 輸入 | 預期 | 實際 |）")
    else
      printf '%s\n' "$rows" | grep -qE '⬜|❌' && problems+=("核心旅程有 ⬜／❌ 列，未驗或未過")
      unverified=$(printf '%s\n' "$rows" | grep -v '✅' || true)
      [ -z "$unverified" ] || problems+=("核心旅程有列缺 ✅（實際欄要有攔到的狀態碼）：$(printf '%s' "$unverified" | head -1)")
      # 每條旅程（第 2 欄）都要同時有「正常」與「錯誤路徑」（第 3 欄）
      pair_problems=$(printf '%s\n' "$rows" | awk -F'|' '
        { j=$3; t=$4; gsub(/^[ \t]+|[ \t]+$/, "", j); gsub(/^[ \t]+|[ \t]+$/, "", t)
          if (j == "") next
          seen[j]=1; if (t ~ /正常/) ok[j]=1; if (t ~ /錯誤路徑/) err[j]=1 }
        END { for (j in seen) { if (!ok[j]) printf "旅程「%s」缺「正常」列；", j; if (!err[j]) printf "旅程「%s」缺「錯誤路徑」列（server 拒絕的輸入、訊息顯示、輸入保留）；", j } }')
      [ -z "$pair_problems" ] || problems+=("$pair_problems")
    fi
  fi
fi

if [ "${#problems[@]}" -eq 0 ]; then
  echo "✅ pr-evidence-gate passed"
  exit 0
fi

level="warning"; [ "$MODE" = "block" ] && level="error"
for p in "${problems[@]}"; do
  echo "::${level}::pr-evidence-gate: $p"
done
echo "格式見 daodaoedu/daodao .claude/skills/dev-task/references/journey-matrix.md；例外請加 label evidence-exempt 並在 PR 說明原因。"
if [ "$MODE" = "block" ]; then
  exit 1
fi
echo "（advisory 模式：未阻擋；設定 repo variable PR_EVIDENCE_GATE_MODE=block 後升為必要檢查）"
exit 0
