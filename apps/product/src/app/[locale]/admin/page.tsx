"use client";

import { useAdminActiveUsers, useAdminOverview, useEmailHealth, useEmailStats } from "@daodao/api";
import { Link } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Mail,
  Monitor,
  Shield,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { StatCard } from "../../../components/admin/stat-card";

export default function AdminDashboardPage() {
  const { data: overviewData, isLoading: overviewLoading } = useAdminOverview();
  const { data: activeUsersData, isLoading: activeUsersLoading } = useAdminActiveUsers();
  const { data: emailStatsData, isLoading: emailStatsLoading } = useEmailStats();
  const { data: emailHealthData, isLoading: emailHealthLoading } = useEmailHealth();

  const overview = overviewData?.data;
  const activeUsers = activeUsersData?.data;
  const emailStats = emailStatsData?.data;
  const emailHealth = emailHealthData?.data;

  const isLoading =
    overviewLoading || activeUsersLoading || emailStatsLoading || emailHealthLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const healthStatus = emailHealth?.status ?? "unknown";
  const HealthIcon =
    healthStatus === "healthy"
      ? CheckCircle
      : healthStatus === "degraded"
        ? AlertTriangle
        : XCircle;
  const healthColor =
    healthStatus === "healthy"
      ? "text-green-500"
      : healthStatus === "degraded"
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">總覽儀表板</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="總使用者數"
          value={overview?.totalUsers ?? 0}
          change={overview?.growthRate}
          changeLabel="vs 上月"
        />
        <StatCard
          title="本月新增"
          value={overview?.newUsersThisMonth ?? 0}
          change={overview?.growthRate}
          changeLabel="vs 上月"
        />
        <StatCard
          title="活躍使用者"
          value={overview?.activeUsers ?? 0}
          changeLabel={`活躍率 ${overview?.activeRate ? `${overview.activeRate}%` : "N/A"}`}
        />
        <StatCard
          title="郵件成功率"
          value={emailStats?.successRate !== undefined ? `${emailStats.successRate}%` : "N/A"}
        />
      </div>

      {/* DAU / WAU / MAU */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">DAU / WAU / MAU</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DauCard
            label="DAU (日活躍數)"
            value={activeUsers?.dau}
            change={activeUsers?.trend?.dauTrend}
          />
          <DauCard
            label="WAU (週活躍數)"
            value={activeUsers?.wau}
            change={activeUsers?.trend?.wauTrend}
          />
          <DauCard
            label="MAU (月活躍數)"
            value={activeUsers?.mau}
            change={activeUsers?.trend?.mauTrend}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Email Health */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">郵件服務狀態</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HealthIcon className={cn("size-5", healthColor)} />
              <span className="font-medium capitalize">{healthStatus}</span>
            </div>
            <div className="text-sm text-basic-400">
              <p>SMTP: {emailHealth?.smtpConnection ? "已連線" : "未連線"}</p>
              <p>佇列: {emailHealth?.queueSize ?? 0} 封待發送</p>
              {emailHealth?.lastError && (
                <p className="text-red-500">錯誤: {emailHealth.lastError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">快速連結</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/users", label: "使用者統計", icon: Users },
              { href: "/admin/practices", label: "主題實踐管理", icon: Target },
              { href: "/admin/email", label: "郵件管理", icon: Mail },
              { href: "/admin/roles", label: "角色權限管理", icon: Shield },
              { href: "/admin/system", label: "系統監控", icon: Monitor },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-basic-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <link.icon className="size-4 text-basic-400" />
                  <span>{link.label}</span>
                </div>
                <ArrowRight className="size-4 text-basic-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DauCard({ label, value, change }: { label: string; value?: number; change?: number }) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <div className="rounded-lg bg-basic-50 p-4 text-center">
      <p className="text-sm text-basic-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {value !== undefined ? value.toLocaleString() : "—"}
      </p>
      {change !== undefined && (
        <p
          className={cn("mt-1 text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
        </p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-basic-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders have no unique identifiers
          <div key={`kpi-${i}`} className="h-28 animate-pulse rounded-xl bg-basic-100" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-basic-100" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-basic-100" />
        <div className="h-40 animate-pulse rounded-xl bg-basic-100" />
      </div>
    </div>
  );
}
