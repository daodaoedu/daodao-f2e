#!/usr/bin/env bash
# 把 workflow 產生的變更交付出去：目標是受保護分支就開 PR，其餘直接 push。
#
# 為什麼：dev／prod 已由 ruleset「Protect branches」保護，workflow 直推會被拒；
# 而 GitHub 不接受把 GitHub Actions 加成 ruleset bypass actor
# （422: Actor GitHub Actions integration must be part of the ruleset source or owner organization），
# 所以自動產生的變更一律改走 PR。feat/** 這類未受保護的分支維持直推，避免為了一次 token 重生就開一張 PR。
#
# 用法：commit-changes.sh <commit-message> <branch-slug> <path...>
#
# 環境變數：
#   GH_TOKEN             必填（開 PR 用）。需為能觸發 CI 的 token：GITHUB_TOKEN 開的 PR 不會觸發
#                        pull_request workflow，required checks 永遠不出現，PR 就合不進去。
#   TARGET_REF           目標分支，預設 GITHUB_REF_NAME
#   PROTECTED_BRANCHES   空白分隔，預設 "dev prod main"
#   GITHUB_RUN_ID        併入 PR 分支名，預設 local
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "用法: commit-changes.sh <commit-message> <branch-slug> <path...>" >&2
  exit 2
fi

MSG="$1"
SLUG="$2"
shift 2

TARGET="${TARGET_REF:-${GITHUB_REF_NAME:-}}"
if [ -z "$TARGET" ]; then
  echo "::error::TARGET_REF／GITHUB_REF_NAME 都是空的，無法判斷目標分支" >&2
  exit 2
fi

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

git add -- "$@"
if git diff --cached --quiet; then
  echo "沒有變更，結束"
  exit 0
fi

protected=false
for b in ${PROTECTED_BRANCHES:-dev prod main}; do
  [ "$b" = "$TARGET" ] && protected=true && break
done

if [ "$protected" = false ]; then
  git commit -m "$MSG"
  git push origin "HEAD:$TARGET"
  echo "✅ 直接推到未受保護分支 $TARGET"
  exit 0
fi

BRANCH="chore/${SLUG}-${GITHUB_RUN_ID:-local}"
git checkout -b "$BRANCH"
git commit -m "$MSG"
git push origin "$BRANCH"

# 每次 run 產生的都是「當下來源 vs 目標分支」的完整差異，新 PR 一定涵蓋舊 PR 未合的內容；
# 舊的留著只會堆積（同 daodao sync-claude-config 的處理）。
gh pr list --state open --json number,headRefName \
  --jq ".[] | select(.headRefName | startswith(\"chore/${SLUG}-\")) | .number" \
  | while read -r n; do
      gh pr close "$n" --delete-branch \
        --comment "由較新的 run ${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-} 取代，自動關閉。" \
        && echo "closed superseded PR #$n"
    done

PR_URL=$(gh pr create \
  --base "$TARGET" \
  --head "$BRANCH" \
  --title "$(printf '%s' "$MSG" | head -1)" \
  --body "$(cat <<EOF
自動產生的變更，由 ${GITHUB_WORKFLOW:-workflow} 於 ${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-} 產出。

目標分支 \`$TARGET\` 受 ruleset 保護，無法直推，故改以 PR 交付。內容為機器產生，請確認 diff 只含預期的生成物後再合併。

## 驗證證據

核心旅程不適用：機器產生的生成物同步，無使用者旅程；正確性由本 PR 的 CI（type check／lint／test）驗證。
EOF
)")
echo "✅ 已開 PR：$PR_URL"
