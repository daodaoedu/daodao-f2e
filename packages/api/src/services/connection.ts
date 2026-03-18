import { getRequiredEnv } from "@daodao/config";
import { unauthorizedHandler } from "../client";

// ============================================================================
// Types
// (Follow/Connection API は types.ts 生成前のため手動定義)
// ============================================================================

export interface IConnectionUserProfile {
  id: string;
  name: string;
  photoURL?: string;
  bio?: string;
  identifier?: string;
}

export interface IConnectionRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  intent?: string;
  status: "pending" | "accepted" | "rejected";
  contextPracticeId?: string;
  createdAt: string;
  updatedAt: string;
  requester?: IConnectionUserProfile;
  receiver?: IConnectionUserProfile;
}

export interface IConnection {
  id: string;
  userAId: string;
  userBId: string;
  connectedAt: string;
  partner?: IConnectionUserProfile;
}

export interface IPaginatedConnectionRequests {
  data: IConnectionRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface IPaginatedConnections {
  data: IConnection[];
  total: number;
  page: number;
  limit: number;
}

export interface ISendConnectionRequestBody {
  receiverExternalId: string;
  intent?: string;
  contextPracticeExternalId?: string;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// API Functions
// ============================================================================

const getBaseUrl = () => getRequiredEnv("NEXT_PUBLIC_API_URL");

export const sendConnectionRequest = async (body: ISendConnectionRequestBody): Promise<IConnectionRequest> => {
  const res = await unauthorizedHandler.wrapFetch(`${getBaseUrl()}/api/v1/connections/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "發送連結請求失敗");
  }
  return res.json();
};

export const respondConnectionRequest = async (
  requestId: string,
  action: "accept" | "reject"
): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/connections/request/${requestId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
      credentials: "include",
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "操作失敗");
  }
};

export const withdrawConnectionRequest = async (requestId: string): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/connections/request/${requestId}`,
    { method: "DELETE", credentials: "include" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "撤回失敗");
  }
};

export const disconnectUser = async (userId: string): Promise<void> => {
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/connections/${userId}`,
    { method: "DELETE", credentials: "include" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? "解除連結失敗");
  }
};

export const getConnections = async (params?: IPaginationParams): Promise<IPaginatedConnections> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/connections?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入夥伴列表失敗");
  return res.json();
};

export const getIncomingConnectionRequests = async (
  params?: IPaginationParams
): Promise<IPaginatedConnectionRequests> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/connections/requests/incoming?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入收到的請求失敗");
  return res.json();
};

export const getOutgoingConnectionRequests = async (
  params?: IPaginationParams
): Promise<IPaginatedConnectionRequests> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const res = await unauthorizedHandler.wrapFetch(
    `${getBaseUrl()}/api/v1/connections/requests/outgoing?${query}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("載入發出的請求失敗");
  return res.json();
};
