"use client";

import { useAdminPractices, useAdminPracticesStats } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import { StatCard } from "../../../../components/admin/stat-card";

type PracticeStatus = "all" | "draft" | "not_started" | "active" | "completed" | "archived";

export default function PracticesPage() {
  const [status, setStatus] = useState<PracticeStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const limit = 20;

  const { data: statsData } = useAdminPracticesStats();

  const stats = statsData?.data as
    | {
        total?: number;
        active?: number;
        completed?: number;
        totalCheckIns?: number;
      }
    | undefined;

  const { data: listData, isLoading: listLoading } = useAdminPractices({
    page,
    limit,
    status,
    query: search || undefined,
    sort: sortBy as "createdAt" | "updatedAt" | "likeCount",
  });

  const practices = listData?.data ?? [];
  const total = listData?.pagination?.totalItems ?? 0;
  const totalPages = listData?.pagination?.totalPages ?? Math.ceil(total / limit);

  const statusLabels: Record<string, string> = {
    draft: "草稿",
    not_started: "未開始",
    active: "進行中",
    completed: "已完成",
    archived: "已封存",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-basic-100 text-basic-400",
    not_started: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    archived: "bg-basic-100 text-basic-300",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">主題實踐管理</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="總實踐數" value={stats?.total ?? 0} />
        <StatCard title="活躍實踐" value={stats?.active ?? 0} />
        <StatCard title="已完成" value={stats?.completed ?? 0} />
        <StatCard title="總簽到數" value={stats?.totalCheckIns ?? 0} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="搜尋實踐..."
          className="rounded-lg border border-border px-3 py-2 text-sm w-60"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PracticeStatus);
            setPage(1);
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="all">全部狀態</option>
          <option value="draft">草稿</option>
          <option value="not_started">未開始</option>
          <option value="active">進行中</option>
          <option value="completed">已完成</option>
          <option value="archived">已封存</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <option value="createdAt">建立時間</option>
          <option value="updatedAt">更新時間</option>
          <option value="likeCount">按讚數</option>
        </select>
      </div>

      {/* Practices Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
        {listLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : practices.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無資料</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-basic-400">
                <th className="px-4 py-3">標題</th>
                <th className="px-4 py-3">創建者</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">開始日期</th>
                <th className="px-4 py-3">天數</th>
                <th className="px-4 py-3">簽到</th>
                <th className="px-4 py-3">按讚</th>
              </tr>
            </thead>
            <tbody>
              {practices.map(
                (
                  practice: {
                    id?: string;
                    title?: string;
                    user?: { name?: string };
                    status?: string;
                    startDate?: string;
                    durationDays?: number;
                    checkInCount?: number;
                    stats?: { likeCount?: number };
                  },
                  i: number
                ) => (
                  <tr
                    key={practice.id ?? i}
                    className="border-b border-border/50 hover:bg-basic-50"
                  >
                    <td className="px-4 py-3 font-medium max-w-xs truncate">
                      {practice.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-basic-400">{practice.user?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusColors[practice.status ?? ""] ?? "bg-basic-100 text-basic-400"
                        )}
                      >
                        {statusLabels[practice.status ?? ""] ?? practice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-basic-400 whitespace-nowrap">
                      {practice.startDate ? new Date(practice.startDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">{practice.durationDays ?? "—"}</td>
                    <td className="px-4 py-3">{practice.checkInCount ?? 0}</td>
                    <td className="px-4 py-3">{practice.stats?.likeCount ?? 0}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            上一頁
          </button>
          <span className="text-sm text-basic-400">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
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
