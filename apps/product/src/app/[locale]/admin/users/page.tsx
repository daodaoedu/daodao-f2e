"use client";

import {
  getAdminExportUrl,
  useAdminActivity,
  useAdminDeviceAnalytics,
  useAdminPopularProfiles,
  useAdminRegistrations,
  useAdminRetention,
  useAdminSegmentation,
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

type TabId = "registrations" | "activity" | "retention" | "devices" | "segmentation" | "popular";

const tabs: { id: TabId; label: string }[] = [
  { id: "registrations", label: "註冊統計" },
  { id: "activity", label: "活躍度" },
  { id: "retention", label: "留存率" },
  { id: "devices", label: "裝置" },
  { id: "segmentation", label: "分群" },
  { id: "popular", label: "熱門排行" },
];

export default function UsersStatsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("registrations");

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
      {activeTab === "registrations" && <RegistrationsTab />}
      {activeTab === "activity" && <ActivityTab />}
      {activeTab === "retention" && <RetentionTab />}
      {activeTab === "devices" && <DevicesTab />}
      {activeTab === "segmentation" && <SegmentationTab />}
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

  const handleExport = (type: "registrations" | "activity" | "full") => {
    const url = getAdminExportUrl({ format, type });
    window.open(url, "_blank");
    setIsOpen(false);
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
            <button
              key={type}
              type="button"
              onClick={() => handleExport(type)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-basic-50"
            >
              {type === "registrations"
                ? "註冊統計"
                : type === "activity"
                  ? "活躍度統計"
                  : "完整資料"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tab 1: Registrations
// ============================================================================

function RegistrationsTab() {
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
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">註冊趨勢圖</h3>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-basic-300">暫無資料</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
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
// Tab 2: Activity
// ============================================================================

const ACTIVITY_COLORS = ["#16B9B3", "#E5E7EB"];

function ActivityTab() {
  const [groupBy, setGroupBy] = useState<"role" | "location" | "education_stage" | undefined>(
    undefined
  );
  const { data, isLoading } = useAdminActivity({ groupBy });

  const activityData = data?.data as
    | {
        activeUsers?: number;
        inactiveUsers?: number;
        activeRate?: number;
        groups?: Array<{
          group?: string;
          activeUsers?: number;
          inactiveUsers?: number;
        }>;
      }
    | undefined;

  const pieData = useMemo(() => {
    if (!activityData) return [];
    return [
      { name: "活躍", value: activityData.activeUsers ?? 0 },
      { name: "不活躍", value: activityData.inactiveUsers ?? 0 },
    ];
  }, [activityData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">活躍度比例</h3>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center text-sm text-basic-400">
                活躍: {activityData?.activeUsers?.toLocaleString()} / 不活躍:{" "}
                {activityData?.inactiveUsers?.toLocaleString()}
              </div>
            </>
          )}
        </div>

        {/* Group Analysis */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">分組分析</h3>
            <select
              value={groupBy ?? ""}
              onChange={(e) => setGroupBy((e.target.value || undefined) as typeof groupBy)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              <option value="">不分組</option>
              <option value="role">按角色</option>
              <option value="location">按地區</option>
              <option value="education_stage">按教育階段</option>
            </select>
          </div>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
            </div>
          ) : activityData?.groups && activityData.groups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-basic-400">
                    <th className="pb-2 pr-4">分組</th>
                    <th className="pb-2 pr-4">活躍</th>
                    <th className="pb-2">不活躍</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.groups.map((group) => (
                    <tr key={group.group} className="border-b border-border/50">
                      <td className="py-2 pr-4">{group.group}</td>
                      <td className="py-2 pr-4 font-medium text-green-600">
                        {group.activeUsers?.toLocaleString()}
                      </td>
                      <td className="py-2 text-basic-400">
                        {group.inactiveUsers?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-basic-300">
              請選擇分組方式
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Tab 3: Retention
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
// Tab 4: Devices
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
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
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
                outerRadius={65}
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
// Tab 5: Segmentation
// ============================================================================

const SEGMENT_COLORS: Record<string, string> = {
  highly_active: "#059669",
  active: "#16B9B3",
  moderate: "#F59E0B",
  inactive: "#F97316",
  dormant: "#EF4444",
};

function SegmentationTab() {
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
// Tab 6: Popular Profiles
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
