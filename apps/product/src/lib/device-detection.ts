import { type DeviceInfo, detectDeviceFromUserAgent } from "@daodao/shared";
import { headers } from "next/headers";

/**
 * 在 Server Side 解析設備資訊
 * 透過 User-Agent 判斷設備類型
 *
 * @returns 設備資訊
 */
export async function detectDevice(): Promise<DeviceInfo> {
  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";

    return detectDeviceFromUserAgent(userAgent);
  } catch (error) {
    // 如果無法取得 headers（例如在靜態生成時），預設為桌面裝置
    console.warn("Failed to detect device, defaulting to desktop:", error);
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
    };
  }
}
