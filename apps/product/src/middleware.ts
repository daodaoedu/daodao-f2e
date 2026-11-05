import { getEnv } from "@daodao/config";
import createMiddleware from "@daodao/i18n/middleware";
import { routing } from "@daodao/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { checkPrivateSession, isPrivateSpacePath } from "./lib/auth/private-access";
import { resolveLighthouseOrganization } from "./utils/lighthouse-organization";

/**
 * i18n middleware plus the Lighthouse organization-membership gate.
 * The API is cross-origin, so the browser cookie is forwarded explicitly by
 * this server-side middleware instead of relying on browser cookie policy.
 */
const i18nMiddleware = createMiddleware(routing);

// dev 環境曾經出現 redirect Location 帶內部 listen port (:3001)，
// 導致瀏覽器 navigate 到不可達 URL → ERR_CONNECTION_TIMED_OUT。
// 觸發條件 curl 重現不出（只在瀏覽器特定 header / cookie 組合下發生），
// 先在 middleware 層把 Location 中的 :3001 清掉，並 log 觸發 headers 以便日後追根因。
const INTERNAL_PORT_RE = /:3001(?=\/|$|\?|#)/g;
const LIGHTHOUSE_PATH_RE = /^\/(?:en\/)?lighthouse(?:\/|$)/;
const LIGHTHOUSE_ACCESS_REQUIRED_RE = /^\/(?:en\/)?lighthouse\/access-required(?:\/|$)/;

type LighthouseAccess = {
  status: "allowed" | "unauthorized" | "denied" | "unavailable";
  organizations?: Array<{ id: number; status: string }>;
};

async function hasLighthouseAccess(request: NextRequest): Promise<LighthouseAccess> {
  const authToken = request.cookies.get("auth_token")?.value;
  if (!authToken) return { status: "unauthorized" };

  try {
    // Server-side membership checks may use a private service address while browsers
    // continue using NEXT_PUBLIC_API_URL.
    const apiBaseUrl = (
      getEnv("API_INTERNAL_URL") || getEnv("NEXT_PUBLIC_API_URL", "https://api.daodao.so")
    )?.replace(/\/$/, "");
    // Middleware runs on the Edge runtime; openapi-fetch currently uses a Node API,
    // so this boundary performs the same typed endpoint call with native fetch.
    const response = await fetch(`${apiBaseUrl}/api/v1/lighthouse/organizations`, {
      headers: { Cookie: `auth_token=${authToken}` },
      cache: "no-store",
    });
    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 403) return { status: "denied" };
    if (!response.ok) return { status: "unavailable" };

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload))
      return { status: "unavailable" };
    if (!Array.isArray(payload.data)) return { status: "unavailable" };
    const organizations = payload.data.filter(
      (item): item is { id: number; status: string } =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "number" &&
        typeof item.status === "string"
    );
    if (organizations.length !== payload.data.length) return { status: "unavailable" };
    return organizations.length > 0 ? { status: "allowed", organizations } : { status: "denied" };
  } catch (error) {
    console.error("[middleware] Lighthouse membership check failed", error);
    return { status: "unavailable" };
  }
}

function localizedPath(pathname: string, path: string): string {
  return pathname.startsWith("/en/") || pathname === "/en" ? `/en${path}` : path;
}

function normalizeRedirectLocation(request: NextRequest, response: NextResponse): NextResponse {
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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPrivateSpacePath(pathname)) {
    const apiBaseUrl =
      getEnv("NEXT_PUBLIC_API_URL", "https://api.daodao.so") ?? "https://api.daodao.so";
    const access = await checkPrivateSession(request.cookies.get("auth_token")?.value, apiBaseUrl);
    if (access !== "allowed") {
      const destination = request.nextUrl.clone();
      destination.pathname = localizedPath(
        pathname,
        access === "unauthorized" ? "/auth/login" : "/auth/access-unavailable"
      );
      destination.search = `?redirect=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`;
      const response = normalizeRedirectLocation(request, NextResponse.redirect(destination));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }
  if (LIGHTHOUSE_PATH_RE.test(pathname) && !LIGHTHOUSE_ACCESS_REQUIRED_RE.test(pathname)) {
    const access = await hasLighthouseAccess(request);
    if (access.status !== "allowed") {
      if (access.status === "unavailable") {
        const errorUrl = request.nextUrl.clone();
        errorUrl.pathname = localizedPath(pathname, "/lighthouse/access-required");
        errorUrl.search = "?reason=unavailable";
        return normalizeRedirectLocation(request, NextResponse.redirect(errorUrl));
      }
      const redirectUrl = request.nextUrl.clone();
      if (access.status === "unauthorized") {
        redirectUrl.pathname = localizedPath(pathname, "/auth/login");
        redirectUrl.search = `?redirect=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`;
      } else {
        redirectUrl.pathname = localizedPath(pathname, "/lighthouse/access-required");
        redirectUrl.search = "";
      }
      return normalizeRedirectLocation(request, NextResponse.redirect(redirectUrl));
    }
    const entry = pathname.match(
      /^(\/(?:en\/)?lighthouse)(\/(?:programs|templates|organization|archive))?\/?$/
    );
    if (entry) {
      const requested = request.nextUrl.searchParams.get("organizationId");
      if (requested === "") {
        const destination = request.nextUrl.clone();
        destination.pathname = localizedPath(pathname, "/lighthouse/access-required");
        destination.search = "";
        return normalizeRedirectLocation(request, NextResponse.redirect(destination));
      }
      let savedId: number | null = null;
      if (requested === null) {
        try {
          const apiBaseUrl = (
            getEnv("API_INTERNAL_URL") || getEnv("NEXT_PUBLIC_API_URL", "https://api.daodao.so")
          )?.replace(/\/$/, "");
          const preferenceResponse = await fetch(`${apiBaseUrl}/api/v1/lighthouse/preferences`, {
            headers: { Cookie: `auth_token=${request.cookies.get("auth_token")?.value}` },
            cache: "no-store",
          });
          if (preferenceResponse.ok) {
            const payload: unknown = await preferenceResponse.json();
            if (
              payload &&
              typeof payload === "object" &&
              "data" in payload &&
              payload.data &&
              typeof payload.data === "object" &&
              "organizationId" in payload.data &&
              typeof payload.data.organizationId === "number"
            )
              savedId = payload.data.organizationId;
          }
        } catch {
          // Preference outages must not block an otherwise authorized organization entry.
        }
      }
      const resolution = resolveLighthouseOrganization(
        access.organizations ?? [],
        requested,
        savedId
      );
      // Explicit old query choices stay explicit, including forbidden IDs; the scoped page
      // displays unavailable instead of silently selecting a different organization.
      const organizationId =
        requested ?? (resolution.status === "ready" ? String(resolution.organizationId) : null);
      if (organizationId !== null && organizationId !== "") {
        const destination = request.nextUrl.clone();
        destination.pathname = `${entry[1]}/o/${encodeURIComponent(organizationId)}${entry[2] ?? ""}`;
        destination.searchParams.delete("organizationId");
        const response = normalizeRedirectLocation(request, NextResponse.redirect(destination));
        response.headers.set("Cache-Control", "private, no-store");
        return response;
      }
    }
  }

  const response = await i18nMiddleware(request);

  return normalizeRedirectLocation(request, response);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
