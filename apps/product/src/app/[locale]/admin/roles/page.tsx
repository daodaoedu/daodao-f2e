"use client";

import { useAdminMutations, useAdminPermissions, useAdminRole, useAdminRoles } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronDown, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

type TabId = "roles" | "permissions";

const tabsList: { id: TabId; label: string }[] = [
  { id: "roles", label: "角色管理" },
  { id: "permissions", label: "權限管理" },
];

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("roles");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">角色權限管理</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabsList.map((tab) => (
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

      {activeTab === "roles" && <RolesTab />}
      {activeTab === "permissions" && <PermissionsTab />}
    </div>
  );
}

// ============================================================================
// Roles Tab
// ============================================================================

function RolesTab() {
  const { data, isLoading, mutate } = useAdminRoles();
  const mutations = useAdminMutations();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("role:manage");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  const roles = (data?.data ?? []) as Array<{
    id?: number;
    name?: string;
    description?: string;
    permissionCount?: number;
    createdAt?: string;
  }>;

  const handleCreateRole = async (name: string, description: string) => {
    await mutations.createRole({ name, description });
    mutate();
    setShowCreateDialog(false);
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("確定要刪除此角色？")) return;
    await mutations.deleteRole(id);
    mutate();
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-medium text-white hover:bg-primary-base/90"
        >
          <Plus className="size-4" />
          新增角色
        </button>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateDialog
          title="新增角色"
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateRole}
        />
      )}

      {/* Roles Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : roles.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無角色</div>
        ) : (
          <div>
            {roles.map((role) => (
              <div key={role.id} className="border-b border-border/50 last:border-0">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-basic-50">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedRoleId(expandedRoleId === String(role.id) ? null : String(role.id))
                    }
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {expandedRoleId === String(role.id) ? (
                      <ChevronDown className="size-4 text-basic-400" />
                    ) : (
                      <ChevronRight className="size-4 text-basic-400" />
                    )}
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-xs text-basic-400">
                        {role.description ?? "無描述"} · {role.permissionCount ?? 0} 項權限
                      </p>
                    </div>
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(String(role.id))}
                      className="rounded p-1 text-basic-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                {expandedRoleId === String(role.id) && (
                  <RolePermissionsDetail roleId={String(role.id)} canManage={canManage} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RolePermissionsDetail({ roleId, canManage }: { roleId: string; canManage: boolean }) {
  const { data, isLoading, mutate } = useAdminRole(roleId);
  const { data: allPermsData } = useAdminPermissions();
  const mutations = useAdminMutations();

  const roleDetail = data?.data as
    | {
        permissions?: Array<{
          id?: number;
          name?: string;
          description?: string;
        }>;
      }
    | undefined;

  const allPerms = (allPermsData?.data ?? []) as Array<{
    id?: number;
    name?: string;
  }>;

  const currentPermIds = new Set(roleDetail?.permissions?.map((p) => p.id) ?? []);

  const handleAddPerm = async (permId: number) => {
    await mutations.addPermissionToRole(roleId, permId);
    mutate();
  };

  const handleRemovePerm = async (permId: string) => {
    await mutations.removePermissionFromRole(roleId, permId);
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center border-t border-border/50 bg-basic-50">
        <div className="size-4 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="border-t border-border/50 bg-basic-50 px-4 py-3">
      <p className="mb-2 text-sm font-medium">已指派權限:</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {roleDetail?.permissions?.map((perm) => (
          <span
            key={perm.id}
            className="flex items-center gap-1 rounded-full bg-primary-base/10 px-3 py-1 text-xs font-medium text-primary-base"
          >
            {perm.name}
            {canManage && (
              <button
                type="button"
                onClick={() => handleRemovePerm(String(perm.id))}
                className="ml-1 rounded-full hover:bg-primary-base/20"
              >
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
        {(!roleDetail?.permissions || roleDetail.permissions.length === 0) && (
          <span className="text-xs text-basic-300">無權限</span>
        )}
      </div>
      {canManage && (
        <div>
          <p className="mb-1 text-xs text-basic-400">新增權限:</p>
          <div className="flex flex-wrap gap-1">
            {allPerms
              .filter((p) => !currentPermIds.has(p.id))
              .map((perm) => (
                <button
                  key={perm.id}
                  type="button"
                  onClick={() => handleAddPerm(perm.id ?? 0)}
                  className="rounded-full border border-border bg-white px-2 py-0.5 text-xs hover:bg-primary-base/10 hover:border-primary-base"
                >
                  + {perm.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Permissions Tab
// ============================================================================

function PermissionsTab() {
  const { data, isLoading, mutate } = useAdminPermissions();
  const mutations = useAdminMutations();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("role:manage");

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const permissions = (data?.data ?? []) as Array<{
    id?: number;
    name?: string;
    description?: string;
    createdAt?: string;
  }>;

  const handleCreate = async (name: string, description: string) => {
    await mutations.createPermission({ name, description });
    mutate();
    setShowCreateDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此權限？")) return;
    await mutations.deletePermission(id);
    mutate();
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <button
          type="button"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-medium text-white hover:bg-primary-base/90"
        >
          <Plus className="size-4" />
          新增權限
        </button>
      )}

      {showCreateDialog && (
        <CreateDialog
          title="新增權限"
          namePlaceholder="resource:action (例如 user:read)"
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreate}
        />
      )}

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
          </div>
        ) : permissions.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無權限</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-basic-400">
                <th className="px-4 py-3">名稱</th>
                <th className="px-4 py-3">描述</th>
                <th className="px-4 py-3">建立時間</th>
                {canManage && <th className="px-4 py-3 w-16" />}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.id} className="border-b border-border/50 hover:bg-basic-50">
                  <td className="px-4 py-3 font-mono text-sm">{perm.name}</td>
                  <td className="px-4 py-3 text-basic-400">{perm.description ?? "—"}</td>
                  <td className="px-4 py-3 text-basic-400 whitespace-nowrap">
                    {perm.createdAt ? new Date(perm.createdAt).toLocaleDateString() : "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(String(perm.id))}
                        className="rounded p-1 text-basic-300 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Create Dialog
// ============================================================================

function CreateDialog({
  title,
  namePlaceholder = "名稱",
  onClose,
  onSubmit,
}: {
  title: string;
  namePlaceholder?: string;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), description.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: overlay backdrop click to close dialog */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop click to close dialog */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              名稱
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
                placeholder={namePlaceholder}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              描述
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
                placeholder="描述（選填）"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-basic-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="rounded-lg bg-primary-base px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isSubmitting ? "建立中..." : "建立"}
          </button>
        </div>
      </div>
    </div>
  );
}
