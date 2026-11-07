/** Match the API's first-cookie precedence while preserving its encoded value. */
export function getRawAuthTokenCookie(cookieHeader: string | null): string | undefined {
  for (const part of cookieHeader?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).replace(/^[\t ]+|[\t ]+$/g, "") !== "auth_token")
      continue;
    return part.slice(separator + 1).replace(/^[\t ]+|[\t ]+$/g, "");
  }
  return undefined;
}
