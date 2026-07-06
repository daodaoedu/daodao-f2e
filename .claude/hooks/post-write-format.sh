#!/usr/bin/env bash
# PostToolUse hook（Write|Edit）：寫檔後自動格式化該檔案。
# 正本在 daodao monorepo .claude/shared/hooks/，由 sync.sh 同步——不要直接改副本。
#
# 格式化指令來自 .claude/repo.json 的 formatFile（{file} 佔位符）。
# 沒有設定 formatFile 的 repo 一律跳過。
# 格式化失敗 → exit 2（stderr 回饋給模型，讓它知道要處理，而不是默默吞掉）。
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[ -n "$FILE" ] && [ -f "$FILE" ] || exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REPO_JSON="${ROOT}/.claude/repo.json"
[ -f "$REPO_JSON" ] || exit 0

CMD=$(jq -r '.formatFile // empty' "$REPO_JSON" 2>/dev/null)
[ -n "$CMD" ] || exit 0

# 只格式化程式碼檔案
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.py) ;;
  *) exit 0 ;;
esac

CMD=${CMD//\{file\}/$FILE}
if ! OUT=$(cd "$ROOT" && eval "$CMD" 2>&1); then
  echo "[post-write-format] 自動格式化失敗（${CMD}）：$(echo "$OUT" | tail -5)" >&2
  exit 2
fi
exit 0
