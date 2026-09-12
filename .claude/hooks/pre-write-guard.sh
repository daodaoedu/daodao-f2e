#!/usr/bin/env bash
# PreToolUse hook (Layer 2): 敏感檔案保護 + Profile-based 品質攔截
# 四層 Hook Pipeline 品質攔截
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOKS_DIR/lib.sh"

filepath=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.file_path // .filePath // empty' 2>/dev/null)
[ -z "$filepath" ] && exit 0

tool_name="${CLAUDE_TOOL_NAME:-}"
new_content=""

if [ "$tool_name" = "Write" ]; then
  new_content=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.content // empty' 2>/dev/null)
elif [ "$tool_name" = "Edit" ]; then
  new_content=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.new_string // empty' 2>/dev/null)
fi

# === 硬性攔截（不看 profile）===

# 1. 敏感檔案
if echo "$filepath" | grep -qE '\.(env|pem|key)$'; then
  echo "❌ 禁止寫入敏感檔案（.env / .pem / .key）" >&2
  log_gate_event "sensitive-file" "$filepath" "block" "global"
  exit 2
fi

# 2. 既有 migration
if echo "$filepath" | grep -q 'migrate/sql/' && [ -f "$filepath" ]; then
  echo "❌ 禁止修改已存在的 migration，請新增新的 migration 檔案" >&2
  log_gate_event "existing-migration" "$filepath" "block" "global"
  exit 2
fi

# 3. 憑證洩漏偵測
if [ -n "$new_content" ]; then
  if echo "$new_content" | grep -qE '(AKIA[A-Z0-9]{16}|-----BEGIN (RSA |EC )?PRIVATE KEY|xoxb-|xoxp-|ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{48})'; then
    echo "❌ 偵測到可能的憑證/密鑰，禁止寫入" >&2
    log_gate_event "credential-leak" "$filepath" "block" "global"
    exit 2
  fi
fi

# === Profile-based 品質攔截 ===

profile=$(detect_profile "$filepath")
[ -z "$profile" ] && exit 0
[ -z "$new_content" ] && exit 0

profile_file="$PROFILES_DIR/${profile}.json"
[ -f "$profile_file" ] || exit 0

# Block rules
block_count=$(jq '.block | length' "$profile_file")
for ((i=0; i<block_count; i++)); do
  rule_id=$(jq -r ".block[$i].id" "$profile_file")
  path_pat=$(jq -r ".block[$i].pathPattern // empty" "$profile_file")
  exclude_pat=$(jq -r ".block[$i].excludePathPattern // empty" "$profile_file")
  pattern=$(jq -r ".block[$i].pattern // empty" "$profile_file")
  message=$(jq -r ".block[$i].message // empty" "$profile_file")

  # 路徑不匹配 → 跳過
  if [ -n "$path_pat" ] && ! path_matches "$filepath" "$path_pat"; then
    continue
  fi
  # 路徑在排除清單 → 跳過
  if [ -n "$exclude_pat" ] && path_excluded "$filepath" "$exclude_pat"; then
    continue
  fi
  # 檢查內容 pattern
  if [ -n "$pattern" ] && check_pattern "$new_content" "$pattern"; then
    echo "❌ [$rule_id] $message" >&2
    log_gate_event "$rule_id" "$filepath" "block" "$profile"
    exit 2
  fi
done

# Warn rules
warn_count=$(jq '.warn | length' "$profile_file")
warned=false
for ((i=0; i<warn_count; i++)); do
  rule_id=$(jq -r ".warn[$i].id" "$profile_file")
  path_pat=$(jq -r ".warn[$i].pathPattern // empty" "$profile_file")
  exclude_pat=$(jq -r ".warn[$i].excludePathPattern // empty" "$profile_file")
  pattern=$(jq -r ".warn[$i].pattern // empty" "$profile_file")
  message=$(jq -r ".warn[$i].message // empty" "$profile_file")

  if [ -n "$path_pat" ] && ! path_matches "$filepath" "$path_pat"; then
    continue
  fi
  if [ -n "$exclude_pat" ] && path_excluded "$filepath" "$exclude_pat"; then
    continue
  fi
  if [ -n "$pattern" ] && check_pattern "$new_content" "$pattern"; then
    echo "⚠️  [$rule_id] $message" >&2
    log_gate_event "$rule_id" "$filepath" "warn" "$profile"
    warned=true
  fi
done

# 首次寫入時自動載入 project-rules
PROJECT_ROOT="${CLAUDE_WORKING_DIRECTORY:-$(pwd)}"
rules="$PROJECT_ROOT/.claude/skills/project-rules/SKILL.md"
flag="/tmp/.claude-rules-loaded-$(basename "$PROJECT_ROOT")-$$"
if [ -f "$rules" ] && [ ! -f "$flag" ]; then
  echo "📋 自動載入專案規範："
  cat "$rules"
  touch "$flag"
fi

exit 0
