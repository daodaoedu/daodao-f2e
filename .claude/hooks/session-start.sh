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

    if [ "$branch" != "dev" ] || [ -n "$is_dirty" ]; then
      dirty_repos="$dirty_repos\n   ⚠️  $repo_name: branch=$branch"
      [ -n "$is_dirty" ] && dirty_repos="$dirty_repos (dirty)"
    fi
  done

  if [ -n "$dirty_repos" ]; then
    echo ""
    echo "⚠️  projects/ 異常狀態（預期全在 dev）："
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

echo ""

exit 0
