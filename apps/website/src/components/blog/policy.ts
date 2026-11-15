export function assertPreviewOrigin(mode: string, origin: string) {
  if (mode !== "draft") return;
  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    throw new Error("Draft preview requires an explicit website origin");
  }
  if (hostname === "daodao.so" || hostname === "www.daodao.so")
    throw new Error("Draft content cannot be used on the production website");
}
