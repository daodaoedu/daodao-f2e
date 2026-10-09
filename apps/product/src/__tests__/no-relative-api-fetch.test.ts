import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * daodao#166 regression guard（dev 冒煙 J-07）。
 *
 * 錯誤回報表單用 `fetch("/api/feedback/bug-report")` 打相對路徑，請求落在前端自己的 origin
 * （app-dev.daodao.so），不是 server API，送出永遠 404、畫面只剩「操作失敗，請稍後再試」。
 *
 * 呼叫後端一律經 `@daodao/api`（`client` 或用 `getApiBaseUrl()` 組 URL 的 service），
 * 元件不可對 `/api/...` 相對路徑直接 fetch。Next 自己的 route handler（`app/api/**`）若真的要從
 * 元件呼叫，登記在 ALLOWED 並寫明原因。
 */
const ALLOWED: Array<{ file: string; reason: string }> = [];

const SRC_DIR = path.resolve(__dirname, "..");
const RELATIVE_API_FETCH = /\bfetch\(\s*["'`]\/api\//;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return name === "__tests__" || name === "node_modules" ? [] : walk(full);
    }
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });

describe("no relative /api fetch in product app", () => {
  it("components call the server through @daodao/api instead of fetch('/api/...')", () => {
    const allowed = new Set(ALLOWED.map((a) => a.file));
    const offenders = walk(SRC_DIR)
      .map((file) => path.relative(SRC_DIR, file))
      .filter((rel) => !allowed.has(rel))
      .filter((rel) => RELATIVE_API_FETCH.test(readFileSync(path.join(SRC_DIR, rel), "utf8")));

    expect(offenders).toEqual([]);
  });
});
