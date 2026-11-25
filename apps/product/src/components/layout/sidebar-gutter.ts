/**
 * 版面上「當作訪客」的判斷（daodao#567）：決定要不要留側欄空位、要不要顯示訪客頁首。
 *
 * 第一次畫面只看伺服器讀到的登入 cookie（SSR 與 client 同值，不會 hydration mismatch）：
 * 確定沒有 cookie 才當訪客；不知道（null）或有 cookie 都先當登入，避免登入使用者被往右推。
 */
export const initialLayoutGuest = (hasSessionCookie: boolean | null): boolean =>
  hasSessionCookie === false;

/**
 * 登入檢查完成後以實際狀態為準（cookie 失效、站內登出時修正第一次的判斷）。
 * 還在檢查中回傳 null，表示維持目前狀態。
 */
export const resolvedLayoutGuest = ({
  isLoading,
  isAuthenticated,
}: {
  isLoading: boolean;
  isAuthenticated: boolean;
}): boolean | null => (isLoading ? null : !isAuthenticated);
