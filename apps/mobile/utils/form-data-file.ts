import type { IReactNativeFormDataFile } from "@daodao/api";

/**
 * 從 URI 推斷 MIME type（React Native image picker local uri）
 */
export const getMimeTypeFromUri = (uri: string): string => {
  const path = uri.split("?")[0] ?? uri;
  const extension = path.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    default:
      return "image/jpeg";
  }
};

/**
 * 將本機 URI 轉成 RN FormData 可接受的 file part
 */
export const createReactNativeFormDataFile = (
  uri: string,
  index = 0
): IReactNativeFormDataFile => {
  const path = uri.split("?")[0] ?? uri;
  const rawExt = path.split(".").pop()?.toLowerCase() || "jpg";
  const ext = rawExt.length > 0 && rawExt.length <= 5 ? rawExt : "jpg";

  return {
    uri,
    type: getMimeTypeFromUri(uri),
    name: `image-${index}.${ext}`,
  };
};
