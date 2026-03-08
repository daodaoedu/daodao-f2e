"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

interface LottieEmojiProps {
  /** Lottie JSON URL (e.g. Google Noto Emoji CDN) */
  url: string;
  /** 備用靜態 emoji，Lottie 載入前顯示 */
  fallback?: string;
  /** px — 寬高 */
  size?: number;
  /**
   * play=true  → autoplay once（播放一次後停止）
   * play=false → 靜止在第一格
   */
  play?: boolean;
}

// 簡單的模組級快取，避免同一個 URL 重複 fetch
const cache = new Map<string, unknown>();

export function LottieEmoji({ url, fallback, size = 28, play = false }: LottieEmojiProps) {
  const [animationData, setAnimationData] = useState<unknown>(() => cache.get(url) ?? null);

  useEffect(() => {
    if (cache.has(url)) {
      setAnimationData(cache.get(url));
      return;
    }
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        cache.set(url, data);
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {/* 靜默失敗，顯示 fallback */});
    return () => { cancelled = true; };
  }, [url]);

  if (!animationData) {
    // 載入中：顯示備用靜態 emoji
    return (
      <span style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.75 }}>
        {fallback ?? ""}
      </span>
    );
  }

  return (
    <Lottie
      animationData={animationData}
      loop={false}
      autoplay={play}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}
