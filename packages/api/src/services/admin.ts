/**
 * Admin API Service
 * 提供管理後台相關的 API 調用函數
 */

import { client } from "../client";
import type { paths } from "../types";

// ============================================================================
// Types
// ============================================================================

// User Stats
export type OverviewResponse =
  paths["/api/v1/admin/user-stats/overview"]["get"]["responses"]["200"]["content"]["application/json"];
export type ActiveUsersResponse =
  paths["/api/v1/admin/user-stats/active-users"]["get"]["responses"]["200"]["content"]["application/json"];
export type RegistrationsResponse =
  paths["/api/v1/admin/user-stats/registrations"]["get"]["responses"]["200"]["content"]["application/json"];
export type ActivityResponse =
  paths["/api/v1/admin/user-stats/activity"]["get"]["responses"]["200"]["content"]["application/json"];
export type DeviceAnalyticsResponse =
  paths["/api/v1/admin/user-stats/device-analytics"]["get"]["responses"]["200"]["content"]["application/json"];
export type RetentionResponse =
  paths["/api/v1/admin/user-stats/retention"]["get"]["responses"]["200"]["content"]["application/json"];
export type PopularProfilesResponse =
  paths["/api/v1/admin/user-stats/popular-profiles"]["get"]["responses"]["200"]["content"]["application/json"];
export type SegmentationResponse =
  paths["/api/v1/admin/user-stats/segmentation"]["get"]["responses"]["200"]["content"]["application/json"];

// Roles & Permissions
export type RolesListResponse =
  paths["/api/v1/admin/roles"]["get"]["responses"]["200"]["content"]["application/json"];
export type RoleDetailResponse =
  paths["/api/v1/admin/roles/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type PermissionsListResponse =
  paths["/api/v1/admin/permissions"]["get"]["responses"]["200"]["content"]["application/json"];

// Admin Users
export type AdminUserListResponse =
  paths["/api/v1/admin/users"]["get"]["responses"]["200"]["content"]["application/json"];
export type AdminUserDetailResponse =
  paths["/api/v1/admin/users/{userId}"]["get"]["responses"]["200"]["content"]["application/json"];

// Param interfaces
export interface IGetRegistrationsParams {
  groupBy: "day" | "week" | "month" | "year" | "location" | "role" | "education_stage";
  startDate?: string;
  endDate?: string;
  locationId?: string;
  roleId?: string;
  educationStage?: string;
  limit?: number;
  offset?: number;
}

export interface IGetActivityParams {
  activeWithinDays?: number;
  groupBy?: "role" | "location" | "education_stage";
  limit?: number;
  offset?: number;
}

export interface IGetRetentionParams {
  cohorts?: number;
  trackDays?: number;
  granularity?: "day" | "week";
}

export interface IGetPopularProfilesParams {
  limit?: number;
  offset?: number;
  minViews?: number;
}

export interface IGetDeviceAnalyticsParams {
  startDate?: string;
  endDate?: string;
  days?: number;
}

export interface IExportParams {
  format: "csv" | "excel";
  type: "registrations" | "activity" | "full";
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month" | "year" | "location" | "role" | "education_stage";
}

export interface IGetAdminUsersParams {
  search?: string;
  roleId?: string;
  isActive?: "true" | "false";
  isVerified?: "true" | "false";
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "lastLoginAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// User Stats API
// ============================================================================

export const getAdminOverview = async () => {
  return client.GET("/api/v1/admin/user-stats/overview");
};

export const getAdminActiveUsers = async () => {
  return client.GET("/api/v1/admin/user-stats/active-users");
};

export const getAdminActiveUsersTrend = async (days?: number) => {
  return client.GET("/api/v1/admin/user-stats/active-users/trend", {
    params: { query: { days: days ? String(days) : undefined } },
  });
};

export const getAdminRegistrations = async (params: IGetRegistrationsParams) => {
  return client.GET("/api/v1/admin/user-stats/registrations", {
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

export const getAdminActivity = async (params?: IGetActivityParams) => {
  return client.GET("/api/v1/admin/user-stats/activity", {
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

export const getAdminDeviceAnalytics = async (params?: IGetDeviceAnalyticsParams) => {
  return client.GET("/api/v1/admin/user-stats/device-analytics", {
    params: {
      query: {
        startDate: params?.startDate,
        endDate: params?.endDate,
        days: params?.days ? String(params.days) : undefined,
      },
    },
  });
};

export const getAdminRetention = async (params?: IGetRetentionParams) => {
  return client.GET("/api/v1/admin/user-stats/retention", {
    params: {
      query: {
        cohorts: params?.cohorts ? String(params.cohorts) : undefined,
        trackDays: params?.trackDays ? String(params.trackDays) : undefined,
        granularity: params?.granularity,
      },
    },
  });
};

export const getAdminPopularProfiles = async (params?: IGetPopularProfilesParams) => {
  return client.GET("/api/v1/admin/user-stats/popular-profiles", {
    params: {
      query: {
        limit: params?.limit ? String(params.limit) : undefined,
        offset: params?.offset ? String(params.offset) : undefined,
        minViews: params?.minViews ? String(params.minViews) : undefined,
      },
    },
  });
};

export const getAdminSegmentation = async () => {
  return client.GET("/api/v1/admin/user-stats/segmentation");
};

// ============================================================================
// Admin Users API
// ============================================================================

export const getAdminUsers = async (params?: IGetAdminUsersParams) => {
  return client.GET("/api/v1/admin/users", {
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

export const getAdminUserDetail = async (userId: string) => {
  return client.GET("/api/v1/admin/users/{userId}", {
    params: { path: { userId } },
  });
};

export const getAdminUserLoginHistory = async (
  userId: string,
  params?: { startDate?: string; endDate?: string; page?: number; limit?: number }
) => {
  return client.GET("/api/v1/admin/users/{userId}/login-history", {
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

export const getAdminUserActivityStats = async (userId: string) => {
  return client.GET("/api/v1/admin/users/{userId}/activity-stats", {
    params: { path: { userId } },
  });
};

export const updateAdminUserStatus = async (userId: string, isActive: boolean) => {
  return client.PUT("/api/v1/admin/users/{userId}/status", {
    params: { path: { userId } },
    body: { isActive },
  });
};

// ============================================================================
// Roles & Permissions API
// ============================================================================

export const getAdminRoles = async () => {
  return client.GET("/api/v1/admin/roles");
};

export const getAdminRole = async (id: string) => {
  return client.GET("/api/v1/admin/roles/{id}", {
    params: { path: { id } },
  });
};

export const createAdminRole = async (data: { name: string; description?: string }) => {
  return client.POST("/api/v1/admin/roles", { body: data });
};

export const updateAdminRole = async (
  id: string,
  data: { name?: string; description?: string }
) => {
  return client.PUT("/api/v1/admin/roles/{id}", {
    params: { path: { id } },
    body: data,
  });
};

export const deleteAdminRole = async (id: string) => {
  return client.DELETE("/api/v1/admin/roles/{id}", {
    params: { path: { id } },
  });
};

export const getAdminPermissions = async () => {
  return client.GET("/api/v1/admin/permissions");
};

export const createAdminPermission = async (data: { name: string; description?: string }) => {
  return client.POST("/api/v1/admin/permissions", { body: data });
};

export const updateAdminPermission = async (
  id: string,
  data: { name?: string; description?: string }
) => {
  return client.PUT("/api/v1/admin/permissions/{id}", {
    params: { path: { id } },
    body: data,
  });
};

export const deleteAdminPermission = async (id: string) => {
  return client.DELETE("/api/v1/admin/permissions/{id}", {
    params: { path: { id } },
  });
};

export const addPermissionToRole = async (roleId: string, permissionId: number) => {
  return client.POST("/api/v1/admin/roles/{roleId}/permissions", {
    params: { path: { roleId } },
    body: { permissionId },
  });
};

export const removePermissionFromRole = async (roleId: string, permissionId: string) => {
  return client.DELETE("/api/v1/admin/roles/{roleId}/permissions/{permissionId}", {
    params: { path: { roleId, permissionId } },
  });
};

export const getUserRole = async (userId: string) => {
  return client.GET("/api/v1/admin/users/{userId}/role", {
    params: { path: { userId } },
  });
};

export const updateUserRole = async (userId: string, roleId: number) => {
  return client.PUT("/api/v1/admin/users/{userId}/role", {
    params: { path: { userId } },
    body: { roleId },
  });
};

// ============================================================================
// Practices Stats API
// ============================================================================

export const getAdminPracticesStats = async (params?: { startDate?: string; endDate?: string }) => {
  return client.GET("/api/v1/admin/practices/stats", {
    params: { query: { startDate: params?.startDate, endDate: params?.endDate } },
  });
};

// ============================================================================
// System Monitoring API
// ============================================================================

export const getSystemMonitor = async () => {
  return client.GET("/api/v1/monitor");
};

export const getDbInfo = async () => {
  return client.GET("/api/v1/db-info");
};

export const getHealthCheck = async () => {
  return client.GET("/api/v1/health");
};

// ============================================================================
// Export
// ============================================================================

export const getAdminExportUrl = (params: IExportParams) => {
  const searchParams = new URLSearchParams();
  searchParams.set("format", params.format);
  searchParams.set("type", params.type);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.groupBy) searchParams.set("groupBy", params.groupBy);
  return `/api/v1/admin/user-stats/export?${searchParams.toString()}`;
};
