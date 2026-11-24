"use client";
import { Image } from "@daodao/ui/components/image";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { BlogLocaleType } from "./copy";

type BlogSearchArticle = {
  id: string;
  href: string;
  title: string;
  description: string;
  body: string;
  author: string;
  date: string;
  publishedAt: string;
  minutes: number;
  cover?: string;
  coverAlt?: string;
};

export function BlogSearch({
  title,
  locale,
  articles,
}: {
  title: string;
  locale: BlogLocaleType;
  articles: BlogSearchArticle[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const placeholder = locale === "en" ? "Search articles" : "搜尋文章標題或內容";
  const closeLabel = locale === "en" ? "Close search" : "關閉搜尋";
  const noResults =
    locale === "en"
      ? "No matching articles. Try another keyword."
      : "沒有找到符合的文章，試試其他關鍵字。";
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);

  const results = useMemo(
    () =>
      articles.filter((article) =>
        [article.title, article.description, article.body]
          .join(" ")
          .toLocaleLowerCase(locale)
          .includes(normalizedQuery)
      ),
    [articles, locale, normalizedQuery]
  );

  return (
    <section className="blog-intro" aria-label={locale === "en" ? "Articles" : "文章"}>
      <div className="blog-intro-heading">
        <h1>{title}</h1>
        <div className={`blog-search${expanded ? " is-expanded" : ""}`}>
          {expanded ? (
            <div className="blog-search-expanded" role="search">
              <Search aria-hidden="true" />
              <input
                id="article-search"
                className="blog-search-input"
                type="text"
                aria-label={placeholder}
                placeholder={placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="button"
                className="blog-search-close"
                aria-label={closeLabel}
                title={closeLabel}
                onClick={() => {
                  setQuery("");
                  setExpanded(false);
                }}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="blog-search-toggle"
              aria-label={locale === "en" ? "Open search" : "搜尋文章"}
              aria-expanded={false}
              onClick={() => setExpanded(true)}
            >
              <Search aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {query.trim() && (
        <p className="blog-search-status" aria-live="polite">
          {results.length === 0 ? noResults : locale === "en" ? `${results.length} results` : `找到 ${results.length} 篇文章`}
        </p>
      )}
      {results.length === 0 && !query.trim() ? (
        <p className="blog-empty">{locale === "en" ? "No articles yet." : "目前沒有文章。"}</p>
      ) : results.length === 0 ? null : (
        results.map((article) => (
          <article key={article.id} className={`blog-post ${article.cover ? "blog-post-cover" : ""}`}>
            <div>
              <p className="blog-by">{article.author}</p>
              <h2>
                <a href={article.href}>{article.title}</a>
              </h2>
              <p>{article.description}</p>
              <div className="blog-meta">
                <time dateTime={article.publishedAt}>{article.date}</time>
                <span>
                  {article.minutes} {locale === "en" ? "min read" : "分鐘閱讀"}
                </span>
              </div>
            </div>
            {article.cover && (
              <Image
                src={article.cover}
                alt={article.coverAlt || ""}
                width={156}
                height={126}
              />
            )}
          </article>
        ))
      )}
    </section>
  );
}
