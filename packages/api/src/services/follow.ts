import { getApiBaseUrl, unauthorizedHandler } from "../client";
import { apiErrorFromBody } from "../errors";

// ============================================================================
// Types
// generated types 尚未涵蓋 follow endpoints，手動對齊 server 實際回應（daodao#251）
// ============================================================================

export interface IFollowTarget {
  targetType: "user" | "practice";
  targetId: string;
}

export interface IFollowUserProfile {
  id: string;
  name: string;
  photoURL?: string | null;
  bio?: string | null;
  identifier?: string | null;
}

/** followers 清單的一筆：由 server `FollowItem` 映射而來，多帶關注時間 */
export interface IFollowerProfile extends IFollowUserProfile {
  followedAt: string;
}

export interface IFollowPracticeProfile {
  id: string;
  title: string;
  ownerName: string;
  ownerPhotoURL?: string | null;
}

export interface IFollowingItem {
  targetType: "user" | "practice";
  user?: IFollowUserProfile;
  practice?: IFollowPracticeProfile;
}

/** server `paginationInfoSchema`（daodao-server src/validators/api-response.validators.ts） */
export interface IFollowPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** server `FollowItem`（daodao-server src/validators/follow.validators.ts）：followers 的原始形狀 */
export interface IServerFollowerItem {
  userId: number;
  externalId: string;
  nickname: string | null;
  followedAt: string;
}

export interface IPaginatedFollowers {
  data: IFollowerProfile[];
  pagination?: IFollowPagination;
}

export interface IPaginatedFollowing {
  data: IFollowingItem[];
  pagination?: IFollowPagination;
}

export interface IGetFollowParams {
  userId: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// API Functions
// ============================================================================

const getBaseUrl = () => getApiBaseUrl();

export const followTarget = async (body: IFollowTarget): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(`${getBaseUrl()}/api/v1/follows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw apiErrorFromBody(res.status, err, "關注失敗");
  }
};

export const unfollowTarget = async (
  targetType: "user" | "practice",
  targetId: string
): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/follows/${targetType}/${targetId}`,
    { method: "DELETE", credentials: "include" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw apiErrorFromBody(res.status, err, "取消關注失敗");
  }
};

export const checkFollowStatus = async (
  targetType: "user" | "practice",
  targetId: string
): Promise<{ data: { isFollowing: boolean } }> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/follows/check/${targetType}/${targetId}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("查詢關注狀態失敗");
  return res.json();
};

/**
 * followers 的 server item 是 `{ userId, externalId, nickname, followedAt }`，
 * 跟 following 的 user profile 形狀不同；在這裡映射成 IFollowUserProfile，
 * 讓消費端用同一套欄位（id 用 externalId，/users/<uuid> 可直接開個人頁）。
 */
export const toFollowerProfile = (item: IServerFollowerItem): IFollowerProfile => ({
  id: item.externalId,
  name: item.nickname ?? "",
  photoURL: null,
  bio: null,
  identifier: null,
  followedAt: item.followedAt,
});

export const getFollowers = async (params: IGetFollowParams): Promise<IPaginatedFollowers> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/users/${params.userId}/followers?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入關注者失敗");
  const body = (await res.json()) as {
    data?: IServerFollowerItem[];
    pagination?: IFollowPagination;
  };
  return {
    data: (body.data ?? []).map(toFollowerProfile),
    pagination: body.pagination,
  };
};

export const getFollowing = async (params: IGetFollowParams): Promise<IPaginatedFollowing> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/users/${params.userId}/following?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入關注中失敗");
  return res.json();
};
