const DEFAULT_AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Auth cookie name for this deployment (daodaoedu/daodao#526).
 * dev and production share the `.daodao.so` cookie domain, so each environment
 * must use its own name; it must match the API's AUTH_COOKIE_NAME.
 */
export function getAuthCookieName(): string {
  const configured = process.env.AUTH_COOKIE_NAME?.trim();
  if (!configured) return DEFAULT_AUTH_COOKIE_NAME;
  if (!AUTH_COOKIE_NAME_PATTERN.test(configured))
    throw new Error('AUTH_COOKIE_NAME may only contain letters, digits, "_" and "-"');
  return configured;
}

/** Cookie header value that forwards the user's session to the API from server-side code. */
export function authCookieHeader(authToken: string | undefined): string {
  return `${getAuthCookieName()}=${authToken ?? ""}`;
}

/** Match the API's first-cookie precedence while preserving its encoded value. */
export function getRawAuthTokenCookie(cookieHeader: string | null): string | undefined {
  const name = getAuthCookieName();
  for (const part of cookieHeader?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).replace(/^[\t ]+|[\t ]+$/g, "") !== name)
      continue;
    return part.slice(separator + 1).replace(/^[\t ]+|[\t ]+$/g, "");
  }
  return undefined;
}
