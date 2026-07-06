#!/usr/bin/env bash
# PreToolUse hook（Write|Edit）：阻擋敏感檔案與受保護路徑的寫入。
# 正本在 daodao monorepo .claude/shared/hooks/，由 sync.sh 同步——不要直接改副本。
#
# Claude Code hook 介面：JSON 由 stdin 傳入，.tool_input.file_path 為目標檔案。
# exit 2 = 阻擋該次寫入（stderr 會回饋給模型）。
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)
[ -n "$FILE" ] || exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# 1. 敏感檔案（副檔名 / 檔名）
BASE=$(basename "$FILE")
case "$BASE" in
  .env|.env.*|*.pem|*.key|*.p12|*.pfx|id_rsa|id_ed25519|credentials.json|service-account*.json)
    echo "BLOCKED: ${FILE} 是敏感檔案，禁止由 AI 直接寫入。需要變更請告知使用者手動處理。" >&2
    exit 2
    ;;
esac

# 2. 受保護路徑（來自 .claude/repo.json 的 protectedPaths，glob 比對）
REPO_JSON="${ROOT}/.claude/repo.json"
if [ -f "$REPO_JSON" ]; then
  REL="${FILE#"$ROOT"/}"
  while IFS= read -r pat; do
    [ -n "$pat" ] || continue
    # shellcheck disable=SC2254
    case "$REL" in
      $pat)
        echo "BLOCKED: ${REL} 屬於受保護路徑（${pat}）。此類檔案禁止由 AI 修改。" >&2
        exit 2
        ;;
    esac
  done < <(jq -r '.protectedPaths[]? // empty' "$REPO_JSON" 2>/dev/null)
fi

exit 0
