import { getEnv } from "@daodao/config";
import createMiddleware from "@daodao/i18n/middleware";
import { routing } from "@daodao/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { getRawAuthTokenCookie } from "./lib/auth/auth-cookie";
import { checkPrivateSession, isPrivateSpacePath } from "./lib/auth/private-access";
import {
  isOrganizationInvitationToken,
  ORGANIZATION_INVITATION_COOKIE,
  ORGANIZATION_INVITATION_PATH,
} from "./lib/organization-invitation-token";
import { resolveLighthouseOrganization } from "./utils/lighthouse-organization";

/**
 * i18n middleware plus the Lighthouse organization-membership gate.
 * The API is cross-origin, so the browser cookie is forwarded explicitly by
 * this server-side middleware instead of relying on browser cookie policy.
 */
const i18nMiddleware = createMiddleware(routing);

const LIGHTHOUSE_PATH_RE = /^\/(?:en\/)?lighthouse(?:\/|$)/;
const LIGHTHOUSE_ACCESS_REQUIRED_RE = /^\/(?:en\/)?lighthouse\/access-required(?:\/|$)/;

type LighthouseAccess = {
  status: "allowed" | "unauthorized" | "denied" | "unavailable";
  organizations?: Array<{ id: number; status: string }>;
};

async function hasLighthouseAccess(request: NextRequest): Promise<LighthouseAccess> {
  const authToken = getRawAuthTokenCookie(request.headers.get("cookie"));
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
    if (response.status !== 403) {
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
      if (organizations.length > 0) return { status: "allowed", organizations };
    }
    // Leaders without organization membership may only access their resources in templates.
    if (!/^\/(?:en\/)?lighthouse\/templates(?:\/|$)/.test(request.nextUrl.pathname))
      return { status: "denied" };
    const bindingsResponse = await fetch(
      `${apiBaseUrl}/api/v1/lighthouse/my-cohort-resource-bindings`,
      {
        headers: { Cookie: `auth_token=${authToken}` },
        cache: "no-store",
      }
    );
    if (bindingsResponse.status === 401) return { status: "unauthorized" };
    if (bindingsResponse.status === 403) return { status: "denied" };
    if (!bindingsResponse.ok) return { status: "unavailable" };
    const bindings: unknown = await bindingsResponse.json();
    if (
      !bindings ||
      typeof bindings !== "object" ||
      !("data" in bindings) ||
      !Array.isArray(bindings.data)
    )
      return { status: "unavailable" };
    if (
      !bindings.data.every(
        (binding: unknown) =>
          binding !== null &&
          typeof binding === "object" &&
          "organizationId" in binding &&
          Number.isInteger(binding.organizationId) &&
          "templateId" in binding &&
          Number.isInteger(binding.templateId) &&
          "cohortId" in binding &&
          Number.isInteger(binding.cohortId) &&
          "cohortName" in binding &&
          typeof binding.cohortName === "string" &&
          "templateName" in binding &&
          typeof binding.templateName === "string"
      )
    )
      return { status: "unavailable" };
    return { status: bindings.data.length > 0 ? "allowed" : "denied" };
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
  const host = request.headers.get("host");
  if (!location || !host || !/^[a-zA-Z0-9.[\]:-]+$/.test(host)) return response;

  try {
    const destination = new URL(location, request.nextUrl);
    // Next builds middleware URLs from the container's listen address. Host is the
    // requested public authority; forwarded-host must not choose a new destination.
    const publicOrigin = new URL(`${request.nextUrl.protocol}//${host}`);
    // next-intl can combine the public Host hostname with Next's internal port.
    // Accept only that exact request-protocol/listen-port variant, never another
    // authority supplied by a redirect or by forwarded headers.
    const isPublicHostWithListenPort =
      destination.protocol === request.nextUrl.protocol &&
      destination.hostname === publicOrigin.hostname &&
      destination.port === request.nextUrl.port;
    if (
      destination.username ||
      destination.password ||
      (destination.origin !== request.nextUrl.origin && !isPublicHostWithListenPort)
    )
      return response;
    try {
      // TLS terminates before Next in dev; only the configured app authority may
      // restore HTTPS, never an untrusted forwarded header or a different host.
      const configuredOrigin = new URL(getEnv("NEXT_PUBLIC_APP_URL") || "");
      if (
        configuredOrigin.protocol === "https:" &&
        configuredOrigin.host === publicOrigin.host &&
        !configuredOrigin.username &&
        !configuredOrigin.password
      )
        publicOrigin.protocol = "https:";
    } catch {
      // Missing or invalid app configuration retains the request's protocol.
    }
    destination.protocol = publicOrigin.protocol;
    destination.hostname = publicOrigin.hostname;
    destination.port = publicOrigin.port;
    response.headers.set("location", destination.toString());
  } catch {
    // A malformed authority must not become a redirect destination.
  }
  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Remove the secret before rendering HTML, loading analytics, or constructing OAuth state.
  if (ORGANIZATION_INVITATION_PATH.test(pathname) && request.nextUrl.searchParams.has("token")) {
    const tokens = request.nextUrl.searchParams.getAll("token");
    const token = tokens.length === 1 ? (tokens[0] ?? null) : null;
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.search = "";
    const response = normalizeRedirectLocation(request, NextResponse.redirect(cleanUrl, 303));
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.cookies.set(
      ORGANIZATION_INVITATION_COOKIE,
      isOrganizationInvitationToken(token) ? token : "",
      {
        httpOnly: true,
        secure: getEnv("NODE_ENV") === "production" || request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: isOrganizationInvitationToken(token) ? 7 * 24 * 60 * 60 : 0,
      }
    );
    return response;
  }
  if (isPrivateSpacePath(pathname)) {
    const apiBaseUrl =
      getEnv("API_INTERNAL_URL") ||
      getEnv("NEXT_PUBLIC_API_URL", "https://api.daodao.so") ||
      "https://api.daodao.so";
    const access = await checkPrivateSession(
      getRawAuthTokenCookie(request.headers.get("cookie")),
      apiBaseUrl
    );
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
            headers: {
              Cookie: `auth_token=${getRawAuthTokenCookie(request.headers.get("cookie"))}`,
            },
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
