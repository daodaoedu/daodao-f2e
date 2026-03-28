"use client";

import useSWR from "swr";
import type { IPaginationParams } from "./connection";
import {
  disconnectUser,
  getConnections,
  getIncomingConnectionRequests,
  getOutgoingConnectionRequests,
  respondConnectionRequest,
  withdrawConnectionRequest,
} from "./connection";

// ============================================================================
// Query Hooks
// ============================================================================

export const useConnections = (params?: IPaginationParams) => {
  return useSWR(["/api/v1/connections", params], () => getConnections(params), {
    revalidateOnFocus: false,
  });
};

export const useIncomingConnectionRequests = (params?: IPaginationParams) => {
  return useSWR(
    ["/api/v1/connections/requests/incoming", params],
    () => getIncomingConnectionRequests(params),
    { revalidateOnFocus: false }
  );
};

export const useOutgoingConnectionRequests = (params?: IPaginationParams) => {
  return useSWR(
    ["/api/v1/connections/requests/outgoing", params],
    () => getOutgoingConnectionRequests(params),
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
