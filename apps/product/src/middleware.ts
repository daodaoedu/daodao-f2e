import { authMiddleware } from "@daodao/auth/lib/auth-middleware";
import createMiddleware from "@daodao/i18n/middleware";
import { routing } from "@daodao/i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 組合 i18n middleware 和 auth middleware
 */
const i18nMiddleware = createMiddleware(routing);

/**
 * Auth Middleware 配置
 * 可以在這裡自訂需要保護的路徑和公開路徑
 */
const authConfig = {
  // 需要保護的路徑（需要登入）
  protectedPaths: [
    "/dashboard",
    "/quiz/advanced-analysis",
    // 可以在這裡添加更多需要保護的路徑
  ],
  // 公開路徑（不需要登入）
  publicPaths: [
    "/auth/login",
    "/auth/callback",
    "/auth/logout",
    // 可以在這裡添加更多公開路徑
  ],
  cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME,
};

export default async function middleware(request: NextRequest) {
  // 先執行 i18n middleware
  const i18nResponse = i18nMiddleware(request);

  // 如果 i18n middleware 返回重定向，直接返回
  if (
    i18nResponse instanceof Response &&
    (i18nResponse.status === 307 || i18nResponse.status === 308)
  ) {
    return i18nResponse;
  }

  // 執行 auth middleware（檢查登入狀態）
  const authResponse = await authMiddleware(request, authConfig);

  // 如果 auth middleware 返回重定向，直接返回
  if (
    authResponse instanceof Response &&
    (authResponse.status === 307 || authResponse.status === 308)
  ) {
    return authResponse;
  }

  // 兩個 middleware 都通過，返回 i18n 的響應或繼續處理
  return i18nResponse instanceof Response ? i18nResponse : NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
