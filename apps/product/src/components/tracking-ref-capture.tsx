"use client";

import { useEffect } from "react";
import { captureTrackingRef } from "@/lib/tracking-ref";

export function TrackingRefCapture() {
  useEffect(() => {
    captureTrackingRef();
  }, []);
  return null;
}
