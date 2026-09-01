/** 已知網域對照表（FR-3.15），key 為去除 www. 的 host */
export const KNOWN_DOMAIN_NAMES: Readonly<Record<string, string>> = {
  "books.com.tw": "博客來",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "hahow.in": "Hahow",
  "coursera.org": "Coursera",
  "medium.com": "Medium",
  "notion.so": "Notion",
  "daodao.so": "島島阿學",
};

const SEGMENT_MAX_LENGTH = 40;
const HEX_LIKE = /^[0-9a-f]{16,}$/i;

function stripWww(host: string): string {
  return host.replace(/^www\./, "");
}

function lastPathSegment(pathname: string): string | null {
  const segment = pathname
    .split("/")
    .filter((part) => part.length > 0)
    .at(-1);
  if (!segment) return null;

  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // 保留原始字串
  }

  const readable = decoded.replace(/[-_]+/g, " ").trim();
  if (readable.length === 0) return null;
  if (readable.length > SEGMENT_MAX_LENGTH) return null;
  if (HEX_LIKE.test(readable)) return null;
  return readable;
}

/**
 * 依 FR-3.15 的純函式部分推導資源名稱（不含 og:title）：
 * 已知網域 → 路徑最後一段｜網域 → 網域。
 * URL 無法 parse 或非 http(s) 時回傳 null。
 */
export function deriveResourceName(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const host = stripWww(parsed.hostname.toLowerCase());
  if (host.length === 0) return null;

  const known = KNOWN_DOMAIN_NAMES[host];
  if (known) return known;

  const segment = lastPathSegment(parsed.pathname);
  return segment ? `${segment}｜${host}` : host;
}
