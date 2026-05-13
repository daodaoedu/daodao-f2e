import { describe, expect, it } from "vitest";
import { getUserConnectionStatus } from "../connection-status";

describe("getUserConnectionStatus", () => {
  it("returns pending after sending a request but before acceptance", () => {
    expect(
      getUserConnectionStatus({
        isAlreadyConnected: false,
        hasOutgoingPendingRequest: true,
      })
    ).toBe("pending");
  });

  it("returns connected only after connection is established", () => {
    expect(
      getUserConnectionStatus({
        isAlreadyConnected: true,
        hasOutgoingPendingRequest: false,
      })
    ).toBe("connected");
  });

  it("lets optimistic status override fetched data", () => {
    expect(
      getUserConnectionStatus({
        isAlreadyConnected: false,
        hasOutgoingPendingRequest: false,
        optimisticStatus: "pending",
      })
    ).toBe("pending");
  });
});
