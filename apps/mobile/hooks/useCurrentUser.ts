import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api-client";
import type { IUserProfile } from "@/types/user";

/**
 * 後端 /users/me 回傳格式：{ success: true, data: FormattedUserResponse }
 */
interface IUsersMeResponse {
  success: boolean;
  data: IUserProfile;
}

export function useCurrentUser() {
  const { user: authUser, isAuthenticated } = useAuth();

  const fallbackData = useMemo<IUserProfile | undefined>(() => {
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

  const { data, error, isLoading, mutate } = useSWR<IUserProfile>(
    isAuthenticated ? "/users/me" : null,
    async () => {
      const res = await api.get<IUsersMeResponse>("/users/me");
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
