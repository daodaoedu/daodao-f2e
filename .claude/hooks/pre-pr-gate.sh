#!/usr/bin/env bash
# PreToolUse hook (Bash): 發 PR 前的 dev-task 驗收閘門
#
# 攔 `gh pr create`：cwd（或指令裡的 cd 路徑）在 worktrees/<task>/ 底下且有 task.md 時，依序檢查：
#   1. pr-status-not-verified   task.md Status 已離開 implementing／planning
#   2. pr-poc-compare-missing   有可互動 HTML 原型的 UI repo，必須做過 POC 並排量測比對
#   3. pr-journey-matrix-missing task.md「### 核心旅程矩陣」存在、含正常＋錯誤路徑列、全 ✅（或一行「核心旅程不適用：<原因>」）
#   4. pr-deferred-unlinked     task.md「## Deferred items」每項都有子 issue（#n）或「待開卡：<原因>」
#   5. pr-body-evidence-missing PR body 有「## 驗證證據」且含報告連結或不適用聲明
#   6. pr-fe-pattern-invalid    UI repo 手寫 HTML pattern 用 v flag 編不過（#188 的根因）；UNMATCHED 只 warn 留痕
#   7. pr-verify-unchecked      task.md「## 驗證」還有 `- [ ]` 未驗項目或「需要手動驗證」清單（#166：6 頁寫「需 OAuth 登入」就發 PR）
#   8. pr-layout-probe-missing  UI repo 缺「### 版面探針」表、表裡有 ❌、或沒有「版面探針不適用：<原因>」（#233：settings 每頁多 132px）
#
# 依據：ADR-0001 gates over guidelines——「skill 文件寫必做」擋不住忘記，改成機器攔。
# 教訓：#189（POC 比對漏做）、#171→#188（畫面驗過了、使用者建不了場次；deferred 項目只留在 comment）、
#       #166→#233（「需登入才能驗」的頁面沒驗就 merge，evidence 截圖是登入牆；settings 橫向溢出 132px 六個月沒人量到）。
# 逃生口：DEV_TASK_SKIP_GATE="<原因>"（全部閘門）或 DEV_TASK_SKIP_POC_GATE="<原因>"（相容舊名），都寫進 gate ledger 留痕。
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOKS_DIR/lib.sh"

# jq 不在時不能默默放行：粗略比對 payload，看起來是在發 PR 就擋下並說明原因（fail closed）
if ! jq --version >/dev/null 2>&1; then
  if printf '%s' "${CLAUDE_TOOL_INPUT:-}" | grep -qE 'gh[[:space:]]+pr[[:space:]]+create'; then
    echo "❌ pre-pr-gate 需要 jq 解析工具輸入，但找不到 jq；閘門無法判斷就不放行（brew install jq / apt install jq）" >&2
    exit 2
  fi
  exit 0
fi
cmd=$(echo "${CLAUDE_TOOL_INPUT:-}" | jq -r '.command // empty' 2>/dev/null || true)
[ -z "$cmd" ] && exit 0
echo "$cmd" | grep -qE '(^|[;&|[:space:]])gh[[:space:]]+pr[[:space:]]+create([[:space:]]|$)' || exit 0

cwd="${CLAUDE_WORKING_DIRECTORY:-$(pwd)}"
# 從 cwd、指令裡的 cd 路徑、或指令中任何含 /worktrees/<n>-<slug> 的路徑找任務資料夾。
# 引號要剝掉（cd "/a/worktrees/1-x/repo" 會連引號一起抓到，task.md 就找不到、整組閘門被繞過）。
task_dir=""
cd_paths=$(echo "$cmd" | grep -oE 'cd[[:space:]]+[^[:space:];&|]+' | awk '{print $2}' | tr -d "\"'" || true)
wt_paths=$(echo "$cmd" | tr "\"'" '  ' | grep -oE '[^[:space:];&|]*/worktrees/[^/[:space:];&|]+' || true)
for candidate in "$cwd" $cd_paths $wt_paths; do
  case "$candidate" in
    */worktrees/*)
      task_dir="${candidate%%/worktrees/*}/worktrees/$(echo "${candidate#*/worktrees/}" | cut -d/ -f1)"
      break
      ;;
  esac
done
[ -z "$task_dir" ] && exit 0          # 不在 dev-task 任務內，不管
task_md="$task_dir/task.md"
[ -f "$task_md" ] || exit 0           # 沒有 manifest（clone 模式或臨時分支），不管

# 目標 repo：cd 路徑或 cwd 中 worktrees/<task>/<repo>
repo_dir=""
for candidate in "$cwd" $cd_paths $wt_paths; do
  case "$candidate" in
    "$task_dir"/*) repo_dir=$(basename "$(echo "${candidate#"$task_dir"/}" | cut -d/ -f1)"); break ;;
  esac
done
# cd "$TASK/<repo>" 這種未展開的變數路徑抓不到 repo：退而從任務資料夾裡找唯一的 repo 目錄
if [ -z "$repo_dir" ]; then
  repo_candidates=$(find "$task_dir" -mindepth 1 -maxdepth 1 -type d -name 'daodao-*' 2>/dev/null | wc -l | tr -d ' ')
  [ "$repo_candidates" = 1 ] && repo_dir=$(basename "$(find "$task_dir" -mindepth 1 -maxdepth 1 -type d -name 'daodao-*')")
fi
is_ui_repo=0
case "$repo_dir" in daodao-f2e|daodao-admin-ui) is_ui_repo=1 ;; esac

skip_reason="${DEV_TASK_SKIP_GATE:-${DEV_TASK_SKIP_POC_GATE:-}}"

# 統一的擋／略過處理：有 skip_reason 就留痕放行，否則印訊息並 exit 2
gate_fail() {
  local rule="$1" target="$2" message="$3"
  if [ -n "$skip_reason" ]; then
    log_gate_event "$rule" "$target" "skip:$skip_reason" "dev-task"
    return 0
  fi
  printf '%s\n' "$message" >&2
  log_gate_event "$rule" "$target" "block" "dev-task"
  exit 2
}

# 取 task.md 某個標題底下、到下一個同級或更高級標題前的內容
section_body() {
  local file="$1" heading_re="$2" stop_re="$3"
  awk -v h="$heading_re" -v s="$stop_re" '
    found && $0 ~ s { exit }
    found { print }
    $0 ~ h { found = 1 }
  ' "$file"
}

# --- 閘門 1：task.md Status 必須離開 implementing ---
status_line=$(awk '/^## Status/{getline; print; exit}' "$task_md" | tr -d '[:space:]')
if [ -z "$status_line" ] || echo "$status_line" | grep -qiE '^(implementing|planning)'; then
  gate_fail "pr-status-not-verified" "$task_md" \
    "❌ task.md Status 仍是「${status_line:-空}」：verify 階段沒跑完不能發 PR（dev-task Phase 3 → Status: verified 後再進 finish）"
fi

# --- 閘門 2：有可互動 HTML 原型的 UI repo，必須做過 POC 並排量測比對 ---
has_poc=0
if compgen -G "$task_dir/poc/*.dc.html" >/dev/null 2>&1; then has_poc=1; fi
if [ -f "$task_dir/poc/index.html" ] && [ -f "$task_dir/poc/support.js" ]; then has_poc=1; fi

if [ "$has_poc" = 1 ] && [ "$is_ui_repo" = 1 ]; then
  ok=1
  [ -s "$task_dir/notes/poc-compare/report.md" ] || ok=0
  grep -q '^### POC 比對' "$task_md" || ok=0
  # 差異表裡的 ❌ 不能自行放過：要嘛修掉、要嘛使用者已確認（task.md 有這行）
  grep -q 'POC 差異決策已確認' "$task_md" || ok=0
  # probe 涵蓋率：poc-report.py 產的 coverage.json，required 類別缺一不可（config.mjs 的 categories.na 可豁免並留理由）
  cov="$task_dir/notes/poc-compare/coverage.json"
  cov_missing=""
  if [ -s "$cov" ]; then
    # jq 解析失敗或沒有 missing 陣列 → 不能當成「沒有缺漏」，明確標記並擋下（AI review #225 抓到的 fail-open）
    if cov_missing=$(jq -er '.missing | if type == "array" then join(", ") else error("missing 不是陣列") end' "$cov" 2>/dev/null); then
      [ -z "$cov_missing" ] || ok=0
    else
      cov_missing="(coverage.json 無法解析或缺 missing 陣列，請重跑 poc-report.py)"; ok=0
    fi
  else
    cov_missing="(沒有 coverage.json，請跑 poc-report.py)"; ok=0
  fi
  if [ "$ok" = 0 ]; then
    gate_fail "pr-poc-compare-missing" "$task_dir" "$(cat <<EOF
❌ 這個任務有可互動的 POC（$task_dir/poc/），但還沒做「POC 並排量測比對」就要發 $repo_dir 的 PR。
   需要：
   1. $task_dir/notes/poc-compare/report.md（getComputedStyle 量測差異表）
   2. task.md「驗證」區塊有「### POC 比對」差異表，且剩餘差異已用 AskUserQuestion 給使用者確認、寫下「POC 差異決策已確認」
   3. notes/poc-compare/coverage.json 的 required 類別全部有 probe（目前缺：${cov_missing:-無}）；真的沒有的類別在 config.mjs categories.na 寫理由
   做法見 .claude/skills/dev-task/references/poc-compare.md
   真的不適用時：DEV_TASK_SKIP_GATE="<原因>" 再跑一次（會留痕）
EOF
)"
  fi
fi

# --- 閘門 3：核心旅程矩陣（#188：畫面驗過了，使用者建不了場次）---
if grep -qE '^核心旅程不適用[：:]' "$task_md"; then
  na_reason=$(grep -m1 -E '^核心旅程不適用[：:]' "$task_md" | sed -E 's/^核心旅程不適用[：:][[:space:]]*//')
  if [ -z "$na_reason" ] || echo "$na_reason" | grep -qE '^<.*>$'; then
    gate_fail "pr-journey-matrix-missing" "$task_md" \
      "❌ task.md 寫了「核心旅程不適用」但沒有具體原因。要寫清楚 diff 為什麼沒碰任何 form／mutation／controller，例如「純 CSS 對齊，diff 未碰任何 form／mutation／controller」"
  fi
  log_gate_event "pr-journey-matrix-na" "$task_md" "pass:$na_reason" "dev-task"
else
  matrix_rows=$(section_body "$task_md" '^### 核心旅程矩陣' '^(#|##|###) ' \
    | sed -E 's/^[[:space:]]+//' | grep -E '^\|' | grep -vE '^\|[[:space:]]*(ID|-+)[[:space:]]*\|' | grep -vE '^\|[[:space:]-]*\|[[:space:]-]*\|' || true)
  # 模板佔位列不算已填：<…> 裡含非 ASCII（<建立 X>、<輸入>）或 <file:line>；真實輸入如 <script> 不受影響
  matrix_rows=$(echo "$matrix_rows" | LC_ALL=C grep -vE '<([^>|]*[^ -~][^>|]*|file:line)>' || true)
  problems=""
  if ! grep -q '^### 核心旅程矩陣' "$task_md"; then
    problems="task.md 沒有「### 核心旅程矩陣」區塊"
  elif [ -z "$matrix_rows" ]; then
    problems="矩陣沒有任何已填的旅程列（模板佔位列不算）"
  else
    # 每條旅程（第 2 欄）都要同時有「正常」與「錯誤路徑」（第 3 欄）——只有建立成功＋刪除失敗不算
    pair_problems=$(echo "$matrix_rows" | awk -F'|' '
      { j=$3; t=$4; gsub(/^[ \t]+|[ \t]+$/, "", j); gsub(/^[ \t]+|[ \t]+$/, "", t)
        if (j == "") next
        seen[j]=1; if (t ~ /正常/) ok[j]=1; if (t ~ /錯誤路徑/) err[j]=1 }
      END { for (j in seen) { if (!ok[j]) printf "旅程「%s」缺「正常」列（真實輸入送出成功）；", j; if (!err[j]) printf "旅程「%s」缺「錯誤路徑」列（server 會拒絕的輸入，訊息顯示、輸入保留）；", j } }')
    [ -z "$pair_problems" ] || problems="$pair_problems"
    if echo "$matrix_rows" | grep -qE '⬜|❌'; then
      problems="${problems:+${problems}；}有 ⬜／❌ 列（未驗或未過）"
    fi
    bad_rows=$(echo "$matrix_rows" | grep -v '✅' || true)
    [ -z "$bad_rows" ] || problems="${problems:+${problems}；}有列缺 ✅（實際欄要有攔到的狀態碼）"
  fi
  if [ -n "$problems" ]; then
    gate_fail "pr-journey-matrix-missing" "$task_md" "$(cat <<EOF
❌ 核心旅程矩陣沒過：$problems
   verify 階段必須對每條「建立／編輯／刪除／送出」旅程：一列真實輸入送出成功、一列 server 拒絕的輸入失敗且訊息顯示；「實際」欄寫攔到的 HTTP 狀態碼。
   格式與輸入目錄見 .claude/skills/dev-task/references/journey-matrix.md
   任務真的沒有寫入路徑時，在 task.md「## 驗證」底下寫一行：核心旅程不適用：<具體原因>
   例外：DEV_TASK_SKIP_GATE="<原因>"（會留痕）
EOF
)"
  fi
fi

# --- 閘門 4：Deferred items 每項都要離開這台機器（子 issue 或明確待開卡）---
deferred=$(section_body "$task_md" '^## Deferred items' '^## ' | grep -E '^[[:space:]]*[-*] ' || true)
if [ -n "$deferred" ]; then
  unlinked=$(echo "$deferred" \
    | grep -viE '^[[:space:]]*[-*][[:space:]]*(none|無)[[:space:]]*$' \
    | grep -vE '#[0-9]+|/issues/[0-9]+|待開卡[：:][^<[:space:]]' || true)
  if [ -n "$unlinked" ]; then
    gate_fail "pr-deferred-unlinked" "$task_md" "$(cat <<EOF
❌ task.md「## Deferred items」有項目沒開子 issue、也沒寫明待開卡原因：
$(echo "$unlinked" | sed 's/^/   /')
   task.md 會在 cleanup 被刪，只留在 comment 裡的「之後再做」等於消失（#171 的「驗證紅框」就這樣變成 #188）。
   依 publish-tasks skill 在授權範圍開子 issue 後補 #<n>；沒有授權就寫「（待開卡：<原因>）」交人決定。
EOF
)"
  fi
fi

# --- 閘門 5：PR body 要帶「## 驗證證據」（CI pr-evidence-gate 讀的就是這段）---
body_text=""
# 先抓引號包住的路徑（可含空白），再抓裸路徑
body_file=$(echo "$cmd" | grep -oE -- '(--body-file|-F)([[:space:]]+|=)"[^"]+"' | head -1 | sed -E 's/^(--body-file|-F)([[:space:]]+|=)"//; s/"$//' || true)
[ -n "$body_file" ] || body_file=$(echo "$cmd" | grep -oE -- "(--body-file|-F)([[:space:]]+|=)'[^']+'" | head -1 | sed -E "s/^(--body-file|-F)([[:space:]]+|=)'//; s/'\$//" || true)
[ -n "$body_file" ] || body_file=$(echo "$cmd" | grep -oE -- '(--body-file|-F)([[:space:]]+|=)[^[:space:];&|]+' | head -1 | sed -E 's/^(--body-file|-F)([[:space:]]+|=)//' || true)
body_file_note=""
if [ -n "$body_file" ]; then
  # 指令字串裡的 $TASK／${TASK}／$ROOT 不會被展開，hook 自己代入
  body_file=$(printf '%s' "$body_file" | sed -e "s|\${TASK}|$task_dir|g" -e "s|\$TASK|$task_dir|g" -e "s|\${ROOT}|${task_dir%/worktrees/*}|g" -e "s|\$ROOT|${task_dir%/worktrees/*}|g" -e "s|^~|$HOME|")
  for base in "" "$cwd/" "$task_dir/"; do
    candidate="${base}${body_file}"
    if [ -f "$candidate" ]; then body_text=$(cat "$candidate"); break; fi
  done
  if [ -z "$body_text" ]; then
    body_text="$cmd"   # heredoc 寫檔在同一指令裡：內容還在 cmd 字串中
    body_file_note="（--body-file 指向的檔案找不到：${body_file}；改讀指令字串）"
  fi
else
  body_text="$cmd"                          # --body "..." 或 heredoc：內容就在指令裡
fi
evidence_section=$(printf '%s\n' "$body_text" | awk '/^## 驗證證據/{f=1; next} f && /^## /{exit} f')
if ! printf '%s\n' "$body_text" | grep -q '^## 驗證證據'; then
  gate_fail "pr-body-evidence-missing" "$task_md" "$(cat <<EOF
❌ PR body 缺「## 驗證證據」區塊${body_file_note}。需要：驗證報告連結 + 核心旅程矩陣摘要（或 task.md 那行「核心旅程不適用：<原因>」）。
   用 --body-file <notes/pr-body-<repo>.md>，範本見 dev-task SKILL.md Phase 4 步驟 6。
EOF
)"
elif ! printf '%s\n' "$evidence_section" | grep -qE 'https?://|核心旅程不適用[：:]'; then
  gate_fail "pr-body-evidence-missing" "$task_md" \
    "❌ PR body「## 驗證證據」裡沒有驗證報告連結（https://…），也沒有「核心旅程不適用：<原因>」聲明。"
fi

# --- 閘門 6：前端手寫驗證規則要能編譯、要對得到 server 規則（#188 根因）---
# 腳本住在 monorepo root；sub-repo 同步來的 hook 從任務資料夾往上找 root（<root>/worktrees/<task>），不依賴 HOOKS_DIR 位置
parity_script=""
for candidate in "${task_dir%/worktrees/*}/scripts/check-validation-parity.py" "$HOOKS_DIR/../../scripts/check-validation-parity.py"; do
  [ -f "$candidate" ] && { parity_script="$candidate"; break; }
done
if [ "$is_ui_repo" = 1 ] && [ -d "$task_dir/$repo_dir" ]; then
  if [ -z "$parity_script" ] || ! command -v python3 >/dev/null 2>&1; then
    echo "⚠️  找不到 scripts/check-validation-parity.py 或 python3，前端驗證規則對齊未檢查（記錄為 pr-fe-parity-unavailable）" >&2
    log_gate_event "pr-fe-parity-unavailable" "$task_dir/$repo_dir" "warn" "dev-task"
  else
  # base 由腳本自動判斷（remote HEAD → origin/dev → origin/main），不寫死 origin/dev
  parity_json=$(python3 "$parity_script" --repo "$task_dir/$repo_dir" --base auto --task-md "$task_md" --json 2>/dev/null || true)
  if [ -n "$parity_json" ]; then
    invalid=$(echo "$parity_json" | jq -r '.counts.INVALID // 0' 2>/dev/null || echo 0)
    unmatched=$(echo "$parity_json" | jq -r '.counts.UNMATCHED // 0' 2>/dev/null || echo 0)
    if [ "$invalid" != "0" ]; then
      detail=$(echo "$parity_json" | jq -r '.rules[] | select(.status=="INVALID") | "   \(.file):\(.line)  \(.source)  — \(.detail)"' 2>/dev/null || true)
      gate_fail "pr-fe-pattern-invalid" "$task_dir/$repo_dir" "$(cat <<EOF
❌ 前端 HTML pattern 以瀏覽器的 v flag 編不過，等於沒有前端驗證（#188 根因）：
$detail
   規則要與 server openapi pattern 同源；修完重跑 scripts/check-validation-parity.py --repo <f2e> --task-md task.md
EOF
)"
    fi
    if [ "$unmatched" != "0" ]; then
      echo "⚠️  前端有 $unmatched 條手寫驗證規則在 openapi.json 找不到對應（可能前後端擋的不一樣）。請在核心旅程矩陣填 BE 規則來源並用錯誤輸入實測；明細：python3 scripts/check-validation-parity.py --repo $task_dir/$repo_dir --task-md $task_md" >&2
      log_gate_event "pr-fe-rule-unmatched" "$task_dir/$repo_dir" "warn" "dev-task"
    fi
  fi
  fi
fi

# --- 閘門 7：「## 驗證」不能留未驗項目（#166：task.md 列了 6 頁「需要手動驗證（需 Google OAuth 登入）」照樣發 PR）---
verify_body=$(section_body "$task_md" '^## 驗證' '^## ')
unchecked=$(printf '%s\n' "$verify_body" | grep -E '^[[:space:]]*[-*] \[ \]' | grep -v '豁免[：:]' || true)
manual_rows=""
if printf '%s\n' "$verify_body" | grep -qE '需要手動驗證|待手動驗證'; then
  # 標題底下到下一個標題前的所有實質列都算：表格資料列（排除分隔列與表頭）或 bullet 清單列
  manual_rows=$(printf '%s\n' "$verify_body" | awk '
    /需要手動驗證|待手動驗證/ { f = 1; next }
    f && /^[[:space:]]*#/ { exit }
    f && /^[[:space:]]*\|/ && !/^[[:space:]]*\|[[:space:]|:-]*$/ && !/^[[:space:]]*\|[[:space:]]*(項目|頁面|路徑|route|Route)[[:space:]]*\|/ { print; next }
    f && /^[[:space:]]*[-*] / { print }
  ' || true)
fi
if [ -n "$unchecked" ] || [ -n "$manual_rows" ]; then
  gate_fail "pr-verify-unchecked" "$task_md" "$(cat <<EOF
❌ task.md「## 驗證」還有沒驗完的項目就要發 PR：
$(printf '%s\n' "$unchecked" "$manual_rows" | sed '/^$/d; s/^/   /')
   每一項不是驗掉（打勾 + 截圖），就是由使用者明確豁免：在該行尾加「（豁免：<使用者說的原因>）」。
   「需要登入才能看」不是豁免理由——用 dev-login 端點（browser-verify.md §3a），登入牆截圖不算證據。
EOF
)"
fi

# --- 閘門 8：UI repo 必須跑過版面探針（#233：settings 十五頁 w-screen 疊在 md:pl-[132px] 上，每頁多 132px，六個月沒人量到）---
if [ "$is_ui_repo" = 1 ]; then
  if grep -qE '^版面探針不適用[：:]' "$task_md"; then
    probe_na=$(grep -m1 -E '^版面探針不適用[：:]' "$task_md" | sed -E 's/^版面探針不適用[：:][[:space:]]*//')
    if [ -z "$probe_na" ] || echo "$probe_na" | grep -qE '^<.*>$'; then
      gate_fail "pr-layout-probe-missing" "$task_md" \
        "❌ task.md 寫了「版面探針不適用」但沒有具體原因。UI repo 的 diff 沒碰任何頁面／版面時才適用，要寫清楚（例如「只改 i18n 字串，無 tsx／css 變更」）"
    fi
    log_gate_event "pr-layout-probe-na" "$task_md" "pass" "dev-task"
  else
    probe_rows=$(section_body "$task_md" '^### 版面探針' '^(#|##|###) ' | grep -E '^\|' | grep -vE '^\|[[:space:]-]*\|' | grep -v '^| 寬度' || true)
    probe_problem=""
    if ! grep -q '^### 版面探針' "$task_md"; then
      probe_problem="task.md 沒有「### 版面探針」區塊"
    elif [ -z "$probe_rows" ]; then
      probe_problem="「### 版面探針」表是空的"
    elif printf '%s\n' "$probe_rows" | grep -q '❌'; then
      probe_problem="探針表還有 ❌：
$(printf '%s\n' "$probe_rows" | grep '❌' | cut -c1-160 | sed 's/^/   /')"
    fi
    if [ -n "$probe_problem" ]; then
      gate_fail "pr-layout-probe-missing" "$task_md" "$(cat <<EOF
❌ 版面探針沒過：$probe_problem
   在 ${task_dir}/${repo_dir}/apps/product（f2e）或 ${task_dir}/${repo_dir}（admin-ui）底下跑：
     node <daodao-root>/.claude/skills/dev-task/references/layout-probe.mjs --base http://localhost:<port> \\
       --routes <任務碰到的每條 route> --cookie "auth_token=<dev-login token>" --out $task_dir/evidence/verify-layout-probe
   把產出的 verify-layout-probe.md 貼進 task.md「## 驗證」底下；❌ 先修再重跑。
   diff 沒碰任何頁面／版面時，在「## 驗證」底下寫一行：版面探針不適用：<具體原因>
EOF
)"
    fi
  fi
fi

exit 0
