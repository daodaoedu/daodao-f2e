#!/usr/bin/env bash
# Contract test for the validators and marker ownership in code-review.yml.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKFLOW="$SCRIPT_DIR/../workflows/code-review.yml"
SKILL="$SCRIPT_DIR/../../plugin/skills/code-review/SKILL.md"
# 引擎指令拆到 references/；字句檢查看 SKILL.md 加 references 的合併內容，步驟 0 仍從 SKILL.md 抽
SKILL_ALL=$(mktemp)
cat "$SKILL" "$SCRIPT_DIR/../../plugin/skills/code-review/references/"*.md > "$SKILL_ALL" 2>/dev/null

fail() {
  echo "❌ $1" >&2
  exit 1
}

# Executable schema/batch/coverage behavior lives in the shared Python tests.
# This contract guards the privileged workflow wiring, not implementation text.
for script in build-review-batches.py run-review-batches.py; do
  grep -Fq "\$BASE_SHA:.github/scripts/$script" "$WORKFLOW" \
    || fail "workflow does not load $script from the trusted base"
done
if grep -Eq 'cap=12000|head -c|Diff truncated' "$WORKFLOW"; then
  fail "workflow still silently truncates the global diff"
fi
if grep -Eq 'python3 +\.github/scripts/(build|run)-review-batches' "$WORKFLOW"; then
  fail "workflow executes PR checkout review runtime"
fi
grep -Fq 'actions/upload-artifact@v4' "$WORKFLOW" || fail "review coverage artifacts are missing"
grep -Fq 'daodao-ai-code-review-head:' "$WORKFLOW" || fail "head-specific review marker is missing"
grep -Fq '.user.login == "github-actions[bot]"' "$WORKFLOW" || fail "comment lookup does not verify marker ownership"
grep -Fq 'contains($marker)' "$WORKFLOW" || fail "comment lookup does not bind the exact head marker"
PATCH_LINE=$(grep -n -- '--method PATCH' "$WORKFLOW" | tail -1 | cut -d: -f1)
POST_LINE=$(grep -n -- '--method POST' "$WORKFLOW" | tail -1 | cut -d: -f1)
[ -n "$PATCH_LINE" ] && [ -n "$POST_LINE" ] && [ "$PATCH_LINE" -lt "$POST_LINE" ] || fail "same-head PATCH/new-head POST branches are not present"
grep -Fq 'HEAD_SHA: ${{ github.event.pull_request.head.sha }}' "$WORKFLOW" || fail "workflow is not bound to event head SHA"
# Bootstrap is deliberately incomplete; missing trusted code must never fall back
# to PR checkout code while provider credentials are available.
python3 - "$WORKFLOW" <<'PYCONTRACT'
import re
import sys
from pathlib import Path
workflow = Path(sys.argv[1]).read_text()
def step(name):
    match = re.search(r"^      - name: " + re.escape(name) + r"\n(.*?)(?=^      - |\Z)", workflow, re.M | re.S)
    assert match, f"missing workflow step: {name}"
    return match.group(1)
bootstrap = step("Load trusted review runtime")
assert 'trusted_runtime_missing' in bootstrap and '\"complete\":false' in bootstrap, "bootstrap must report incomplete when trusted runtime is missing"
assert 'available=false' in bootstrap and 'available=$available' in bootstrap, "bootstrap availability must propagate to later steps"
assert 'if [ "$available" != true ]' in bootstrap, "missing trusted runtime must produce an explicit notice"
provider = step("Review bounded batches with Workers AI")
assert "if: steps.runtime.outputs.available == 'true'" in provider, "provider secrets step must require trusted runtime availability"
assert 'python3 -I "$RUNNER_TEMP/review-runtime/run-review-batches.py"' in provider, "provider step must execute extracted trusted runtime"
assert '$GITHUB_WORKSPACE/.github/scripts' not in provider and '$HEAD_SHA:.github/scripts' not in workflow, "PR runtime must not execute with provider secrets"
assert 'persist-credentials: false' in workflow, "checkout credentials must not persist alongside untrusted PR data"
assert 'python3 -I "$RUNNER_TEMP/review-runtime/build-review-batches.py"' in workflow, "planner must isolate Python imports from PR checkout"
post = step("Post coverage-aware review snapshot")
assert "python3 -I - <<'PY'" in post, "secret-bearing inline Python must isolate PR imports"
# A PR-controlled pathlib.py/json.py must never execute during trusted review.
import os
import subprocess
import tempfile
with tempfile.TemporaryDirectory() as fixture:
    root = Path(fixture)
    marker = root / 'malicious-import'
    poison = "open(" + repr(str(marker)) + ", 'w').write('executed')\nraise RuntimeError('PR module executed')\n"
    (root / 'pathlib.py').write_text(poison)
    (root / 'json.py').write_text(poison)
    env = dict(os.environ, PYTHONPATH=str(root))
    result = subprocess.run([sys.executable, '-I', '-c', 'import pathlib,json; print(json.dumps(str(pathlib.Path.cwd())))'], cwd=root, env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert not marker.exists(), "isolated Python imported a PR-controlled module"

# Execute the actual workflow presentation code, rather than a mirrored helper.
import json
match = re.search(r"python3 -I - <<'PY'\n(.*?)^          PY$", post, re.M | re.S)
assert match, "post inline Python is missing"
inline = '\n'.join(line[10:] if line.startswith('          ') else line for line in match.group(1).splitlines())
with tempfile.TemporaryDirectory() as fixture:
    root = Path(fixture)
    output = root / 'review-output'
    output.mkdir()
    head = 'a' * 40
    url = 'https://github.com/daodaoedu/daodao/actions/runs/1234'
    env = dict(os.environ, RUNNER_TEMP=str(root), HEAD_SHA=head, REVIEW_RUN_URL=url)
    oversized = '## Code Review\n\n' + ('完整證據 coverage. ' * 7000)
    original = output / 'review-body.md'
    original.write_text(oversized)
    (output / 'status.json').write_text(json.dumps({'complete': False, 'reviewed_paths': ['a.py'], 'unreviewed': ['b.py'], 'findings': []}))
    result = subprocess.run([sys.executable, '-I', '-'], input=inline, env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    comment = (output / 'review-comment-body.md').read_text()
    assert len(comment) < 50000, "oversized comment exceeds presentation budget"
    assert 'Review 未完成' in comment and url in comment, "oversized incomplete coverage must retain notice and artifact link"
    assert f'<!-- daodao-ai-code-review-head:{head} -->' in comment, "summary lost exact head marker"
    assert original.read_text() == oversized, "presentation cap destroyed full artifact report"
    normal = '## Code Review\n\nSmall review report.\n'
    original.write_text(normal)
    result = subprocess.run([sys.executable, '-I', '-'], input=inline, env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    comment = (output / 'review-comment-body.md').read_text()
    assert 'Small review report.' in comment and f'<!-- daodao-ai-code-review-head:{head} -->' in comment
    assert original.read_text() == normal, "normal presentation overwrote original artifact"

PYCONTRACT
# Historical examples remain prompt context; CI must not erase/downgrade
# structured findings using the former textual Markdown row filter.
grep -Fq 'prompt-block --db' "$WORKFLOW" || fail "CI lost historical false-positive prompt context"
if grep -Fq 'filter --db' "$WORKFLOW"; then
  fail "CI must not use the old Markdown row filter with structured findings"
fi
DECISION_DOC="$SCRIPT_DIR/../../docs/automation/complete-ci-review.md"
if [ -f "$DECISION_DOC" ]; then
  grep -Fq '新 CI 刻意不再跑舊 Markdown `filter`' "$DECISION_DOC" || fail "CI filter removal decision is undocumented"
  grep -Fq '全部刪掉後會改成「沒有發現明顯問題」' "$DECISION_DOC" || fail "filter removal must explain false-clean risk"
  grep -Fq 'manual review 的既有 knowledge 流程保持不變' "$DECISION_DOC" || fail "decision must distinguish CI from manual review"
fi
KNOWLEDGE="$SCRIPT_DIR/review-knowledge.cjs"
node "$KNOWLEDGE" test --db "$SCRIPT_DIR/../review-knowledge/false-positives.jsonl" >/dev/null || fail "review knowledge fixtures failed"
for test in test_review_batches.py test_review_runner.py; do
  [ -f "$SCRIPT_DIR/__tests__/$test" ] || fail "review regression suite missing: $test"
done
python3 -m unittest discover -s "$SCRIPT_DIR/__tests__" -p 'test_review_*.py' -v

if [ -f "$SKILL" ]; then
grep -Fq 'review-knowledge.cjs' "$SKILL_ALL" || fail "manual skill lost the shared false-positive knowledge"
grep -Fq '## 步驟 0：建立可重現的 review input' "$SKILL_ALL" || fail "manual review skill has no Context Pack Step 0"
grep -Fq 'git show "$_BASE_REF:.github/scripts/retrieve-context.sh"' "$SKILL_ALL" \
  || fail "manual review skill does not load the retriever from the trusted base"
grep -Fq 'read the shared review input at $_REVIEW_INPUT' "$SKILL_ALL" \
  || fail "Codex does not receive the shared Context Pack input"
grep -Fq '@"$_REVIEW_INPUT"' "$SKILL_ALL" || fail "OMP does not receive diff plus Context Pack"
if grep -Fq -- '--file="$_REVIEW_INPUT"' "$SKILL_ALL"; then
  fail "OpenCode still attaches a temp file that can be only partially read"
fi
grep -Fq 'cat "$_REVIEW_INPUT"' "$SKILL_ALL" || fail "OpenCode stdin does not include the complete shared input"
grep -Fq 'OPENCODE_PERMISSION='"'"'{"*":"deny"}' "$SKILL_ALL" \
  || fail "OpenCode does not deny every unnecessary tool"
grep -Fq -- '--tools "" < "$_REVIEW_INPUT"' "$SKILL_ALL" || fail "Haiku input is missing or tools remain enabled"
# 步驟 6.5 的誤判過濾與 findings 整合讀 $_REVIEW_TMP_DIR/<engine>.txt；任何引擎沒存檔，它的結果就會被靜靜略過
grep -Fq -- '--tools "" < "$_REVIEW_INPUT" > "$_REVIEW_TMP_DIR/claude.txt"' "$SKILL_ALL" \
  || fail "Claude reviewer output is not saved for the knowledge-base filter"
for engine in codex omp opencode; do
  grep -Fq "\$_REVIEW_TMP_DIR/$engine.txt" "$SKILL_ALL" || fail "$engine reviewer output is not saved"
done
[ "$(grep -Fc 'untrusted repository data' "$SKILL_ALL")" -ge 4 ] \
  || fail "manual reviewers do not consistently treat diff and Context Pack as untrusted data"

STEP0=$(awk '
  /^## 步驟 0：/ { section=1; next }
  section && /^```bash$/ { capture=1; next }
  capture && /^```$/ { exit }
  capture { print }
' "$SKILL")
[ -n "$STEP0" ] || fail "cannot extract manual review Step 0"

FIXTURE=$(mktemp -d)
trap 'rm -rf "$FIXTURE" "$SKILL_ALL"' EXIT
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

fi

echo "✅ code-review workflow contract tests passed"
