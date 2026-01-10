/**
 * 設備類型
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * 設備資訊
 */
export interface DeviceInfo {
  /** 是否為行動裝置（< 768px） */
  isMobile: boolean;
  /** 是否為平板裝置（>= 768px 且 < 1025px） */
  isTablet: boolean;
  /** 是否為桌面裝置（>= 1025px） */
  isDesktop: boolean;
  /** 設備類型 */
  deviceType: DeviceType;
}

/**
 * 從 User-Agent 判斷是否為行動裝置
 * 使用簡單的 User-Agent 檢測，適用於大多數情況
 */
function isMobileUserAgent(userAgent: string): boolean {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(userAgent);
}

/**
 * 從 User-Agent 判斷是否為平板裝置
 */
function isTabletUserAgent(userAgent: string): boolean {
  const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i;
  return tabletRegex.test(userAgent);
}

/**
 * 從 User-Agent 字串解析設備資訊
 * 這個函數可以在 Server Side 使用，只需要傳入 User-Agent 字串
 *
 * @param userAgent - User-Agent 字串
 * @returns 設備資訊
 */
export function detectDeviceFromUserAgent(userAgent: string): DeviceInfo {
  // 判斷設備類型
  const isTablet = isTabletUserAgent(userAgent);
  const isMobile = isMobileUserAgent(userAgent) && !isTablet;
  const isDesktop = !isMobile && !isTablet;

  let deviceType: DeviceType;
  if (isMobile) {
    deviceType = "mobile";
  } else if (isTablet) {
    deviceType = "tablet";
  } else {
    deviceType = "desktop";
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
  };
}

/**
 * 同步版本的設備偵測（用於 Client Side）
 * 透過 window.matchMedia 判斷設備類型
 *
 * @returns 設備資訊
 */
export function detectDeviceClient(): DeviceInfo {
  if (typeof window === "undefined") {
    // Server Side 時返回預設值
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
    };
  }

  const md = window.matchMedia("(min-width: 768px)").matches;
  const lg = window.matchMedia("(min-width: 1025px)").matches;

  const isMobile = !md;
  const isTablet = md && !lg;
  const isDesktop = lg;

  let deviceType: DeviceType;
  if (isMobile) {
    deviceType = "mobile";
  } else if (isTablet) {
    deviceType = "tablet";
  } else {
    deviceType = "desktop";
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
  };
}

