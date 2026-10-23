export type PrivateSessionAccess = "allowed" | "unauthorized" | "unavailable";

/** Private space pages require login; published token links retain anonymous access. */
export function isPrivateSpacePath(pathname: string): boolean {
  const path = pathname.replace(/^\/(?:en|zh-TW)(?=\/|$)/, "");
  return /^\/spaces(?:\/|$)/.test(path) && !/^\/spaces\/public\/[^/]+(?:\/|$)/.test(path);
}

/** Validate a private-page session without treating a service outage as logout. */
export async function checkPrivateSession(
  authToken: string | undefined,
  apiBaseUrl: string,
  request: typeof fetch = fetch
): Promise<PrivateSessionAccess> {
  if (!authToken) return "unauthorized";
  try {
    const response = await request(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/me`, {
      headers: { Cookie: `auth_token=${authToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401) return "unauthorized";
    if (!response.ok) return "unavailable";
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload)) return "unavailable";
    const data = payload.data;
    if (!data || typeof data !== "object" || !("user" in data)) return "unavailable";
    if (!(data.user && typeof data.user === "object" && "id" in data.user && data.user.id))
      return "unavailable";
    if ("isTemporary" in data && data.isTemporary === true) return "unauthorized";
    return "allowed";
  } catch {
    return "unavailable";
  }
}
