import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { useMobileTranslation } from "@/i18n";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.authCompat");
  const { status } = useLocalSearchParams<{ status?: string }>();
  const isSuccess = status === "success";

  return (
    <AuthStatusScreen
      variant={isSuccess ? "success" : "error"}
      title={isSuccess ? t("verify_success_title") : t("verify_error_title")}
      description={isSuccess ? t("verify_success_description") : t("verify_error_description")}
      primaryLabel={isSuccess ? t("back_home") : t("retry_login")}
      onPrimaryPress={() => router.replace(isSuccess ? "/" : "/login")}
      secondaryLabel={t("back_home")}
      onSecondaryPress={() => router.replace("/" as never)}
    />
  );
}
