"use client";

import { useIsMobile } from "@daodao/shared";
import { DesktopCheckInDateSelector } from "./desktop";
import { MobileCheckInDateSelector } from "./mobile";
import type { CheckInDateSelectorProps } from "./types";

export const CheckInDateSelector = (props: CheckInDateSelectorProps) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <MobileCheckInDateSelector {...props} />;
  }
  return <DesktopCheckInDateSelector {...props} />;
};

