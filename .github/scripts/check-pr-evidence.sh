#!/usr/bin/env bash
# PR body 驗證證據閘門（CI 版；本機 hook 版是 plugin/hooks/pre-pr-gate.sh 閘門 5）
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
#   REPO      owner/repo（github.repository；決定 `#N` 是否指中央 issue）
#   MODE      block（缺就 exit 1）| warn（預設；只印 ::warning）
#
# 另檢查 closing keyword（#364）：PR body 用 close／fix／resolve（含 -s／-d、冒號）指向中央 issue
# daodaoedu/daodao#N 或其 URL 時，PR merge 進預設分支就會自動關卡，board 內建 workflow 移 Done，
# 跳過 dev 冒煙與 PM 驗收（#333／#335／#337）。在 daodao root 本身，`#N` 也是中央 issue。
# 這項不吃上面的豁免（docs／chore PR、evidence-exempt、bot 一樣會關卡），模式同 MODE。
# 程式碼區塊（``` 與 `…`）裡的範例不算——GitHub 不解析其中的 issue 參照。
set -euo pipefail

BODY="${BODY:-}"
HEAD_REF="${HEAD_REF:-}"
LABELS="${LABELS:-}"
AUTHOR="${AUTHOR:-}"
REPO="${REPO:-}"
MODE="${MODE:-warn}"

problems=()

central_refs='daodaoedu/daodao#[0-9]+|(\[[^]]*\]\()?https?://github\.com/daodaoedu/daodao/issues/[0-9]+'
[ "$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]')" = "daodaoedu/daodao" ] && central_refs="$central_refs|#[0-9]+"
closing_hits=$(printf '%s\n' "$BODY" \
  | LC_ALL=C awk '/^[[:space:]]*(```|~~~)/ { fence = !fence; next } !fence' \
  | LC_ALL=C sed -E 's/`[^`]*`//g' \
  | LC_ALL=C grep -oiE "(^|[^[:alnum:]_])(close[sd]?|fix(e[sd])?|resolve[sd]?):?[[:space:]]+(${central_refs})" \
  | LC_ALL=C sed -E 's/^[^[:alpha:]]*//' | paste -sd ';' - || true)
if [ -n "$closing_hits" ]; then
  problems+=("PR body 用 closing keyword 指向中央 issue（${closing_hits}）：merge 時 GitHub 會自動關卡、board 移 Done，跳過 dev 冒煙與 PM 驗收。改寫成獨立一行 Refs daodaoedu/daodao#N（卡片由 PM 驗收後關閉）")
fi

exempt_reason=""
case "$HEAD_REF" in
  chore/*|docs/*|ci/*|build/*|test/*|dependabot/*|renovate/*) exempt_reason="分支前綴 ${HEAD_REF%%/*}/" ;;
esac
case ",$LABELS," in *,evidence-exempt,*) exempt_reason="label evidence-exempt" ;; esac
case "$AUTHOR" in *"[bot]") exempt_reason="bot 作者 $AUTHOR" ;; esac

evidence_problems=${#problems[@]}
if [ -n "$exempt_reason" ]; then
  echo "pr-evidence-gate: 驗證證據豁免（${exempt_reason}）"
elif ! printf '%s\n' "$BODY" | grep -q '^## 驗證證據'; then
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
if [ "${#problems[@]}" -gt "$evidence_problems" ]; then
  echo "格式見 daodaoedu/daodao plugin/skills/dev-task/references/journey-matrix.md；例外請加 label evidence-exempt 並在 PR 說明原因。"
fi
if [ "$MODE" = "block" ]; then
  exit 1
fi
echo "（advisory 模式：未阻擋；設定 repo variable PR_EVIDENCE_GATE_MODE=block 後升為必要檢查）"
exit 0
