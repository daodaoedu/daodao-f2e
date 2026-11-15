import { Image } from "@daodao/ui/components/image";
import { format, parseISO } from "date-fns";
import { enUS, zhTW } from "date-fns/locale";
import { type BlogArticleType, loadBlog } from "./content";
import { type BlogLocaleType, blogCopy, blogPath } from "./copy";
import { articleOutline, readingMinutes } from "./helpers";
import { BlogMarkdown } from "./markdown";
import { BlogShell, ShareArticle } from "./shell";
import { BlogTelemetry } from "./telemetry";
export function dateLabel(date: string, locale: BlogLocaleType) {
  return format(parseISO(date), locale === "en" ? "MMM d, yyyy" : "yyyy 年 M 月 d 日", {
    locale: locale === "en" ? enUS : zhTW,
  });
}
export async function BlogList({ locale, topic }: { locale: BlogLocaleType; topic?: string }) {
  const data = await loadBlog();
  const t = blogCopy[locale];
  const entries = data.articles
    .filter((a) => a.metadata.lang === locale && (!topic || a.metadata.topic === topic))
    .sort((a, b) => b.metadata.published_at.localeCompare(a.metadata.published_at));
  return (
    <BlogShell locale={locale} preview={data.preview}>
      <BlogTelemetry locale={locale} />
      <main className="blog-list" id="blog-main" tabIndex={-1}>
        <div className="blog-intro">
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <nav className="blog-topics" aria-label={locale === "en" ? "Topics" : "文章主題"}>
          <a href={blogPath(locale)} aria-current={!topic ? "page" : undefined}>
            {t.all}
          </a>
          {data.topics.map((item) => (
            <a
              key={item.id}
              href={`${blogPath(locale)}/topic/${item.id}`}
              aria-current={topic === item.id ? "page" : undefined}
            >
              {item.name[locale]}
            </a>
          ))}
        </nav>
        {entries.length === 0 ? (
          <p className="blog-empty">{t.empty}</p>
        ) : (
          entries.map((article) => (
            <PostSummary
              key={article.metadata.id}
              article={article}
              locale={locale}
              author={
                data.authors.find((author) => author.id === article.metadata.author_id)?.name[
                  locale
                ] || ""
              }
            />
          ))
        )}
      </main>
    </BlogShell>
  );
}
function PostSummary({
  article,
  locale,
  author,
}: {
  article: BlogArticleType;
  locale: BlogLocaleType;
  author: string;
}) {
  const m = article.metadata;
  return (
    <article className={`blog-post ${m.cover ? "blog-post-cover" : ""}`}>
      <div>
        <p className="blog-by">{author}</p>
        <h2>
          <a href={blogPath(locale, m.slug)}>{m.title}</a>
        </h2>
        <p>{m.description}</p>
        <div className="blog-meta">
          <time dateTime={m.published_at}>{dateLabel(m.published_at, locale)}</time>
          <span>
            {readingMinutes(article.body)} {blogCopy[locale].minutes}
          </span>
        </div>
      </div>
      {m.cover && (
        <Image
          src={article.assets[m.cover.path] || ""}
          alt={m.cover.alt}
          width={156}
          height={126}
        />
      )}
    </article>
  );
}
export async function BlogArticle({
  article,
  locale,
}: {
  article: BlogArticleType;
  locale: BlogLocaleType;
}) {
  const data = await loadBlog();
  const t = blogCopy[locale];
  const m = article.metadata;
  const alternate = data.articles.find((a) => a.metadata.id === m.id && a.metadata.lang !== locale);
  const outline = articleOutline(article.body);
  const author = data.authors.find((author) => author.id === m.author_id);
  const related = data.articles
    .filter(
      (a) => a.metadata.lang === locale && a.metadata.id !== m.id && a.metadata.topic === m.topic
    )
    .slice(0, 3);
  return (
    <BlogShell
      locale={locale}
      preview={data.preview}
      alternate={alternate ? blogPath(alternate.metadata.lang, alternate.metadata.slug) : undefined}
    >
      <BlogTelemetry
        locale={locale}
        article={{ id: article.metadata.id, slug: article.metadata.slug }}
      />
      <main className="blog-reader" id="blog-main" tabIndex={-1}>
        <a className="blog-back" href={blogPath(locale)}>
          ← {t.back}
        </a>
        <article>
          <header>
            <h1>{m.title}</h1>
            <p className="blog-dek">{m.description}</p>
            <div className="blog-author">
              <p>{author?.name[locale]}</p>
              <div className="blog-meta">
                <time dateTime={m.published_at}>{dateLabel(m.published_at, locale)}</time>
                <span>
                  {readingMinutes(article.body)} {t.minutes}
                </span>
                {m.updated_at && (
                  <span>
                    {t.updated}{" "}
                    <time dateTime={m.updated_at}>{dateLabel(m.updated_at, locale)}</time>
                  </span>
                )}
              </div>
            </div>
          </header>
          {m.cover && (
            <Image
              className="blog-cover"
              src={article.assets[m.cover.path] || ""}
              alt={m.cover.alt}
              width={article.images.find((i) => i.path === m.cover?.path)?.width || 1200}
              height={article.images.find((i) => i.path === m.cover?.path)?.height || 800}
            />
          )}{" "}
          {outline.length >= 3 && (
            <details className="blog-toc">
              <summary>{t.toc}</summary>
              <ol>
                {outline.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? "blog-subheading" : ""}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          )}
          <BlogMarkdown article={article} />
          <ShareArticle locale={locale} />
          <aside className="blog-cta">
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaBody}</p>
            <a className="blog-join" href="https://tally.so/r/44WXdk" data-blog-cta="beta-interest">
              {t.apply}
            </a>
          </aside>
        </article>
        {related.length > 0 && (
          <aside className="blog-related">
            <h2>{t.related}</h2>
            {related.map((a) => (
              <a key={a.metadata.id} href={blogPath(locale, a.metadata.slug)}>
                {a.metadata.title}
              </a>
            ))}
          </aside>
        )}
      </main>
    </BlogShell>
  );
}
