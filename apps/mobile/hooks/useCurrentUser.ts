import { useCurrentUser as useApiCurrentUser } from "@daodao/api";
import { useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import type { IUserProfile } from "@/types/user";

export function useCurrentUser() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { data, error, isLoading, mutate } = useApiCurrentUser({ enabled: isAuthenticated });

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

  const user = isAuthenticated
    ? ((data?.data as IUserProfile | undefined) ?? fallbackData)
    : undefined;

  return {
    user,
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : undefined,
    mutate,
  };
}
