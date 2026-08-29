/**
 * Auto-naming for resource links (FR-8.4/8.5): map well-known services to
 * readable names, annotate PDFs, fall back to a cleaned filename, then the
 * domain name.
 *
 * Service matching is done on the parsed hostname (exact or subdomain match),
 * never on a substring of the whole URL, so `evil.com/?x=hackmd.io` or
 * `hackmd.io.evil.com` are not mistaken for the real service.
 */

interface KnownService {
  hosts: string[];
  /** Optional pathname prefix required in addition to the host match. */
  pathPrefix?: string;
  name: string;
}

const KNOWN_SERVICES: KnownService[] = [
  { hosts: ["docs.google.com"], pathPrefix: "/document", name: "Google 文件" },
  { hosts: ["docs.google.com"], pathPrefix: "/spreadsheets", name: "Google 試算表" },
  { hosts: ["docs.google.com"], pathPrefix: "/presentation", name: "Google 簡報" },
  { hosts: ["docs.google.com"], pathPrefix: "/forms", name: "Google 表單" },
  { hosts: ["forms.gle"], name: "Google 表單" },
  { hosts: ["drive.google.com"], name: "Google 雲端硬碟" },
  { hosts: ["meet.google.com"], name: "Google Meet" },
  { hosts: ["calendar.google.com"], name: "Google 日曆" },
  { hosts: ["hackmd.io"], name: "HackMD" },
  { hosts: ["notion.so", "notion.site"], name: "Notion" },
  { hosts: ["youtube.com", "youtu.be"], name: "YouTube" },
  { hosts: ["figma.com"], name: "Figma" },
  { hosts: ["zoom.us"], name: "Zoom" },
  { hosts: ["padlet.com"], name: "Padlet" },
  { hosts: ["miro.com"], name: "Miro" },
  { hosts: ["spotify.com"], name: "Spotify" },
];

/** True when `hostname` is `domain` itself or one of its subdomains. */
export function hostMatches(hostname: string, domain: string): boolean {
  const host = hostname.toLowerCase();
  return host === domain || host.endsWith(`.${domain}`);
}

/** Parse a URL string, returning null instead of throwing on invalid input. */
export function parseUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl.trim());
  } catch {
    return null;
  }
}

/** Derive a readable link name from a URL (FR-8.4/8.5). */
export function autoNameForUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  const isPdf = /\.pdf(\?|#|$)/i.test(url);
  const parsed = parseUrl(url);

  if (parsed) {
    const service = KNOWN_SERVICES.find(
      (entry) =>
        entry.hosts.some((host) => hostMatches(parsed.hostname, host)) &&
        (!entry.pathPrefix || parsed.pathname.startsWith(entry.pathPrefix))
    );
    if (service) return isPdf ? `${service.name}（PDF）` : service.name;
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
