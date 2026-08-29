#!/usr/bin/env node
/**
 * review-knowledge.cjs — code review 誤判知識庫的唯一存取入口。
 *
 * 單一來源：daodao monorepo 的 .github/review-knowledge/false-positives.jsonl
 * （sync-claude-config 會把本腳本與 jsonl 一起同步到各 sub-repo，供 CI 從 base ref 讀取）。
 * 兩個消費者共用同一份資料與同一套規則：
 *   - CI  code-review.yml  → prompt-block 進模型輸入、filter 在 strict validator 之前
 *   - 本機 code-review skill → prompt-block 進 review-input.md、filter 套在各引擎的表格輸出、record 寫回
 *
 * 子命令：
 *   prompt-block [--db FILE]                 依樣態彙整「已知誤判」段落（給模型看，短）
 *   filter [--db FILE] [--report FILE]       stdin=review body → stdout=過濾後 body；report 寫 JSON
 *   record --pattern A-F --source ci|local --engine X --repo R --pr N --finding "…" --why "…" \
 *          [--file path:line] [--severity High|Medium|Low] [--evidence "…"] [--action drop|downgrade|context|repair|none] \
 *          [--sample "| 🔴 High | `p:1` | … | … |"] [--expected keep|drop|downgrade] [--db FILE|auto]
 *   test [--db FILE]                         每筆帶 sample+expected 的紀錄都當 fixture 跑一次 filter
 *
 * 樣態（pattern）：
 *   A absent-claim   對 diff 外的程式碼做否定斷言（找不到／缺少／未實作 X，而 X 在 head tree 存在）
 *   B deletion       把刪除舊碼當成功能消失（替代實作在同 PR 別的檔案）
 *   C unverifiable   承認看不到／被截斷／不確定卻仍列為問題         → filter: drop
 *   D hypothetical   假設性風險（若未來／萬一／可能會），無具體證據   → filter: High/Medium 降為 Low
 *   E format         schema 漂移（漏行號、括號說明、簡體）         → normalize 修復器處理，不在此
 *   F misattribution 引用的 path:line 指到別的函式／檔案
 */
"use strict";
const fs = require("fs");
const path = require("path");

const PATTERNS = {
  A: "absent-claim：對 diff 外程式碼做「找不到／缺少／未實作」的否定斷言，但該實作存在（例如 route 已掛 authenticate、schema 已 .or(literal(''))）",
  B: "deletion：舊檔案被刪就報功能回歸，但同 PR 已有替代實作",
  C: "unverifiable：自己寫「無法確認／被截斷／不確定」卻仍列成問題",
  D: "hypothetical：「若未來／萬一／可能會」的假設性風險，沒有具體 path:line 證據",
  E: "format：檔案欄漏行號、夾說明文字、簡體——屬格式漂移，由修復器處理",
  F: "misattribution：引用的 path:line 指到別的函式或檔案",
};

// ---- 規則（確定性；每條規則都對應知識庫裡的樣態，改規則要同時加 fixture）----
const UNVERIFIABLE_RE = /無法確認|无法确认|未能確認|無法判斷|无法判断|被截斷|被截断|不確定是否|不确定是否|無法得知|cannot (?:be )?(?:verif|confirm)|unable to (?:verify|confirm)|truncated in the diff|not visible in the diff/i;
const HYPOTHETICAL_RE = /若未來|如果未來|若將來|萬一|万一|未來若|未来若|假設|hypothetical|in the future|if a future|should a future|potential(?:ly)? (?:risk|issue|problem)/i;

const ZH_HEADER_RE = /^\|\s*(嚴重度|严重度)\s*\|\s*(檔案|文件)\s*\|\s*(問題|问题)\s*\|\s*(建議|建议)\s*\|\s*$/;
const EN_HEADER_RE = /^\|\s*Severity\s*\|\s*File\s*\|\s*Issue\s*\|\s*Suggestion\s*\|\s*$/i;
const SEVERITY_RE = /^(🔴|🟡|🟢)?\s*(High|Medium|Low)$/;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function findMonorepoDb(start) {
  let dir = path.resolve(start);
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, ".github", "review-knowledge", "false-positives.jsonl");
    if (fs.existsSync(candidate) && fs.existsSync(path.join(dir, "openspec"))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function resolveDb(opt, { forWrite } = {}) {
  if (opt && opt !== "auto") return opt;
  if (forWrite || opt === "auto") {
    const found = findMonorepoDb(process.cwd());
    if (found) return found;
    if (forWrite) throw new Error("找不到 monorepo 的 .github/review-knowledge/false-positives.jsonl（record 只能寫回單一來源，請在 daodao monorepo 或其 worktrees/ 下執行）");
  }
  // 讀取：先找 monorepo，再退回自身 repo 的同步副本
  return findMonorepoDb(process.cwd()) || path.join(__dirname, "..", "review-knowledge", "false-positives.jsonl");
}

function loadDb(file) {
  if (!file || !fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l, i) => {
    try { return JSON.parse(l); } catch (e) { throw new Error(`${file}:${i + 1} 不是合法 JSON：${e.message}`); }
  });
}

function splitRow(line) {
  if (!line.startsWith("|")) return null;
  const cells = line.split("|");
  if (cells.length < 6) return null;
  return cells;
}

// ---- filter ----
function filterBody(body, db) {
  const lines = body.split("\n");
  const report = { dropped: [], downgraded: [], kept: 0, mode: null };
  let inTable = false;
  const out = [];
  for (const line of lines) {
    if (ZH_HEADER_RE.test(line)) { inTable = true; report.mode = "zh"; out.push(line); continue; }
    if (EN_HEADER_RE.test(line)) { inTable = true; report.mode = "en"; out.push(line); continue; }
    if (inTable && !line.startsWith("|")) inTable = false;
    const cells = inTable ? splitRow(line) : null;
    if (!cells) { out.push(line); continue; }
    const severity = cells[1].trim();
    if (/^-+$/.test(severity) || ZH_HEADER_RE.test(line)) { out.push(line); continue; }
    if (!SEVERITY_RE.test(severity)) { out.push(line); continue; }
    const issue = `${cells[3]} ${cells[4]}`;
    const file = cells[2].trim();
    if (UNVERIFIABLE_RE.test(cells[3])) {
      report.dropped.push({ pattern: "C", file, severity, issue: cells[3].trim().slice(0, 160) });
      continue;
    }
    if (HYPOTHETICAL_RE.test(issue) && /High|Medium/.test(severity)) {
      cells[1] = " 🟢 Low ";
      report.downgraded.push({ pattern: "D", file, from: severity, issue: cells[3].trim().slice(0, 160) });
      out.push(cells.join("|"));
      continue;
    }
    report.kept++;
    out.push(line);
  }
  let result = out.join("\n");
  if (report.mode && report.kept === 0 && report.downgraded.length === 0 && report.dropped.length > 0) {
    result = report.mode === "zh" ? "✅ 沒有發現明顯問題" : "No issues found.";
    report.collapsedToClean = true;
  }
  return { body: result, report };
}

// ---- prompt-block ----
function promptBlock(db) {
  if (!db.length) return "";
  const byPattern = new Map();
  for (const r of db) {
    if (!byPattern.has(r.pattern)) byPattern.set(r.pattern, []);
    byPattern.get(r.pattern).push(r);
  }
  const lines = ["已知誤判樣態（來自歷史 review 紀錄，這些不是問題，不得再報）："];
  for (const [p, rs] of [...byPattern.entries()].sort()) {
    const ex = rs[rs.length - 1];
    const finding = (ex.finding || "").replace(/\s+/g, " ").slice(0, 90);
    const why = (ex.why || "").replace(/\s+/g, " ").slice(0, 90);
    lines.push(`- ${p}. ${PATTERNS[p] || p}（${rs.length} 例；例：「${finding}」— ${why}）`);
  }
  return lines.join("\n");
}

// ---- record ----
function record(opt) {
  const required = ["pattern", "source", "engine", "repo", "pr", "finding", "why"];
  for (const k of required) if (!opt[k]) throw new Error(`record 缺少 --${k}`);
  if (!PATTERNS[opt.pattern]) throw new Error(`--pattern 必須是 ${Object.keys(PATTERNS).join("/")}`);
  if (!["ci", "local"].includes(opt.source)) throw new Error("--source 必須是 ci 或 local");
  if (opt.expected && !["keep", "drop", "downgrade"].includes(opt.expected)) throw new Error("--expected 必須是 keep/drop/downgrade");
  const file = resolveDb(opt.db, { forWrite: true });
  const db = loadDb(file);
  const id = `FP-${String(db.length + 1).padStart(4, "0")}`;
  const entry = {
    id, date: new Date().toISOString().slice(0, 10),
    source: opt.source, engine: opt.engine, repo: opt.repo, pr: Number(opt.pr),
    pattern: opt.pattern, severity: opt.severity || null, file: opt.file || null,
    finding: opt.finding, why: opt.why, evidence: opt.evidence || null,
    action: opt.action || "none",
  };
  if (opt.sample) entry.sample = opt.sample;
  if (opt.expected) entry.expected = opt.expected;
  fs.appendFileSync(file, JSON.stringify(entry) + "\n");
  process.stdout.write(`${id} → ${file}\n`);
}

// ---- test ----
function runTests(db) {
  let n = 0;
  for (const r of db) {
    if (!r.sample || !r.expected) continue;
    n++;
    const header = /^\|\s*(🔴|🟡|🟢)?\s*(High|Medium|Low)/.test(r.sample) ? "| 嚴重度 | 檔案 | 問題 | 建議 |\n|---|---|---|---|\n" : "";
    const { body, report } = filterBody(`## Code Review\n\n### 問題\n\n${header}${r.sample}\n\n### 總結\n\nx`, db);
    const got = report.dropped.length ? "drop" : report.downgraded.length ? "downgrade" : "keep";
    if (got !== r.expected) {
      console.error(`❌ ${r.id} 期望 ${r.expected}，實際 ${got}\n${body}`);
      process.exit(1);
    }
  }
  console.log(`✅ review-knowledge: ${n} 筆 fixture 通過（共 ${db.length} 筆紀錄）`);
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const opt = parseArgs(rest);
  switch (cmd) {
    case "prompt-block": {
      process.stdout.write(promptBlock(loadDb(resolveDb(opt.db))));
      return;
    }
    case "filter": {
      const body = fs.readFileSync(0, "utf8");
      const { body: filtered, report } = filterBody(body, loadDb(resolveDb(opt.db)));
      if (opt.report) fs.writeFileSync(opt.report, JSON.stringify(report, null, 2));
      process.stdout.write(filtered);
      return;
    }
    case "record": return record(opt);
    case "test": return runTests(loadDb(resolveDb(opt.db)));
    default:
      console.error("usage: review-knowledge.cjs <prompt-block|filter|record|test> [--db FILE]");
      process.exit(2);
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`review-knowledge: ${e.message}`); process.exit(1); }
}
module.exports = { filterBody, promptBlock, PATTERNS };
