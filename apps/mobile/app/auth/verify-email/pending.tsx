import { useRouter } from "expo-router";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { useMobileTranslation } from "@/i18n";
import { useAuth } from "@/providers/AuthProvider";

export default function VerifyEmailPendingScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.authCompat");
  const { user, signOut } = useAuth();

  return (
    <AuthStatusScreen
      variant="mail"
      title={t("verify_pending_title")}
      description={
        user?.email
          ? t("verify_pending_description", { email: user.email })
          : t("verify_pending_no_email")
      }
      primaryLabel={t("open_login")}
      onPrimaryPress={() => router.replace("/login")}
      secondaryLabel={t("logout")}
      onSecondaryPress={() => {
        void signOut().then(() => router.replace("/login"));
      }}
    />
  );
}
