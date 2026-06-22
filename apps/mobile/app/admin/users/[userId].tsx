import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import useSWR from "swr";
import { Button, Text, XStack, YStack } from "tamagui";
import {
  AdminScreen,
  asArray,
  asRecord,
  EmptyState,
  FieldRow,
  formatDate,
  formatNumber,
  LoadingState,
  SectionCard,
  StatGrid,
  StatusPill,
  stringValue,
} from "@/components/admin/admin-components";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

export default function AdminUserDetailScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const t = useMobileTranslation("mobile.admin");
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const user = useSWR(userId ? `/admin/users/${userId}` : null, () =>
    api.get<{ data?: unknown }>(`/admin/users/${userId}`)
  );
  const role = useSWR(userId ? `/admin/users/${userId}/role` : null, () =>
    api.get<{ data?: unknown }>(`/admin/users/${userId}/role`)
  );
  const activity = useSWR(userId ? `/admin/users/${userId}/activity-stats` : null, () =>
    api.get<{ data?: unknown }>(`/admin/users/${userId}/activity-stats`)
  );
  const loginHistory = useSWR(userId ? `/admin/users/${userId}/login-history?limit=10` : null, () =>
    api.get<{ data?: unknown }>(`/admin/users/${userId}/login-history?limit=10`)
  );
  const roles = useSWR("/admin/roles", () => api.get<{ data?: unknown }>("/admin/roles"));

  const userData = asRecord(user.data?.data);
  const currentRole = asRecord(asRecord(role.data?.data).role);
  const activityData = asRecord(activity.data?.data);
  const historyRecords = asArray(asRecord(loginHistory.data?.data).records);
  const roleItems = asArray(roles.data?.data);

  const updateRole = async (roleId: unknown) => {
    if (!userId || roleId == null || roleId === "") return;
    setSavingRoleId(String(roleId));
    try {
      await api.put(`/admin/users/${userId}/role`, { roleId });
      await role.mutate();
      Alert.alert("", t("role_saved"));
    } catch {
      Alert.alert(t("error_title"), t("role_save_failed"));
    } finally {
      setSavingRoleId(null);
    }
  };

  const updateStatus = async () => {
    if (!userId) return;
    setSavingStatus(true);
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !userData.isActive });
      await user.mutate();
      Alert.alert("", t("status_saved"));
    } catch {
      Alert.alert(t("error_title"), t("status_save_failed"));
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <AdminScreen
      title={t("user_detail_title")}
      refreshing={
        user.isValidating ||
        role.isValidating ||
        activity.isValidating ||
        loginHistory.isValidating ||
        roles.isValidating
      }
      onRefresh={() => {
        user.mutate();
        role.mutate();
        activity.mutate();
        loginHistory.mutate();
        roles.mutate();
      }}
    >
      {user.isLoading ? (
        <LoadingState label={t("loading")} />
      ) : !userData.id ? (
        <EmptyState label={t("user_not_found")} />
      ) : (
        <>
          <SectionCard>
            <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
              <YStack flex={1} gap="$1">
                <Text fontSize={20} fontWeight="700" color="$color">
                  {stringValue(userData.name, t("unnamed_user"))}
                </Text>
                <Text fontSize={13} color="$color" opacity={0.65}>
                  {stringValue(userData.email)}
                </Text>
              </YStack>
              <StatusPill
                label={userData.isActive ? t("active") : t("inactive")}
                tone={userData.isActive ? "good" : "bad"}
              />
            </XStack>
            <FieldRow label={t("created_at")} value={formatDate(userData.createdAt)} />
            <FieldRow label={t("last_login_label")} value={formatDate(userData.lastLoginAt)} />
            <FieldRow label={t("login_count")} value={formatNumber(userData.loginCount)} />
            <FieldRow
              label={t("current_role")}
              value={stringValue(currentRole.name, t("unassigned"))}
            />
            <Button disabled={savingStatus} onPress={updateStatus}>
              {userData.isActive ? t("deactivate_user") : t("activate_user")}
            </Button>
          </SectionCard>

          <StatGrid
            items={[
              { label: t("total_practices"), value: formatNumber(activityData.totalPractices) },
              { label: t("active_practices"), value: formatNumber(activityData.activePractices) },
              {
                label: t("completed_practices"),
                value: formatNumber(activityData.completedPractices),
              },
              { label: t("total_checkins"), value: formatNumber(activityData.totalCheckIns) },
            ]}
          />

          <SectionCard title={t("change_role")}>
            <YStack gap="$2">
              {roleItems.map((item) => (
                <Button
                  key={stringValue(item.id)}
                  disabled={savingRoleId === String(item.id)}
                  backgroundColor={
                    currentRole.id === item.id ? colors.primary.palest : "$backgroundHover"
                  }
                  onPress={() => updateRole(item.id)}
                >
                  <Text color="$color">{stringValue(item.name)}</Text>
                </Button>
              ))}
            </YStack>
          </SectionCard>

          <SectionCard title={t("login_history")}>
            {historyRecords.length === 0 ? (
              <EmptyState label={t("empty_login_history")} />
            ) : (
              <YStack gap="$3">
                {historyRecords.map((record, index) => (
                  <YStack key={`${stringValue(record.loginAt)}-${index}`} gap="$1">
                    <Text fontSize={13} fontWeight="600" color="$color">
                      {formatDate(record.loginAt)}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      {stringValue(record.ipAddress)}
                    </Text>
                    <Text fontSize={11} color="$color" opacity={0.45} numberOfLines={1}>
                      {stringValue(record.userAgent)}
                    </Text>
                  </YStack>
                ))}
              </YStack>
            )}
          </SectionCard>
        </>
      )}
    </AdminScreen>
  );
}
