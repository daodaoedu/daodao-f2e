#!/usr/bin/env bash
# test-retrieve-context.sh — retrieve-context.sh 的 fixture 回歸測試
#
# 重演筆記裡 #1374 的形態：PR 只修了一個 postMessage 呼叫點，
# 斷言 context pack 必須列出其他檔案裡的同類呼叫點與被改元件的 importer。
# 每次改 retrieve-context.sh 都要過這關。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RETRIEVE="$SCRIPT_DIR/retrieve-context.sh"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cd "$TMP"
git init -q -b main
git config user.email test@test && git config user.name test

mkdir -p src/components src/lib daodao-ai-backend/src/routes daodao-ai-backend/src/services
# 同一種呼叫模式散在多個檔案（PR 只會修其中一個）
cat > src/lib/sdk.ts <<'EOF'
export function sendPing() {
  window.parent.postMessage({ type: "ping" }, "*");
}
EOF
cat > src/lib/chatbotInit.ts <<'EOF'
export function init() {
  window.parent.postMessage({ type: "init" }, "*");
}
EOF
cat > src/components/Navbar.tsx <<'EOF'
export function Navbar() {
  const notify = () => window.parent.postMessage({ type: "nav" }, "*");
  return null;
}
EOF
cat > src/components/InputBar.tsx <<'EOF'
import { helperFn } from "../lib/helper";
export function InputBar() {
  return null;
}
EOF
cat > src/lib/helper.ts <<'EOF'
export function helperFn() {
  return 1;
}
EOF
cat > daodao-ai-backend/src/services/member_lookup.py <<'EOF'
def lookup_member(member_id: str):
    return member_id
EOF
cat > daodao-ai-backend/src/routes/members.py <<'EOF'
from src.services.member_lookup import lookup_member

def get_member(member_id: str):
    return lookup_member(member_id)
EOF
git add -A && git commit -qm "base"

# PR branch：只修 sdk.ts 的 postMessage（加 origin 參數），並改動 helper.ts
git checkout -qb fix/postmessage-origin
cat > src/lib/sdk.ts <<'EOF'
export function sendPing() {
  window.parent.postMessage({ type: "ping" }, window.location.origin);
}
EOF
cat > src/lib/helper.ts <<'EOF'
export function helperFn() {
  return 2;
}
EOF
cat > daodao-ai-backend/src/services/member_lookup.py <<'EOF'
def lookup_member(member_id: str):
    return member_id.strip()
EOF
git add -A && git commit -qm "fix: postMessage origin (partial)"

PACK="$("$RETRIEVE" main fix/postmessage-origin)"

fail() { echo "❌ $1"; echo "---- pack ----"; printf '%s\n' "$PACK"; exit 1; }

# 斷言 1：漏掉的同類呼叫點檔案全部要在 pack 裡（#1374 的教訓）
for f in chatbotInit.ts Navbar.tsx; do
  printf '%s' "$PACK" | grep -q "$f" || fail "pack 缺少同類 postMessage 呼叫點：$f"
done

# 斷言 2：pack 不得把 diff 內的檔案當成 ⚠ 位置（sdk.ts 只能出現在統計，不在命中清單）
printf '%s' "$PACK" | grep -E '^\s+- (\./)?src/lib/sdk\.ts:' && fail "diff 內檔案 sdk.ts 被列為 diff 外命中"

# 斷言 3：被改檔案 helper.ts 的 importer（InputBar.tsx）要被列出
printf '%s' "$PACK" | grep -q "InputBar.tsx" || fail "pack 缺少 helper.ts 的 importer：InputBar.tsx"

# 斷言 4：monorepo 子專案路徑要正規化成合法 Python dotted module
printf '%s' "$PACK" | grep -q "members.py" || fail "pack 缺少 Python importer：members.py"

# 斷言 5：reviewer 規則要注入
printf '%s' "$PACK" | grep -q "Incomplete scope" || fail "pack 缺少 Incomplete scope 規則"

# 斷言 6：CI 的 open PR 交集必須排除目前 PR，但保留其他衝突 PR
mkdir -p "$TMP/bin"
cat > "$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' \
  $'src/lib/helper.ts\t#42 current PR' \
  $'src/lib/helper.ts\t#99 overlapping PR'
EOF
chmod +x "$TMP/bin/gh"
PACK_WITH_PRS="$(PATH="$TMP/bin:$PATH" GH_REPO=example/repo CURRENT_PR_NUMBER=42 "$RETRIEVE" main fix/postmessage-origin)"
printf '%s' "$PACK_WITH_PRS" | grep -q '#42 ' && fail "in-flight 清單未排除目前 PR #42"
printf '%s' "$PACK_WITH_PRS" | grep -q '#99 overlapping PR' || fail "in-flight 清單漏掉其他衝突 PR #99"

# 斷言 7：byte budget 只在完整行截斷，輸出仍是合法 UTF-8
SMALL_PACK="$TMP/context-small.md"
# 用 untracked fixture 產生超過 pipe buffer 的檢索輸出；它不會被視為 diff 內檔案。
for i in $(seq 1 2500); do
  printf 'window.parent.postMessage({ type: "bulk-%s" }, "*");\n' "$i"
done > src/lib/bulk-messages.ts
MAX_HITS=10000 PER_FILE_LINES=5000 PACK_BYTES=700 "$RETRIEVE" main fix/postmessage-origin "$SMALL_PACK" >/dev/null
[ "$(wc -c < "$SMALL_PACK" | tr -d ' ')" -le 700 ] || fail "context pack 超過 PACK_BYTES"
iconv -f UTF-8 -t UTF-8 "$SMALL_PACK" >/dev/null || fail "context pack 截出非法 UTF-8"

# 斷言 8：migration diff 的跨表 FK 引用——被引用但不在 diff 內的表要附上定義，
# 本次 diff 自己建立的表不用另外附（重演 daodao-storage #215 review 誤判：
# reviewer 看不到 FK 指向的既有表，誤判欄位/約束跨表引用有誤）
git checkout -q main
mkdir -p schema migrate/sql
cat > schema/010_create_table_users.sql <<'EOF'
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL,
    "privacy_status" VARCHAR(20) NOT NULL DEFAULT 'public'
);
EOF
git add -A && git commit -qm "base: users table"

git checkout -qb fix/add-posts-table
cat > migrate/sql/002_add_posts.sql <<'EOF'
CREATE TABLE "posts" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "fk_posts_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);
EOF
git add -A && git commit -qm "feat: add posts table referencing users"

PACK_SQL="$("$RETRIEVE" main fix/add-posts-table)"

fail_sql() { echo "❌ $1"; echo "---- pack ----"; printf '%s\n' "$PACK_SQL"; exit 1; }

printf '%s' "$PACK_SQL" | grep -q '`users`（定義於' || fail_sql "pack 缺少被 FK 引用但不在 diff 內的 users 表定義"
printf '%s' "$PACK_SQL" | grep -q 'privacy_status' || fail_sql "pack 沒有把 users 表的實際欄位（privacy_status）附進去"
printf '%s' "$PACK_SQL" | grep -q '`posts`（定義於' && fail_sql "本次 diff 自己建立的 posts 表不該被當成「不在 diff 內」又附一次"

echo "✅ retrieve-context fixture 回歸測試通過"
