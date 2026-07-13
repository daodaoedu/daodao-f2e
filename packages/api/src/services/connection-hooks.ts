"use client";

import useSWR from "swr";
import type { IPaginationParams } from "./connection";
import {
  disconnectUser,
  getConnectionStatus,
  getConnections,
  getIncomingConnectionRequests,
  getOutgoingConnectionRequests,
  respondConnectionRequest,
  withdrawConnectionRequest,
} from "./connection";

// ============================================================================
// Query Hooks
// ============================================================================

/** Primitive SWR keys only — avoid thrashing when callers pass inline params objects */

export const useConnections = (params?: IPaginationParams) => {
  const page = params?.page ?? null;
  const limit = params?.limit ?? null;
  return useSWR(
    ["/api/v1/connections", page, limit] as const,
    () => getConnections(params),
    {
      revalidateOnFocus: false,
    }
  );
};

export const useIncomingConnectionRequests = (params?: IPaginationParams) => {
  const page = params?.page ?? null;
  const limit = params?.limit ?? null;
  return useSWR(
    ["/api/v1/connections/requests/incoming", page, limit] as const,
    () => getIncomingConnectionRequests(params),
    { revalidateOnFocus: false }
  );
};

export const useOutgoingConnectionRequests = (params?: IPaginationParams) => {
  const page = params?.page ?? null;
  const limit = params?.limit ?? null;
  return useSWR(
    ["/api/v1/connections/requests/outgoing", page, limit] as const,
    () => getOutgoingConnectionRequests(params),
    { revalidateOnFocus: false }
  );
};

export const useConnectionStatus = (userId?: string | null) => {
  return useSWR(
    userId ? (["/api/v1/connections/status/{userId}", userId] as const) : null,
    ([, targetUserId]) => getConnectionStatus(targetUserId),
    { revalidateOnFocus: false }
  );
};

// ============================================================================
// Mutation Hook
// ============================================================================

export const useConnectionMutations = () => {
  const { mutate: mutateConnections } = useConnections();
  const { mutate: mutateIncoming } = useIncomingConnectionRequests();
  const { mutate: mutateOutgoing } = useOutgoingConnectionRequests();

  const refreshAll = async () => {
    await Promise.all([mutateConnections(), mutateIncoming(), mutateOutgoing()]);
  };

  const accept = async (requestId: string) => {
    await respondConnectionRequest(requestId, "accept");
    await refreshAll();
  };

  const ignore = async (requestId: string) => {
    await respondConnectionRequest(requestId, "reject");
    await mutateIncoming();
  };

  const withdraw = async (requestId: string) => {
    await withdrawConnectionRequest(requestId);
    await mutateOutgoing();
  };

  const disconnect = async (userId: string) => {
    await disconnectUser(userId);
    await mutateConnections();
  };

  return { accept, ignore, withdraw, disconnect };
};
