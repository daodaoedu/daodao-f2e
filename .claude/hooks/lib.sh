#!/usr/bin/env bash
# 共用函式庫 — profile 偵測、gate ledger、路徑工具

HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILES_DIR="$HOOKS_DIR/profiles"
LEDGER_DIR="${HOME}/.cache/daodao-harness"
LEDGER_FILE="$LEDGER_DIR/gate-ledger.jsonl"

mkdir -p "$LEDGER_DIR"

detect_profile() {
  local filepath="$1"

  # daodao-f2e 底下的 .ts/.tsx/.vue → frontend
  if echo "$filepath" | grep -qE '(daodao-f2e|daodao-admin-ui)/'; then
    echo "frontend"
    return
  fi

  # daodao-server / daodao-ai-backend → backend
  if echo "$filepath" | grep -qE '(daodao-server|daodao-ai-backend)/'; then
    echo "backend"
    return
  fi

  # 依副檔名 fallback
  if echo "$filepath" | grep -qE '\.(vue|tsx)$'; then
    echo "frontend"
  elif echo "$filepath" | grep -qE '\.(ts|js)$'; then
    echo "backend"
  else
    echo ""
  fi
}

log_gate_event() {
  local rule_id="$1"
  local filepath="$2"
  local result="$3"  # block / warn / pass
  local profile="$4"
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  printf '{"ts":"%s","rule":"%s","file":"%s","result":"%s","profile":"%s"}\n' \
    "$timestamp" "$rule_id" "$filepath" "$result" "$profile" >> "$LEDGER_FILE"
}

check_pattern() {
  local content="$1"
  local pattern="$2"

  if [ -z "$pattern" ] || [ "$pattern" = "null" ]; then
    return 1
  fi

  echo "$content" | grep -qE "$pattern"
}

path_matches() {
  local filepath="$1"
  local pattern="$2"

  if [ -z "$pattern" ] || [ "$pattern" = "null" ]; then
    return 0  # no pattern = match all
  fi

  echo "$filepath" | grep -qE "$pattern"
}

path_excluded() {
  local filepath="$1"
  local pattern="$2"

  if [ -z "$pattern" ] || [ "$pattern" = "null" ]; then
    return 1  # no exclude = not excluded
  fi

  echo "$filepath" | grep -qE "$pattern"
}
