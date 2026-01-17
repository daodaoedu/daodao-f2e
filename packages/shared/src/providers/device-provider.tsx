"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type DeviceInfo, detectDeviceClient } from "../lib/device-detection";

interface DeviceContextValue extends DeviceInfo {
  isInitialized: boolean;
}

const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);

function DeviceProviderInternal({
  value,
  children,
}: {
  value: DeviceContextValue;
  children: React.ReactNode;
}) {
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

function useDevice(): DeviceContextValue {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within DeviceProvider");
  }
  return context;
}

/**
 * Device Provider 組件
 * 提供設備資訊給子組件，避免 hydration mismatch
 */
function DeviceProviderComponent({
  initialDevice,
  children,
}: {
  initialDevice: DeviceInfo;
  children: React.ReactNode;
}) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceContextValue>({
    ...initialDevice,
    isInitialized: true,
  });

  useEffect(() => {
    const updateDevice = () => {
      const clientDevice = detectDeviceClient();
      setDeviceInfo({
        ...clientDevice,
        isInitialized: true,
      });
    };

    updateDevice();

    const mediaQueries = {
      md: window.matchMedia("(min-width: 768px)"),
      lg: window.matchMedia("(min-width: 1025px)"),
    };

    const handleChange = () => {
      updateDevice();
    };

    mediaQueries.md.addEventListener("change", handleChange);
    mediaQueries.lg.addEventListener("change", handleChange);

    return () => {
      mediaQueries.md.removeEventListener("change", handleChange);
      mediaQueries.lg.removeEventListener("change", handleChange);
    };
  }, []);

  return <DeviceProviderInternal value={deviceInfo}>{children}</DeviceProviderInternal>;
}

/**
 * 安全地取得 Device Context（如果 Provider 不存在則返回 null）
 */
function useDeviceSafe(): DeviceContextValue | null {
  const context = useContext(DeviceContext);
  return context ?? null;
}

export { DeviceProviderComponent as DeviceProvider, useDevice, useDeviceSafe };
