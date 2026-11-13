import { Image } from "@daodao/ui/components/image";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { BlogArticleType } from "./content";
import { articleOutline } from "./helpers";
export function BlogMarkdown({ article }: { article: BlogArticleType }) {
  let heading = 0;
  const outline = articleOutline(article.body);
  return (
    <div className="blog-prose">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          h2: ({ children }) => <h2 id={outline[heading++]?.id}>{children}</h2>,
          h3: ({ children }) => <h3 id={outline[heading++]?.id}>{children}</h3>,
          table: ({ children }) => (
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to focus and scroll wide tables.
            <section className="blog-scroll" tabIndex={0} aria-label="Table">
              <table>{children}</table>
            </section>
          ),
          pre: ({ children }) => (
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Focus is required for keyboard scrolling of wide code.
            <pre tabIndex={0}>{children}</pre>
          ),
          img: ({ src, alt, title }) => {
            const image = article.images.find((image) => image.path === src);
            if (!image || !src) return null;
            return (
              <span className="blog-figure">
                <Image
                  src={article.assets[src] || ""}
                  alt={alt || ""}
                  width={image.width}
                  height={image.height}
                />
                {title && <span className="blog-caption">{title}</span>}
              </span>
            );
          },
          a: ({ href, children }) => (
            <a href={href} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
              {children}
            </a>
          ),
        }}
      >
        {article.body}
      </Markdown>
    </div>
  );
}
