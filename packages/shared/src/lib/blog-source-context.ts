import { z } from "zod";

const touchSchema = z
  .object({
    articleId: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    articleSlug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    locale: z.enum(["zh-TW", "en"]),
    source: z.enum(["search", "social", "internal", "unknown"]),
    occurredAt: z.string().datetime({ offset: true }),
  })
  .strict();
const contextSchema = z
  .object({
    version: z.literal(1),
    contextId: z.string().uuid(),
    ttlSeconds: z.number().int().positive(),
    first: touchSchema,
    lastAssist: touchSchema,
  })
  .strict();
export const blogSourceReportContextSchema = z
  .object({
    contextId: z.string().uuid(),
    confidence: z.literal("browser_reported"),
    release: z
      .object({
        id: z.string().regex(/^[a-f0-9]{64}$/),
        frontend_sha: z.string().regex(/^[a-f0-9]{40}$/),
        content_sha: z.string().regex(/^[a-f0-9]{40}$/),
        baseline_sha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict()
      .optional(),
    first: touchSchema,
    lastAssist: touchSchema,
  })
  .strict();
export type BlogSourceReportContext = z.infer<typeof blogSourceReportContextSchema>;
export type BlogSourceTouch = z.infer<typeof touchSchema>;
export type BlogSourceContext = z.infer<typeof contextSchema>;
export type BlogSourceConfig = { ttlSeconds: number; domain: string };
const COOKIE = "daodao_blog_context";

/** No deployment configuration means no context storage or association. */
export function resolveBlogSourceConfig(
  ttl: string | undefined,
  domain: string | undefined,
  hostname: string
): BlogSourceConfig | null {
  if (!ttl || !/^\d+$/.test(ttl) || !domain) return null;
  const ttlSeconds = Number(ttl);
  const normalized = domain.replace(/^\./, "").toLowerCase();
  if (
    !Number.isSafeInteger(ttlSeconds) ||
    ttlSeconds <= 0 ||
    ttlSeconds > 2147483647 ||
    !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(normalized)
  )
    return null;
  if (hostname !== normalized && !hostname.endsWith(`.${normalized}`)) return null;
  return { ttlSeconds, domain: normalized };
}
export function parseBlogSourceContext(
  raw: string | null,
  config: BlogSourceConfig,
  now = Date.now()
): BlogSourceContext | null {
  if (!raw || raw.length > 2048) return null;
  try {
    const result = contextSchema.safeParse(JSON.parse(raw));
    if (!result.success || result.data.ttlSeconds !== config.ttlSeconds) return null;
    const value = result.data;
    const first = Date.parse(value.first.occurredAt);
    const last = Date.parse(value.lastAssist.occurredAt);
    if (first > now || last > now || last < first || now - first >= config.ttlSeconds * 1000)
      return null;
    return value;
  } catch {
    return null;
  }
}
export function buildBlogSourceContext(
  previous: BlogSourceContext | null,
  touch: BlogSourceTouch,
  config: BlogSourceConfig,
  now = Date.now(),
  contextId = crypto.randomUUID()
): BlogSourceContext | null {
  const candidate = previous
    ? { ...previous, lastAssist: touch }
    : { version: 1, contextId, ttlSeconds: config.ttlSeconds, first: touch, lastAssist: touch };
  return parseBlogSourceContext(JSON.stringify(candidate), config, now);
}
function config(): BlogSourceConfig | null {
  return typeof window === "undefined"
    ? null
    : resolveBlogSourceConfig(
        process.env.NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_TTL_SECONDS,
        process.env.NEXT_PUBLIC_BLOG_SOURCE_CONTEXT_DOMAIN,
        window.location.hostname
      );
}
function trackingState(): "out" | "available" | "unavailable" {
  try {
    const sdk = (window as unknown as { posthog?: { has_opted_out_capturing?: () => unknown } })
      .posthog;
    const state = sdk?.has_opted_out_capturing?.();
    return state === true ? "out" : state === false ? "available" : "unavailable";
  } catch {
    return "unavailable";
  }
}
function rawCookie(): string | null {
  let cookies: string;
  try {
    cookies = document.cookie;
  } catch {
    return null;
  }
  const value = cookies
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`));
  if (!value) return null;
  try {
    return decodeURIComponent(value.slice(COOKIE.length + 1));
  } catch {
    return null;
  }
}
export function clearBlogSourceContext(): void {
  if (typeof document === "undefined") return;
  const options = config();
  const suffix = options ? `; Domain=${options.domain}` : "";
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every supported browser; the configured shared first-party domain is required.
    document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${suffix}${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    /* Storage restrictions never block account actions. */
  }
}
export function readBlogSourceHeader(): string | undefined {
  const options = config();
  const state = trackingState();
  if (!options || state !== "available") {
    if (state === "out") clearBlogSourceContext();
    return undefined;
  }
  const value = parseBlogSourceContext(rawCookie(), options);
  if (!value) {
    clearBlogSourceContext();
    return undefined;
  }
  return JSON.stringify(value);
}
export function recordBlogSourceTouch(touch: BlogSourceTouch): boolean {
  const options = config();
  const state = trackingState();
  if (!options || state !== "available") {
    if (state === "out") clearBlogSourceContext();
    return false;
  }
  const raw = rawCookie();
  const previous = parseBlogSourceContext(raw, options);
  // A malformed/expired stored context cannot silently restart with a new attribution.
  if (raw && !previous) {
    clearBlogSourceContext();
    return false;
  }
  const value = buildBlogSourceContext(previous, touch, options);
  if (!value) return false;
  const remaining = Math.max(
    0,
    Math.floor((Date.parse(value.first.occurredAt) + options.ttlSeconds * 1000 - Date.now()) / 1000)
  );
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every supported browser; the configured shared first-party domain is required.
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Domain=${options.domain}; Max-Age=${remaining}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  } catch {
    return false;
  }
  return parseBlogSourceContext(rawCookie(), options)?.contextId === value.contextId;
}
