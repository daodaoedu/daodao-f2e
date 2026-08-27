/**
 * Auto-naming for resource links (FR-8.4/8.5): map well-known services to
 * readable names, annotate PDFs, fall back to a cleaned filename, then the
 * domain name.
 */

const KNOWN_SERVICES: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /docs\.google\.com\/document/, name: "Google 文件" },
  { pattern: /docs\.google\.com\/spreadsheets/, name: "Google 試算表" },
  { pattern: /docs\.google\.com\/presentation/, name: "Google 簡報" },
  { pattern: /docs\.google\.com\/forms|forms\.gle/, name: "Google 表單" },
  { pattern: /drive\.google\.com/, name: "Google 雲端硬碟" },
  { pattern: /meet\.google\.com/, name: "Google Meet" },
  { pattern: /calendar\.google\.com/, name: "Google 日曆" },
  { pattern: /hackmd\.io/, name: "HackMD" },
  { pattern: /notion\.(so|site)/, name: "Notion" },
  { pattern: /youtube\.com|youtu\.be/, name: "YouTube" },
  { pattern: /figma\.com/, name: "Figma" },
  { pattern: /zoom\.us/, name: "Zoom" },
  { pattern: /padlet\.com/, name: "Padlet" },
  { pattern: /miro\.com/, name: "Miro" },
  { pattern: /spotify\.com/, name: "Spotify" },
];

/** Derive a readable link name from a URL (FR-8.4/8.5). */
export function autoNameForUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  const isPdf = /\.pdf(\?|#|$)/i.test(url);

  const service = KNOWN_SERVICES.find((entry) => entry.pattern.test(url));
  if (service) return isPdf ? `${service.name}（PDF）` : service.name;

  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    parsed = null;
  }

  const lastSegment = parsed?.pathname.split("/").filter(Boolean).at(-1) ?? "";
  const fileName = decodeURIComponent(lastSegment)
    .replace(/\.[a-z0-9]+$/i, "")
    .replaceAll(/[-_]+/g, " ")
    .trim();
  if (fileName && /[^\d.]/.test(fileName)) {
    return isPdf ? `${fileName}（PDF）` : fileName;
  }

  const domain = parsed?.hostname.replace(/^www\./, "") ?? url;
  return isPdf ? `${domain}（PDF）` : domain;
}
