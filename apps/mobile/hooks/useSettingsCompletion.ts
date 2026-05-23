import useSWR from "swr";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api-client";

export interface ISettingsSummary {
  completed: number;
  total: number;
  sections: {
    onboarding: boolean;
    preferences: boolean;
    account: boolean;
    publicInfo: boolean;
  };
}

interface ISettingsSummaryResponse {
  success: boolean;
  data: ISettingsSummary;
}

export function useSettingsCompletion() {
  const { isAuthenticated } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<ISettingsSummary>(
    isAuthenticated ? "/users/settings-summary" : null,
    async () => {
      const res = await api.get<ISettingsSummaryResponse>("/users/settings-summary");
      return res.data;
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );

  return {
    data,
    error,
    isLoading,
    revalidate: mutate,
  };
}
