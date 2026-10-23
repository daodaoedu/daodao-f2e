const LOGIN_PATH = "/auth/login";

/**
 * 登出後要導向的登入頁路徑，保留目前語系。
 * 路由採 next-intl `localePrefix: "as-needed"`：預設中文不帶前綴，英文帶 `/en`。
 */
export function getPostLogoutLoginPath(pathname: string): string {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  return isEnglish ? `/en${LOGIN_PATH}` : LOGIN_PATH;
}
