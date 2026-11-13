"use client";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { useState } from "react";
import { Footer } from "@/components/layout/footer";
import { type BlogLocaleType, blogCopy, blogPath } from "./copy";
import "./blog.css";
export function BlogShell({
  children,
  locale,
  alternate,
  preview,
}: {
  children: React.ReactNode;
  locale: BlogLocaleType;
  alternate?: string;
  preview: boolean;
}) {
  const [dark, setDark] = useState(false);
  const t = blogCopy[locale];
  return (
    <div className="blog-site" data-blog-theme={dark ? "dark" : "light"}>
      <a className="blog-skip" href="#blog-main">
        {t.skip}
      </a>
      <header className="blog-header">
        <nav aria-label="Journal">
          <a
            href={blogPath(locale)}
            className="blog-brand"
            aria-label={locale === "en" ? "DaoDao Journal" : "島島阿學 Journal"}
          >
            <Image
              src={`/assets/blog/${locale === "en" ? "en" : "zh"}-${dark ? "dark" : "light"}.svg`}
              width={145}
              height={32}
              alt={locale === "en" ? "DaoDao" : "島島阿學"}
            />
            <span>Journal</span>
          </a>
          <div className="blog-controls">
            <a
              href={alternate || blogPath(locale === "en" ? "zh-TW" : "en")}
              hrefLang={locale === "en" ? "zh-TW" : "en"}
              lang={locale === "en" ? "zh-TW" : "en"}
            >
              {locale === "en" ? "中文" : "EN"}
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="blog-theme"
              aria-label={t.theme}
              aria-pressed={dark}
              onClick={() => setDark(!dark)}
            >
              ◐
            </Button>
            <a className="blog-join" href="https://tally.so/r/44WXdk" data-blog-cta="beta-interest">
              {t.apply}
            </a>
          </div>
        </nav>
      </header>
      {preview && <p className="blog-preview">{t.preview}</p>}
      {children}
      <Footer
        showLanguageSwitcher={false}
        logoLocale={locale}
        newsletterLink={{ description: t.newsletterDescription, label: t.newsletterLink }}
      />
    </div>
  );
}
export function ShareArticle({ locale }: { locale: BlogLocaleType }) {
  const [status, setStatus] = useState("");
  const t = blogCopy[locale];
  return (
    <div className="blog-share">
      <Button
        variant="ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setStatus(t.copied);
          } catch {
            setStatus(t.copyError);
          }
        }}
      >
        {t.share}
      </Button>
      <output aria-live="polite">{status}</output>
    </div>
  );
}
