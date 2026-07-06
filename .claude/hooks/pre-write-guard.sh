#!/usr/bin/env bash
# PreToolUse hook: 保護敏感檔案 + 每個 session 自動載入一次 project-rules
set -euo pipefail

filepath=$(echo "${CLAUDE_TOOL_INPUT:-}" | jq -r '.file_path // .filePath // empty' 2>/dev/null)
[ -z "$filepath" ] && exit 0

# 1. 禁止寫入敏感檔案（exit 2 才會真正阻擋工具執行；exit 1 只顯示警告不會擋）
if echo "$filepath" | grep -qE '\.(env|pem|key)$'; then
  echo "❌ 禁止寫入敏感檔案（.env / .pem / .key）" >&2
  exit 2
fi

# 2. 禁止修改已存在的 migration SQL（僅 daodao-storage）
if echo "$filepath" | grep -q 'migrate/sql/' && [ -f "$filepath" ]; then
  echo "❌ 禁止修改已存在的 migration，請新增新的 migration 檔案" >&2
  exit 2
fi

# 3. 每個 session 首次寫入時自動載入 project-rules
#    flag 不可含 $$：每次 hook 都是新 process，PID 必不同，會變成每次寫檔都重灌規範進 context
#    有 CLAUDE_SESSION_ID 時以 session 區分；沒有時退回「4 小時過期」機制
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-${CLAUDE_WORKING_DIRECTORY:-$(pwd)}}"
rules="$PROJECT_ROOT/.claude/skills/project-rules/SKILL.md"
session="${CLAUDE_SESSION_ID:-}"
flag="/tmp/.claude-rules-loaded-$(basename "$PROJECT_ROOT")${session:+-$session}"
if [ -z "$session" ] && [ -f "$flag" ] && [ -n "$(find "$flag" -mmin +240 2>/dev/null)" ]; then
  rm -f "$flag"
fi
if [ -f "$rules" ] && [ ! -f "$flag" ]; then
  echo "📋 自動載入專案規範："
  cat "$rules"
  touch "$flag"
fi

exit 0
