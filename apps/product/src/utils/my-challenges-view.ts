export type MyChallengesView = "loading" | "login-required" | "error" | "ready";

/**
 * 「我的共同挑戰」頁該顯示哪個狀態（daodao#295 AC-01）。
 * 未登入時 GET /me/challenges 必回 401，不能只看清單的 isLoading／空陣列：
 * 登入狀態確認為未登入 → 顯示需要登入；已登入但載入失敗 → 顯示錯誤，而不是空清單。
 */
export function resolveMyChallengesView(state: {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
}): MyChallengesView {
  if (state.isAuthLoading) return "loading";
  if (!state.isAuthenticated) return "login-required";
  if (state.hasError) return "error";
  if (state.isLoading) return "loading";
  return "ready";
}
