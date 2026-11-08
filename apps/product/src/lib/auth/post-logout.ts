const LOGIN_PATH = "/auth/login";

const isInvitationReturnPath = (returnPath: string | null | undefined): boolean =>
  returnPath === "/organization-invitation" || returnPath === "/en/organization-invitation";

/** Keep explicit invitation recovery usable even when logout could not clear a stale auth cookie. */
export function shouldKeepInvitationLoginOpen(
  returnPath: string | null,
  reauth: string | null
): boolean {
  return reauth === "1" && isInvitationReturnPath(returnPath);
}

/**
 * 登出後要導向的登入頁路徑，保留目前語系。
 * 路由採 next-intl `localePrefix: "as-needed"`：預設中文不帶前綴，英文帶 `/en`。
 */
export function getPostLogoutLoginPath(pathname: string, returnPath?: string): string {
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const loginPath = isEnglish ? `/en${LOGIN_PATH}` : LOGIN_PATH;
  // Invitation tokens stay in the HttpOnly cookie, never in a login URL.
  if (returnPath && isInvitationReturnPath(returnPath)) {
    return `${loginPath}?redirect=${encodeURIComponent(returnPath)}&reauth=1`;
  }
  return loginPath;
}
