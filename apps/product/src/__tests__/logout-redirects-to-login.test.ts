import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * daodao#346 regression guard。
 *
 * 側欄帳號選單、手機版選單直接呼叫 `useAuth().logout()`，只清掉登入狀態、停在原頁；
 * 首頁訪客畫面沒有登入入口，使用者登出後找不到再次登入的地方。
 *
 * 登出一律經 `useLogoutAndRedirect`（hooks/use-logout-redirect.ts），登出後導向登入頁。
 * 元件不可從 `useAuth()`／`useAuthContext()` 取 `logout` 自己呼叫。
 */
const ALLOWED = new Set(["hooks/use-logout-redirect.ts"]);

const SRC_DIR = path.resolve(__dirname, "..");
// useAuth 是 useAuthContext 的別名；解構與直接呼叫（useAuth().logout()、auth.logout()）都算
const BARE_LOGOUT =
  /const\s*\{[^}]*\blogout\b[^}]*\}\s*=\s*useAuth(?:Context)?\(\)|useAuth(?:Context)?\(\)\.logout\b|\bauth\.logout\(/;

const sourceFiles = (readdirSync(SRC_DIR, { recursive: true }) as string[]).filter(
  (rel) => /\.(ts|tsx)$/.test(rel) && !rel.split(path.sep).includes("__tests__")
);

describe("logout always redirects to the login page", () => {
  it("components log out through useLogoutAndRedirect instead of useAuth().logout", () => {
    const offenders = sourceFiles
      .filter((rel) => !ALLOWED.has(rel))
      .filter((rel) => BARE_LOGOUT.test(readFileSync(path.join(SRC_DIR, rel), "utf8")));

    expect(sourceFiles.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
