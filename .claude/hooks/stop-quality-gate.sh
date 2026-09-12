#!/usr/bin/env bash
# Stop hook (Layer 3): 任務結束時的交接品質清單
# 列出已變更檔案的就緒狀態、diff 統計、高風險分類
set -uo pipefail

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOKS_DIR/lib.sh"

PROJECT_ROOT="${CLAUDE_WORKING_DIRECTORY:-$(pwd)}"

# 找到 git root（可能在 worktree 內）
GIT_ROOT=$(cd "$PROJECT_ROOT" && git rev-parse --show-toplevel 2>/dev/null) || exit 0

cd "$GIT_ROOT"

# 取得 diff（staged + unstaged）
changed_files=$(git diff --name-only HEAD 2>/dev/null; git diff --cached --name-only 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)
changed_files=$(echo "$changed_files" | sort -u | grep -v '^$' || true)

[ -z "$changed_files" ] && exit 0

# === 1. Diff 統計 ===
diff_stat=$(git diff --stat HEAD 2>/dev/null || true)
staged_stat=$(git diff --cached --stat 2>/dev/null || true)

echo "📊 變更統計："
if [ -n "$diff_stat" ]; then
  echo "$diff_stat" | tail -1
fi
if [ -n "$staged_stat" ]; then
  echo "  (staged) $staged_stat" | tail -1
fi
echo ""

# === 2. 逐檔就緒狀態 ===
echo "📋 檔案就緒清單："
file_count=0
warn_count=0

while IFS= read -r f; do
  [ -z "$f" ] && continue
  file_count=$((file_count + 1))

  status="✅"
  notes=""

  # 檔案大小警告
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f" 2>/dev/null || echo 0)
    profile=$(detect_profile "$f")
    warn_threshold=400

    if [ -n "$profile" ] && [ -f "$PROFILES_DIR/${profile}.json" ]; then
      threshold=$(jq -r '.size.warnLines // 400' "$PROFILES_DIR/${profile}.json")
      warn_threshold=${threshold:-400}
    fi

    if [ "$lines" -gt "$warn_threshold" ] 2>/dev/null; then
      status="⚠️"
      notes="$lines 行（超過 ${warn_threshold} 行門檻）"
      warn_count=$((warn_count + 1))
    fi
  fi

  if [ -n "$notes" ]; then
    echo "  $status $f — $notes"
  else
    echo "  $status $f"
  fi
done <<< "$changed_files"

echo ""
echo "  共 $file_count 個檔案變更"
[ "$warn_count" -gt 0 ] && echo "  ⚠️  $warn_count 個檔案超過行數門檻"

# === 3. 高風險變更分類 ===
high_risk_file="$PROFILES_DIR/high-risk.json"
if [ -f "$high_risk_file" ]; then
  risk_found=false
  cat_count=$(jq '.categories | length' "$high_risk_file")

  for ((i=0; i<cat_count; i++)); do
    cat_pattern=$(jq -r ".categories[$i].pathPattern" "$high_risk_file")
    cat_label=$(jq -r ".categories[$i].label" "$high_risk_file")
    cat_note=$(jq -r ".categories[$i].reviewNote" "$high_risk_file")

    matched=$(echo "$changed_files" | grep -E "$cat_pattern" || true)
    if [ -n "$matched" ]; then
      if [ "$risk_found" = false ]; then
        echo ""
        echo "🚨 高風險變更偵測："
        risk_found=true
      fi
      match_count=$(echo "$matched" | wc -l | tr -d ' ')
      echo "  $cat_label ($match_count 檔) — $cat_note"
    fi
  done
fi

# === 4. 未 commit 提醒 ===
uncommitted=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$uncommitted" -gt 0 ]; then
  echo ""
  echo "📌 有 $uncommitted 個未 commit 的變更"
fi

# === 5. 未 push 提醒 ===
branch=$(git branch --show-current 2>/dev/null || true)
if [ -n "$branch" ]; then
  upstream=$(git rev-parse --abbrev-ref "$branch@{upstream}" 2>/dev/null || true)
  if [ -n "$upstream" ]; then
    ahead=$(git rev-list --count "$upstream..HEAD" 2>/dev/null || echo 0)
    if [ "$ahead" -gt 0 ]; then
      echo "📌 有 $ahead 個未 push 的 commit（$branch → $upstream）"
    fi
  else
    local_commits=$(git rev-list --count HEAD 2>/dev/null || echo 0)
    if [ "$local_commits" -gt 0 ]; then
      echo "📌 branch '$branch' 尚未設定 upstream（未 push）"
    fi
  fi
fi

echo ""

exit 0
