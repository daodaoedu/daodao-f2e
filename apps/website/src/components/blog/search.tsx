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
  tags: string[];
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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const placeholder = locale === "en" ? "Search articles" : "搜尋文章標題或內容";
  const closeLabel = locale === "en" ? "Close search" : "關閉搜尋";
  const noResults =
    locale === "en"
      ? "No matching articles. Try another keyword."
      : "沒有找到符合的文章，試試其他關鍵字。";
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const allTags = useMemo(
    () =>
      [...new Set(articles.flatMap((article) => article.tags))].sort((a, b) =>
        a.localeCompare(b, locale)
      ),
    [articles, locale]
  );
  const hasFilters = Boolean(normalizedQuery || activeTag);
  const results = useMemo(
    () =>
      articles.filter((article) => {
        const searchableText = [article.title, article.description, article.body, ...article.tags]
          .join(" ")
          .toLocaleLowerCase(locale);
        const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
        const matchesTag = !activeTag || article.tags.includes(activeTag);
        return matchesQuery && matchesTag;
      }),
    [articles, activeTag, locale, normalizedQuery]
  );
  const toggleTag = (tag: string) =>
    setActiveTag((current) => (current === tag ? null : tag));

  return (
    <section className="blog-intro" aria-label={locale === "en" ? "Articles" : "文章"}>
      <div className="blog-intro-heading">
        <h1>{title}</h1>
      </div>
      <div className="blog-list-controls">
        {allTags.length > 0 && (
          <nav className="blog-tag-filters" aria-label={locale === "en" ? "Filter by tag" : "依標籤篩選文章"}>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="blog-tag-chip"
                aria-pressed={activeTag === tag}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </nav>
        )}
        <div className={`blog-search${expanded ? " is-expanded" : ""}`}>
          {expanded ? (
            <search className="blog-search-expanded">
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
            </search>
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
      {hasFilters && (
        <p className="blog-search-status" aria-live="polite">
          {results.length === 0 ? noResults : locale === "en" ? `${results.length} results` : `找到 ${results.length} 篇文章`}
        </p>
      )}
      {results.length === 0 && !hasFilters ? (
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
              {article.tags.length > 0 && (
                <div className="blog-post-tags" aria-label={locale === "en" ? "Article tags" : "文章標籤"}>
                  {article.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="blog-tag-chip"
                      aria-pressed={activeTag === tag}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
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
