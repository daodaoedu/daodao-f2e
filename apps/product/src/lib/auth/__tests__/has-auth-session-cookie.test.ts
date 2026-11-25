import { afterEach, describe, expect, it, vi } from "vitest";
import { hasAuthSessionCookie } from "../auth-cookie";

// daodaoedu/daodao#567 dev 冒煙：root layout 寫死讀 auth_token，dev 的 Cookie 名稱是 auth_token_dev（#526），
// 登入使用者第一次畫面被當成訪客（沒有側欄空位、出現訪客頁首），載入後才跳回來
const cookieJar = (cookies: Record<string, string>) => (name: string) => cookies[name];

describe("hasAuthSessionCookie（版面樂觀判斷用）", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("依 AUTH_COOKIE_NAME 讀本環境的登入 cookie", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "auth_token_dev");
    expect(hasAuthSessionCookie(cookieJar({ auth_token_dev: "dev-session" }))).toBe(true);
  });

  it("只有別的環境的 cookie 時不算登入", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "auth_token_dev");
    expect(hasAuthSessionCookie(cookieJar({ auth_token: "prod-session" }))).toBe(false);
  });

  it("沒設 AUTH_COOKIE_NAME 時用 auth_token", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "");
    expect(hasAuthSessionCookie(cookieJar({ auth_token: "session" }))).toBe(true);
  });

  it("cookie 值是空字串時不算登入", () => {
    vi.stubEnv("AUTH_COOKIE_NAME", "");
    expect(hasAuthSessionCookie(cookieJar({ auth_token: "" }))).toBe(false);
  });
});
