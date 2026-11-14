import { z } from "zod";

const identifier = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
export const blogInteractionSchema = z
  .object({
    event: z.enum(["blog_article_viewed", "blog_index_viewed", "blog_beta_interest_clicked"]),
    interaction_id: z.string().uuid(),
    page_type: z.enum(["article", "index"]),
    article_id: identifier.optional(),
    article_slug: identifier.optional(),
    locale: z.enum(["zh-TW", "en"]),
    source: z.enum(["direct", "search", "social", "internal", "unknown"]),
    cta_target: z.literal("beta-interest").optional(),
  })
  .strict()
  .refine(
    (value) => value.event !== "blog_beta_interest_clicked" || value.cta_target === "beta-interest",
    "CTA clicks require their confirmed target"
  )
  .refine(
    (value) =>
      value.page_type === "article"
        ? Boolean(value.article_id && value.article_slug && value.event !== "blog_index_viewed")
        : !value.article_id && !value.article_slug && value.event !== "blog_article_viewed",
    "Page identity must match the view event"
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
  if (!referrer) return "unknown";
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
export function createBlogTracker(
  capture: BlogCaptureType | undefined,
  context: { environment: "production" | "nonproduction" } = { environment: "nonproduction" }
) {
  const queued = new Set<string>();
  return (input: unknown): "queued" | "duplicate" | "unavailable" | "invalid" | "failed" => {
    const parsed = blogInteractionSchema.safeParse(input);
    if (!parsed.success) return "invalid";
    if (!capture) return "unavailable";
    const data = parsed.data;
    if (queued.has(data.interaction_id)) return "duplicate";
    const properties = data;
    const route = `${data.locale === "en" ? "/en" : ""}/blog${data.page_type === "article" ? "/:article" : ""}`;
    try {
      capture(data.event, {
        ...properties,
        route,
        $current_url: `https://daodao.so${route}`,
        $process_person_profile: false,
        measurement_environment: context.environment,
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

/** Dynamic route values are grouped, never inferred public from slug-like syntax. */
export function sanitizeWebsitePath(pathname: string): string {
  const locale = /^\/(en|zh-TW)(?=\/|$)/.exec(pathname)?.[0] ?? "";
  const route = (pathname.slice(locale.length) || "/").replace(/\/$/, "") || "/";
  const fixed = new Set([
    "/",
    "/about",
    "/blog",
    "/dev/design-system",
    "/quiz",
    "/quiz/result",
    "/action-maker",
    "/action-maker/actions",
    "/action-maker/category",
    "/action-maker/result",
    "/action-maker/topic",
    "/action-maker/detail",
    "/action-maker/nickname",
    "/learning-marathons/2025S1",
  ]);
  if (fixed.has(route)) return route === "/" ? locale || "/" : `${locale}${route}`;
  if (/^\/blog\/topic\/[^/]+$/.test(route)) return `${locale}/blog/topic/:topic`;
  if (/^\/blog\/[^/]+$/.test(route)) return `${locale}/blog/:article`;
  if (/^\/quiz\/questions\/[^/]+$/.test(route)) return `${locale}/quiz/questions/:question`;
  if (/^\/quiz\/result\/[^/]+$/.test(route)) return `${locale}/quiz/result/:result`;
  if (/^\/terms\/[^/]+$/.test(route)) return `${locale}/terms/:type`;
  return `${locale}/_unrecognized`;
}

/** Serialized with the explicit path sanitizer, so no module closure enters the SDK hook. */
export function sanitizeBlogAnalyticsEvent(
  event: BlogAnalyticsEnvelopeType,
  safePath: typeof sanitizeWebsitePath = sanitizeWebsitePath
): BlogAnalyticsEnvelopeType | null {
  const urlKeys = new Set([
    "$current_url",
    "$referrer",
    "$initial_current_url",
    "$initial_referrer",
    "page_location",
    "page_referrer",
  ]);
  const cleanRecord = (input: object): { record: Record<string, unknown>; changed: boolean } => {
    const record: Record<string, unknown> = {};
    let changed = false;
    for (const [key, value] of Object.entries(input)) {
      if (value === "$direct" && (key === "$referrer" || key === "$initial_referrer")) {
        record[key] = value;
      } else if (urlKeys.has(key) && typeof value === "string" && value) {
        try {
          const url = new URL(value);
          if (!["https:", "http:"].includes(url.protocol)) {
            changed = true;
            continue;
          }
          const safe =
            key === "$current_url" || key === "page_location"
              ? `${url.origin}${safePath(url.pathname)}`
              : url.origin;
          record[key] = safe;
          changed ||= safe !== value;
        } catch {
          changed = true;
        }
      } else if (
        ["$pathname", "$initial_pathname", "pathname", "page_path", "route"].includes(key) &&
        typeof value === "string"
      ) {
        record[key] = safePath(value);
        changed ||= record[key] !== value;
      } else if (
        (key === "$set" || key === "$set_once") &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        const nested = cleanRecord(value);
        record[key] = nested.record;
        changed ||= nested.changed;
      } else record[key] = value;
    }
    return { record, changed };
  };
  const properties = event.properties ?? {};
  const cleaned = cleanRecord(properties);
  const profile = event.$set ? cleanRecord(event.$set) : undefined;
  const initialProfile = event.$set_once ? cleanRecord(event.$set_once) : undefined;
  let blogRoute = [
    "blog_article_viewed",
    "blog_index_viewed",
    "blog_beta_interest_clicked",
  ].includes(event.event);
  try {
    const href = typeof properties.$current_url === "string" ? properties.$current_url : "";
    const pathname = href
      ? new URL(href).pathname
      : typeof window !== "undefined"
        ? window.location.pathname
        : "";
    blogRoute ||= /^\/(?:en\/|zh-TW\/)?blog(?:\/|$)/.test(pathname);
  } catch {
    /* Explicit Blog events still use the restricted properties below. */
  }
  if (!blogRoute) {
    if (!cleaned.changed && !profile?.changed && !initialProfile?.changed) return event;
    return {
      ...event,
      properties: cleaned.record,
      ...(profile ? { $set: profile.record } : {}),
      ...(initialProfile ? { $set_once: initialProfile.record } : {}),
    };
  }
  if (
    !["blog_article_viewed", "blog_index_viewed", "blog_beta_interest_clicked"].includes(
      event.event
    )
  )
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
    "page_type",
    "article_id",
    "article_slug",
    "locale",
    "source",
    "cta_target",
    "route",
    "$current_url",
    "$process_person_profile",
    "measurement_environment",
  ]);
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(cleaned.record))
    if (allowed.has(key)) safe[key] = value;
  return { ...event, properties: safe, $set: undefined, $set_once: undefined };
}

/** GA4 receives a canonical Blog URL and origin-only referrer, not inbound query/fragment data. */
export function getBlogPageContext(
  href: string,
  referrer: string,
  websitePrivacy = false,
  safePath: typeof sanitizeWebsitePath = sanitizeWebsitePath
): Record<string, string> {
  try {
    const url = new URL(href);
    if (!websitePrivacy && !/^\/(?:en\/|zh-TW\/)?blog(?:\/|$)/.test(url.pathname)) return {};
    let referringOrigin = "";
    try {
      if (referrer) referringOrigin = new URL(referrer).origin;
    } catch {
      /* Invalid referrers stay absent. */
    }
    return {
      page_location: `${url.origin}${safePath(url.pathname)}`,
      page_path: safePath(url.pathname),
      page_referrer: referringOrigin,
    };
  } catch {
    return {};
  }
}
