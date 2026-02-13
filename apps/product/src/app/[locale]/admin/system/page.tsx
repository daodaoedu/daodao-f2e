"use client";

import { useDbInfo, useHealthCheck, useSystemMonitor } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircle, Database, HardDrive, Server, XCircle } from "lucide-react";

export default function SystemPage() {
  const { data: monitorData, isLoading: monitorLoading } = useSystemMonitor();
  const { data: dbData, isLoading: dbLoading } = useDbInfo();
  const { data: healthData, isLoading: healthLoading } = useHealthCheck();

  // /api/v1/monitor returns { system, postgres, disk }
  const systemInfo = monitorData?.system;
  const monitorPostgres = monitorData?.postgres;
  const monitorDisk = monitorData?.disk;

  // /api/v1/db-info returns { postgres, redis }
  const dbRedis = dbData?.redis;

  // /api/v1/health returns { status, uptime, timestamp }
  const health = healthData;

  const isLoading = monitorLoading || dbLoading || healthLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-basic-100" />
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders have no unique identifiers
          <div key={`skel-${i}`} className="h-40 animate-pulse rounded-xl bg-basic-100" />
        ))}
      </div>
    );
  }

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "—";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}天 ${h}時 ${m}分`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };

  const totalMem = systemInfo?.totalMemory ?? 0;
  const freeMem = systemInfo?.freeMemory ?? 0;
  const usedMem = totalMem - freeMem;
  const memoryPercent = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">系統監控</h1>

      {/* Health Status */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-4",
          health?.status === "ok" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        )}
      >
        {health?.status === "ok" ? (
          <CheckCircle className="size-6 text-green-500" />
        ) : (
          <XCircle className="size-6 text-red-500" />
        )}
        <div>
          <p className="font-medium">API 健康狀態: {health?.status ?? "unknown"}</p>
          {health?.timestamp && (
            <p className="text-xs text-basic-400">{new Date(health.timestamp).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Server className="size-5" />}
          label="主機名"
          value={systemInfo?.hostname ?? "—"}
        />
        <InfoCard
          icon={<Server className="size-5" />}
          label="平台/架構"
          value={`${systemInfo?.platform ?? "—"} / ${systemInfo?.arch ?? "—"}`}
        />
        <InfoCard
          icon={<Server className="size-5" />}
          label="Uptime"
          value={formatUptime(systemInfo?.uptime)}
        />
        <InfoCard
          icon={<Server className="size-5" />}
          label="CPU 負載"
          value={
            systemInfo?.loadAverage
              ? systemInfo.loadAverage.map((l) => l.toFixed(2)).join(" / ")
              : "—"
          }
        />
      </div>

      {/* Memory */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <HardDrive className="size-5" />
          記憶體使用量
        </h2>
        <div className="mb-2 flex justify-between text-sm">
          <span>
            {formatBytes(usedMem)} / {formatBytes(totalMem)}
          </span>
          <span className="font-medium">{memoryPercent}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-basic-100">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              memoryPercent > 90
                ? "bg-red-500"
                : memoryPercent > 70
                  ? "bg-yellow-500"
                  : "bg-primary-base"
            )}
            style={{ width: `${memoryPercent}%` }}
          />
        </div>
      </div>

      {/* Disk */}
      {monitorDisk && monitorDisk.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <HardDrive className="size-5" />
            磁碟使用量
          </h2>
          <div className="space-y-4">
            {monitorDisk.map((d) => {
              const percent = d.use ?? 0;
              return (
                <div key={`disk-${d.mount ?? d.filesystem}`}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {d.mount} ({d.filesystem})
                    </span>
                    <span>
                      {formatBytes(d.used)} / {formatBytes(d.size)} ({percent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-basic-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        percent > 90
                          ? "bg-red-500"
                          : percent > 70
                            ? "bg-yellow-500"
                            : "bg-primary-base"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PostgreSQL */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Database className="size-5" />
          PostgreSQL
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-basic-400">版本</p>
            <p className="font-medium">{monitorPostgres?.version ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-basic-400">連線數</p>
            <p className="font-medium">
              {monitorPostgres?.current_connections ?? "—"} /{" "}
              {monitorPostgres?.max_connections ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-basic-400">DB 大小</p>
            <p className="font-medium">{monitorPostgres?.database_size ?? "—"}</p>
          </div>
        </div>
        {monitorPostgres?.tables && monitorPostgres.tables.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-basic-400">
                  <th className="pb-2 pr-4">表格</th>
                  <th className="pb-2 pr-4">行數</th>
                  <th className="pb-2">大小</th>
                </tr>
              </thead>
              <tbody>
                {monitorPostgres.tables.map((table) => (
                  <tr key={table.table_name} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 font-mono text-xs">{table.table_name}</td>
                    <td className="py-1.5 pr-4">{table.row_count?.toLocaleString()}</td>
                    <td className="py-1.5">{table.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Redis */}
      {dbRedis && !("error" in dbRedis) && (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Database className="size-5" />
            Redis
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <p className="text-sm text-basic-400">版本</p>
              <p className="font-medium">{dbRedis.version ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-basic-400">Uptime</p>
              <p className="font-medium">{formatUptime(dbRedis.uptime_in_seconds)}</p>
            </div>
            <div>
              <p className="text-sm text-basic-400">連線數</p>
              <p className="font-medium">{dbRedis.connected_clients ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-basic-400">記憶體</p>
              <p className="font-medium">{dbRedis.used_memory_human ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-basic-400">命令處理</p>
              <p className="font-medium">
                {dbRedis.total_commands_processed?.toLocaleString() ?? "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-basic-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-1 font-medium text-text-dark">{value}</p>
    </div>
  );
}
