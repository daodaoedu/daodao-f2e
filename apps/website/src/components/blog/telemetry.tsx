"use client";

import { classifyBlogSource, createBlogTracker } from "@daodao/analytics";
import { getAnalyticsConfig } from "@daodao/analytics/lib/config";
import { useEffect, useRef } from "react";

type TrackingSessionType = {
  key: string;
  viewId: string;
  track: ReturnType<typeof createBlogTracker>;
};

export function BlogTelemetry({
  locale,
  article,
}: {
  locale: "zh-TW" | "en";
  article?: { id: string; slug: string };
}) {
  const articleId = article?.id;
  const articleSlug = article?.slug;
  const session = useRef<TrackingSessionType | null>(null);
  useEffect(() => {
    if (!getAnalyticsConfig().posthog.enabled) return;
    const key = `${locale}/${articleId ?? "index"}`;
    if (session.current?.key !== key) {
      session.current = {
        key,
        viewId: crypto.randomUUID(),
        track: createBlogTracker(
          (event, properties) => {
            if (typeof window.posthog?.capture !== "function")
              throw new Error("Analytics SDK unavailable");
            window.posthog.capture(event, properties);
          },
          {
            environment:
              window.location.origin === "https://daodao.so" ? "production" : "nonproduction",
          }
        ),
      };
    }
    const current = session.current;
    const source = classifyBlogSource(
      document.referrer,
      new URLSearchParams(window.location.search).get("utm_source") ?? undefined
    );
    const identity =
      articleId && articleSlug
        ? { page_type: "article", article_id: articleId, article_slug: articleSlug }
        : { page_type: "index" };
    const properties = { ...identity, locale, source };
    let attempts = 0;
    const view = () =>
      current.track({
        ...properties,
        event: articleId ? "blog_article_viewed" : "blog_index_viewed",
        interaction_id: current.viewId,
      });
    view();
    const timer = window.setInterval(() => {
      attempts++;
      const result = view();
      if (result === "queued" || result === "duplicate" || attempts >= 20)
        window.clearInterval(timer);
    }, 250);
    const click = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest('a[data-blog-cta="beta-interest"]')
          : null;
      if (anchor)
        current.track({
          ...properties,
          event: "blog_beta_interest_clicked",
          interaction_id: crypto.randomUUID(),
          cta_target: "beta-interest",
        });
    };
    document.addEventListener("click", click);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("click", click);
    };
  }, [articleId, articleSlug, locale]);
  return null;
}
