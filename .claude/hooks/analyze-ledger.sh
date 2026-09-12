#!/usr/bin/env bash
# Gate Ledger 分析 — 定期跑來決定哪些 warn 升級 block、哪些是 false positive
set -uo pipefail

LEDGER_FILE="${HOME}/.cache/daodao-harness/gate-ledger.jsonl"

if [ ! -f "$LEDGER_FILE" ]; then
  echo "沒有 gate ledger 資料。"
  exit 0
fi

total=$(wc -l < "$LEDGER_FILE" | tr -d ' ')
echo "📊 Gate Ledger 分析（共 $total 筆事件）"
echo ""

echo "=== 按規則統計 ==="
jq -r '[.rule, .result] | @tsv' "$LEDGER_FILE" | sort | uniq -c | sort -rn | head -20

echo ""
echo "=== 按 profile 統計 ==="
jq -r '.profile' "$LEDGER_FILE" | sort | uniq -c | sort -rn

echo ""
echo "=== 按日期統計 ==="
jq -r '.ts[:10]' "$LEDGER_FILE" | sort | uniq -c | sort -rn | head -14

echo ""
echo "=== Block 事件（可能需要 false-positive 處理）==="
jq -r 'select(.result == "block") | "\(.ts[:10]) \(.rule) → \(.file)"' "$LEDGER_FILE" | tail -10

echo ""
echo "=== 高頻 Warn（候選升級 Block）==="
jq -r 'select(.result == "warn") | .rule' "$LEDGER_FILE" | sort | uniq -c | sort -rn | head -5
echo ""
echo "💡 建議：warn 在兩週內觸發 10+ 次且從未被 skip 的規則，可考慮升級為 block"
