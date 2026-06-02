import { Redirect, Stack } from "expo-router";
import useSWR from "swr";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api-client";

function useIsAdmin(enabled: boolean) {
  const { data, error } = useSWR(
    enabled ? "/admin/user-stats/overview" : null,
    () => api.get<{ data?: unknown }>("/admin/user-stats/overview"),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );
  const isLoading = enabled && data === undefined && !error;
  return { isAdmin: !!data && !error, isLoading };
}

export default function AdminLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useIsAdmin(isAuthenticated);

  if (authLoading || adminLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
