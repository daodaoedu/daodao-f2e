'use client';

import { useEffect, useState } from 'react';

interface UsePreloadImagesOptions {
  minSpinnerTime?: number;
  hardTimeout?: number;
}

const MIN_SPINNER_TIME = 1200;
const HARD_TIMEOUT = 3500;

export function usePreloadImages(
  selector = 'img[data-preload]',
  {
    minSpinnerTime = MIN_SPINNER_TIME,
    hardTimeout = HARD_TIMEOUT,
  }: UsePreloadImagesOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLImageElement>(selector)
    );
    const total = nodes.length || 1;

    const update = () => setProgress((pre) => (pre * total + 1) / total);

    nodes.forEach((element) => {
      if (element.complete && element.naturalWidth > 0) {
        update();
      }
    });

    nodes.forEach((element) => {
      element.addEventListener('load', update);
      element.addEventListener('error', update);
    });

    const timeoutId = window.setTimeout(() => {
      setProgress(1);
    }, hardTimeout);

    return () => {
      window.clearTimeout(timeoutId);
      nodes.forEach((element) => {
        element.removeEventListener('load', update);
        element.removeEventListener('error', update);
      });
    };
  }, [selector, hardTimeout]);

  useEffect(() => {
    let doneTimer: NodeJS.Timeout;
    if (progress >= 1) {
      doneTimer = setTimeout(() => {
        setDone(true);
      }, minSpinnerTime);
    }
    return () => {
      window.clearTimeout(doneTimer);
    };
  }, [progress, minSpinnerTime]);

  // 提升體感：回傳 easing 後的進度（UI 用），但內部以實際 loaded 比例為準
  const eased = progress < 1 ? Math.max(1 - (1 - progress) ** 3, 0.02) : 1;
  return { progress: eased, done };
}
