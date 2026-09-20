#!/usr/bin/env bash
# Session Start hook (Layer 1): 注入 worktree 狀態與開發 context
set -uo pipefail

PROJECT_ROOT="${CLAUDE_WORKING_DIRECTORY:-$(pwd)}"

echo "🏗️  daodao-guard v0.1.0"
echo ""

# === 1. 偵測工作位置 ===
GIT_ROOT=$(cd "$PROJECT_ROOT" && git rev-parse --show-toplevel 2>/dev/null) || true

if echo "$PROJECT_ROOT" | grep -q 'worktrees/'; then
  task_dir=$(echo "$PROJECT_ROOT" | grep -oE 'worktrees/[^/]+')
  task_md="$PROJECT_ROOT/task.md"
  if [ -z "$task_dir" ]; then
    task_md=$(find "$PROJECT_ROOT" -maxdepth 2 -name "task.md" 2>/dev/null | head -1)
  fi

  echo "📍 工作區：$task_dir"
  if [ -n "$task_md" ] && [ -f "$task_md" ]; then
    status=$(grep -m1 'Status:' "$task_md" 2>/dev/null | sed 's/.*Status:\s*//' || echo "unknown")
    echo "   狀態：$status"
  fi
else
  echo "📍 工作區：monorepo root"
fi

# === 2. 列出進行中的 worktrees ===
WORKTREES_DIR="$PROJECT_ROOT/worktrees"
if [ ! -d "$WORKTREES_DIR" ]; then
  # 可能在 worktree 裡面，往上找
  parent=$(dirname "$PROJECT_ROOT")
  if [ -d "$parent/worktrees" ]; then
    WORKTREES_DIR="$parent/worktrees"
  fi
fi

if [ -d "$WORKTREES_DIR" ]; then
  task_count=$(ls -d "$WORKTREES_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ')
  if [ "$task_count" -gt 0 ]; then
    echo ""
    echo "📂 進行中的任務 ($task_count)："
    for d in "$WORKTREES_DIR"/*/; do
      [ -d "$d" ] || continue
      name=$(basename "$d")
      tm="$d/task.md"
      if [ -f "$tm" ]; then
        st=$(grep -m1 'Status:' "$tm" 2>/dev/null | sed 's/.*Status:\s*//' || echo "?")
        echo "   $name → $st"
      else
        echo "   $name → (no task.md)"
      fi
    done
  fi
fi

# === 3. projects/ 子模組狀態 ===
PROJECTS_DIR="$PROJECT_ROOT/projects"
if [ -d "$PROJECTS_DIR" ]; then
  dirty_repos=""
  for repo_dir in "$PROJECTS_DIR"/*/; do
    [ -d "$repo_dir/.git" ] || [ -f "$repo_dir/.git" ] || continue
    repo_name=$(basename "$repo_dir")
    branch=$(cd "$repo_dir" && git branch --show-current 2>/dev/null || echo "?")
    is_dirty=$(cd "$repo_dir" && git status --porcelain 2>/dev/null | head -1)

    # 預期分支＝該 repo 的 default branch，不是一律 dev：worker 與 infra 的預設是 main，
    # 硬編成 dev 會讓它們每個 session 都被誤報，久了整段就被當背景噪音
    # （2026-09-20：infra 長期顯示 ⚠️ branch=main，其實完全正常）。
    expected=$(cd "$repo_dir" && git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
    if [ -n "$expected" ] && [ "$branch" != "$expected" ]; then
      # origin/HEAD 是本機快取，遠端改過預設分支就會過期（admin-ui 本機仍寫 main，實際是 dev）。
      # 只在不一致時付一次網路成本重抓，確認真的異常才提醒。
      (cd "$repo_dir" && git remote set-head origin -a >/dev/null 2>&1) || true
      expected=$(cd "$repo_dir" && git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
    fi
    [ -n "$expected" ] || expected="dev"

    if [ "$branch" != "$expected" ] || [ -n "$is_dirty" ]; then
      # 注意：全形括號緊接 $branch 會被 bash 併進變數名，一定要加大括號
      dirty_repos="$dirty_repos\n   ⚠️  ${repo_name}: branch=${branch}"
      # 只有分支真的不對才提預期值；相符時多印一個「（預期 dev）」只是噪音
      [ "$branch" != "$expected" ] && dirty_repos="${dirty_repos}（預期 ${expected}）"
      [ -n "$is_dirty" ] && dirty_repos="$dirty_repos (dirty)"
    fi
  done

  if [ -n "$dirty_repos" ]; then
    echo ""
    echo "⚠️  projects/ 異常狀態（預期＝各 repo 的 default branch）："
    echo -e "$dirty_repos"
  fi
fi

# === 4. Gate Ledger 摘要 ===
LEDGER_FILE="${HOME}/.cache/daodao-harness/gate-ledger.jsonl"
if [ -f "$LEDGER_FILE" ]; then
  today=$(date -u +"%Y-%m-%d")
  today_blocks=$(grep "$today" "$LEDGER_FILE" 2>/dev/null | grep '"block"' | wc -l | tr -d ' ')
  today_warns=$(grep "$today" "$LEDGER_FILE" 2>/dev/null | grep '"warn"' | wc -l | tr -d ' ')
  total=$(wc -l < "$LEDGER_FILE" | tr -d ' ')

  if [ "$today_blocks" -gt 0 ] || [ "$today_warns" -gt 0 ]; then
    echo ""
    echo "📈 今日 Gate 統計：$today_blocks blocks, $today_warns warns（累計 $total 筆）"
  fi
fi

# === 5. 卡住的共用設定同步 PR ===
# sync-claude-config 用 auto-merge：checks 紅的同步 PR 會靜靜留著，workflow run 卻是綠的。
# 2026-09-20 的教訓是「紅燈 job 一整天沒人看」，所以把訊號放在每次 session 都會經過的地方。
# 單一 search 查詢（head: 限定詞；標題會被 auto-pr-description 改寫，不能用標題比對）、
# 逾時即放棄、結果快取 3 小時；查不到就安靜跳過，絕不拖慢開場。
SYNC_CACHE="${HOME}/.cache/daodao-harness/stale-sync-prs"
if command -v gh >/dev/null 2>&1; then
  mkdir -p "$(dirname "$SYNC_CACHE")"
  cache_age=999999
  if [ -f "$SYNC_CACHE" ]; then
    cache_mtime=$(stat -f %m "$SYNC_CACHE" 2>/dev/null || stat -c %Y "$SYNC_CACHE" 2>/dev/null || echo 0)
    cache_age=$(( $(date +%s) - cache_mtime ))
  fi
  if [ "$cache_age" -gt 10800 ]; then
    # macOS 沒有 coreutils 的 timeout；有 gtimeout 就用，兩者都沒有就直接跑（gh 自己有網路逾時）
    TIMEOUT_CMD=""
    for t in timeout gtimeout; do command -v "$t" >/dev/null 2>&1 && TIMEOUT_CMD="$t 8" && break; done
    cutoff=$(date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d '24 hours ago' +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")
    if [ -n "$cutoff" ]; then
      # shellcheck disable=SC2086
      $TIMEOUT_CMD gh search prs --owner daodaoedu --state open "head:chore/sync-claude-config-" \
        --created "<$cutoff" --json repository,number,createdAt \
        --jq '.[] | "   \(.repository.nameWithOwner)#\(.number) 自 \(.createdAt[:10]) 未合"' \
        > "$SYNC_CACHE" 2>/dev/null || : > "$SYNC_CACHE"
    fi
  fi
  if [ -s "$SYNC_CACHE" ]; then
    echo ""
    echo "🔁 共用設定同步 PR 卡住超過 24 小時（checks 沒過，auto-merge 不會合）："
    cat "$SYNC_CACHE"
    echo "   查原因：gh pr checks <PR-URL>"
  fi
fi

echo ""

exit 0
