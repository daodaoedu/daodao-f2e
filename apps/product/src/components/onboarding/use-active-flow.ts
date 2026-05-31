"use client";

import { getActiveOnboardingFlow, type ActiveOnboardingFlow } from "@daodao/api";
import { useEffect, useState } from "react";

interface UseActiveFlowReturn {
  data: ActiveOnboardingFlow | null;
  isLoading: boolean;
}

/**
 * 取得目前啟用的 Onboarding 動態流程
 * 如果沒有啟用流程則回傳 null，表單會 fallback 到固定的興趣 + 來源步驟
 */
export function useActiveFlow(): UseActiveFlowReturn {
  const [data, setData] = useState<ActiveOnboardingFlow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActiveOnboardingFlow()
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
