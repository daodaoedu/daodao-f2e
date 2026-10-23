import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * daodao#346 regression guard。
 *
 * 側欄帳號選單、手機版選單直接呼叫 `useAuth().logout()`，只清掉登入狀態、停在原頁；
 * 首頁訪客畫面沒有登入入口，使用者登出後找不到再次登入的地方。
 *
 * 登出一律經 `useLogoutAndRedirect`（hooks/use-logout-redirect.ts），登出後導向登入頁。
 * 元件不可從 `useAuth()` 解構 `logout` 自己呼叫。
 */
const ALLOWED = new Set(["hooks/use-logout-redirect.ts"]);

const SRC_DIR = path.resolve(__dirname, "..");
const DESTRUCTURE_LOGOUT_FROM_USE_AUTH = /const\s*\{[^}]*\blogout\b[^}]*\}\s*=\s*useAuth\(\)/;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return name === "__tests__" || name === "node_modules" ? [] : walk(full);
    }
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });

describe("logout always redirects to the login page", () => {
  it("components log out through useLogoutAndRedirect instead of useAuth().logout", () => {
    const offenders = walk(SRC_DIR)
      .map((file) => path.relative(SRC_DIR, file))
      .filter((rel) => !ALLOWED.has(rel))
      .filter((rel) =>
        DESTRUCTURE_LOGOUT_FROM_USE_AUTH.test(readFileSync(path.join(SRC_DIR, rel), "utf8"))
      );

    expect(offenders).toEqual([]);
  });
});
