import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button, Text, XStack, YStack } from "tamagui";
import {
  AdminScreen,
  EmptyState,
  FieldRow,
  LoadingState,
  PaginationRow,
  SearchRow,
  SectionCard,
  StatGrid,
  StatusPill,
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

const STATUSES = ["all", "draft", "not_started", "active", "completed", "archived"] as const;

export default function AdminPracticesScreen() {
  const t = useMobileTranslation("mobile.admin");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [page, setPage] = useState(1);
  const endpoint = useMemo(
    () =>
      buildQuery("/practices", {
        page,
        limit: 20,
        status,
        query: submittedQuery.trim() || undefined,
        sort: "createdAt",
        order: "desc",
      }),
    [page, status, submittedQuery]
  );
  const stats = useSWR("/admin/practices/stats", () =>
    api.get<{ data?: unknown }>("/admin/practices/stats")
  );
  const list = useSWR(endpoint, () => api.get<{ data?: unknown; pagination?: unknown }>(endpoint), {
    revalidateOnFocus: false,
  });

  const statsData = asRecord(stats.data?.data);
  const practices = asArray(list.data?.data);
  const pagination = asRecord(list.data?.pagination);
  const totalPages =
    typeof pagination.totalPages === "number" && pagination.totalPages > 0
      ? pagination.totalPages
      : 1;

  return (
    <AdminScreen
      title={t("practices_title")}
      refreshing={stats.isValidating || list.isValidating}
      onRefresh={() => {
        stats.mutate();
        list.mutate();
      }}
    >
      <StatGrid
        items={[
          { label: t("total_practices"), value: formatNumber(statsData.total) },
          { label: t("active_practices"), value: formatNumber(statsData.active) },
          { label: t("completed_practices"), value: formatNumber(statsData.completed) },
          { label: t("total_checkins"), value: formatNumber(statsData.totalCheckIns) },
        ]}
      />

      <SectionCard title={t("filters")}>
        <SearchRow
          value={query}
          onChange={setQuery}
          placeholder={t("search_practices")}
          searchLabel={t("search")}
          onSubmit={() => {
            setPage(1);
            setSubmittedQuery(query);
          }}
        />
        <XStack flexWrap="wrap" gap="$2">
          {STATUSES.map((item) => (
            <Button
              key={item}
              size="$3"
              borderRadius="$full"
              backgroundColor={status === item ? colors.primary.palest : "$backgroundHover"}
              onPress={() => {
                setStatus(item);
                setPage(1);
              }}
            >
              <Text color={status === item ? colors.primary.base : "$color"}>
                {t(`status_${item}`)}
              </Text>
            </Button>
          ))}
        </XStack>
      </SectionCard>

      <SectionCard title={t("practice_list")}>
        {list.isLoading ? (
          <LoadingState label={t("loading")} />
        ) : practices.length === 0 ? (
          <EmptyState label={t("empty_practices")} />
        ) : (
          <YStack gap="$3">
            {practices.map((practice, index) => {
              const author = asRecord(practice.user);
              const practiceStats = asRecord(practice.stats);
              const practiceStatus = stringValue(practice.status, "unknown");
              return (
                <SectionCard key={stringValue(practice.id, `practice-${index}`)}>
                  <YStack gap="$2">
                    <XStack justifyContent="space-between" gap="$3" alignItems="flex-start">
                      <Text flex={1} fontSize={15} fontWeight="700" color="$color">
                        {stringValue(practice.title)}
                      </Text>
                      <StatusPill label={t(`status_${practiceStatus}`)} />
                    </XStack>
                    <FieldRow label={t("creator")} value={stringValue(author.name)} />
                    <FieldRow label={t("start_date")} value={formatDate(practice.startDate)} />
                    <FieldRow label={t("duration_days")} value={formatNumber(practice.durationDays)} />
                    <FieldRow label={t("checkins")} value={formatNumber(practice.checkInCount)} />
                    <FieldRow label={t("likes")} value={formatNumber(practiceStats.likeCount)} />
                  </YStack>
                </SectionCard>
              );
            })}
          </YStack>
        )}

        <PaginationRow
          page={page}
          totalPages={totalPages}
          previousLabel={t("previous_page")}
          nextLabel={t("next_page")}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </SectionCard>
    </AdminScreen>
  );
}
