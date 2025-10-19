'use client';

import { toast } from 'sonner';

export interface CapturedImageData {
  src: string;
  width: number;
  height: number;
}

const getBorderWidth = (element: HTMLElement) => {
  const computedStyle = getComputedStyle(element);
  
  const borderLeft = parseInt(computedStyle.borderLeftWidth, 10) || 0;
  const borderRight = parseInt(computedStyle.borderRightWidth, 10) || 0;
  const borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0;
  const borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
  
  return {
    horizontal: borderLeft + borderRight,
    vertical: borderTop + borderBottom,
  };
};

export const captureElementAsImage = async (
  element: HTMLElement
): Promise<CapturedImageData | null> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { toJpeg } = await import('html-to-image');
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: window.devicePixelRatio,
    });

    const borderWidth = getBorderWidth(element);

    return {
      src: dataUrl,
      width: element.clientWidth - borderWidth.horizontal,
      height: element.clientHeight - borderWidth.vertical,
    };
  } catch {
    toast.error('圖片渲染失敗');
    return null;
  }
};
