"use client";

/**
 * Admin API Hooks
 * 提供管理後台相關的 React Hooks（用於 Client Components）
 */

import { client } from "../client";
import { useQuery } from "../hooks";
import type {
  IGetActivityParams,
  IGetAdminUsersParams,
  IGetDeviceAnalyticsParams,
  IGetPopularProfilesParams,
  IGetRegistrationsParams,
  IGetRetentionParams,
} from "./admin";

// ============================================================================
// User Stats Hooks
// ============================================================================

export const useAdminOverview = () => {
  return useQuery("/api/v1/admin/user-stats/overview");
};

export const useAdminActiveUsers = () => {
  return useQuery("/api/v1/admin/user-stats/active-users");
};

export const useAdminActiveUsersTrend = (days?: number) => {
  return useQuery("/api/v1/admin/user-stats/active-users/trend", {
    params: { query: { days: days ? String(days) : undefined } },
  });
};

export const useAdminRegistrations = (params: IGetRegistrationsParams) => {
  return useQuery("/api/v1/admin/user-stats/registrations", {
    params: {
      query: {
        groupBy: params.groupBy,
        startDate: params.startDate,
        endDate: params.endDate,
        locationId: params.locationId,
        roleId: params.roleId,
        educationStage: params.educationStage,
        limit: params.limit ? String(params.limit) : undefined,
        offset: params.offset ? String(params.offset) : undefined,
      },
    },
  });
};

export const useAdminActivity = (params?: IGetActivityParams) => {
  return useQuery("/api/v1/admin/user-stats/activity", {
    params: {
      query: {
        activeWithinDays: params?.activeWithinDays ? String(params.activeWithinDays) : undefined,
        groupBy: params?.groupBy,
        limit: params?.limit ? String(params.limit) : undefined,
        offset: params?.offset ? String(params.offset) : undefined,
      },
    },
  });
};

export const useAdminDeviceAnalytics = (params?: IGetDeviceAnalyticsParams) => {
  return useQuery("/api/v1/admin/user-stats/device-analytics", {
    params: {
      query: {
        startDate: params?.startDate,
        endDate: params?.endDate,
        days: params?.days ? String(params.days) : undefined,
      },
    },
  });
};

export const useAdminRetention = (params?: IGetRetentionParams) => {
  return useQuery("/api/v1/admin/user-stats/retention", {
    params: {
      query: {
        cohorts: params?.cohorts ? String(params.cohorts) : undefined,
        trackDays: params?.trackDays ? String(params.trackDays) : undefined,
        granularity: params?.granularity,
      },
    },
  });
};

export const useAdminPopularProfiles = (params?: IGetPopularProfilesParams) => {
  return useQuery("/api/v1/admin/user-stats/popular-profiles", {
    params: {
      query: {
        limit: params?.limit ? String(params.limit) : undefined,
        offset: params?.offset ? String(params.offset) : undefined,
        minViews: params?.minViews ? String(params.minViews) : undefined,
      },
    },
  });
};

export const useAdminSegmentation = () => {
  return useQuery("/api/v1/admin/user-stats/segmentation");
};

// ============================================================================
// Admin Users Hooks
// ============================================================================

export const useAdminUsers = (params?: IGetAdminUsersParams) => {
  return useQuery("/api/v1/admin/users", {
    params: {
      query: {
        search: params?.search,
        roleId: params?.roleId,
        isActive: params?.isActive,
        isVerified: params?.isVerified,
        page: params?.page ? String(params.page) : undefined,
        limit: params?.limit ? String(params.limit) : undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    },
  });
};

export const useAdminUserDetail = (userId: string) => {
  return useQuery("/api/v1/admin/users/{userId}", {
    params: { path: { userId } },
  });
};

export const useAdminUserLoginHistory = (
  userId: string,
  params?: { startDate?: string; endDate?: string; page?: number; limit?: number }
) => {
  return useQuery("/api/v1/admin/users/{userId}/login-history", {
    params: {
      path: { userId },
      query: {
        startDate: params?.startDate,
        endDate: params?.endDate,
        page: params?.page ? String(params.page) : undefined,
        limit: params?.limit ? String(params.limit) : undefined,
      },
    },
  });
};

export const useAdminUserActivityStats = (userId: string) => {
  return useQuery("/api/v1/admin/users/{userId}/activity-stats", {
    params: { path: { userId } },
  });
};

// ============================================================================
// Roles & Permissions Hooks
// ============================================================================

export const useAdminRoles = () => {
  return useQuery("/api/v1/admin/roles");
};

export const useAdminRole = (id: string) => {
  return useQuery("/api/v1/admin/roles/{id}", {
    params: { path: { id } },
  });
};

export const useAdminPermissions = () => {
  return useQuery("/api/v1/admin/permissions");
};

export const useUserRole = (userId: string) => {
  return useQuery("/api/v1/admin/users/{userId}/role", {
    params: { path: { userId } },
  });
};

// ============================================================================
// Practices Stats Hooks
// ============================================================================

export const useAdminPracticesStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery("/api/v1/admin/practices/stats", {
    params: { query: { startDate: params?.startDate, endDate: params?.endDate } },
  });
};

export const useAdminPractices = (params?: {
  page?: number;
  limit?: number;
  status?: "draft" | "not_started" | "active" | "completed" | "archived" | "all";
  query?: string;
  sort?: "createdAt" | "updatedAt" | "likeCount";
  order?: "asc" | "desc";
}) => {
  return useQuery("/api/v1/practices", {
    params: {
      query: {
        page: params?.page,
        limit: params?.limit,
        status: params?.status ?? "all",
        ...(params?.query ? { query: params.query } : {}),
        sort: params?.sort,
        order: params?.order,
      },
    },
  });
};

// ============================================================================
// System Monitoring Hooks
// ============================================================================

export const useSystemMonitor = () => {
  return useQuery("/api/v1/monitor");
};

export const useDbInfo = () => {
  return useQuery("/api/v1/db-info");
};

export const useHealthCheck = () => {
  return useQuery("/api/v1/health");
};

// ============================================================================
// Admin Mutation helpers
// ============================================================================

export const useAdminMutations = () => {
  return {
    createRole: async (data: { name: string; description?: string }) => {
      return client.POST("/api/v1/admin/roles", { body: data });
    },
    updateRole: async (id: string, data: { name?: string; description?: string }) => {
      return client.PUT("/api/v1/admin/roles/{id}", {
        params: { path: { id } },
        body: data,
      });
    },
    deleteRole: async (id: string) => {
      return client.DELETE("/api/v1/admin/roles/{id}", {
        params: { path: { id } },
      });
    },
    createPermission: async (data: { name: string; description?: string }) => {
      return client.POST("/api/v1/admin/permissions", { body: data });
    },
    updatePermission: async (id: string, data: { name?: string; description?: string }) => {
      return client.PUT("/api/v1/admin/permissions/{id}", {
        params: { path: { id } },
        body: data,
      });
    },
    deletePermission: async (id: string) => {
      return client.DELETE("/api/v1/admin/permissions/{id}", {
        params: { path: { id } },
      });
    },
    addPermissionToRole: async (roleId: string, permissionId: number) => {
      return client.POST("/api/v1/admin/roles/{roleId}/permissions", {
        params: { path: { roleId } },
        body: { permissionId },
      });
    },
    removePermissionFromRole: async (roleId: string, permissionId: string) => {
      return client.DELETE("/api/v1/admin/roles/{roleId}/permissions/{permissionId}", {
        params: { path: { roleId, permissionId } },
      });
    },
    updateUserRole: async (userId: string, roleId: number) => {
      return client.PUT("/api/v1/admin/users/{userId}/role", {
        params: { path: { userId } },
        body: { roleId },
      });
    },
    updateUserStatus: async (userId: string, isActive: boolean) => {
      return client.PUT("/api/v1/admin/users/{userId}/status", {
        params: { path: { userId } },
        body: { isActive },
      });
    },
  };
};
