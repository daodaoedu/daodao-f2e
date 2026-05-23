import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.authCompat");
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? "/(tabs)" : "/login");
  }, [isAuthenticated, isLoading, router]);

  return (
    <AuthStatusScreen
      variant="loading"
      title={t("callback_title")}
      description={t("callback_description")}
    />
  );
}
