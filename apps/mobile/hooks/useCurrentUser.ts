import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api-client";
import type { UserProfile } from "@/types/user";

/**
 * 後端 /users/me 回傳格式：{ success: true, data: FormattedUserResponse }
 */
interface UsersMeResponse {
  success: boolean;
  data: UserProfile;
}

export function useCurrentUser() {
  const { user: authUser, isAuthenticated } = useAuth();

  const fallbackData = useMemo<UserProfile | undefined>(() => {
    if (!authUser) return undefined;
    return {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      photoURL: authUser.avatar ?? null,
      selfIntroduction: null,
      personalSlogan: null,
      location: null,
      locationNameZh: null,
      locationNameEn: null,
      contactList: null,
      latestQuizResult: null,
      tagList: null,
      customId: null,
    };
  }, [authUser]);

  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    isAuthenticated ? "/users/me" : null,
    async () => {
      const res = await api.get<UsersMeResponse>("/users/me");
      return res.data;
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      fallbackData,
    }
  );

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}
