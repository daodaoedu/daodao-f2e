export type UserConnectionStatus = "none" | "pending" | "connected";

interface GetUserConnectionStatusParams {
  isAlreadyConnected: boolean;
  hasOutgoingPendingRequest: boolean;
  optimisticStatus?: UserConnectionStatus | null;
}

export const getUserConnectionStatus = ({
  isAlreadyConnected,
  hasOutgoingPendingRequest,
  optimisticStatus,
}: GetUserConnectionStatusParams): UserConnectionStatus => {
  if (optimisticStatus) return optimisticStatus;
  if (isAlreadyConnected) return "connected";
  if (hasOutgoingPendingRequest) return "pending";
  return "none";
};
