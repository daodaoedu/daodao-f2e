import useSWR from "swr";
import {
  AdminScreen,
  asArray,
  asRecord,
  FieldRow,
  formatNumber,
  LoadingState,
  SectionCard,
  StatusPill,
  stringValue,
} from "@/components/admin/admin-components";
import { useMobileTranslation } from "@/i18n";
import { api } from "@/services/api-client";

function formatBytes(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1048576) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1073741824) return `${(value / 1048576).toFixed(1)} MB`;
  return `${(value / 1073741824).toFixed(1)} GB`;
}

function formatUptime(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export default function AdminSystemScreen() {
  const t = useMobileTranslation("mobile.admin");
  const monitor = useSWR("/monitor", () => api.get<Record<string, unknown>>("/monitor"));
  const dbInfo = useSWR("/db-info", () => api.get<Record<string, unknown>>("/db-info"));
  const health = useSWR("/health", () => api.get<Record<string, unknown>>("/health"));

  const system = asRecord(monitor.data?.system);
  const postgres = asRecord(monitor.data?.postgres);
  const redis = asRecord(asRecord(dbInfo.data).redis);
  const disks = asArray(monitor.data?.disk);
  const tables = asArray(postgres.tables);
  const healthStatus = stringValue(health.data?.status, t("unknown"));

  return (
    <AdminScreen
      title={t("system_title")}
      refreshing={monitor.isValidating || dbInfo.isValidating || health.isValidating}
      onRefresh={() => {
        monitor.mutate();
        dbInfo.mutate();
        health.mutate();
      }}
    >
      {monitor.isLoading || dbInfo.isLoading || health.isLoading ? (
        <LoadingState label={t("loading")} />
      ) : (
        <>
          <SectionCard title={t("api_health")}>
            <StatusPill
              label={healthStatus}
              tone={healthStatus === "ok" || healthStatus === "healthy" ? "good" : "bad"}
            />
            <FieldRow label={t("timestamp")} value={stringValue(health.data?.timestamp)} />
            <FieldRow label={t("uptime")} value={formatUptime(health.data?.uptime)} />
          </SectionCard>

          <SectionCard title={t("system_info")}>
            <FieldRow label={t("hostname")} value={stringValue(system.hostname)} />
            <FieldRow
              label={t("platform")}
              value={`${stringValue(system.platform)} / ${stringValue(system.arch)}`}
            />
            <FieldRow label={t("uptime")} value={formatUptime(system.uptime)} />
            <FieldRow
              label={t("memory")}
              value={`${formatBytes(system.freeMemory)} / ${formatBytes(system.totalMemory)}`}
            />
            <FieldRow
              label={t("load_average")}
              value={Array.isArray(system.loadAverage) ? system.loadAverage.join(" / ") : "-"}
            />
          </SectionCard>

          <SectionCard title="PostgreSQL">
            <FieldRow label={t("version")} value={stringValue(postgres.version)} />
            <FieldRow
              label={t("connections")}
              value={`${formatNumber(postgres.current_connections)} / ${formatNumber(postgres.max_connections)}`}
            />
            <FieldRow label={t("database_size")} value={stringValue(postgres.database_size)} />
            {tables.slice(0, 8).map((table, index) => (
              <FieldRow
                key={`${stringValue(table.table_name)}-${index}`}
                label={stringValue(table.table_name)}
                value={`${formatNumber(table.row_count)} · ${stringValue(table.size)}`}
              />
            ))}
          </SectionCard>

          <SectionCard title="Redis">
            <FieldRow label={t("status")} value={stringValue(redis.status)} />
            <FieldRow label={t("memory")} value={stringValue(redis.used_memory_human)} />
            <FieldRow label={t("connections")} value={formatNumber(redis.connected_clients)} />
          </SectionCard>

          {disks.length > 0 ? (
            <SectionCard title={t("disk_usage")}>
              {disks.map((disk, index) => (
                <FieldRow
                  key={`${stringValue(disk.mount)}-${index}`}
                  label={`${stringValue(disk.mount)} (${stringValue(disk.filesystem)})`}
                  value={`${formatBytes(disk.used)} / ${formatBytes(disk.size)} (${formatNumber(disk.use)}%)`}
                />
              ))}
            </SectionCard>
          ) : null}
        </>
      )}
    </AdminScreen>
  );
}
