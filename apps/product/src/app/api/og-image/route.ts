/**
 * OG Image API Route
 * 從指定網址提取 og:image 並暫存
 */

import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getCachedOgImage, type IOgImageCacheData, setCachedOgImage } from "@/lib/og-image-cache";
import { fetchPublicHtml, UnsafePublicUrlError, validatePublicUrl } from "@/lib/safe-public-fetch";

/**
 * 從 HTML 內容中提取 Open Graph 資料
 */
const extractOgData = (
  html: string,
  baseUrl: string
): {
  ogImageUrl: string | null;
  title?: string;
  description?: string;
} => {
  // 提取 og:image
  const imagePatterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    /<meta\s+name=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']og:image["']/i,
  ];

  let ogImageUrl: string | null = null;
  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const imageUrl = match[1].trim();
      // Resolve relative metadata against the final public response URL.
      try {
        ogImageUrl = new URL(imageUrl, baseUrl).href;
        break;
      } catch {
        // Ignore malformed metadata and continue looking for another match.
      }
    }
  }

  // 提取 og:title（可選）
  const titlePatterns = [
    /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i,
  ];
  let title: string | undefined;
  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      title = match[1].trim();
      break;
    }
  }

  // 提取 og:description（可選）
  const descriptionPatterns = [
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i,
  ];
  let description: string | undefined;
  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      description = match[1].trim();
      break;
    }
  }

  return {
    ogImageUrl,
    title,
    description,
  };
};

/** Preserve distinct paths and ports; fragments do not affect HTTP requests. */
const normalizeUrl = (url: string): string => {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.href;
};

/**
 * 實際爬取網頁並提取 og:image
 * 使用 unstable_cache 進行請求級別的去重
 */
const fetchOgImageData = unstable_cache(
  async (url: string): Promise<IOgImageCacheData | null> => {
    // 檢查記憶體快取
    const cached = getCachedOgImage(`public-v2:${url}`);
    if (cached) {
      return cached;
    }

    const { html, finalUrl } = await fetchPublicHtml(url);
    const ogData = extractOgData(html, finalUrl);

    if (!ogData.ogImageUrl) {
      return null;
    }

    const result: IOgImageCacheData = {
      ogImageUrl: ogData.ogImageUrl,
      timestamp: Date.now(),
      title: ogData.title,
      description: ogData.description,
    };

    // 存入記憶體快取
    setCachedOgImage(`public-v2:${url}`, result);

    return result;
  },
  ["og-image-public-fetch-v2"],
  {
    revalidate: 24 * 60 * 60, // 24 小時
    tags: ["og-image"],
  }
);

/**
 * GET /api/og-image
 * 從指定網址提取 og:image 並暫存
 *
 * Query parameters:
 * - url: 要提取 og:image 的網址（必填）
 * - refresh: 是否強制刷新快取（可選，預設 false）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const refresh = searchParams.get("refresh") === "true";

    if (!targetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: url",
        },
        { status: 400 }
      );
    }

    // 驗證 URL 格式
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL format",
        },
        { status: 400 }
      );
    }

    // 只允許 http 和 https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        {
          success: false,
          error: "Only HTTP and HTTPS URLs are allowed",
        },
        { status: 400 }
      );
    }

    await validatePublicUrl(targetUrl);

    // 標準化 URL 用於快取鍵
    const normalizedUrl = normalizeUrl(targetUrl);

    // 如果不需要強制刷新，先檢查快取
    if (!refresh) {
      const cached = getCachedOgImage(`public-v2:${normalizedUrl}`);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: {
            ogImageUrl: cached.ogImageUrl,
            title: cached.title,
            description: cached.description,
            cached: true,
            timestamp: cached.timestamp,
          },
        });
      }
    }

    // 爬取並提取 og:image（使用 unstable_cache 進行請求級別去重）
    const result = await fetchOgImageData(normalizedUrl);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "No og:image found in the page",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ogImageUrl: result.ogImageUrl,
        title: result.title,
        description: result.description,
        cached: false,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    if (error instanceof UnsafePublicUrlError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("Error processing og:image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
