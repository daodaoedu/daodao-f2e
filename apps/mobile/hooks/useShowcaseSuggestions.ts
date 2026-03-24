import useSWR from "swr";
import { apiClient } from "@/services/api-client";

const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL ?? "https://ai-dev.daodao.so";

interface IAIResponse<T> {
  success: boolean;
  data?: T;
}

export interface IShowcaseSuggestions {
  trending_keywords?: string[];
  interest_tags?: string[];
}

async function fetchAiBackend<T>(path: string): Promise<T> {
  return apiClient<T>(`${AI_API_URL}${path}`);
}

export function useShowcaseSuggestions(enabled: boolean) {
  return useSWR<IAIResponse<IShowcaseSuggestions>>(
    enabled ? "/api/v1/users/practices/suggestions" : null,
    (path: string) => fetchAiBackend<IAIResponse<IShowcaseSuggestions>>(path),
    { revalidateOnFocus: false }
  );
}
