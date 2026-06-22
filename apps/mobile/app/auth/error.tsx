import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { useMobileTranslation } from "@/i18n";

type OAuthErrorReason = "state_expired" | "invalid_state" | "invalid_redirect_uri" | "server_error";

function getReasonKey(reason: OAuthErrorReason | undefined) {
  switch (reason) {
    case "state_expired":
      return "state_expired";
    case "invalid_state":
      return "invalid_state";
    case "invalid_redirect_uri":
      return "invalid_redirect_uri";
    case "server_error":
      return "server_error";
    default:
      return "unknown";
  }
}

export default function AuthErrorScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.authCompat");
  const { reason } = useLocalSearchParams<{ reason?: OAuthErrorReason }>();
  const key = getReasonKey(reason);

  return (
    <AuthStatusScreen
      variant="error"
      title={t(`${key}_title`)}
      description={t(`${key}_description`)}
      primaryLabel={key === "invalid_redirect_uri" ? undefined : t("retry_login")}
      onPrimaryPress={key === "invalid_redirect_uri" ? undefined : () => router.replace("/login")}
      secondaryLabel={t("back_home")}
      onSecondaryPress={() => router.replace("/" as never)}
    />
  );
}
