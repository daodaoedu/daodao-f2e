import { useMemo, useState } from "react";
import { Alert } from "react-native";
import useSWR from "swr";
import { Button, Input, Text, TextArea, XStack, YStack } from "tamagui";
import {
  AdminScreen,
  asArray,
  asRecord,
  buildQuery,
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

export default function AdminEmailScreen() {
  const t = useMobileTranslation("mobile.admin");
  const [activeTab, setActiveTab] = useState<"stats" | "health" | "send">("stats");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const historyEndpoint = useMemo(
    () =>
      buildQuery("/admin/email/history", {
        page: 1,
        limit: 20,
        sortBy: "sentAt",
        sortOrder: "desc",
      }),
    []
  );
  const stats = useSWR("/email/stats", () => api.get<{ data?: unknown }>("/email/stats"));
  const health = useSWR("/email/health", () => api.get<{ data?: unknown }>("/email/health"));
  const history = useSWR(historyEndpoint, () => api.get<{ data?: unknown }>(historyEndpoint));

  const statsData = asRecord(stats.data?.data);
  const healthData = asRecord(health.data?.data);
  const historyData = asRecord(history.data?.data);
  const trackingStats = asRecord(historyData.stats);
  const records = asArray(historyData.records);

  const sendEmail = async () => {
    if (!recipient.trim() || !subject.trim() || !content.trim()) return;
    setSending(true);
    try {
      await api.post("/email/custom", {
        to: recipient.trim(),
        subject: subject.trim(),
        content: content.trim(),
      });
      setRecipient("");
      setSubject("");
      setContent("");
      await history.mutate();
      Alert.alert("", t("email_sent"));
    } catch {
      Alert.alert(t("error_title"), t("email_send_failed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminScreen
      title={t("email_title")}
      refreshing={stats.isValidating || health.isValidating || history.isValidating}
      onRefresh={() => {
        stats.mutate();
        health.mutate();
        history.mutate();
      }}
    >
      <XStack gap="$2">
        {(["stats", "health", "send"] as const).map((tab) => (
          <Button
            key={tab}
            flex={1}
            backgroundColor={activeTab === tab ? colors.primary.palest : "$backgroundHover"}
            onPress={() => setActiveTab(tab)}
          >
            <Text color={activeTab === tab ? colors.primary.base : "$color"}>
              {t(`email_tab_${tab}`)}
            </Text>
          </Button>
        ))}
      </XStack>

      {activeTab === "stats" ? (
        <>
          <StatGrid
            items={[
              { label: t("total_sent"), value: formatNumber(statsData.totalSent) },
              { label: t("total_failed"), value: formatNumber(statsData.totalFailed) },
              {
                label: t("email_success_rate"),
                value:
                  typeof statsData.successRate === "number"
                    ? `${statsData.successRate}%`
                    : t("not_available"),
              },
              { label: t("opened_count"), value: formatNumber(trackingStats.openedCount) },
            ]}
          />
          <SectionCard title={t("email_history")}>
            {stats.isLoading || history.isLoading ? (
              <LoadingState label={t("loading")} />
            ) : records.length === 0 ? (
              <EmptyState label={t("empty_email_history")} />
            ) : (
              <YStack gap="$3">
                {records.slice(0, 10).map((record, index) => (
                  <YStack key={`${stringValue(record.id, "email")}-${index}`} gap="$1">
                    <XStack justifyContent="space-between" gap="$2">
                      <Text
                        flex={1}
                        fontSize={14}
                        fontWeight="700"
                        color="$color"
                        numberOfLines={1}
                      >
                        {stringValue(record.subject, stringValue(record.emailType))}
                      </Text>
                      <StatusPill
                        label={record.openedAt ? t("opened") : t("not_opened")}
                        tone={record.openedAt ? "good" : "neutral"}
                      />
                    </XStack>
                    <Text fontSize={12} color="$color" opacity={0.65} numberOfLines={1}>
                      {stringValue(record.recipient)}
                    </Text>
                    <Text fontSize={11} color="$color" opacity={0.5}>
                      {formatDate(record.sentAt)}
                    </Text>
                  </YStack>
                ))}
              </YStack>
            )}
          </SectionCard>
        </>
      ) : null}

      {activeTab === "health" ? (
        <SectionCard title={t("email_health")}>
          {health.isLoading ? (
            <LoadingState label={t("loading")} />
          ) : (
            <>
              <StatusPill
                label={stringValue(healthData.status, t("unknown"))}
                tone={healthData.status === "healthy" ? "good" : "warn"}
              />
              <FieldRow
                label="SMTP"
                value={healthData.smtpConnection ? t("connected") : t("disconnected")}
              />
              <FieldRow label={t("queue_size")} value={formatNumber(healthData.queueSize)} />
              <FieldRow label={t("last_error")} value={stringValue(healthData.lastError)} />
            </>
          )}
        </SectionCard>
      ) : null}

      {activeTab === "send" ? (
        <SectionCard title={t("send_custom_email")}>
          <Input
            value={recipient}
            onChangeText={setRecipient}
            placeholder={t("recipient")}
            autoCapitalize="none"
          />
          <Input value={subject} onChangeText={setSubject} placeholder={t("subject")} />
          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder={t("content")}
            minHeight={140}
          />
          <Button
            disabled={sending || !recipient.trim() || !subject.trim() || !content.trim()}
            backgroundColor={colors.primary.base}
            onPress={sendEmail}
          >
            <Text color={colors.basic.white}>{sending ? t("sending") : t("send")}</Text>
          </Button>
        </SectionCard>
      ) : null}
    </AdminScreen>
  );
}
