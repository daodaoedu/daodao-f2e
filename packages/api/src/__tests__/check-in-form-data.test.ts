import { describe, expect, it } from "vitest";
import {
  buildCreateCheckInFormData,
  buildUpdateCheckInFormData,
  extractApiErrorMessage,
} from "../services/check-in-form-data";

describe("extractApiErrorMessage", () => {
  it("reads nested daodao-server error.message", () => {
    expect(
      extractApiErrorMessage({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "驗證失敗: tags: 請至少選擇一個標籤" },
      })
    ).toBe("驗證失敗: tags: 請至少選擇一個標籤");
  });

  it("reads top-level message", () => {
    expect(extractApiErrorMessage({ message: "Unauthorized" })).toBe("Unauthorized");
  });

  it("reads string error field", () => {
    expect(extractApiErrorMessage({ error: "boom" })).toBe("boom");
  });

  it("reads Error instances", () => {
    expect(extractApiErrorMessage(new Error("network down"))).toBe("network down");
  });

  it("returns fallback when shape is unknown", () => {
    expect(extractApiErrorMessage({ foo: 1 }, "打卡失敗")).toBe("打卡失敗");
    expect(extractApiErrorMessage(null, "打卡失敗")).toBe("打卡失敗");
  });
});

describe("buildCreateCheckInFormData", () => {
  it("appends mood, note, tags and Blob image parts", () => {
    const blob = new Blob(["fake-image"], { type: "image/jpeg" });
    const formData = buildCreateCheckInFormData({
      mood: "happy",
      description: "今天有收穫",
      tags: ["New concept", "Practice"],
      media: [blob],
    });

    expect(formData.get("mood")).toBe("happy");
    expect(formData.get("note")).toBe("今天有收穫");
    expect(formData.get("tags")).toBe(JSON.stringify(["New concept", "Practice"]));
    expect(formData.get("images")).toBeInstanceOf(Blob);
  });

  it("accepts React Native file parts without throwing", () => {
    // Node FormData stringifies plain objects; RN FormData keeps { uri, type, name }.
    // Here we only assert the builder accepts the RN shape.
    expect(() =>
      buildCreateCheckInFormData({
        mood: "good",
        description: "with photo",
        tags: ["Practice"],
        media: [
          {
            uri: "file:///tmp/photo.jpg",
            type: "image/jpeg",
            name: "image-0.jpg",
          },
        ],
      })
    ).not.toThrow();
  });

  it("omits tags when empty so callers must supply valid tags", () => {
    const formData = buildCreateCheckInFormData({
      mood: "neutral",
      description: "x",
      tags: [],
      media: [],
    });

    expect(formData.get("tags")).toBeNull();
    expect(formData.get("mood")).toBe("neutral");
  });

  it("omits empty optional fields", () => {
    const formData = buildCreateCheckInFormData({
      mood: undefined,
      description: "",
      tags: ["focus"],
      media: [],
    });

    expect(formData.get("mood")).toBeNull();
    expect(formData.get("note")).toBeNull();
    expect(formData.get("tags")).toBe(JSON.stringify(["focus"]));
  });
});

describe("buildUpdateCheckInFormData", () => {
  it("sends empty tags and imageUrls to clear fields", () => {
    const formData = buildUpdateCheckInFormData({
      description: "",
      tags: [],
      existingImageUrls: [],
    });

    expect(formData.get("note")).toBe("");
    expect(formData.get("tags")).toBe("[]");
    expect(formData.get("imageUrls")).toBe("[]");
  });
});
