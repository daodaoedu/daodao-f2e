// String.fromCharCode 一次展開太多參數會超過呼叫堆疊上限，分段轉換
const CHUNK_SIZE = 0x8000;

/**
 * 產生截圖預覽用的 data: URL。
 * 不用 URL.createObjectURL：nginx CSP 的 img-src 只放行 'self' data: https:，blob: 會被擋成破圖。
 */
export async function createScreenshotPreviewUrl(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return `data:${file.type || "application/octet-stream"};base64,${btoa(binary)}`;
}
