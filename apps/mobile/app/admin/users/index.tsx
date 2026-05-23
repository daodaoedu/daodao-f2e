import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button, Input, Text, XStack, YStack } from "tamagui";
import {
  AdminScreen,
  EmptyState,
  LoadingState,
  SectionCard,
  StatGrid,
  asArray,
  asRecord,
  buildQuery,
  formatDate,
  formatNumber,
  stringValue,
} from "@/components/admin/admin-components";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

export default function AdminUsersScreen() {
  const router = useRouter();
  const t = useMobileTranslation("mobile.admin");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const endpoint = useMemo(
    () =>
      buildQuery("/admin/users", {
        search: submittedQuery.trim() || undefined,
        page,
        limit: 20,
        sortBy: "lastLoginAt",
        sortOrder: "desc",
      }),
    [submittedQuery, page]
  );

  const overview = useSWR("/admin/user-stats/overview", () =>
    api.get<{ data?: unknown }>("/admin/user-stats/overview")
  );
  const segment = useSWR("/admin/user-stats/segmentation", () =>
    api.get<{ data?: unknown }>("/admin/user-stats/segmentation")
  );
  const users = useSWR(endpoint, () => api.get<{ data?: unknown; pagination?: unknown }>(endpoint), {
    revalidateOnFocus: false,
  });

  const overviewData = asRecord(overview.data?.data);
  const segmentData = asRecord(segment.data?.data);
  const items = asArray(users.data?.data);
  const pagination = asRecord(users.data?.pagination);
  const totalPages =
    typeof pagination.totalPages === "number" && pagination.totalPages > 0
      ? pagination.totalPages
      : 1;

  return (
    <AdminScreen
      title={t("users_title")}
      refreshing={overview.isValidating || segment.isValidating || users.isValidating}
      onRefresh={() => {
        overview.mutate();
        segment.mutate();
        users.mutate();
      }}
    >
      <StatGrid
        items={[
          { label: t("total_users"), value: formatNumber(overviewData.totalUsers) },
          { label: t("active_users"), value: formatNumber(overviewData.activeUsers) },
          { label: t("new_this_month"), value: formatNumber(overviewData.newUsersThisMonth) },
          { label: t("verified_users"), value: formatNumber(segmentData.verifiedUsers) },
        ]}
      />

      <SectionCard title={t("user_list")}>
        <XStack gap="$2">
          <Input
            flex={1}
            value={query}
            onChangeText={setQuery}
            placeholder={t("search_users")}
            returnKeyType="search"
            onSubmitEditing={() => {
              setPage(1);
              setSubmittedQuery(query);
            }}
          />
          <Button
            backgroundColor={colors.primary.base}
            onPress={() => {
              setPage(1);
              setSubmittedQuery(query);
            }}
          >
            <Text color={colors.basic.white}>{t("search")}</Text>
          </Button>
        </XStack>

        {users.isLoading ? (
          <LoadingState label={t("loading")} />
        ) : items.length === 0 ? (
          <EmptyState label={t("empty_users")} />
        ) : (
          <YStack gap="$3">
            {items.map((user, index) => (
              <Button
                key={stringValue(user.id, `user-${index}`)}
                height="auto"
                padding="$3"
                backgroundColor="$backgroundHover"
                justifyContent="flex-start"
                onPress={() => router.push(`/admin/users/${stringValue(user.id)}` as never)}
              >
                <YStack flex={1} alignItems="stretch" gap="$1">
                  <XStack justifyContent="space-between" gap="$2">
                    <Text flex={1} fontSize={15} fontWeight="700" color="$color" numberOfLines={1}>
                      {stringValue(user.name, t("unnamed_user"))}
                    </Text>
                    <Text fontSize={12} color="$color" opacity={0.55}>
                      {user.isActive ? t("active") : t("inactive")}
                    </Text>
                  </XStack>
                  <Text fontSize={12} color="$color" opacity={0.65} numberOfLines={1}>
                    {stringValue(user.email)}
                  </Text>
                  <Text fontSize={12} color="$color" opacity={0.55}>
                    {t("last_login", { date: formatDate(user.lastLoginAt) })}
                  </Text>
                </YStack>
              </Button>
            ))}
          </YStack>
        )}

        <XStack justifyContent="center" alignItems="center" gap="$3">
          <Button size="$3" disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
            {t("previous_page")}
          </Button>
          <Text color="$color" opacity={0.65}>
            {page} / {totalPages}
          </Text>
          <Button
            size="$3"
            disabled={page >= totalPages}
            onPress={() => setPage((p) => p + 1)}
          >
            {t("next_page")}
          </Button>
        </XStack>
      </SectionCard>
    </AdminScreen>
  );
}
