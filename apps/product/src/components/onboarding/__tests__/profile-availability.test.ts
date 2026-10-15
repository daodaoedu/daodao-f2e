import { describe, expect, it, vi } from "vitest";
import { checkProfileAvailability } from "../profile-availability";

const available = () => Promise.resolve({ data: { data: { available: true } } });

describe("profile availability", () => {
  it("checks the name independently of customId and reports both conflicts", async () => {
    const taken = vi.fn().mockResolvedValue({ data: { data: { available: false } } });
    expect(
      await checkProfileAvailability(
        { name: " Taken Name ", customId: " takenid " },
        { name: taken, customId: taken }
      )
    ).toEqual({ name: "unavailable", customId: "unavailable" });
    expect(taken).toHaveBeenCalledWith("Taken Name");
    expect(taken).toHaveBeenCalledWith("takenid");
  });
  it("accepts both available values", async () => {
    expect(
      await checkProfileAvailability(
        { name: "Name", customId: "customid" },
        { name: available, customId: available }
      )
    ).toEqual({});
  });
  it.each([
    () => Promise.resolve({ error: { message: "unavailable service" } }),
    () => Promise.resolve({ data: {} }),
    () => Promise.reject(new Error("network error")),
  ])("fails closed on API, malformed, and network errors", async (name) => {
    expect(
      await checkProfileAvailability(
        { name: "Name", customId: "customid" },
        { name, customId: available }
      )
    ).toEqual({ name: "failed" });
  });
});
