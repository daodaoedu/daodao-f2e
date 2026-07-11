import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Alert: { alert: vi.fn() },
}));

import { Alert } from "react-native";
import { extractApiErrorMessage, runWithErrorAlert, throwIfOpenApiError } from "../api-error";

describe("throwIfOpenApiError", () => {
  it("does nothing when no error", () => {
    expect(() => throwIfOpenApiError({}, "fallback")).not.toThrow();
  });

  it("throws unwrapped nested message", () => {
    expect(() =>
      throwIfOpenApiError(
        {
          error: {
            success: false,
            error: { message: "驗證失敗: tags" },
          },
        },
        "fallback"
      )
    ).toThrow("驗證失敗: tags");
  });

  it("uses fallback when shape unknown", () => {
    expect(() => throwIfOpenApiError({ error: { foo: 1 } }, "操作失敗")).toThrow("操作失敗");
  });
});

describe("runWithErrorAlert", () => {
  beforeEach(() => {
    vi.mocked(Alert.alert).mockClear();
  });

  it("returns true on success", async () => {
    const ok = await runWithErrorAlert(async () => undefined, {
      title: "Error",
      fallbackMessage: "failed",
    });
    expect(ok).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("alerts and returns false on failure", async () => {
    const ok = await runWithErrorAlert(
      async () => {
        throw new Error("network down");
      },
      { title: "Error", fallbackMessage: "failed" }
    );
    expect(ok).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith("Error", "network down");
  });
});

describe("extractApiErrorMessage re-export", () => {
  it("reads nested daodao-server body", () => {
    expect(
      extractApiErrorMessage({
        success: false,
        error: { message: "Unauthorized" },
      })
    ).toBe("Unauthorized");
  });
});
