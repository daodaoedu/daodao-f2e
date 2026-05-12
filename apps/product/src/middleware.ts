import createMiddleware from "@daodao/i18n/middleware";
import { routing } from "@daodao/i18n/routing";
import type { NextRequest } from "next/server";

/**
 * i18n middleware
 * 注意：路由保護完全依賴 client-side 驗證（使用 useRequireAuth hook 或 AuthGuard 組件）
 * 由於跨域限制，middleware 無法讀取 cookie，因此不在 middleware 層級進行認證檢查
 */
const i18nMiddleware = createMiddleware(routing);

// dev 環境曾經出現 redirect Location 帶內部 listen port (:3001)，
// 導致瀏覽器 navigate 到不可達 URL → ERR_CONNECTION_TIMED_OUT。
// 觸發條件 curl 重現不出（只在瀏覽器特定 header / cookie 組合下發生），
// 先在 middleware 層把 Location 中的 :3001 清掉，並 log 觸發 headers 以便日後追根因。
const INTERNAL_PORT_RE = /:3001(?=\/|$|\?|#)/g;

export default async function middleware(request: NextRequest) {
  const response = await i18nMiddleware(request);

  const location = response.headers.get("location");
  // Local dev runs on :3001 directly, so :3001 in Location is legitimate there.
  // Only strip when the request host is not :3001 (i.e., behind a proxy in prod).
  const isLocalDevPort = (request.headers.get("host") ?? "").endsWith(":3001");
  if (location?.includes(":3001") && !isLocalDevPort) {
    const cleaned = location.replace(INTERNAL_PORT_RE, "");
    response.headers.set("location", cleaned);

    console.warn("[middleware] stripped :3001 from redirect Location", {
      method: request.method,
      path: request.nextUrl.pathname + request.nextUrl.search,
      original: location,
      rewritten: cleaned,
      hasCookie: request.headers.has("cookie"),
      hasRsc: request.headers.has("rsc") || request.headers.has("next-router-state-tree"),
      headers: {
        host: request.headers.get("host"),
        "x-forwarded-host": request.headers.get("x-forwarded-host"),
        "x-forwarded-port": request.headers.get("x-forwarded-port"),
        "x-forwarded-proto": request.headers.get("x-forwarded-proto"),
        referer: request.headers.get("referer"),
        "user-agent": request.headers.get("user-agent"),
        "sec-fetch-site": request.headers.get("sec-fetch-site"),
        "sec-fetch-mode": request.headers.get("sec-fetch-mode"),
        "sec-fetch-dest": request.headers.get("sec-fetch-dest"),
      },
    });
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
