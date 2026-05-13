import { describe, expect, it } from "vitest";
import { tokenizeMentionContent } from "../comment-mentions";

describe("tokenizeMentionContent", () => {
  it("keeps a multi-word mentioned name intact before normal text", () => {
    expect(
      tokenizeMentionContent("@Enn Tang HI", [
        { userId: "enn-id", customId: "enn", name: "Enn Tang" },
      ])
    ).toEqual([
      { type: "mention", text: "@Enn Tang", href: "/users/enn" },
      { type: "text", text: " HI" },
    ]);
  });

  it("prefers the longest matching participant name", () => {
    expect(
      tokenizeMentionContent("@Enn Tang HI", [
        { userId: "enn-id", customId: "enn", name: "Enn" },
        { userId: "enn-tang-id", customId: "enn-tang", name: "Enn Tang" },
      ])
    ).toEqual([
      { type: "mention", text: "@Enn Tang", href: "/users/enn-tang" },
      { type: "text", text: " HI" },
    ]);
  });

  it("does not turn unknown @ text into a broken mention", () => {
    expect(
      tokenizeMentionContent("@Unknown hello @Enn Tang", [
        { userId: "enn-id", customId: "enn", name: "Enn Tang" },
      ])
    ).toEqual([
      { type: "text", text: "@Unknown hello " },
      { type: "mention", text: "@Enn Tang", href: "/users/enn" },
    ]);
  });
});
