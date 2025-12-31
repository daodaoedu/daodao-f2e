/**
 * 跳轉工具函數
 * 支援相對路徑和絕對路徑
 * 支援跨域跳轉（如跳回 daodao.so）
 */
export const redirectTo = (url: string): void => {
  if (
    window === undefined ||
    !url.startsWith("/") ||
    [process.env.NEXT_PUBLIC_APP_URL, process.env.NEXT_PUBLIC_WEBSITE_URL].some(
      (whitelistUrl) => whitelistUrl && url.startsWith(whitelistUrl)
    )
  ) {
    return;
  }

  window.location.href = url;
};
