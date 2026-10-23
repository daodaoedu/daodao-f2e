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
#   XFILE_MAX_ITEMS / XFILE_ITEM_LINES / XFILE_SECTION_BYTES — 0a–0c 跨檔事實的上限
#     （每段最多幾條、每條最多幾行原始碼、每段最多幾 bytes）
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
# pack 總大小上限。原本 16000 給第 1–4 段；0a–0c 最多 3 × XFILE_SECTION_BYTES 排在最前面，
# 所以總額加 6000，第 1–4 段仍保有至少 16000。CI runner 的 context 上限是 24000 字元
#（run-review-batches.py），22000 bytes 一定在上限內。
PACK_BYTES="${PACK_BYTES:-22000}"
XFILE_MAX_ITEMS="${XFILE_MAX_ITEMS:-6}"          # 0a–0c 每段最多列幾條
XFILE_ITEM_LINES="${XFILE_ITEM_LINES:-6}"        # 每條最多附幾行原始碼
XFILE_SECTION_BYTES="${XFILE_SECTION_BYTES:-2000}" # 每段 bytes 上限

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
trap 'rm -f "$CHANGED_LIST" "$CHANGED_LIST".*' EXIT
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

# ── 3b. migration/schema diff 跨表引用但不在本次 diff 的表定義 ─────────
# 動機：cross-table 誤判（reviewer 只看得到 diff 裡的表，看不到 FK 指向的表）
# 屬結構性、可靠地從 REFERENCES 子句解析，涵蓋率不含自由文字註解提到的表名。
section_referenced_tables() {
  echo "## 3b. migration/schema diff 跨表引用的表定義（不在本次 diff 內）"
  echo

  if ! printf '%s\n' "$CHANGED_FILES" | grep -qE '(^|/)(schema|migrate/sql)/.*\.sql$'; then
    echo "（本次 diff 未觸及 schema/migration SQL，略過）"
    echo
    return 0
  fi

  local created referenced
  created="$(printf '%s\n' "$ADDED_LINES" \
    | grep -oiE 'CREATE TABLE( IF NOT EXISTS)? "[A-Za-z_][A-Za-z0-9_]*"' \
    | grep -oE '"[A-Za-z_][A-Za-z0-9_]*"$' | tr -d '"' | sort -u || true)"
  referenced="$(printf '%s\n' "$ADDED_LINES" \
    | grep -oiE 'REFERENCES "[A-Za-z_][A-Za-z0-9_]*"' \
    | grep -oE '"[A-Za-z_][A-Za-z0-9_]*"$' | tr -d '"' | sort -u || true)"

  local tbl any=0 def_file
  while IFS= read -r tbl; do
    [ -z "$tbl" ] && continue
    printf '%s\n' "$created" | grep -qxF "$tbl" && continue
    def_file="$(search "CREATE TABLE( IF NOT EXISTS)? \\\"${tbl}\\\"" \
      | awk -F: '$1 ~ /(^|\/)schema\// { print $1 }' | sort -u | awk 'NR==1')"
    [ -z "$def_file" ] && continue
    printf -- '- `%s`（定義於 `%s`）：\n' "$tbl" "$def_file"
    awk -v needle="\"$tbl\"" '
      /CREATE TABLE/ && index($0, needle) > 0 { on=1 }
      on { print "      " $0 }
      on && /^\);/ { exit }
    ' "$def_file" | awk 'NR<=25{print} NR==26{print "      …（截斷）"}'
    any=1
  done <<EOF
$referenced
EOF
  [ "$any" = 0 ] && echo "（無跨表引用需要補充，或引用的表本次已在 diff 內建立）"
  echo
}

# ── 0a–0c. absent-claim 防線：reviewer 會在 diff 外找、但常找不到的脈絡 ──
# 動機（daodao#168）：誤判知識庫 A 類 absent-claim——模型對 diff 外的程式碼斷言
# 「缺少驗證／找不到替代實作」（FP-0001 route 已掛 authenticate、FP-0010 已有
# validate(...QuerySchema)、FP-0004 刪掉的邏輯搬到同 PR 新檔）。這三段預先把答案放進 pack。
# 三段都只用 git／rg 的確定性結果；每段 ≤ XFILE_MAX_ITEMS 條、每條 ≤ XFILE_ITEM_LINES 行、
# 每段 ≤ XFILE_SECTION_BYTES（以完整行截斷）。排在第 1 段之前，大 PR 的 caller 清單
# 吃滿總額時也不會被截掉；總額已為這三段加寬，第 1–4 段的空間不變。
# 列出的是 route 檔與 schema 檔的「同名」位置，不保證就是本次 handler 的唯一註冊點。

# cap_section：以完整行控制單段 bytes，超過時補一行說明（不從 UTF-8 中間切）
cap_section() {
  LC_ALL=C awk -v cap="$XFILE_SECTION_BYTES" '
    { bytes = length($0) + 1 }
    !full && used + bytes <= cap { print; used += bytes; next }
    !full { full = 1; print "- …（本段超過 " cap " bytes，其餘略）" }
  '
}

# 名稱太泛、查了只會帶來雜訊的識別字
XFILE_STOPWORDS='^(id|ids|data|type|name|value|values|error|errors|user|users|req|res|next|result|items|item|key|keys|status|message|params|query|body|options|config|props|children|className|title|description|createdAt|updatedAt|React|useState|useEffect|useCallback|useMemo|useRef|useTranslations|Button|cn|z|toast)$'

# changed_handlers：diff 改到的 controller handler 名稱（以 head 版檔案定位每個變更行所在的 handler）
changed_handlers() {
  local f lines
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    git cat-file -e "$HEAD_REF:$f" 2>/dev/null || continue
    # shellcheck disable=SC2086
    lines="$(git diff -U0 $DIFF_RANGE -- "$f" | awk '
      /^@@/ {
        split($3, a, ","); start = substr(a[1], 2) + 0
        n = (a[2] == "" ? 1 : a[2] + 0)
        for (i = 0; i < n; i++) print start + i
      }')"
    [ -z "$lines" ] && continue
    printf '%s\n' "$lines" > "$CHANGED_LIST.lines"
    # hint：controller 檔名去掉 controller 與分隔符（admin-challenge.controller.ts → adminchallenge），
    # 用來優先挑 route 裡 adminChallengeController.<handler> 這種註冊，避開別的 controller 的同名 handler
    local hint
    hint="$(basename "$f" | sed -E 's/[._-]?controllers?\..*$//' | tr -cd 'A-Za-z0-9' | tr 'A-Z' 'a-z')"
    git show "$HEAD_REF:$f" | awk -v linesfile="$CHANGED_LIST.lines" -v hint="$hint" '
      BEGIN { while ((getline l < linesfile) > 0) want[l] = 1 }
      {
        line = $0; name = ""
        if (line ~ /^export (default )?(async )?function [A-Za-z_]/) {
          t = line; sub(/^export (default )?(async )?function /, "", t); sub(/[^A-Za-z0-9_].*/, "", t); name = t
        } else if (line ~ /^export (const|let) [A-Za-z_][A-Za-z0-9_]* *=/) {
          t = line; sub(/^export (const|let) /, "", t); sub(/[^A-Za-z0-9_].*/, "", t); name = t
        } else if (line ~ /^  (public |private |protected |static |async |readonly )*[A-Za-z_][A-Za-z0-9_]* *(=|\()/) {
          t = line; sub(/^  (public |private |protected |static |async |readonly )*/, "", t); sub(/[^A-Za-z0-9_].*/, "", t)
          if (t !~ /^(if|for|while|switch|return|constructor|super|catch|await|const|let|var|throw|try|else|new|this|next)$/) name = t
        }
        if (name != "") cur = name
        if ((NR in want) && cur != "") print cur "\t" hint
      }'
  done <<EOF
$(printf '%s\n' "$CHANGED_FILES" | grep -iE 'controller[^/]*\.(ts|js|mjs|cjs)$' || true)
EOF
  rm -f "$CHANGED_LIST.lines"
}

section_route_middleware() {
  echo "## 0a. 改動的 controller handler 在 route 上掛的 middleware"
  echo
  local handlers
  handlers="$(changed_handlers | awk -F'\t' '!seen[$1]++ && length($1) >= 3' \
    | awk -F'\t' -v stop="$XFILE_STOPWORDS" '$1 !~ stop' || true)"
  if [ -z "$handlers" ]; then
    echo "（本次 diff 未改到 controller handler，略過）"
    echo
    return 0
  fi
  local h hint any=0 count=0 hits preferred hit file ln
  while IFS="$(printf '\t')" read -r h hint; do
    [ -z "$h" ] && continue
    [ "$count" -ge "$XFILE_MAX_ITEMS" ] && break
    hits="$(search "\\b${h}\\b" | awk -F: '$1 ~ /route/ && $3 !~ /^[[:space:]]*import /')"
    [ -z "$hits" ] && continue
    # 同名 handler 散在多個 controller 時，只留 route 那行引用了「本 controller」的註冊
    if [ -n "$hint" ]; then
      preferred="$(printf '%s\n' "$hits" | awk -v hint="$hint" '{
        s = tolower($0); gsub(/[^a-z0-9]/, "", s); if (index(s, hint "controller") > 0) print }')"
      [ -n "$preferred" ] && hits="$preferred"
    fi
    hits="$(printf '%s\n' "$hits" | awk 'NR <= 2')"
    while IFS= read -r hit; do
      file="${hit%%:*}"; file="${file#./}"
      ln="$(printf '%s' "$hit" | cut -d: -f2)"
      printf -- '- `%s` → `%s:%s`\n' "$h" "$file" "$ln"
      # 從 handler 那行往上找 router.<method>( 的起點，整段 route 註冊照原文附上
      awk -v target="$ln" -v cap="$XFILE_ITEM_LINES" '
        { line[NR] = $0 }
        END {
          s = target
          for (i = target; i >= target - 10 && i >= 1; i--) {
            if (line[i] ~ /[A-Za-z_]+\.(get|post|put|patch|delete|all|use|route)\(/) { s = i; break }
          }
          for (i = s; i <= target && i < s + cap; i++) print "      " line[i]
          if (target >= s + cap) { print "      …"; print "      " line[target] }
        }' "$file"
      local uses
      uses="$(grep -nE '^[[:space:]]*[A-Za-z_]+\.use\(' "$file" 2>/dev/null | awk 'NR <= 3' || true)"
      if [ -n "$uses" ]; then
        printf '%s\n' "$uses" | sed -E 's/^([0-9]+):[[:space:]]*/  - 同檔全域 middleware（行 \1）：/'
      fi
      any=1
    done <<EOF
$hits
EOF
    count=$((count + 1))
  done <<EOF
$handlers
EOF
  [ "$any" = 0 ] && echo "（改動的 handler 沒有在 route 檔找到註冊點）"
  echo
}

# ── 0b. 新增的 DTO／型別欄位對應的 zod schema 定義 ──────────────────────
section_dto_schema() {
  echo "## 0b. 新增的 DTO 欄位對應的 zod schema 定義"
  echo
  local dto_files fields
  dto_files="$(printf '%s\n' "$CHANGED_FILES" \
    | grep -E '((^|/)(dto|dtos|types|interfaces)/.*\.|\.(dto|types?|interfaces?)\.|(^|/)(dtos?|types?|interfaces?)\.)(ts|js)$' || true)"
  if [ -z "$dto_files" ]; then
    echo "（本次 diff 未改到 DTO／型別檔，略過）"
    echo
    return 0
  fi
  local f
  fields="$(while IFS= read -r f; do
      [ -z "$f" ] && continue
      # shellcheck disable=SC2086
      git diff $DIFF_RANGE -- "$f" | grep '^+' | grep -v '^+++' \
        | grep -oE '^\+[[:space:]]+(readonly[[:space:]]+)?[A-Za-z_][A-Za-z0-9_]*\??:' \
        | sed -E 's/^\+[[:space:]]+(readonly[[:space:]]+)?//; s/\??:$//' || true
    done <<EOF
$dto_files
EOF
  )"
  fields="$(printf '%s\n' "$fields" | awk 'NF && !seen[$0]++' | grep -vE "$XFILE_STOPWORDS" | awk 'length($0) >= 3' || true)"
  local field any=0 count=0 hits hit file ln
  while IFS= read -r field; do
    [ -z "$field" ] && continue
    [ "$count" -ge "$XFILE_MAX_ITEMS" ] && break
    # validator／schema 檔優先，其次才是 route 檔裡的 inline schema
    hits="$(search "\\b${field}[[:space:]]*:[[:space:]]*z\\b" \
      | awk -F: '{ print ($1 ~ /(validat|schema)/ ? 0 : 1) "\t" $0 }' | sort -t"$(printf '\t')" -k1,1n -s | cut -f2- | awk 'NR <= 2')"
    [ -z "$hits" ] && continue
    while IFS= read -r hit; do
      file="${hit%%:*}"; file="${file#./}"
      ln="$(printf '%s' "$hit" | cut -d: -f2)"
      printf -- '- `%s` → `%s:%s`\n' "$field" "$file" "$ln"
      # 附上定義行與後面串接的 .optional()／.or(z.literal(''))／.coerce 等鏈式呼叫
      awk -v start="$ln" -v cap="$XFILE_ITEM_LINES" '
        NR == start { print "      " $0; n = 1; next }
        NR > start && n > 0 && n < cap && $0 ~ /^[[:space:]]*\./ { print "      " $0; n++; next }
        NR > start && n > 0 { exit }
      ' "$file"
      any=1
    done <<EOF
$hits
EOF
    count=$((count + 1))
  done <<EOF
$fields
EOF
  [ "$any" = 0 ] && echo "（新增欄位沒有找到同名 zod schema 定義）"
  echo
}

# ── 0c. 被刪除（或幾乎整檔刪除）的檔案，在同 PR 新增檔案裡的替代者 ──────
# 判定：檔案被刪，或刪除 ≥ 40 行且刪除量 ≥ 4 倍新增量（例：f2e #952 manual/page.tsx 改成只渲染 wizard）。
# 替代者：同 PR 新增、且用到被刪部分 import／export 的相同 symbol 的檔案，依重疊數排序。
section_deleted_replacements() {
  echo "## 0c. 被刪除檔案在同 PR 新增檔案裡的替代者"
  echo
  local removed added
  # --no-renames：搬家後改寫的檔案要算成「刪除＋新增」才找得到替代者；
  # core.quotePath=false：中文路徑不被加引號，後面的 git show 才拿得到
  # shellcheck disable=SC2086
  removed="$(git -c core.quotePath=false diff --no-renames --numstat $DIFF_RANGE -- | awk -F'\t' '
    $1 != "-" && $2 >= 40 && $2 >= 4 * $1 { print $3 }' | sort -u)"
  # shellcheck disable=SC2086
  removed="$(printf '%s\n%s\n' "$removed" "$(git -c core.quotePath=false diff --no-renames --name-only --diff-filter=D $DIFF_RANGE -- | sort -u)" \
    | awk 'NF && !seen[$0]++' | grep -E '\.(ts|tsx|js|jsx|mjs|cjs|vue|py)$' || true)"
  # shellcheck disable=SC2086
  added="$(git -c core.quotePath=false diff --no-renames --name-only --diff-filter=A $DIFF_RANGE -- | grep -E '\.(ts|tsx|js|jsx|mjs|cjs|vue|py)$' \
    | grep -vE '(^|/)(__tests__|tests?)/|\.(test|spec)\.' || true)"
  if [ -z "$removed" ] || [ -z "$added" ]; then
    echo "（本次 diff 沒有被刪除的程式檔，或沒有新增檔案可當替代者，略過）"
    echo
    return 0
  fi
  local f any=0 count=0 symbols ranked
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    [ "$count" -ge "$XFILE_MAX_ITEMS" ] && break
    # 舊版 import／export 的 symbol，扣掉 head 版還留著的
    symbols="$(
      {
        git show "$MB:$f" 2>/dev/null | extract_symbols | sort -u > "$CHANGED_LIST.old"
        git show "$HEAD_REF:$f" 2>/dev/null | extract_symbols | sort -u > "$CHANGED_LIST.new"
        comm -23 "$CHANGED_LIST.old" "$CHANGED_LIST.new"
      } | grep -vE "$XFILE_STOPWORDS" | awk 'length($0) >= 4' || true
    )"
    rm -f "$CHANGED_LIST.old" "$CHANGED_LIST.new"
    [ -z "$symbols" ] && continue
    printf '%s\n' "$symbols" > "$CHANGED_LIST.syms"
    ranked="$(while IFS= read -r a; do
        [ -z "$a" ] && continue
        git show "$HEAD_REF:$a" 2>/dev/null | grep -owFf "$CHANGED_LIST.syms" | sort -u \
          | awk -v a="$a" '{ s = s (n++ ? ", " : "") $0 } END { if (n >= 2) print n "\t" a "\t" s }'
      done <<EOF
$added
EOF
    )"
    rm -f "$CHANGED_LIST.syms"
    ranked="$(printf '%s\n' "$ranked" | awk 'NF' | sort -t"$(printf '\t')" -k1,1nr -k2,2 | awk 'NR <= 3')"
    [ -z "$ranked" ] && continue
    if git cat-file -e "$HEAD_REF:$f" 2>/dev/null; then
      printf -- '- `%s`（大部分內容被刪）可能的替代者：\n' "$f"
    else
      printf -- '- `%s`（整檔刪除）可能的替代者：\n' "$f"
    fi
    printf '%s\n' "$ranked" | awk -F'\t' -v cap=6 '{
      n = split($3, s, ", "); list = ""
      for (i = 1; i <= n && i <= cap; i++) list = list (i > 1 ? ", " : "") s[i]
      if (n > cap) list = list ", …"
      print "  - `" $2 "`：共用 " $1 " 個 symbol（" list "）"
    }'
    any=1
    count=$((count + 1))
  done <<EOF
$removed
EOF
  [ "$any" = 0 ] && echo "（被刪除的檔案在新增檔案裡沒有找到共用 symbol 的替代者）"
  echo
}

# extract_symbols：stdin 原始碼 → import 進來與 export 出去的識別字（每行一個）
extract_symbols() {
  awk '
    # import 敘述可能跨多行：收到 from "…" 或 side-effect import 為止，只留 from 之前的綁定名稱
    /^[[:space:]]*import[[:space:]]/ { inimp = 1; buf = "" }
    inimp {
      buf = buf " " $0
      if (buf ~ /[[:space:]]from[[:space:]]/ || buf ~ /^[[:space:]]*import[[:space:]]*["\047]/) {
        sub(/[[:space:]]from[[:space:]].*/, "", buf); sub(/^[[:space:]]*import[[:space:]]*/, "", buf)
        print buf; inimp = 0
      }
      next
    }
    # export 宣告只取被宣告的名稱；export { a, b } 取大括號內
    /^export[[:space:]]+(default[[:space:]]+)?(async[[:space:]]+)?(function|const|let|var|class|interface|type|enum)[[:space:]]/ {
      t = $0
      sub(/^export[[:space:]]+(default[[:space:]]+)?(async[[:space:]]+)?(function|const|let|var|class|interface|type|enum)[[:space:]]+\**/, "", t)
      sub(/[^A-Za-z0-9_].*/, "", t); print t; next
    }
    /^export[[:space:]]*\{/ { t = $0; sub(/^export[[:space:]]*\{/, "", t); sub(/\}.*/, "", t); print t }
  ' | sed -E 's/[[:space:]]as[[:space:]]+[A-Za-z_][A-Za-z0-9_]*//g' \
    | grep -oE '[A-Za-z_][A-Za-z0-9_]*' \
    | grep -vE '^(import|export|default|from|const|let|var|function|class|interface|enum|async|type|as)$' || true
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
  echo "> 0a–0c 是從 head tree 確定性查到的跨檔事實：斷言「缺少驗證／找不到實作／功能被刪」前先對照。"
  echo
  section_route_middleware | cap_section
  section_dto_schema | cap_section
  section_deleted_replacements | cap_section
  section_symbol_callers
  section_importers
  section_call_patterns
  section_referenced_tables
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
