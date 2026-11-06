/** A transport/server failure does not establish that a signed-in session is invalid. */
export function classifySessionResponse(
  status: number,
  payload: unknown
): "authenticated" | "unauthorized" | "unavailable" {
  if (status === 401) return "unauthorized";
  if (
    status < 200 ||
    status >= 300 ||
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload)
  )
    return "unavailable";
  const data = payload.data;
  if (!data || typeof data !== "object" || !("user" in data)) return "unavailable";
  return data.user && typeof data.user === "object" && "id" in data.user && data.user.id
    ? "authenticated"
    : "unavailable";
}
