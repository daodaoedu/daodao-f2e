"use client";

import {
  useAdminMutations,
  useAdminRoles,
  useAdminUserActivityStats,
  useAdminUserDetail,
  useAdminUserLoginHistory,
  useUserRole,
} from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useRouter } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { StatCard } from "../../../../../components/admin/stat-card";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const { hasPermission } = useAuth();

  const { data: userData, isLoading: userLoading } = useAdminUserDetail(userId);
  const { data: roleData, mutate: mutateRole } = useUserRole(userId);
  const { data: activityData } = useAdminUserActivityStats(userId);
  const { data: loginHistoryData } = useAdminUserLoginHistory(userId, {
    limit: 10,
  });
  const { data: rolesListData } = useAdminRoles();
  const mutations = useAdminMutations();

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const user = userData?.data as
    | {
        id?: string;
        name?: string;
        email?: string;
        photoUrl?: string;
        createdAt?: string;
        lastLoginAt?: string;
        loginCount?: number;
        profileViews?: number;
        isActive?: boolean;
      }
    | undefined;

  const currentRole = roleData?.data as { role?: { id?: number; name?: string } } | undefined;

  const activity = activityData?.data as
    | {
        totalPractices?: number;
        activePractices?: number;
        completedPractices?: number;
        totalCheckIns?: number;
        avgStreak?: number;
        maxStreak?: number;
      }
    | undefined;

  const loginHistory = loginHistoryData?.data as
    | {
        records?: Array<{
          loginAt?: string;
          ipAddress?: string;
          userAgent?: string;
        }>;
      }
    | undefined;

  const rolesList = rolesListData?.data as Array<{ id?: number; name?: string }> | undefined;

  const canManageRoles = hasPermission("role:manage");

  const handleSaveRole = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    try {
      await mutations.updateUserRole(userId, Number(selectedRoleId));
      mutateRole();
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-basic-100" />
        <div className="h-48 animate-pulse rounded-xl bg-basic-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-basic-400 hover:text-text-dark"
      >
        <ArrowLeft className="size-4" />
        返回使用者列表
      </button>

      {/* User Info Card */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary-base/10 text-xl font-bold text-primary-base">
              {user?.name?.[0] ?? "?"}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name ?? "—"}</h2>
            <p className="text-sm text-basic-400">{user?.email ?? "—"}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-basic-400">
              <span>
                註冊時間: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </span>
              <span>
                最後登入:{" "}
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "—"}
              </span>
              <span>登入次數: {user?.loginCount?.toLocaleString() ?? "—"}</span>
            </div>
          </div>
          <div
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              user?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}
          >
            {user?.isActive ? "啟用" : "停用"}
          </div>
        </div>

        {/* Role Management */}
        {canManageRoles && (
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <span className="text-sm font-medium">角色:</span>
            <select
              value={selectedRoleId || String(currentRole?.role?.id ?? "")}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              <option value="">{currentRole?.role?.name ?? "未指定"}</option>
              {rolesList?.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveRole}
              disabled={!selectedRoleId || isSaving}
              className="rounded-lg bg-primary-base px-4 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {isSaving ? "儲存中..." : "儲存變更"}
            </button>
          </div>
        )}
      </div>

      {/* Activity Stats */}
      {activity && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">實踐統計</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard title="總實踐數" value={activity.totalPractices ?? 0} />
            <StatCard title="活躍數" value={activity.activePractices ?? 0} />
            <StatCard title="完成數" value={activity.completedPractices ?? 0} />
            <StatCard title="總簽到" value={activity.totalCheckIns ?? 0} />
            <StatCard title="平均連續" value={`${activity.avgStreak ?? 0} 天`} />
            <StatCard title="最大連續" value={`${activity.maxStreak ?? 0} 天`} />
          </div>
        </div>
      )}

      {/* Login History */}
      {loginHistory?.records && loginHistory.records.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">登入歷史</h3>
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-basic-400">
                  <th className="px-4 py-3">時間</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.records.map((record) => (
                  <tr
                    key={`login-${record.loginAt ?? record.ipAddress}`}
                    className="border-b border-border/50"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {record.loginAt ? new Date(record.loginAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2">{record.ipAddress ?? "—"}</td>
                    <td className="px-4 py-2 max-w-xs truncate text-basic-400">
                      {record.userAgent ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
