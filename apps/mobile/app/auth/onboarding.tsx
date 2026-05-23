import { useRouter } from "expo-router";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { useMobileTranslation } from "@/i18n";

export default function AuthOnboardingScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.authCompat");

  return (
    <AuthStatusScreen
      variant="mail"
      title={t("onboarding_title")}
      description={t("onboarding_description")}
      primaryLabel={t("complete_profile")}
      onPrimaryPress={() => router.replace("/settings/public-info" as never)}
      secondaryLabel={t("back_home")}
      onSecondaryPress={() => router.replace("/" as never)}
    />
  );
}
