/**
 * OG Image API Route
 * 從指定網址提取 og:image 並暫存
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  getCachedOgImage,
  setCachedOgImage,
  type IOgImageCacheData,
} from "@/lib/og-image-cache";

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
    if (match && match[1]) {
      const imageUrl = match[1].trim();
      // 處理相對路徑
      if (imageUrl.startsWith("https://")) {
        ogImageUrl = imageUrl;
        break;
      }
      if (imageUrl.startsWith("//")) {
        ogImageUrl = `https:${imageUrl}`;
        break;
      }
      if (imageUrl.startsWith("/")) {
        const url = new URL(baseUrl);
        ogImageUrl = `${url.protocol}//${url.host}${imageUrl}`;
        break;
      }
      ogImageUrl = `${baseUrl}/${imageUrl}`;
      break;
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
    if (match && match[1]) {
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
    if (match && match[1]) {
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

/**
 * 標準化 URL（用於快取鍵）
 * 移除 trailing slash、統一大小寫等
 */
const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // 移除 trailing slash（除了根路徑）
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    // 統一 protocol 為小寫
    const protocol = parsed.protocol.toLowerCase();
    // 統一 hostname 為小寫
    const hostname = parsed.hostname.toLowerCase();
    // 重新構建 URL
    return `${protocol}//${hostname}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
};

/**
 * 實際爬取網頁並提取 og:image
 * 使用 unstable_cache 進行請求級別的去重
 */
const fetchOgImageData = unstable_cache(
  async (url: string): Promise<IOgImageCacheData | null> => {
    // 檢查記憶體快取
    const cached = getCachedOgImage(url);
    if (cached) {
      return cached;
    }

    // 取得網頁 HTML
    const htmlResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch URL: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }

    const html = await htmlResponse.text();
    const ogData = extractOgData(html, url);

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
    setCachedOgImage(url, result);

    return result;
  },
  ["og-image-fetch"],
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

    // 標準化 URL 用於快取鍵
    const normalizedUrl = normalizeUrl(targetUrl);

    // 如果不需要強制刷新，先檢查快取
    if (!refresh) {
      const cached = getCachedOgImage(normalizedUrl);
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
