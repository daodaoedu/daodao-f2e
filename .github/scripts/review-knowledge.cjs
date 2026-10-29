#!/usr/bin/env node
/**
 * review-knowledge.cjs — code review 誤判知識庫的唯一存取入口。
 *
 * 單一來源：daodao monorepo 的 .github/review-knowledge/false-positives.jsonl
 * （sync-claude-config 會把本腳本與 jsonl 一起同步到各 sub-repo，供 CI 從 base ref 讀取）。
 * 兩個消費者共用同一份資料與同一套規則：
 *   - CI  code-review.yml  → prompt-block 進模型輸入；verify --findings 在 run-review-batches
 *                            （含 strict 來源驗證）之後標註 absent-claim，不刪除 finding（#363 不再跑 filter）
 *   - 本機 review-change skill → prompt-block 進 review-input.md、filter → verify 套在各引擎的表格輸出、record 寫回
 *
 * 子命令：
 *   prompt-block [--db FILE]                 依樣態彙整「已知誤判」段落（給模型看，短）
 *   filter [--db FILE] [--report FILE]       stdin=review body → stdout=過濾後 body；report 寫 JSON
 *   verify --repo-root DIR [--rev REV] [--report FILE]
 *                                            stdin=review body（filter 之後）→ 「找不到／缺少 X」而 X 在
 *                                            head tree 查得到反證的列移出表格；report 記 verified-absent-claim
 *   verify --repo-root DIR --rev SHA --findings status.json [--report FILE] [--note FILE]
 *                                            CI structured findings：只標註不刪除，note 是附在 review body 的 Markdown
 *   record --pattern A-G --source ci|local --engine X --repo R --pr N --finding "…" --why "…" \
 *          [--file path:line] [--severity High|Medium|Low] [--evidence "…"] [--action drop|downgrade|context|repair|none] \
 *          [--sample "| 🔴 High | `p:1` | … | … |"] [--expected keep|drop|downgrade] [--db FILE|auto]
 *   test [--db FILE]                         每筆帶 sample+expected 的紀錄都當 fixture 跑一次 filter；
 *                                            expected=verify-drop 另用紀錄的 verify_tree 建暫存 repo 跑 verify
 *
 * 樣態（pattern）：
 *   A absent-claim   對 diff 外的程式碼做否定斷言（找不到／缺少／未實作 X，而 X 在 head tree 存在）
 *   B deletion       把刪除舊碼當成功能消失（替代實作在同 PR 別的檔案）
 *   C unverifiable   承認看不到／被截斷／不確定卻仍列為問題         → filter: drop
 *   D hypothetical   假設性風險（若未來／萬一／可能會），無具體證據   → filter: High/Medium 降為 Low
 *   E format         schema 漂移（漏行號、括號說明、簡體）         → normalize 修復器處理，不在此
 *   F misattribution 引用的 path:line 指到別的函式／檔案
 *   G reminder       「請確認／需同步／記得更新」的提醒，提醒以外沒有缺陷描述、也沒指出過時位置
 *                    → filter: drop（High 只降為 Low，不 drop）
 *
 * 高風險類別（auth、權限、個資、migration／schema、金流、資料刪除、併發）一律保留原樣：
 * C／D／G 規則都不套用，交人判斷（pstack bugbot-triage：不因歷史上類似 finding 被放過就自動略過）。
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
  G: "reminder：「請確認／需同步／記得更新」的提醒，沒有指出哪個位置還是舊的",
};

// ---- 規則（確定性；每條規則都對應知識庫裡的樣態，改規則要同時加 fixture）----
const UNVERIFIABLE_RE = /無法確認|无法确认|未能確認|無法判斷|无法判断|被截斷|被截断|不確定是否|不确定是否|無法得知|cannot (?:be )?(?:verif|confirm)|unable to (?:verify|confirm)|truncated in the diff|not visible in the diff|not shown in (?:the )?diff|diff (?:doesn'?t|does not) show|已顯示的(?:程式碼)?(?:段落|片段)|已显示的(?:代码)?(?:段落|片段)|在顯示的(?:段落|片段)|(?:visible|shown|displayed) (?:portion|snippet|section|segment)/i;
const HYPOTHETICAL_RE = /若未來|如果未來|若將來|萬一|万一|未來若|未来若|假設|hypothetical|in the future|if a future|should a future|potential(?:ly)? (?:risk|issue|problem)/i;

const REMINDER_RE = /請確認|請確保|請檢查.{0,24}是否|需確認|需確保|需要確認|需要確保|需同步|確認.{0,24}(?:同步|一致|更新)|是否.{0,24}一併|記得(?:更新|同步)|建議檢查.{0,24}是否|ensure .{0,40}(?:updated|in sync|consistent)|make sure|double[- ]check|please (?:check|verify|confirm)|verify that all/i;
// 提醒以外若還描述了具體缺陷（會跳過、仍繼續、但呼叫端…），就不是單純提醒，保留
const DEFECT_RE = /會|導致|造成|但|仍|卻|錯誤|失敗|跳過|遺漏|漏掉|未處理|沒有處理|繞過|外洩|崩潰|break|skip|fail|wrong|incorrect|error|crash|leak|bypass|\bbut\b|\bstill\b|instead|never|regress/i;
// 具體位置：帶目錄的 path:line，而且不是 finding 自己那格。有指出就不是單純提醒
const LOCATION_RE = /[\w.-]+\/[\w./-]*\.[A-Za-z]\w*:\d+/g;
// 只比對問題欄；用片語而不是單字，避免 design token、maxTokens、formSchema 這類一般用詞
const HIGH_RISK_RE = /身份驗證|身分驗證|身份验证|authenticat|authoriz|權限|权限|授權|授权|越權|越权|未登入|登入狀態|access token|refresh token|jwt|csrf|api key|session (?:fixation|hijack)|個資|个资|隱私|隐私|\bPII\b|migration|遷移|迁移|資料庫 ?schema|db schema|schema (?:migration|變更)|transaction|交易|金流|付款|payment|billing|資料刪除|刪除資料|数据删除|删除数据|data loss|併發|并发|concurren|race condition/i;

function isPureReminder(issueCell, suggestionCell, fileCell) {
  if (!REMINDER_RE.test(issueCell)) return false;
  const own = fileCell.replace(/`/g, "").trim();
  const locations = `${issueCell} ${suggestionCell}`.match(LOCATION_RE) || [];
  if (locations.some((l) => l !== own)) return false;
  const rest = issueCell.split(/[；;。，,]/).filter((s) => !REMINDER_RE.test(s)).join(" ");
  return !DEFECT_RE.test(rest);
}
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
    // 子 repo 會同步一份唯讀副本，用 .gitmodules 辨識 monorepo root（openspec/ 已退役，不再當標記）
    if (fs.existsSync(candidate) && fs.existsSync(path.join(dir, ".gitmodules"))) return candidate;
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
  const report = { dropped: [], downgraded: [], exempted: [], kept: 0, mode: null };
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
    if (HIGH_RISK_RE.test(cells[3])) {
      report.exempted.push({ file, severity, issue: cells[3].trim().slice(0, 160) });
      report.kept++;
      out.push(line);
      continue;
    }
    if (UNVERIFIABLE_RE.test(cells[3])) {
      report.dropped.push({ pattern: "C", file, severity, issue: cells[3].trim().slice(0, 160) });
      continue;
    }
    if (isPureReminder(cells[3], cells[4], file)) {
      if (/High/.test(severity)) {
        cells[1] = " 🟢 Low ";
        report.downgraded.push({ pattern: "G", file, from: severity, issue: cells[3].trim().slice(0, 160) });
        out.push(cells.join("|"));
        continue;
      }
      report.dropped.push({ pattern: "G", file, severity, issue: cells[3].trim().slice(0, 160) });
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

// ---- verify（A 類 absent-claim 後置查證，daodao#169）----
// finding 斷言「找不到／缺少／未實作 X」時，到 PR head tree 用 git grep 查 X；
// 查到「足以反駁」的位置才算 verified-absent-claim。
//   存在型斷言（找不到／未定義／not found）：只認 X 的定義處
//   檢查型斷言（缺少驗證／沒有檢查／missing）：先判缺的是權限／身份驗證／輸入驗證哪一類（分不出就不查），
//     route 檔要求同一個註冊敘述掛了「同一類」middleware；輸入驗證另認 validator／schema 程式檔的欄位定義
// 敘述點名的識別字在 tree 裡完全不存在、沒查到、或識別字太短太泛，就原樣保留：寧可漏殺，不可把真的缺漏藏掉。
const ABSENT_EXIST_RE = /找不到|找不着|未定義|未定义|未實作|未实现|未實現|不存在|沒有定義|没有定义|not found|not defined|is undefined|does not exist|doesn'?t exist|no such|not implemented|never defined/i;
const ABSENT_CHECK_RE = /缺少|缺乏|欠缺|沒有檢查|没有检查|未檢查|未检查|沒有驗證|没有验证|未驗證|未验证|未做(?:驗證|检查|檢查)|missing|lacks?\b|without (?:any )?(?:check|validation|auth)|no (?:\w+ ){0,3}(?:check|validation|guard|middleware|auth\w*)|never (?:checks|validates)|does not (?:check|validate)|doesn'?t (?:check|validate)/i;
const ROUTE_PATH_RE = /(route|router)/i;
const ROUTE_START_RE = /[A-Za-z_$][\w$]*\.(?:get|post|put|patch|delete|all|use|route)\(/;
const GENERIC_IDENTS = new Set([
  "data", "error", "errors", "user", "users", "value", "values", "result", "results", "response", "request",
  "string", "number", "boolean", "object", "array", "null", "undefined", "true", "false", "this", "self",
  "req", "res", "next", "body", "query", "params", "item", "items", "list", "name", "type", "status", "message",
  "config", "options", "props", "state", "event", "context", "input", "output", "file", "path", "line",
  "Number", "String", "Boolean", "Object", "Array", "Promise", "Error", "JSON", "Math", "Date", "console",
  "async", "await", "return", "const", "function", "class", "import", "export", "default",
]);
const GREP_EXCLUDES = [
  ":(exclude,glob)**/node_modules/**", ":(exclude,glob)**/dist/**", ":(exclude,glob)**/generated/**",
  ":(exclude,glob)**/__tests__/**", ":(exclude,glob)**/tests/**", ":(exclude,glob)**/*.test.*", ":(exclude,glob)**/*.spec.*",
  ":(exclude,glob)**/*.lock", ":(exclude,glob)**/pnpm-lock.yaml", ":(exclude,glob)**/package-lock.json",
  ":(exclude,glob)**/openapi.*", ":(exclude,glob)**/*.min.*", ":(exclude,glob)**/*.map",
];
const MAX_IDENTS = 6;

function absentClaimKind(text) {
  if (ABSENT_EXIST_RE.test(text)) return "exist";
  if (ABSENT_CHECK_RE.test(text)) return "check";
  return null;
}

// 從問題敘述抽出要查的識別字：反引號 token、member path（req.query.organizationId）、
// camelCase／PascalCase（中間有大寫）、snake_case。member path 另外查最後一段。
function extractIdentifiers(text) {
  const found = [];
  const add = (token) => {
    const t = String(token || "").replace(/\(\)$/, "");
    if (t.length < 4 || GENERIC_IDENTS.has(t) || found.includes(t)) return;
    if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(t)) return;
    found.push(t);
  };
  const addPath = (p) => {
    const parts = p.split(".");
    // req.user／res.locals／this.x 到處都有，查到也證明不了什麼；只查最後一段（太泛的會再被濾掉）
    if (parts.length === 1 || !/^(req|res|ctx|request|response|this|self|context)$/.test(parts[0])) add(p);
    if (parts.length > 1) add(parts[parts.length - 1]);
  };
  for (const m of text.matchAll(/`([^`\n]{1,80})`/g)) {
    const inner = m[1].trim();
    if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*(?:\(\))?$/.test(inner)) addPath(inner.replace(/\(\)$/, ""));
  }
  for (const m of text.matchAll(/\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+\b/g)) {
    if (/\.(?:ts|tsx|js|jsx|mjs|cjs|py|json|sql|md|yml|yaml)$/i.test(m[0])) continue; // 檔名不是識別字
    addPath(m[0]);
  }
  for (const m of text.matchAll(/\b(?:[a-z][a-z0-9]*[A-Z]|[A-Z][a-z0-9]+[A-Z])[A-Za-z0-9]*\b/g)) add(m[0]);
  for (const m of text.matchAll(/\b[a-z][a-z0-9]*_[a-z0-9_]+\b/g)) add(m[0]);
  return found.slice(0, MAX_IDENTS);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function makeGrep(repoRoot, rev) {
  const { execFileSync } = require("child_process");
  const fileCache = new Map();
  const show = (p) => {
    if (!fileCache.has(p)) {
      let text = "";
      try { text = execFileSync("git", ["-C", repoRoot, "show", `${rev}:${p}`], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }); } catch { text = ""; }
      fileCache.set(p, text.split("\n"));
    }
    return fileCache.get(p);
  };
  const grep = (ident) => {
    let out = "";
    try {
      out = execFileSync("git", ["-C", repoRoot, "grep", "-n", "-I", "-w", "-F", "-e", ident, rev, "--", ".", ...GREP_EXCLUDES],
        { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    } catch (e) {
      if (e.status === 1) return []; // 沒命中
      throw new Error(`git grep 失敗（${repoRoot} @ ${rev}）：${String(e.stderr || e.message).trim()}`);
    }
    const prefix = `${rev}:`;
    return out.split("\n").filter(Boolean).map((l) => {
      const rest = l.startsWith(prefix) ? l.slice(prefix.length) : l;
      const m = rest.match(/^(.*?):(\d+):(.*)$/);
      return m ? { path: m[1], line: Number(m[2]), text: m[3] } : null;
    }).filter(Boolean);
  };
  return { grep, show };
}

// 檢查型斷言說缺的是哪一類檢查；分不出來就不查（不能拿 authenticate 反駁「缺少擁有者檢查」）
//   順序有意義：「身份驗證」含「驗證」，權限類要先判，因為 authenticate 證明不了擁有者／角色檢查
const CHECK_CATEGORIES = [
  ["permission", /權限|权限|擁有者|拥有者|所有者|owner|role|admin|permission|授權|授权|authoriz|越權|越权|IDOR/i,
    /require[A-Z]\w*|authoriz\w*|permission\w*|guard\w*|checkRole|isAdmin|\w*Owner\w*/],
  ["auth", /身份驗證|身分驗證|身份验证|登入|登录|未登入|authenticat|req\.user|login|token|session/i,
    /authenticat\w*|requireAuth\w*|optionalAuth\w*/],
  ["validation", /驗證|验证|校驗|校验|validat|NaN|格式|schema|sanitiz|型別|类型/i, /validate\w*/],
];
const DEF_KEYWORD_RE = (id) => new RegExp(`(?:function|class|interface|type|enum|const|let|var|def)\\s+${id}\\b|^\\s*(?:export\\s+)?(?:(?:public|private|protected|static|readonly|async)\\s+)*${id}\\s*(?:=|\\()`);
const SCHEMA_FILE_RE = /(validat|schema)[^/]*\.(?:[cm]?[jt]sx?|py)$|\/(?:validators?|schemas?)\/[^/]+\.(?:[cm]?[jt]sx?|py)$/i;

function checkCategory(text) {
  for (const [name, re, token] of CHECK_CATEGORIES) if (re.test(text)) return { name, token };
  return null;
}

// 該命中能不能反駁這個斷言
function refutes(hit, ident, claim, show) {
  const tail = escapeRe(ident.split(".").pop());
  if (claim.kind === "exist") {
    // 存在型：只認定義處；route／middleware 裡「用到」名字正是被質疑的那件事，不算反證
    return DEF_KEYWORD_RE(tail).test(hit.text);
  }
  if (!claim.category) return false;
  if (ROUTE_PATH_RE.test(hit.path) && /\.(?:[cm]?[jt]sx?|py)$/.test(hit.path)) {
    // route 檔：同一個註冊敘述（命中那行往上找到 router.<method>( 為止）要掛了「同一類」middleware
    const lines = show(hit.path);
    let start = hit.line;
    for (let i = hit.line; i >= Math.max(1, hit.line - 10); i--) {
      if (ROUTE_START_RE.test(lines[i - 1] || "")) { start = i; break; }
    }
    const stmt = lines.slice(start - 1, hit.line).join("\n");
    return claim.category.token.test(stmt);
  }
  // validator／schema 程式檔：只反駁「缺少驗證」，且命中行要是該欄位的 schema 定義（key: …）
  if (claim.category.name === "validation" && SCHEMA_FILE_RE.test(hit.path)) {
    return new RegExp(`(?:^|[\\s{,'"])${tail}['"]?\\??\\s*:`).test(hit.text);
  }
  return false;
}

function verifyText(text, verifier) {
  const kind = absentClaimKind(text);
  if (!kind) return null;
  const claim = { kind, category: kind === "check" ? checkCategory(text) : null };
  if (kind === "check" && !claim.category) return null;
  const evidence = [];
  for (const ident of extractIdentifiers(text)) {
    const all = verifier.grep(ident);
    // 敘述點名的識別字在 tree 裡完全不存在（例：缺少 `requireCohortOwner`）→ 斷言很可能為真，整列保留
    if (!all.length) return null;
    // validator／schema 的命中最直接，排在 route 與定義處前面
    const rank = (h) => (SCHEMA_FILE_RE.test(h.path) ? 0 : ROUTE_PATH_RE.test(h.path) ? 1 : 2);
    const hits = all.filter((h) => refutes(h, ident, claim, verifier.show))
      .sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path) || a.line - b.line);
    if (hits.length) evidence.push({ identifier: ident, hits: hits.slice(0, 3).map((h) => `${h.path}:${h.line}`) });
  }
  return evidence.length ? { kind, category: claim.category && claim.category.name, evidence } : null;
}

// 表格模式（本機 skill 步驟 6.5，接在 filter 之後）：查證成功的列移出表格，記進 report
function verifyBody(body, verifier) {
  const lines = body.split("\n");
  const report = { rule: "verified-absent-claim", dropped: [], kept: 0, checked: 0 };
  let inTable = false;
  let mode = null;
  const out = [];
  for (const line of lines) {
    if (ZH_HEADER_RE.test(line)) { inTable = true; mode = "zh"; out.push(line); continue; }
    if (EN_HEADER_RE.test(line)) { inTable = true; mode = "en"; out.push(line); continue; }
    if (inTable && !line.startsWith("|")) inTable = false;
    const cells = inTable ? splitRow(line) : null;
    if (!cells) { out.push(line); continue; }
    const severity = cells[1].trim();
    if (!SEVERITY_RE.test(severity)) { out.push(line); continue; }
    const issue = cells[3];
    const verdict = absentClaimKind(issue) ? verifyText(issue, verifier) : null;
    if (absentClaimKind(issue)) report.checked++;
    if (verdict) {
      report.dropped.push({ pattern: "A", rule: "verified-absent-claim", file: cells[2].trim(), severity, issue: issue.trim().slice(0, 160), ...verdict });
      continue;
    }
    report.kept++;
    out.push(line);
  }
  // 全部被移除時不改寫成「沒有發現問題」：被移除的列是「查到反證」，不是「沒問題」的證據
  if (report.dropped.length) {
    const note = mode === "en"
      ? `> ${report.dropped.length} finding(s) removed by review-knowledge verify (verified-absent-claim); see the verify report.`
      : `> ${report.dropped.length} 列 finding 經 review-knowledge verify 在 head tree 查到反證（verified-absent-claim），已移出表格，明細見 verify report。`;
    out.push("", note);
  }
  return { body: out.join("\n"), report };
}

// structured 模式（CI，run-review-batches 的 status.json）：只標註、不刪除——
// #363 決定 CI 不得依文字樣態自動隱藏 finding（docs/automation/complete-ci-review.md）
function verifyFindings(status, verifier) {
  const report = { rule: "verified-absent-claim", mode: "annotate", annotated: [], checked: 0 };
  const findings = [...(Array.isArray(status.findings) ? status.findings : []), ...(Array.isArray(status.carried_findings) ? status.carried_findings : [])];
  for (const f of findings) {
    const text = String(f && f.description || "");
    if (!absentClaimKind(text)) continue;
    report.checked++;
    const verdict = verifyText(text, verifier);
    if (verdict) report.annotated.push({ pattern: "A", rule: "verified-absent-claim", file: `${f.path}:${f.line}`, severity: f.severity, issue: text.slice(0, 160), ...verdict });
  }
  return report;
}

function plain(value, max = 120) {
  // 只用於 Markdown code span 與 job log：去掉反引號、換行與 workflow command 標記
  return String(value).replace(/[`\r\n]/g, " ").replace(/::/g, ": :").slice(0, max);
}

function verifyNote(report) {
  if (!report.annotated.length) return "";
  const lines = ["", "### 已在 head tree 查到反證的「缺少／找不到」finding（verify 標註，未刪除）", "",
    "下列 finding 斷言缺少或找不到的識別字，在 PR head 的 route／middleware／schema 或定義處查得到。採納前先對照這些位置；這是 grep 證據，不代表 finding 一定錯。", ""];
  for (const a of report.annotated) {
    const ev = a.evidence.map((e) => `\`${plain(e.identifier, 60)}\` → ${e.hits.map((h) => `\`${plain(h)}\``).join("、")}`).join("；");
    lines.push(`- \`${plain(a.file)}\`（${plain(a.severity, 8)}）：${ev}`);
  }
  return lines.join("\n") + "\n";
}

function logReport(items) {
  for (const a of items) {
    for (const e of a.evidence) {
      process.stderr.write(`verified-absent-claim ${plain(a.file)} ${plain(e.identifier, 60)} -> ${e.hits.map((h) => plain(h)).join(", ")}\n`);
    }
  }
}

// ---- prompt-block ----
function promptBlock(db) {
  if (!db.length) return "";
  const byPattern = new Map();
  for (const r of db) {
    // 反例（expected keep）是「必須保留」，不是誤判；pr 為 0 的是人工造的 fixture，不當成給模型看的範例
    if (r.expected === "keep" || !r.pr) continue;
    if (!byPattern.has(r.pattern)) byPattern.set(r.pattern, []);
    byPattern.get(r.pattern).push(r);
  }
  const lines = ["已知誤判樣態（來自歷史 review 紀錄；符合樣態才不報。auth、權限、個資、migration／schema、金流、資料刪除、併發相關的 finding 仍要照常回報）："];
  for (const [p, rs] of [...byPattern.entries()].sort()) {
    const ex = rs[rs.length - 1];
    const finding = (ex.finding || "").replace(/\s+/g, " ").slice(0, 90);
    const why = (ex.why || "").replace(/\s+/g, " ").slice(0, 90);
    lines.push(`- ${p}. ${PATTERNS[p] || p}（${rs.length} 例；例：「${finding}」— ${why}）`);
  }
  return lines.join("\n");
}

// ---- id ----
// 編號取「現有最大值 + 1」。早期用 db.length + 1，兩個 session 各自從同一份檔案
// append 就會算出同一個編號（實際撞過 FP-0062~0064），而且一旦有斷號就必然重複。
function nextId(db) {
  const max = db.reduce((acc, r) => {
    const n = Number.parseInt(String(r.id || "").replace(/^FP-/, ""), 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `FP-${String(max + 1).padStart(4, "0")}`;
}

function duplicateIds(db) {
  const seen = new Set();
  const dup = new Set();
  for (const r of db) {
    if (seen.has(r.id)) dup.add(r.id);
    seen.add(r.id);
  }
  return [...dup].sort();
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
  const id = nextId(db);
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
  const dup = duplicateIds(db);
  if (dup.length) {
    console.error(`❌ 重複的 ID：${dup.join("、")}（每筆紀錄的 id 必須唯一）`);
    process.exit(1);
  }
  let n = 0;
  let nVerify = 0;
  const wrap = (sample) => {
    const header = /^\|\s*(🔴|🟡|🟢)?\s*(High|Medium|Low)/.test(sample) ? "| 嚴重度 | 檔案 | 問題 | 建議 |\n|---|---|---|---|\n" : "";
    return `## Code Review\n\n### 問題\n\n${header}${sample}\n\n### 總結\n\nx`;
  };
  for (const r of db) {
    if (!r.sample || !r.expected) continue;
    n++;
    const { body, report } = filterBody(wrap(r.sample), db);
    const got = report.dropped.length ? "drop" : report.downgraded.length ? "downgrade" : "keep";
    // verify-drop：filter 不動它（keep），接著 verify 要在 verify_tree 查到反證而移除
    const expectedFilter = r.expected === "verify-drop" ? "keep" : r.expected;
    if (got !== expectedFilter) {
      console.error(`❌ ${r.id} 期望 ${r.expected}，filter 實際 ${got}\n${body}`);
      process.exit(1);
    }
    if (r.expected !== "verify-drop") continue;
    nVerify++;
    const dropped = runVerifyFixture(r.verify_tree, body);
    if (!dropped) {
      console.error(`❌ ${r.id} 期望 verify-drop，verify 沒有在 verify_tree 查到反證`);
      process.exit(1);
    }
  }
  // 反例：真正缺少的東西不得被 verify 移除（識別字在 tree 裡不存在／只出現在非 route、schema 的檔案）
  for (const c of VERIFY_KEEP_FIXTURES) {
    nVerify++;
    if (runVerifyFixture(c.tree, wrap(c.sample))) {
      console.error(`❌ verify 反例「${c.name}」被移除了：真正缺少的東西不能 drop`);
      process.exit(1);
    }
  }
  console.log(`✅ review-knowledge: ${n} 筆 fixture 通過（verify ${nVerify} 筆，共 ${db.length} 筆紀錄）`);
}

// verify 反例：兩筆都必須 keep
const VERIFY_KEEP_FIXTURES = [
  {
    name: "缺少的 middleware 在 tree 裡不存在",
    sample: "| 🔴 High | `src/controllers/cohort.controller.ts:10` | deleteCohort 缺少 `requireCohortOwner` 檢查，任何人都能刪 | 加上 requireCohortOwner |",
    tree: {
      "src/routes/cohort.routes.ts": "router.delete('/:id',\n  authenticate,\n  cohortController.removeMember as RequestHandler);\n",
      "src/controllers/cohort.controller.ts": "export class CohortController {\n  deleteCohort = asyncHandler(async () => {});\n}\n",
    },
  },
  {
    name: "handler 的 route 沒掛任何 middleware",
    sample: "| 🔴 High | `src/controllers/report.controller.ts:3` | exportReports 缺少身份驗證 | 加上 authenticate |",
    tree: {
      "src/routes/report.routes.ts": "router.get('/export',\n  reportController.exportReports as RequestHandler);\n",
      "src/controllers/report.controller.ts": "export class ReportController {\n  exportReports = asyncHandler(async () => {});\n}\n",
    },
  },
];

// 把 {path: content} 建成暫存 git repo，對 body 跑 verify，回傳是否有列被移除
function runVerifyFixture(tree, body) {
  const os = require("os");
  const { execFileSync } = require("child_process");
  if (!tree || typeof tree !== "object") throw new Error("verify-drop 的紀錄需要 verify_tree（{path: content}）");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "review-verify-"));
  try {
    for (const [p, content] of Object.entries(tree)) {
      const target = path.join(dir, p);
      if (!target.startsWith(dir + path.sep)) throw new Error(`verify_tree 路徑越界：${p}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
    const git = (...args) => execFileSync("git", ["-C", dir, ...args], { stdio: "pipe" });
    git("init", "-q");
    git("add", "-A");
    git("-c", "user.name=fixture", "-c", "user.email=fixture@example.com", "commit", "-qm", "fixture");
    const { report } = verifyBody(body, makeGrep(dir, "HEAD"));
    return report.dropped.length > 0;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
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
    case "verify": {
      if (!opt["repo-root"] || opt["repo-root"] === true) throw new Error("verify 需要 --repo-root（PR head 的 git checkout）");
      const verifier = makeGrep(opt["repo-root"], typeof opt.rev === "string" ? opt.rev : "HEAD");
      if (opt.findings) {
        // CI：讀 status.json，只標註不刪除；--note 寫要附在 review body 後面的 Markdown
        const status = JSON.parse(fs.readFileSync(opt.findings, "utf8"));
        const report = verifyFindings(status, verifier);
        if (opt.report) fs.writeFileSync(opt.report, JSON.stringify(report, null, 2));
        if (opt.note) fs.writeFileSync(opt.note, verifyNote(report));
        logReport(report.annotated);
        process.stdout.write(`verified-absent-claim: ${report.annotated.length} 筆（檢查 ${report.checked} 筆「缺少／找不到」finding，只標註不刪除）\n`);
        return;
      }
      const body = fs.readFileSync(0, "utf8");
      const { body: out, report } = verifyBody(body, verifier);
      if (opt.report) fs.writeFileSync(opt.report, JSON.stringify(report, null, 2));
      logReport(report.dropped);
      process.stdout.write(out);
      return;
    }
    case "record": return record(opt);
    case "test": return runTests(loadDb(resolveDb(opt.db)));
    default:
      console.error("usage: review-knowledge.cjs <prompt-block|filter|verify|record|test> [--db FILE]");
      process.exit(2);
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`review-knowledge: ${e.message}`); process.exit(1); }
}
module.exports = { filterBody, promptBlock, nextId, duplicateIds, PATTERNS, verifyBody, verifyFindings, verifyNote, extractIdentifiers, absentClaimKind, makeGrep, runVerifyFixture };
