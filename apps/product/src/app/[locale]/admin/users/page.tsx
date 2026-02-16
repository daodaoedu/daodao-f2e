"use client";

import {
  getAdminExportUrl,
  useAdminDeviceAnalytics,
  useAdminPopularProfiles,
  useAdminRegistrations,
  useAdminRetention,
  useAdminSegmentation,
  useAdminUsers,
} from "@daodao/api";
import { Link } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TabId = "overview" | "retention" | "devices" | "popular";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "使用者總覽" },
  { id: "retention", label: "留存率" },
  { id: "devices", label: "裝置" },
  { id: "popular", label: "熱門排行" },
];

export default function UsersStatsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">使用者統計</h1>
        <ExportButton />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent",
              activeTab === tab.id
                ? "border-b-primary-base text-primary-base"
                : "text-basic-400 hover:text-text-dark"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "retention" && <RetentionTab />}
      {activeTab === "devices" && <DevicesTab />}
      {activeTab === "popular" && <PopularTab />}
    </div>
  );
}

// ============================================================================
// Export Button
// ============================================================================

function ExportButton() {
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [isOpen, setIsOpen] = useState(false);

  const getExportLabel = (type: "registrations" | "activity" | "full") => {
    if (type === "registrations") return "註冊統計";
    if (type === "activity") return "活躍度統計";
    return "完整資料";
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-basic-50 transition-colors"
      >
        <Download className="size-4" />
        匯出
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as "csv" | "excel")}
              className="w-full text-sm bg-transparent"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          {(["registrations", "activity", "full"] as const).map((type) => (
            <a
              key={type}
              href={getAdminExportUrl({ format, type })}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-basic-50"
            >
              {getExportLabel(type)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tab: Overview (合併 註冊統計 + 活躍度 + 使用者清單 + 分群)
// ============================================================================

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* 註冊統計 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-text-dark">註冊統計</h2>
        <RegistrationsSection />
      </section>

      {/* 分群 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-text-dark">分群</h2>
        <SegmentationSection />
      </section>

      {/* 使用者清單 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-text-dark">使用者清單</h2>
        <RecentActiveSection />
      </section>
    </div>
  );
}

// ============================================================================
// Section: Registrations
// ============================================================================

function RegistrationsSection() {
  const [groupBy, setGroupBy] = useState<
    "day" | "week" | "month" | "year" | "location" | "role" | "education_stage"
  >("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useAdminRegistrations({
    groupBy,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    const items = data.data as Array<{ label?: string; group?: string; count?: number }>;
    return items.map((item) => ({
      name: item.label || item.group || "N/A",
      count: item.count ?? 0,
    }));
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="開始日期"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="結束日期"
        />
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="day">按日</option>
          <option value="week">按週</option>
          <option value="month">按月</option>
          <option value="year">按年</option>
          <option value="location">按地區</option>
          <option value="role">按角色</option>
          <option value="education_stage">按教育階段</option>
        </select>
      </div>

      {/* Chart */}
      <div className="min-w-0 rounded-xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">註冊趨勢圖</h3>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-basic-300">暫無資料</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
              <YAxis fontSize={12} width={40} />
              <Tooltip />
              <Bar dataKey="count" fill="#16B9B3" radius={[4, 4, 0, 0]} name="註冊數" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Section: Recent Active Users
// ============================================================================

function RecentActiveSection() {
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<"lastLoginAt" | "createdAt" | "name" | "email">("lastLoginAt");
  const limit = 20;

  const { data, isLoading } = useAdminUsers({
    isActive: "true",
    isVerified: "true",
    sortBy,
    sortOrder: "desc",
    page: page + 1,
    limit,
  });

  type UserItem = {
    id: string;
    internalId: number;
    name: string | null;
    email: string | null;
    photoURL: string | null;
    lastLoginAt: string | null;
    lastActiveAt: string | null;
    createdAt: string;
    isActive: boolean;
    roles: Array<{ id: number; name: string; description: string | null }>;
  };

  // swr-openapi 的 data = response body = { success, data: [...], pagination: {...} }
  const response = data as
    | {
        data?: UserItem[];
        pagination?: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }
    | undefined;

  const users = response?.data ?? [];
  const pagination = response?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  function formatRelativeTime(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "剛剛";
    if (diffMin < 60) return `${diffMin} 分鐘前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} 小時前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} 天前`;
    return date.toLocaleDateString();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-basic-400">
          排序依據
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(0); }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-dark"
          >
            <option value="lastLoginAt">上次登入</option>
            <option value="createdAt">加入時間</option>
            <option value="name">姓名</option>
            <option value="email">Email</option>
          </select>
        </label>
        {pagination && (
          <span className="text-sm text-basic-400">
            共 {pagination.totalItems.toLocaleString()} 位
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無資料</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-basic-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">頭像</th>
                <th className="px-4 py-3">姓名</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">角色</th>
                <th className="px-4 py-3">加入時間</th>
                <th className="px-4 py-3">上次登入</th>
                <th className="px-4 py-3">上次操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-basic-50">
                  <td className="px-4 py-3 text-basic-400">{page * limit + i + 1}</td>
                  <td className="px-4 py-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-basic-100 text-xs text-basic-400">
                        {user.name?.[0] ?? "?"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.internalId}`}
                      className="text-primary-base hover:underline"
                    >
                      {user.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-basic-400">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-block rounded-full bg-primary-base/10 px-2 py-0.5 text-xs font-medium text-primary-base"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-basic-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-basic-400">
                    <span title={new Date(user.createdAt).toLocaleString()}>
                      {formatRelativeTime(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-basic-400">
                    <span title={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : ""}>
                      {formatRelativeTime(user.lastLoginAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-basic-400">
                    <span title={user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : ""}>
                      {formatRelativeTime(user.lastActiveAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            上一頁
          </button>
          <span className="text-sm text-basic-400">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tab: Retention
// ============================================================================

function RetentionTab() {
  const [cohorts, setCohorts] = useState(12);
  const [trackDays, setTrackDays] = useState(30);
  const [granularity, setGranularity] = useState<"day" | "week">("week");

  const { data, isLoading } = useAdminRetention({
    cohorts,
    trackDays,
    granularity,
  });

  const retentionData = data?.data as
    | {
        averageRetention?: Record<string, number>;
        cohorts?: Array<{
          cohortDate?: string;
          size?: number;
          retention?: Record<string, number>;
        }>;
      }
    | undefined;

  const avgRetention = retentionData?.averageRetention ?? {};

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          群組數
          <select
            value={cohorts}
            onChange={(e) => setCohorts(Number(e.target.value))}
            className="rounded-lg border border-border px-2 py-1.5 text-sm"
          >
            {[6, 8, 10, 12, 16, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          追蹤天數
          <select
            value={trackDays}
            onChange={(e) => setTrackDays(Number(e.target.value))}
            className="rounded-lg border border-border px-2 py-1.5 text-sm"
          >
            {[7, 14, 30, 60].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          粒度
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as "day" | "week")}
            className="rounded-lg border border-border px-2 py-1.5 text-sm"
          >
            <option value="day">日</option>
            <option value="week">週</option>
          </select>
        </label>
      </div>

      {/* Average Retention Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["day1", "day7", "day14", "day30"].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-white p-4 text-center shadow-sm"
          >
            <p className="text-sm text-basic-400">{key.replace("day", "Day ")}</p>
            <p className="mt-1 text-2xl font-bold">
              {avgRetention[key] !== undefined ? `${avgRetention[key]}%` : "—"}
            </p>
            <p className="text-xs text-basic-300">平均留存</p>
          </div>
        ))}
      </div>

      {/* Cohort Table */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm overflow-x-auto">
        <h3 className="mb-4 text-lg font-semibold">Cohort 留存率熱力圖</h3>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : retentionData?.cohorts && retentionData.cohorts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-basic-400">
                <th className="pb-2 pr-4">群組</th>
                <th className="pb-2 pr-4">人數</th>
                <th className="pb-2 pr-4">D1</th>
                <th className="pb-2 pr-4">D7</th>
                <th className="pb-2 pr-4">D14</th>
                <th className="pb-2">D30</th>
              </tr>
            </thead>
            <tbody>
              {retentionData.cohorts.map((cohort) => (
                <tr key={cohort.cohortDate} className="border-b border-border/50">
                  <td className="py-2 pr-4 whitespace-nowrap">{cohort.cohortDate}</td>
                  <td className="py-2 pr-4">{cohort.size}</td>
                  {["day1", "day7", "day14", "day30"].map((key) => {
                    const val = cohort.retention?.[key];
                    return (
                      <td key={key} className="py-2 pr-4">
                        {val !== undefined ? (
                          <span
                            className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(22,185,179,${(val / 100) * 0.7 + 0.1})`,
                              color: val > 50 ? "white" : "#333",
                            }}
                          >
                            {val}%
                          </span>
                        ) : (
                          <span className="text-basic-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無資料</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Tab: Devices
// ============================================================================

const DEVICE_COLORS = ["#16B9B3", "#FF9F1C", "#6366F1", "#EC4899", "#94A3B8"];

function DevicesTab() {
  const { data, isLoading } = useAdminDeviceAnalytics({ days: 30 });

  const deviceData = data?.data as
    | {
        totalLogins?: number;
        devices?: Array<{ deviceType?: string; count?: number; percentage?: number }>;
        browsers?: Array<{ browser?: string; count?: number; percentage?: number }>;
        operatingSystems?: Array<{ os?: string; count?: number; percentage?: number }>;
      }
    | undefined;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-basic-400">
        總登入次數: {deviceData?.totalLogins?.toLocaleString() ?? "—"}
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DeviceChart
          title="裝置類型"
          items={deviceData?.devices?.map((d) => ({
            name: d.deviceType,
            count: d.count,
            percentage: d.percentage,
          }))}
        />
        <DeviceChart
          title="瀏覽器"
          items={deviceData?.browsers?.map((b) => ({
            name: b.browser,
            count: b.count,
            percentage: b.percentage,
          }))}
        />
        <DeviceChart
          title="作業系統"
          items={deviceData?.operatingSystems?.map((o) => ({
            name: o.os,
            count: o.count,
            percentage: o.percentage,
          }))}
        />
      </div>
    </div>
  );
}

function DeviceChart({
  title,
  items,
}: {
  title: string;
  items?: Array<{ name?: string; count?: number; percentage?: number }>;
}) {
  const chartData = useMemo(
    () =>
      (items ?? []).map((item) => ({
        name: item.name ?? "Unknown",
        value: item.count ?? 0,
        percentage: item.percentage ?? 0,
      })),
    [items]
  );

  return (
    <div className="min-w-0 rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-basic-300">暫無資料</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={55}
                dataKey="value"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length],
                    }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-basic-400">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Section: Segmentation
// ============================================================================

const SEGMENT_COLORS: Record<string, string> = {
  highly_active: "#059669",
  active: "#16B9B3",
  moderate: "#F59E0B",
  inactive: "#F97316",
  dormant: "#EF4444",
};

function SegmentationSection() {
  const { data, isLoading } = useAdminSegmentation();

  const segmentData = data?.data as
    | {
        totalUsers?: number;
        segments?: Array<{
          label?: string;
          displayName?: string;
          description?: string;
          criteria?: string;
          userCount?: number;
          percentage?: number;
        }>;
      }
    | undefined;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
      </div>
    );
  }

  const segments = segmentData?.segments ?? [];

  return (
    <div className="space-y-4">
      {/* Visual Chart */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">用戶活躍度分群</h3>
          <span className="text-sm text-basic-400">
            總計: {segmentData?.totalUsers?.toLocaleString()}
          </span>
        </div>
        <div className="space-y-3">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium">{seg.displayName}</div>
              <div className="flex-1">
                <div className="h-8 w-full overflow-hidden rounded-lg bg-basic-50">
                  <div
                    className="h-full rounded-lg transition-all"
                    style={{
                      width: `${seg.percentage ?? 0}%`,
                      backgroundColor: SEGMENT_COLORS[seg.label ?? ""] ?? "#94A3B8",
                    }}
                  />
                </div>
              </div>
              <div className="w-24 text-right text-sm text-basic-400">
                {seg.percentage}% ({seg.userCount?.toLocaleString()})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description Table */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-basic-400">
              <th className="pb-2 pr-4">分群</th>
              <th className="pb-2 pr-4">說明</th>
              <th className="pb-2">條件</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg) => (
              <tr key={seg.label} className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: SEGMENT_COLORS[seg.label ?? ""] ?? "#94A3B8",
                      }}
                    />
                    {seg.displayName}
                  </div>
                </td>
                <td className="py-2 pr-4 text-basic-400">{seg.description}</td>
                <td className="py-2 text-basic-400">{seg.criteria}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Tab: Popular Profiles
// ============================================================================

function PopularTab() {
  const [minViews, setMinViews] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading } = useAdminPopularProfiles({
    minViews,
    limit,
    offset: page * limit,
  });

  const profilesData = data?.data as
    | {
        profiles?: Array<{
          userId?: number;
          externalId?: string;
          nickname?: string | null;
          photoUrl?: string | null;
          profileViews?: number;
          lastActiveAt?: string | null;
        }>;
        totalCount?: number;
      }
    | undefined;

  const profiles = profilesData?.profiles ?? [];
  const total = profilesData?.totalCount ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          最低瀏覽次數:
          <input
            type="number"
            value={minViews ?? ""}
            onChange={(e) => setMinViews(e.target.value ? Number(e.target.value) : undefined)}
            className="w-24 rounded-lg border border-border px-3 py-1.5 text-sm"
            placeholder="不限"
          />
        </label>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無資料</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-basic-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">頭像</th>
                <th className="px-4 py-3">暱稱</th>
                <th className="px-4 py-3">瀏覽次數</th>
                <th className="px-4 py-3">最後活躍</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile, i) => (
                <tr key={profile.userId} className="border-b border-border/50 hover:bg-basic-50">
                  <td className="px-4 py-3 text-basic-400">{page * limit + i + 1}</td>
                  <td className="px-4 py-3">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-basic-100 text-xs text-basic-400">
                        {profile.nickname?.[0] ?? "?"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${profile.userId}`}
                      className="text-primary-base hover:underline"
                    >
                      {profile.nickname ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {profile.profileViews?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-basic-400">
                    {profile.lastActiveAt
                      ? new Date(profile.lastActiveAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            上一頁
          </button>
          <span className="text-sm text-basic-400">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}
