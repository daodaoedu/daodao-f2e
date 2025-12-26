"use client";

export interface CapturedImageData {
  src: string;
  width: number;
  height: number;
}

export const captureElementAsImage = async (
  element: HTMLElement
): Promise<CapturedImageData | null> => {
  try {
    const { toJpeg } = await import("html-to-image");
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: window.devicePixelRatio,
    });

    return {
      src: dataUrl,
      width: element.clientWidth,
      height: element.clientHeight,
    };
  } catch {
    return null;
  }
};
