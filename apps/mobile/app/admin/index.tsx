import { Mail, Monitor, Shield, Target, Users } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import useSWR from "swr";
import { Button, Text, XStack, YStack } from "tamagui";
import {
  AdminScreen,
  FieldRow,
  LoadingState,
  SectionCard,
  StatGrid,
  asRecord,
  formatNumber,
  numberValue,
  stringValue,
} from "@/components/admin/admin-components";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

const QUICK_LINKS = [
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/practices", key: "practices", icon: Target },
  { href: "/admin/email", key: "email", icon: Mail },
  { href: "/admin/roles", key: "roles", icon: Shield },
  { href: "/admin/system", key: "system", icon: Monitor },
] as const;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.admin");
  const overview = useSWR("/admin/user-stats/overview", () =>
    api.get<{ data?: unknown }>("/admin/user-stats/overview")
  );
  const activeUsers = useSWR("/admin/user-stats/active-users", () =>
    api.get<{ data?: unknown }>("/admin/user-stats/active-users")
  );
  const emailStats = useSWR("/email/stats", () => api.get<{ data?: unknown }>("/email/stats"));
  const emailHealth = useSWR("/email/health", () => api.get<{ data?: unknown }>("/email/health"));

  const overviewData = asRecord(overview.data?.data);
  const activeData = asRecord(activeUsers.data?.data);
  const statsData = asRecord(emailStats.data?.data);
  const healthData = asRecord(emailHealth.data?.data);
  const isLoading =
    overview.isLoading || activeUsers.isLoading || emailStats.isLoading || emailHealth.isLoading;

  return (
    <AdminScreen
      title={t("dashboard_title")}
      refreshing={
        overview.isValidating ||
        activeUsers.isValidating ||
        emailStats.isValidating ||
        emailHealth.isValidating
      }
      onRefresh={() => {
        overview.mutate();
        activeUsers.mutate();
        emailStats.mutate();
        emailHealth.mutate();
      }}
    >
      {isLoading ? (
        <LoadingState label={t("loading")} />
      ) : (
        <>
          <StatGrid
            items={[
              { label: t("total_users"), value: formatNumber(overviewData.totalUsers) },
              { label: t("new_this_month"), value: formatNumber(overviewData.newUsersThisMonth) },
              {
                label: t("active_users"),
                value: formatNumber(overviewData.activeUsers),
                hint: t("active_rate", { rate: numberValue(overviewData.activeRate) }),
              },
              {
                label: t("email_success_rate"),
                value:
                  typeof statsData.successRate === "number"
                    ? `${statsData.successRate}%`
                    : t("not_available"),
              },
            ]}
          />

          <SectionCard title={t("active_metrics")}>
            <FieldRow label={t("dau")} value={formatNumber(activeData.dau)} />
            <FieldRow label={t("wau")} value={formatNumber(activeData.wau)} />
            <FieldRow label={t("mau")} value={formatNumber(activeData.mau)} />
          </SectionCard>

          <SectionCard title={t("email_health")}>
            <FieldRow label={t("status")} value={stringValue(healthData.status, t("unknown"))} />
            <FieldRow
              label="SMTP"
              value={healthData.smtpConnection ? t("connected") : t("disconnected")}
            />
            <FieldRow label={t("queue_size")} value={formatNumber(healthData.queueSize)} />
          </SectionCard>

          <SectionCard title={t("quick_links")}>
            <YStack gap="$2">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.href}
                    justifyContent="flex-start"
                    backgroundColor="$backgroundHover"
                    onPress={() => router.push(link.href as never)}
                  >
                    <XStack alignItems="center" gap="$2">
                      <Icon size={16} color={colors.primary.base} />
                      <Text color="$color">{t(`link_${link.key}`)}</Text>
                    </XStack>
                  </Button>
                );
              })}
            </YStack>
          </SectionCard>
        </>
      )}
    </AdminScreen>
  );
}
