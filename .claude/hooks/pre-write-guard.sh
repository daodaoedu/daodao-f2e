#!/usr/bin/env bash
# PreToolUse hook: 保護敏感檔案 + 自動載入 project-rules
set -euo pipefail

filepath=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.file_path // .filePath // empty' 2>/dev/null)
[ -z "$filepath" ] && exit 0

# 1. 禁止寫入敏感檔案
if echo "$filepath" | grep -qE '\.(env|pem|key)$'; then
  echo "❌ 禁止寫入敏感檔案（.env / .pem / .key）" >&2
  exit 1
fi

# 2. 禁止修改已存在的 migration SQL（僅 daodao-storage）
if echo "$filepath" | grep -q 'migrate/sql/' && [ -f "$filepath" ]; then
  echo "❌ 禁止修改已存在的 migration，請新增新的 migration 檔案" >&2
  exit 1
fi

# 3. 首次寫入時自動載入 project-rules
PROJECT_ROOT="${CLAUDE_WORKING_DIRECTORY:-$(pwd)}"
rules="$PROJECT_ROOT/.claude/skills/project-rules/SKILL.md"
flag="/tmp/.claude-rules-loaded-$(basename "$PROJECT_ROOT")-$$"
if [ -f "$rules" ] && [ ! -f "$flag" ]; then
  echo "📋 自動載入專案規範："
  cat "$rules"
  touch "$flag"
fi

exit 0
