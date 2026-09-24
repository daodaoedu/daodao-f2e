import { describe, expect, it } from "vitest";
import { getConnectionsRedirectPath } from "../connection-redirect";

describe("getConnectionsRedirectPath", () => {
  it("returns the settings connections path", () => {
    expect(getConnectionsRedirectPath()).toBe("/settings/connections");
  });
});
