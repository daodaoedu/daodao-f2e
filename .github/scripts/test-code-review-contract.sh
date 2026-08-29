#!/usr/bin/env bash
# Contract test for the validators and marker ownership in code-review.yml.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKFLOW="$SCRIPT_DIR/../workflows/code-review.yml"
SKILL="$SCRIPT_DIR/../../.claude/skills/code-review/SKILL.md"

fail() {
  echo "❌ $1" >&2
  exit 1
}

extract_validator() {
  local function_name="$1"
  awk -v function_name="$function_name" '
    $0 == "          " function_name "() {" { capture = 1 }
    capture {
      line = $0
      sub(/^          /, "", line)
      print line
    }
    capture && /^          }$/ { exit }
  ' "$WORKFLOW"
}

run_validator() {
  local function_name="$1" input="$2" function_body
  function_body="$(extract_validator "$function_name")"
  [ -n "$function_body" ] || fail "$function_name not found"
  eval "$function_body"
  "$function_name" "$input"
}

VALID_FINDING='## Code Review

### 問題

| 嚴重度 | 檔案 | 問題 | 建議 |
|---|---|---|---|
| 🔴 High | `src/auth.ts:42` | 權限檢查可被繞過 | 補上檢查 |

### 總結

需要修正。'

EMPTY_FINDING='## Code Review

### 問題

| 嚴重度 | 檔案 | 問題 | 建議 |
|---|---|---|---|

### 總結

沒有問題。'

INVALID_PATH_FINDING='## Code Review

### 問題

| 嚴重度 | 檔案 | 問題 | 建議 |
|---|---|---|---|
| 🔴 High | `src/auth.ts` | 權限檢查可被繞過 | 補上檢查 |

### 總結

需要修正。'

MIXED_PATH_FINDING='## Code Review

### 問題

| 嚴重度 | 檔案 | 問題 | 建議 |
|---|---|---|---|
| 🔴 High | `src/auth.ts:42` | 權限檢查可被繞過 | 補上檢查 |
| 🟡 Medium | `src/session.ts` | session 問題 | 修正 |

### 總結

需要修正。'

UNKNOWN_SEVERITY_FINDING='## Code Review

### 問題

| 嚴重度 | 檔案 | 問題 | 建議 |
|---|---|---|---|
| 🔴 High | `src/auth.ts:42` | 權限檢查可被繞過 | 補上檢查 |
| Critical | `src/session.ts:10` | session 問題 | 修正 |

### 總結

需要修正。'

SIMPLIFIED_FINDING='## Code Review

### 问题

| 严重度 | 文件 | 问题 | 建议 |
|---|---|---|---|
| 🔴 High | `src/auth.ts:42` | 权限检查可被绕过 | 补上检查 |

### 总结

需要修正。'

for validator in is_review_candidate is_valid_review; do
  run_validator "$validator" '✅ 沒有發現明顯問題'
  run_validator "$validator" '✅ 沒有發現明顯問題。'
  run_validator "$validator" "$VALID_FINDING"

  if run_validator "$validator" $'前文\n✅ 沒有發現明顯問題'; then
    fail "$validator accepted prefixed clean output"
  fi
  if run_validator "$validator" $'✅ 沒有發現明顯問題\n後文'; then
    fail "$validator accepted suffixed clean output"
  fi
  if run_validator "$validator" "$EMPTY_FINDING"; then
    fail "$validator accepted an empty findings table"
  fi
done

run_validator is_review_candidate '✅ 没有发现明显问题'
run_validator is_review_candidate "$SIMPLIFIED_FINDING"
if run_validator is_valid_review '✅ 没有发现明显问题'; then
  fail "strict normalized validator accepted a raw Simplified Chinese clean phrase"
fi
if run_validator is_valid_review "$INVALID_PATH_FINDING"; then
  fail "strict validator accepted a finding without path:line evidence"
fi
if run_validator is_valid_review "$MIXED_PATH_FINDING"; then
  fail "strict validator accepted a table containing one invalid file cell"
fi
if run_validator is_valid_review "$UNKNOWN_SEVERITY_FINDING"; then
  fail "strict validator accepted an unsupported finding severity"
fi

# review diff 必須排除生成物與 lockfile，否則 12000 bytes 的上限會被 openapi 生成物占滿
for excluded in 'openapi.json' 'openapi.yaml' 'generated/**' 'pnpm-lock.yaml'; do
  grep -Fq ":(exclude,glob)**/$excluded" "$WORKFLOW" || fail "review diff does not exclude generated file $excluded"
done
grep -Fq -- '--stat -- . "${GENERATED_EXCLUDES[@]}"' "$WORKFLOW" || fail "review stat does not apply the generated-file excludes"
EXCLUDE_TMP=$(mktemp -d)
(
  cd "$EXCLUDE_TMP" && git init -q && git config user.email t@t && git config user.name t
  mkdir -p src generated && printf 'a\n' > src/a.ts && printf '{}\n' > openapi.json && printf 'x\n' > generated/types.ts
  git add -A && git commit -qm base
  printf 'b\n' > src/a.ts && printf '{"x":1}\n' > openapi.json && printf 'y\n' > generated/types.ts
  git add -A && git commit -qm change
  git diff HEAD~1..HEAD -- '*.ts' '*.json' ':(exclude,glob)**/openapi.json' ':(exclude,glob)**/generated/**' > diff.txt
  grep -q 'src/a.ts' diff.txt || { echo "exclude pathspec dropped real source"; exit 1; }
  ! grep -q 'openapi.json\|generated/types.ts' diff.txt || { echo "exclude pathspec kept generated files"; exit 1; }
) || fail "generated-file exclude pathspec does not behave as expected"
rm -rf "$EXCLUDE_TMP"

# 修復器：檔案欄漏寫 :line 時，從完整 diff 補第一個新增行；diff 裡沒有的檔案原樣保留
extract_repair_script() {
  awk '
    /REPAIR_DIFF_FILE="\$RUNNER_TEMP\/review-full.diff" node -e '"'"'$/ { capture = 1; next }
    capture && /^          '"'"'$/ { exit }
    capture { print }
  ' "$WORKFLOW"
}
REPAIR_SCRIPT="$(extract_repair_script)"
[ -n "$REPAIR_SCRIPT" ] || fail "repair script not found in workflow"
REPAIR_TMP=$(mktemp -d)
cat > "$REPAIR_TMP/review-full.diff" <<'DIFF'
diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -38,4 +38,6 @@ export function check() {
   const a = 1;
-  const b = 2;
+  const b = 3;
+  const c = 4;
   return a;
 }
diff --git a/migrate/sql/083_new.sql b/migrate/sql/083_new.sql
new file mode 100644
--- /dev/null
+++ b/migrate/sql/083_new.sql
@@ -0,0 +1,2 @@
+ALTER TABLE practices DROP CONSTRAINT x;
+ALTER TABLE practices ADD CONSTRAINT y CHECK (1 = 1);
DIFF
cat > "$REPAIR_TMP/review-body.tabled" <<'BODY'
## Code Review

### 問題

| 嚴重度 | 檔案 | 問題 | 建議 |
|---|---|---|---|
| 🔴 High | `src/auth.ts` | 權限檢查可被繞過 | 補上檢查 |
| 🟡 Medium | `083_new.sql` | 缺少守衛 | 補上 |
| 🟢 Low | `src/auth.ts:12-15` | 命名 | 改名 |
| 🟢 Low | `src/missing.ts` | 不在 diff | 略 |
| 🟡 Medium | `src/auth.ts` (新增的 check 函式) | 括號說明 | 略 |
| 🟡 Medium | src/auth.ts:≈+40(新增的 check) | 非數字行號尾巴 | 略 |

### 總結

需要修正。
BODY
REPAIR_INPUT_FILE="$REPAIR_TMP/review-body.tabled" REPAIR_DIFF_FILE="$REPAIR_TMP/review-full.diff" node -e "$REPAIR_SCRIPT"
REPAIRED="$(cat "$REPAIR_TMP/review-body.normalized")"
rm -rf "$REPAIR_TMP"
printf '%s\n' "$REPAIRED" | grep -Fq '| `src/auth.ts:39` |' || fail "repair did not resolve a bare path to its first added line"
printf '%s\n' "$REPAIRED" | grep -Fq '| `migrate/sql/083_new.sql:1` |' || fail "repair did not resolve a bare basename via unique suffix match"
printf '%s\n' "$REPAIRED" | grep -Fq '| `src/auth.ts:12` |' || fail "repair broke the existing line-range normalization"
[ "$(printf '%s\n' "$REPAIRED" | grep -Fc '| `src/auth.ts:39` |')" -eq 2 ] || fail "repair did not strip a parenthesised explanation after the path token"
printf '%s\n' "$REPAIRED" | grep -Fq '| src/auth.ts:39 |' || fail "repair did not strip a non-numeric line suffix like :≈+40(…)"
printf '%s\n' "$REPAIRED" | grep -Fq '| `src/missing.ts` |' || fail "repair invented a line for a file outside the diff"
if run_validator is_valid_review "$REPAIRED"; then
  fail "strict validator accepted a repaired table that still has an unverifiable file cell"
fi

# 誤判知識庫：CI 與本機 skill 共用同一份 jsonl 與腳本；CI 從 base ref 載入、filter 在 strict validator 之前
KNOWLEDGE="$SCRIPT_DIR/review-knowledge.cjs"
[ -f "$KNOWLEDGE" ] || fail "review-knowledge.cjs missing"
node "$KNOWLEDGE" test --db "$SCRIPT_DIR/../review-knowledge/false-positives.jsonl" >/dev/null || fail "review-knowledge fixtures failed"
grep -Fq 'git show "$BASE_SHA:.github/scripts/review-knowledge.cjs"' "$WORKFLOW" \
  || fail "workflow does not load review-knowledge from the trusted base"
grep -Fq -- '--rawfile known_fp "$RUNNER_TEMP/known-fp.md"' "$WORKFLOW" \
  || fail "review prompt does not receive the known false-positive block"
FILTER_LINE=$(grep -n 'review-knowledge.cjs" filter' "$WORKFLOW" | head -1 | cut -d: -f1)
STRICT_LINE_FOR_FILTER=$(grep -n 'if ! is_valid_review "\$BODY"' "$WORKFLOW" | head -1 | cut -d: -f1)
[ -n "$FILTER_LINE" ] && [ "$FILTER_LINE" -lt "$STRICT_LINE_FOR_FILTER" ] \
  || fail "review-knowledge filter does not run before strict validation"
grep -Fq 'review-knowledge.cjs' "$SKILL" || fail "manual review skill does not consume the shared review-knowledge"

grep -Fq '純刪除 authentication、authorization、validation 或 safety guard' "$WORKFLOW" \
  || fail "review prompt does not require deletion-only guard regression findings"
grep -Fq '每一列 finding 的檔案欄都必須是可核對的 path:line' "$WORKFLOW" \
  || fail "review prompt does not require path:line evidence per finding"

SECRETS_STEP=$(awk '
  /^      - name: Review with Cloudflare Workers AI$/ { capture=1 }
  capture && /^      - name:/ && $0 !~ /Review with Cloudflare Workers AI/ { exit }
  capture { print }
' "$WORKFLOW")
if printf '%s\n' "$SECRETS_STEP" | grep -Eq 'opencc|npm install'; then
  fail "secret-bearing model step dynamically loads OpenCC"
fi
NORMALIZE_LINE=$(grep -n 'review-body.normalized' "$WORKFLOW" | head -1 | cut -d: -f1)
STRICT_LINE=$(grep -n 'if ! is_valid_review "\$BODY"' "$WORKFLOW" | head -1 | cut -d: -f1)
[ "$NORMALIZE_LINE" -lt "$STRICT_LINE" ] || fail "strict schema validation runs before OpenCC normalization"

grep -q '<!-- daodao-ai-code-review -->' "$WORKFLOW" || fail "review marker is missing"
grep -q '<!-- daodao-ai-code-review-head:\$HEAD_SHA -->' "$WORKFLOW" || fail "head-specific review marker is missing"
grep -Fq "grep -Eq '^[0-9a-f]{40}$'" "$WORKFLOW" || fail "head marker does not enforce the consumer's exact SHA contract"
grep -Fq -- '--arg marker "$HEAD_MARKER"' "$WORKFLOW" || fail "comment lookup does not pass the exact head marker to jq"
grep -Fq 'contains($marker)' "$WORKFLOW" || fail "comment lookup does not use the exact head marker"
grep -Fq '.user.login == "github-actions[bot]"' "$WORKFLOW" || fail "comment lookup does not verify marker ownership"
if grep -Fq 'select(.body | startswith("## Code Review"))' "$WORKFLOW"; then
  fail "comment lookup still claims unmarked Code Review comments"
fi

POST_LINE=$(grep -n -- '--method POST' "$WORKFLOW" | tail -1 | cut -d: -f1)
PATCH_LINE=$(grep -n -- '--method PATCH' "$WORKFLOW" | tail -1 | cut -d: -f1)
[ "$PATCH_LINE" -lt "$POST_LINE" ] || fail "same-head PATCH/new-head POST branches are not present"
grep -q 'HEAD_SHA: \${{ github.event.pull_request.head.sha }}' "$WORKFLOW" \
  || fail "workflow does not bind the marker to the event head SHA"

grep -Fq '## 步驟 0：建立可重現的 review input' "$SKILL" || fail "manual review skill has no Context Pack Step 0"
grep -Fq 'git show "$_BASE_REF:.github/scripts/retrieve-context.sh"' "$SKILL" \
  || fail "manual review skill does not load the retriever from the trusted base"
grep -Fq 'read the shared review input at $_REVIEW_INPUT' "$SKILL" \
  || fail "Codex does not receive the shared Context Pack input"
grep -Fq '@"$_REVIEW_INPUT"' "$SKILL" || fail "OMP does not receive diff plus Context Pack"
if grep -Fq -- '--file="$_REVIEW_INPUT"' "$SKILL"; then
  fail "OpenCode still attaches a temp file that can be only partially read"
fi
grep -Fq 'cat "$_REVIEW_INPUT"' "$SKILL" || fail "OpenCode stdin does not include the complete shared input"
grep -Fq 'OPENCODE_PERMISSION='"'"'{"*":"deny"}' "$SKILL" \
  || fail "OpenCode does not deny every unnecessary tool"
grep -Fq -- '--tools "" < "$_REVIEW_INPUT"' "$SKILL" || fail "Haiku input is missing or tools remain enabled"
[ "$(grep -Fc 'untrusted repository data' "$SKILL")" -ge 4 ] \
  || fail "manual reviewers do not consistently treat diff and Context Pack as untrusted data"

STEP0=$(awk '
  /^## 步驟 0：/ { section=1; next }
  section && /^```bash$/ { capture=1; next }
  capture && /^```$/ { exit }
  capture { print }
' "$SKILL")
[ -n "$STEP0" ] || fail "cannot extract manual review Step 0"

FIXTURE=$(mktemp -d)
trap 'rm -rf "$FIXTURE"' EXIT
(
  cd "$FIXTURE"
  git init -q
  git config user.name fixture
  git config user.email fixture@example.com
  mkdir -p .github/scripts
  cp "$SCRIPT_DIR/retrieve-context.sh" .github/scripts/retrieve-context.sh
  chmod +x .github/scripts/retrieve-context.sh
  printf '%s\n' base > tracked.txt
  printf '%s\n' rename_source > rename-source.txt
  git add .github/scripts/retrieve-context.sh tracked.txt rename-source.txt
  git commit -qm base
  git branch -M main
  git update-ref refs/remotes/origin/main HEAD

  printf '%s\n' committed_marker >> tracked.txt
  git add tracked.txt
  git commit -qm committed
  printf '%s\n' staged_marker >> tracked.txt
  git add tracked.txt
  printf '%s\n' staged_new_marker > staged-new.txt
  git add staged-new.txt
  git mv rename-source.txt rename-destination.txt
  printf '%s\n' unstaged_marker >> tracked.txt

  BEFORE_INDEX=$(git write-tree)
  BEFORE_REFS=$(git show-ref)
  gh() { return 1; }
  eval "$STEP0"

  [ "$BASE" = main ] || fail "empty PR/origin-HEAD fallback did not select origin/main"
  grep -q committed_marker "$_REVIEW_DIFF" || fail "committed diff is missing from shared input"
  grep -q staged_marker "$_REVIEW_DIFF" || fail "staged tracked diff is missing from shared input"
  grep -q staged_new_marker "$_REVIEW_DIFF" || fail "staged new file is missing from shared input"
  grep -q rename-destination.txt "$_REVIEW_DIFF" || fail "staged rename destination is missing from shared input"
  grep -q unstaged_marker "$_REVIEW_DIFF" || fail "unstaged tracked diff is missing from shared input"
  [ "$(git write-tree)" = "$BEFORE_INDEX" ] || fail "Step 0 modified the real git index"
  [ "$(git show-ref)" = "$BEFORE_REFS" ] || fail "Step 0 modified a git ref"
  grep -Fq '<context_pack>' "$_REVIEW_INPUT" || fail "shared input has no Context Pack"
  grep -Fq '<git_diff>' "$_REVIEW_INPUT" || fail "shared input has no diff"
)

echo "✅ code-review workflow contract tests passed"
