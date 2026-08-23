#!/usr/bin/env bash
# retrieve-context.sh — deterministic context pack for AI code review / implementation
#
# 依「Context Pack 實戰筆記」設計：在 review/實作 prompt 前，把與本次 diff 相關
# 但不在 diff 裡的東西打包成 markdown（retriever 是 rg/git/gh，沒有模型）。
#
# Usage:
#   retrieve-context.sh <base_ref> <head_ref> [out_file]
#     base/head 可為 branch、SHA；內部一律先取 merge-base 再做兩點 diff
#     out_file 省略時寫到 stdout
#
# Env（皆可選）:
#   GH_REPO   owner/name — 有設且 gh 可用時，才產出「進行中的工作」的 open PR 交集
#   CURRENT_PR_NUMBER — CI review 中排除目前 PR，避免把自己誤報成 in-flight 衝突
#   MAX_HITS / MAX_FILES / PER_FILE_LINES / PACK_BYTES — 噪音門檻覆寫
#
# 已內建的坑（來源：筆記第五節）：
#   - 用 git merge-base 取真正的比較基準，兩點 diff（不用 base...head 對稱差）
#   - 所有可能無結果的查詢 || true（rg 無命中 exit 1 會在 set -e 下靜默斷掉）
#   - 任何截斷前先 sort（rg 平行輸出順序不確定，CI 與本機才會一致）
#   - 只用 GNU/BSD 皆可的參數（無 xargs -a、無 sed \s）
set -euo pipefail

BASE_REF="${1:?usage: retrieve-context.sh <base_ref> <head_ref> [out_file]}"
HEAD_REF="${2:?usage: retrieve-context.sh <base_ref> <head_ref> [out_file]}"
OUT_FILE="${3:-}"

MAX_HITS="${MAX_HITS:-60}"        # 單一 pattern 命中數超過 → 壓成一行摘要
MAX_FILES="${MAX_FILES:-15}"      # 單一 pattern 分散檔數超過 → 壓成一行摘要
PER_FILE_LINES="${PER_FILE_LINES:-3}"  # 每檔最多列幾行，避免單檔吃光預算
PACK_BYTES="${PACK_BYTES:-16000}" # pack 總大小上限

MB="$(git merge-base "$BASE_REF" "$HEAD_REF" 2>/dev/null || true)"
if [ -z "$MB" ]; then
  # shallow clone 沒有 merge-base：退回直接用 base（呼叫端應先 fetch merge-base）
  MB="$BASE_REF"
fi

DIFF_RANGE="$MB $HEAD_REF"
# shellcheck disable=SC2086
CHANGED_FILES="$(git diff --name-only $DIFF_RANGE -- | sort)"
# shellcheck disable=SC2086
ADDED_LINES="$(git diff $DIFF_RANGE -- | grep '^+' | grep -v '^+++' || true)"
# shellcheck disable=SC2086
HUNK_HEADERS="$(git diff $DIFF_RANGE -- | grep '^@@' || true)"

SEARCH_EXCLUDES=(-g '!node_modules' -g '!dist' -g '!build' -g '!.next' -g '!coverage' -g '!*.lock' -g '!pnpm-lock.yaml' -g '!*.min.*' -g '!*.map' -g '!migrations/' -g '!locale' -g '!*.po')

have_rg=0
command -v rg >/dev/null 2>&1 && have_rg=1

# search <pattern> → "path:line:text"，已 sort，永不失敗
# 搜的是工作樹（呼叫端保證已 checkout head），rg 缺席時退回 git grep
search() {
  if [ "$have_rg" = 1 ]; then
    rg -n --no-heading "${SEARCH_EXCLUDES[@]}" -e "$1" . 2>/dev/null | sort || true
  else
    git grep -n -E "$1" -- '.' ':!node_modules' ':!dist' ':!*.lock' 2>/dev/null | sort || true
  fi
}

# 過濾掉 diff 內的檔案（pack 只收 diff 外的位置）
# 變更清單走暫存檔——awk -v 塞多行字串在 BSD awk 會直接報錯
CHANGED_LIST="$(mktemp)"
trap 'rm -f "$CHANGED_LIST"' EXIT
printf '%s\n' "$CHANGED_FILES" > "$CHANGED_LIST"
outside_diff() {
  awk -F: -v listfile="$CHANGED_LIST" '
    BEGIN { while ((getline line < listfile) > 0) if (line != "") changed[line] = 1 }
    { f = $1; sub(/^\.\//, "", f); if (!(f in changed)) print }
  '
}

# 分級摘要：命中太多 → 一行「數量 + 為什麼不列」；否則每檔最多 PER_FILE_LINES 行
render_hits() { # $1 = label
  local hits label="$1"
  hits="$(cat)"
  [ -z "$hits" ] && return 0
  local total files
  total="$(printf '%s\n' "$hits" | wc -l | tr -d ' ')"
  files="$(printf '%s\n' "$hits" | cut -d: -f1 | sort -u | wc -l | tr -d ' ')"
  if [ "$total" -gt "$MAX_HITS" ] || [ "$files" -gt "$MAX_FILES" ]; then
    printf -- '- ⚠ `%s`：%s 處（%s 檔）— 泛用 pattern，僅計數不逐一列出\n' "$label" "$total" "$files"
    return 0
  fi
  printf -- '- ⚠ `%s`（%s 處 / %s 檔）\n' "$label" "$total" "$files"
  printf '%s\n' "$hits" | awk -F: -v cap="$PER_FILE_LINES" '
    { count[$1]++ }
    count[$1] <= cap { print "  - " $0 }
    count[$1] == cap + 1 { print "  - " $1 "：其餘 " "省略" }
  ' | awk 'NR <= 100 { print }'
}

# ── 1. 改動的 symbol 與其 caller ────────────────────────────────────────
collect_symbols() {
  {
    # + 行的新定義：TS/JS function/class/const、Python def/class
    printf '%s\n' "$ADDED_LINES" \
      | grep -oE '(function|class|interface|def) +[A-Za-z_][A-Za-z0-9_]+' \
      | awk '{print $2}' || true
    printf '%s\n' "$ADDED_LINES" \
      | grep -oE '(const|let) +[A-Za-z_][A-Za-z0-9_]+ *= *(async +)?\(' \
      | awk '{print $2}' || true
    # hunk header：改了內容但簽名不在 diff 的函式（最便宜的精確答案）
    printf '%s\n' "$HUNK_HEADERS" \
      | sed -E 's/^@@[^@]*@@ *//' \
      | grep -oE '[A-Za-z_][A-Za-z0-9_]+ *\(' \
      | sed -E 's/ *\($//' | sed -E 's/\($//' || true
    # hunk header 的 arrow function／assignment：名字在 = 左邊（const foo = async (…)）
    printf '%s\n' "$HUNK_HEADERS" \
      | sed -E 's/^@@[^@]*@@ *//' \
      | grep -oE '(const|let|var) +[A-Za-z_][A-Za-z0-9_]+ *=' \
      | grep -oE '[A-Za-z_][A-Za-z0-9_]+ *=$' | sed -E 's/ *=$//' || true
    # + 行 new 出來的類別：同一個 error/domain class 在其他地方怎麼用
    printf '%s\n' "$ADDED_LINES" \
      | grep -oE 'new +[A-Z][A-Za-z0-9_]+\(' \
      | sed -E 's/^new +//; s/\($//' || true
  } | grep -vE '^(if|for|while|switch|return|function|class|def|async|await|new|catch|constructor|describe|it|test|expect|Date|Number|String|Boolean|Object|Array|Promise|Error|Record|Partial|Omit|Pick)$' \
    | awk 'length($0) >= 4' | sort -u
}

section_symbol_callers() {
  local sym
  echo "## 1. 改動的 symbol 在 diff 外的引用（caller）"
  echo
  local any=0
  while IFS= read -r sym; do
    [ -z "$sym" ] && continue
    local out
    out="$(search "\\b${sym}\\b" | outside_diff | render_hits "$sym")"
    if [ -n "$out" ]; then printf '%s\n' "$out"; any=1; fi
  done <<EOF
$(collect_symbols | awk 'NR <= 20 { print }')
EOF
  [ "$any" = 0 ] && echo "（無）"
  echo
}

# ── 1b. 被改檔案的 importer ─────────────────────────────────────────────
section_importers() {
  echo "## 1b. 被改檔案的 importer"
  echo
  local f any=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    local base name out=""
    base="$(basename "$f")"
    name="${base%.*}"
    case "$f" in
      *.ts|*.tsx|*.js|*.jsx|*.vue|*.mjs)
        [ "$name" = "index" ] && name="$(basename "$(dirname "$f")")"
        out="$(search "from ['\\\"][^'\\\"]*/${name}(\\.[a-z]+)?['\\\"]" | outside_diff | render_hits "import …/${name}")"
        # PascalCase 元件：JSX/SFC 以 <Tag 被引用，不是函式名
        if printf '%s' "$name" | grep -qE '^[A-Z]'; then
          out="${out}
$(search "<${name}[ />]" | outside_diff | render_hits "<${name}>")"
        fi
        ;;
      *.py)
        local mod mod_path
        mod_path="${f%.py}"
        # monorepo root 的子專案目錄含連字號，不是合法 Python module；import 從 src 起算。
        case "$mod_path" in
          daodao-*/src/*) mod_path="${mod_path#*/}" ;;
        esac
        mod="$(printf '%s' "$mod_path" | tr '/' '.')"
        out="$(search "(import|from) +${mod//./\\.}\\b" | outside_diff | render_hits "import ${mod}")"
        ;;
    esac
    out="$(printf '%s\n' "$out" | grep -v '^$' || true)"
    if [ -n "$out" ]; then printf '%s\n' "$out"; any=1; fi
  done <<EOF
$CHANGED_FILES
EOF
  [ "$any" = 0 ] && echo "（無）"
  echo
}

# ── 2. diff 碰到的呼叫模式在 repo 其他地方的出現點 ─────────────────────
section_call_patterns() {
  echo "## 2. diff 觸及的呼叫模式，在 repo 其他地方的出現點"
  echo
  local pat any=0
  while IFS= read -r pat; do
    [ -z "$pat" ] && continue
    local out
    out="$(search "$(printf '%s' "$pat" | sed -E 's/[].[^$*\\()+?{}|]/\\&/g')" | outside_diff | render_hits "$pat")"
    if [ -n "$out" ]; then printf '%s\n' "$out"; any=1; fi
  done <<EOF
$(printf '%s\n' "$ADDED_LINES" \
    | grep -oE '[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]+){1,3}\(' \
    | grep -vE '^(console|Math|JSON|Object|Array|String|Number|Promise|expect|this|self|props|res|req|process|Date)\b' \
    | sort | uniq -c | sort -rn | awk 'NR <= 8 {print $2}')
EOF
  [ "$any" = 0 ] && echo "（無）"
  echo
}

# ── 3. 同檔案進行中的工作 ──────────────────────────────────────────────
section_inflight() {
  echo "## 3. 同檔案進行中的工作"
  echo
  # base 上近 21 天的 commit（純 git，不需 token）
  local f recent any=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    recent="$(git log --since='21 days ago' --oneline "$MB" -- "$f" 2>/dev/null | awk 'NR <= 3 { print }' || true)"
    if [ -n "$recent" ]; then
      printf -- '- `%s` 近 21 天的 commit：\n' "$f"
      printf '%s\n' "$recent" | sed 's/^/  - /'
      any=1
    fi
  done <<EOF
$CHANGED_FILES
EOF
  # open PR 檔案交集（需要 gh + GH_REPO）
  if [ -n "${GH_REPO:-}" ] && command -v gh >/dev/null 2>&1; then
    local prs
    prs="$(gh pr list --repo "$GH_REPO" --state open --limit 100 --json number,title,files \
      --jq '.[] | .number as $n | .title as $t | .files[].path as $p | "\($p)\t#\($n) \($t)"' 2>/dev/null | sort || true)"
    if printf '%s' "${CURRENT_PR_NUMBER:-}" | grep -qE '^[0-9]+$'; then
      prs="$(printf '%s\n' "$prs" | awk -F'\t' -v current="#$CURRENT_PR_NUMBER " '$2 !~ "^" current' || true)"
    fi
    if [ -n "$prs" ]; then
      local hot
      while IFS= read -r f; do
        [ -z "$f" ] && continue
        hot="$(printf '%s\n' "$prs" | awk -F'\t' -v f="$f" '$1 == f {print $2}' | sort -u)"
        [ -z "$hot" ] && continue
        local n
        n="$(printf '%s\n' "$hot" | wc -l | tr -d ' ')"
        if [ "$n" -ge 4 ]; then
          printf -- '- ⚠ `%s` 是 hotspot：%s 個 open PR 同時在動（僅計數）\n' "$f" "$n"
        else
          printf -- '- ⚠ `%s` 也被 open PR 動到：\n' "$f"
          printf '%s\n' "$hot" | sed 's/^/  - /'
        fi
        any=1
      done <<EOF
$CHANGED_FILES
EOF
    fi
  else
    echo "（未設 GH_REPO / 無 gh，略過 open PR 交集）"
  fi
  [ "$any" = 0 ] && echo "（無）"
  echo
}

# ── 4. 精簡 repo map ───────────────────────────────────────────────────
section_repo_map() {
  echo "## 4. 精簡 repo map"
  echo
  local d
  for d in $(git ls-tree -d --name-only "$HEAD_REF" 2>/dev/null | awk 'NR <= 15 { print }'); do
    case "$d" in node_modules|dist|build|coverage|.github) continue ;; esac
    printf -- '- `%s/`：%s 檔\n' "$d" "$(git ls-files "$d" | wc -l | tr -d ' ')"
  done
  echo
}

# ── 組裝 ───────────────────────────────────────────────────────────────
build_pack() {
  echo "# Context Pack（deterministic，由 retrieve-context.sh 產生）"
  echo
  echo "比較基準：\`$(git rev-parse --short "$MB" 2>/dev/null || echo "$MB")\` → \`$(git rev-parse --short "$HEAD_REF" 2>/dev/null || echo "$HEAD_REF")\`"
  echo "變更檔案 $(printf '%s\n' "$CHANGED_FILES" | grep -c . || true) 個。"
  echo
  echo "> Reviewer 規則：對下列每個 ⚠ 位置判斷「需不需要同樣的修改」。"
  echo "> 同缺陷、PR 沒提 → BLOCKING「Incomplete scope」。"
  echo
  section_symbol_callers
  section_importers
  section_call_patterns
  section_inflight
  section_repo_map
}

# 以完整行控制 byte budget，避免 head -c 從 UTF-8 中文或 Markdown 行中間切斷。
PACK="$(build_pack | LC_ALL=C awk -v cap="$PACK_BYTES" '
  { bytes = length($0) + 1 }
  !full && used + bytes <= cap { print; used += bytes; next }
  { full = 1 }
')"

if [ -n "$OUT_FILE" ]; then
  printf '%s\n' "$PACK" > "$OUT_FILE"
  echo "context pack → $OUT_FILE ($(printf '%s' "$PACK" | wc -c | tr -d ' ') bytes)" >&2
else
  printf '%s\n' "$PACK"
fi
