import createMiddleware from "@daodao/i18n/middleware";
import { routing } from "@daodao/i18n/routing";
import type { NextRequest } from "next/server";

/**
 * i18n middleware
 * 注意：路由保護完全依賴 client-side 驗證（使用 useRequireAuth hook 或 AuthGuard 組件）
 * 由於跨域限制，middleware 無法讀取 cookie，因此不在 middleware 層級進行認證檢查
 */
const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 執行 i18n middleware
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
