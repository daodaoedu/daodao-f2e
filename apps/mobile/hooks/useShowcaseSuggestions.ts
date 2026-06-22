import useSWR from "swr";
import { aiApiClient } from "@/services/ai-api-client";

interface IAIResponse<T> {
  success: boolean;
  data?: T;
}

export interface IShowcaseSuggestions {
  trending_keywords?: string[];
  interest_tags?: string[];
}

async function fetchAiBackend<T>(path: string): Promise<T> {
  return aiApiClient<T>(path);
}

export function useShowcaseSuggestions(enabled: boolean) {
  return useSWR<IAIResponse<IShowcaseSuggestions>>(
    enabled ? "/api/v1/users/practices/suggestions" : null,
    (path: string) => fetchAiBackend<IAIResponse<IShowcaseSuggestions>>(path),
    { revalidateOnFocus: false }
  );
}
