import { z } from "zod";

const identifier = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
export const blogInteractionSchema = z
  .object({
    event: z.enum(["blog_article_viewed", "blog_beta_interest_clicked"]),
    interaction_id: z.string().uuid(),
    article_id: identifier,
    article_slug: identifier,
    locale: z.enum(["zh-TW", "en"]),
    source: z.enum(["direct", "search", "social", "internal", "unknown"]),
    cta_target: z.literal("beta-interest").optional(),
  })
  .strict()
  .refine(
    (value) => value.event !== "blog_beta_interest_clicked" || value.cta_target === "beta-interest",
    "CTA clicks require their confirmed target"
  );
export type BlogInteractionType = z.infer<typeof blogInteractionSchema>;
export type BlogCaptureType = (event: string, properties: Record<string, unknown>) => void;

export function classifyBlogSource(
  referrer: string,
  campaignSource?: string
): BlogInteractionType["source"] {
  if (campaignSource) {
    if (["google", "bing"].includes(campaignSource.toLowerCase())) return "search";
    if (
      ["linkedin", "facebook", "instagram", "threads", "medium", "vocus"].includes(
        campaignSource.toLowerCase()
      )
    )
      return "social";
    return "unknown";
  }
  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    if (!["http:", "https:"].includes(url.protocol)) return "unknown";
    const host = url.hostname.toLowerCase();
    if (host === "daodao.so" || host.endsWith(".daodao.so")) return "internal";
    if (
      ["google.com", "google.com.tw", "bing.com"].some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      )
    )
      return "search";
    if (
      [
        "linkedin.com",
        "facebook.com",
        "instagram.com",
        "threads.net",
        "threads.com",
        "medium.com",
        "vocus.cc",
      ].some((domain) => host === domain || host.endsWith(`.${domain}`))
    )
      return "social";
  } catch {
    return "unknown";
  }
  return "unknown";
}

/** One tracker per mounted page. Queue success is not server delivery or form submission. */
export function createBlogTracker(capture: BlogCaptureType | undefined) {
  const queued = new Set<string>();
  return (input: unknown): "queued" | "duplicate" | "unavailable" | "invalid" | "failed" => {
    const parsed = blogInteractionSchema.safeParse(input);
    if (!parsed.success) return "invalid";
    if (!capture) return "unavailable";
    const data = parsed.data;
    if (queued.has(data.interaction_id)) return "duplicate";
    const { article_slug, ...properties } = data;
    const route = `${data.locale === "en" ? "/en" : ""}/blog/${article_slug}`;
    try {
      capture(data.event, {
        ...properties,
        route,
        $current_url: `https://daodao.so${route}`,
        $process_person_profile: false,
      });
      queued.add(data.interaction_id);
      return "queued";
    } catch {
      return "failed";
    }
  };
}

export type BlogAnalyticsEnvelopeType = {
  event: string;
  properties?: Record<string, unknown>;
  $set?: Record<string, unknown>;
  $set_once?: Record<string, unknown>;
};

/** Self-contained so the same tested hook can be serialized into the SDK initialization. */
export function sanitizeBlogAnalyticsEvent(
  event: BlogAnalyticsEnvelopeType
): BlogAnalyticsEnvelopeType | null {
  const properties = event.properties ?? {};
  let blogRoute =
    event.event === "blog_article_viewed" || event.event === "blog_beta_interest_clicked";
  try {
    const href = typeof properties.$current_url === "string" ? properties.$current_url : "";
    const pathname = href
      ? new URL(href).pathname
      : typeof window !== "undefined"
        ? window.location.pathname
        : "";
    blogRoute ||= /^\/(?:en\/|zh-TW\/)?blog(?:\/|$)/.test(pathname);
  } catch {
    /* Unknown URLs are not retained on explicit Blog events. */
  }
  if (!blogRoute) return event;
  if (event.event !== "blog_article_viewed" && event.event !== "blog_beta_interest_clicked")
    return null;
  const allowed = new Set([
    "token",
    "distinct_id",
    "$device_id",
    "$session_id",
    "$window_id",
    "$lib",
    "$lib_version",
    "$insert_id",
    "event",
    "interaction_id",
    "article_id",
    "locale",
    "source",
    "cta_target",
    "route",
    "$current_url",
    "$process_person_profile",
  ]);
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) if (allowed.has(key)) safe[key] = value;
  if (typeof safe.$current_url === "string") {
    try {
      const url = new URL(safe.$current_url);
      safe.$current_url = `${url.origin}${url.pathname}`;
    } catch {
      delete safe.$current_url;
    }
  }
  return { ...event, properties: safe, $set: undefined, $set_once: undefined };
}
