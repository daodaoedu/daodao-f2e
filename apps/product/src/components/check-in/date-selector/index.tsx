"use client";

import { MobileCheckInDateSelector } from "./mobile";
import type { ICheckInDateSelectorProps } from "./types";

export { mockCheckIns } from "./mock";

export const CheckInDateSelector = (props: ICheckInDateSelectorProps) => {
  return <MobileCheckInDateSelector {...props} />;
};
