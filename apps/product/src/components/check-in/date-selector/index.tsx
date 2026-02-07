"use client";

import { useIsMobile } from "@daodao/shared";
import { DesktopCheckInDateSelector } from "./desktop";
import { MobileCheckInDateSelector } from "./mobile";
import type { ICheckInDateSelectorProps } from "./types";

export { mockCheckIns } from "./mock";

export const CheckInDateSelector = (props: ICheckInDateSelectorProps) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <MobileCheckInDateSelector {...props} />;
  }
  return <DesktopCheckInDateSelector {...props} />;
};
