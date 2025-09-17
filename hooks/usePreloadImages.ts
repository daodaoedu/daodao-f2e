
'use client';

import { useEffect, useState } from 'react';

export function usePreloadImages(selector = 'img[data-preload], video[data-preload]') {
  const [progress, setProgress] = useState(0); // 0 ~ 1
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => {
        // 空的 cleanup function
      };
    }

    const nodes = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(selector));
    const total = nodes.length || 1; // 避免除以 0

    let loaded = 0;
    let settled = false;
    const MIN_SPINNER_TIME = 500;     // 至少顯示 0.5s，避免閃爍
    const HARD_TIMEOUT = 8000;        // 最多等 8s，防止卡死
    const startAt = performance.now();

    const update = () => setProgress((loaded / total));

    const onSettle = () => {
      if (settled) return;
      settled = true;
      const elapsed = performance.now() - startAt;
      const delay = Math.max(0, MIN_SPINNER_TIME - elapsed);
      setTimeout(() => {
        setProgress(1);
        setDone(true);
      }, delay);
    };

    // 檢查元素是否已載入完成
    nodes.forEach(element => {
      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        if (img.complete && img.naturalWidth > 0) loaded += 1;
      } else if (element.tagName === 'VIDEO') {
        const video = element as HTMLVideoElement;
        if (video.readyState >= 3) loaded += 1; // HAVE_FUTURE_DATA 或更高
      }
    });
    update();

    const handlers: Array<[(this: HTMLImageElement | HTMLVideoElement, ev: Event) => void, (this: HTMLImageElement | HTMLVideoElement, ev: Event) => void]> = [];

    nodes.forEach(element => {
      const handleOK = () => { loaded += 1; update(); if (loaded >= total) onSettle(); };
      const handleErr = () => { loaded += 1; update(); if (loaded >= total) onSettle(); };

      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        img.addEventListener('load', handleOK);
        img.addEventListener('error', handleErr);
        handlers.push([handleOK, handleErr]);
      } else if (element.tagName === 'VIDEO') {
        const video = element as HTMLVideoElement;
        video.addEventListener('canplaythrough', handleOK);
        video.addEventListener('error', handleErr);
        handlers.push([handleOK, handleErr]);
      }
    });

    // 超時保障
    const timeoutId = window.setTimeout(onSettle, HARD_TIMEOUT);

    return () => {
      window.clearTimeout(timeoutId);
      nodes.forEach((element, i) => {
        const [ok, err] = handlers[i] || [];
        if (ok && element.tagName === 'IMG') {
          (element as HTMLImageElement).removeEventListener('load', ok);
        } else if (ok && element.tagName === 'VIDEO') {
          (element as HTMLVideoElement).removeEventListener('canplaythrough', ok);
        }
        if (err) element.removeEventListener('error', err);
      });
    };
  }, [selector]);

  // 提升體感：回傳 easing 後的進度（UI 用），但內部以實際 loaded 比例為準
  const eased = progress < 1 ? (1 - (1 - progress) ** 3) : 1;
  return { progress: eased, done };
}
