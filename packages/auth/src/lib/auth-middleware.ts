import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * 路由保護配置選項
 */
export interface AuthMiddlewareOptions {
  /**
   * 需要保護的路徑前綴
   * 這些路徑需要登入才能訪問
   */
  protectedPaths?: string[];

  /**
   * 公開路徑（不需要登入）
   * 這些路徑即使未登入也可以訪問
   */
  publicPaths?: string[];

  /**
   * Cookie 名稱
   */
  cookieName?: string;
}

/**
 * 檢查路徑是否需要保護
 * @param pathname 路徑名稱
 * @param options 配置選項
 * @returns 是否需要保護
 */
const isProtectedPath = (pathname: string, options: Required<AuthMiddlewareOptions>): boolean => {
  // 檢查是否為公開路徑（優先級最高）
  if (options.publicPaths.some((path) => pathname.startsWith(path))) {
    return false;
  }

  // 如果指定了 protectedPaths，只保護這些路徑
  // 如果 protectedPaths 為空，預設保護所有路徑（除了 publicPaths）
  if (options.protectedPaths.length > 0) {
    return options.protectedPaths.some((path) => pathname.startsWith(path));
  }

  // 預設保護所有路徑
  return true;
};

/**
 * Auth Middleware
 * 檢查 Cookie 是否存在，保護需要登入的路徑
 *
 * @param request Next.js Request 物件
 * @param options 配置選項
 * @returns NextResponse 或 null（繼續處理）
 */
export const authMiddleware = async (request: NextRequest, options: AuthMiddlewareOptions) => {
  const { pathname } = request.nextUrl;

  // 合併配置選項
  const config: Required<AuthMiddlewareOptions> = {
    protectedPaths: options.protectedPaths ?? [],
    publicPaths: options.publicPaths ?? [],
    cookieName: options.cookieName ?? "token",
  };

  // 如果不需要保護，直接通過
  if (!isProtectedPath(pathname, config)) {
    return NextResponse.next();
  }

  // 檢查 Cookie 是否存在
  // 在 Middleware 中，直接從 request.cookies 讀取
  const authToken = request.cookies.get(config.cookieName);

  if (!authToken) {
    // Cookie 不存在，跳轉到登入頁，保留原始 URL
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};
