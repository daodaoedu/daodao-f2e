"use client";

export interface CapturedImageData {
  src: string;
  width: number;
  height: number;
}

export interface CropOptions {
  width: number;
  height: number;
  x?: number; // 裁切起始 X 座標，預設為中心
  y?: number; // 裁切起始 Y 座標，預設為中心
}

/**
 * 裁切圖片到指定尺寸
 */
const cropImage = async (
  imageSrc: string,
  options: CropOptions,
  devicePixelRatio: number
): Promise<CapturedImageData | null> => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(null);
          return;
        }

        // 將邏輯像素轉換為物理像素
        const pixelRatio = devicePixelRatio;
        const sourceWidth = img.width; // 實際圖片寬度（物理像素）
        const sourceHeight = img.height; // 實際圖片高度（物理像素）
        const targetWidth = options.width * pixelRatio; // 目標寬度（物理像素）
        const targetHeight = options.height * pixelRatio; // 目標高度（物理像素）

        // Canvas 尺寸使用高解析度（物理像素）以獲得清晰圖片
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 縮放 context 以保持正確的繪製比例
        ctx.scale(pixelRatio, pixelRatio);

        // 計算裁切起始位置（預設從中心裁切）
        let sourceX = options.x !== undefined ? options.x * pixelRatio : undefined;
        let sourceY = options.y !== undefined ? options.y * pixelRatio : undefined;

        if (sourceX === undefined) {
          sourceX = Math.max(0, (sourceWidth - targetWidth) / 2);
        }
        if (sourceY === undefined) {
          sourceY = Math.max(0, (sourceHeight - targetHeight) / 2);
        }

        // 確保裁切範圍不超出圖片範圍
        sourceX = Math.min(sourceX, sourceWidth - targetWidth);
        sourceY = Math.min(sourceY, sourceHeight - targetHeight);
        sourceX = Math.max(0, sourceX);
        sourceY = Math.max(0, sourceY);

        // 計算實際可裁切的尺寸（不超出圖片範圍）
        const cropWidth = Math.min(targetWidth, sourceWidth - sourceX);
        const cropHeight = Math.min(targetHeight, sourceHeight - sourceY);

        // 裁切並繪製到 canvas（使用高解析度繪製）
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          cropWidth,
          cropHeight,
          0,
          0,
          options.width, // 輸出到 canvas 的邏輯尺寸（已通過 scale 調整）
          options.height
        );

        const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.95);

        resolve({
          src: croppedDataUrl,
          width: options.width, // 返回邏輯像素尺寸
          height: options.height,
        });
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = imageSrc;
    });
  } catch {
    return null;
  }
};

export const captureElementAsImage = async (
  element: HTMLElement,
  cropOptions?: CropOptions
): Promise<CapturedImageData | null> => {
  try {
    const { toJpeg } = await import("html-to-image");
    const devicePixelRatio = window.devicePixelRatio || 1;
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: devicePixelRatio,
    });

    const imageData: CapturedImageData = {
      src: dataUrl,
      width: element.clientWidth,
      height: element.clientHeight,
    };

    // 如果需要裁切，則進行裁切
    if (cropOptions) {
      const croppedData = await cropImage(dataUrl, cropOptions, devicePixelRatio);
      return croppedData;
    }

    return imageData;
  } catch {
    return null;
  }
};
