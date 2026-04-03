/**
 * Regression: notification 通知顯示正確的 reaction emoji
 *
 * 注意：product app 目前尚未配置 vitest。
 * 這些測試需要在 apps/product 加入 vitest.config.ts 後才能執行。
 *
 * 測試邏輯：REACTION_CONFIG 是 notification-list.tsx 中 getReactionEmoji 的依賴，
 * 確保各 reactionType 對應正確 emoji。
 */

import { describe, it, expect } from "vitest";
import { REACTION_CONFIG, ReactionType } from "../reaction-type";

describe("Regression: REACTION_CONFIG emoji mapping for notification display", () => {
  it("encourage 對應 🥰", () => {
    expect(REACTION_CONFIG[ReactionType.encourage].emoji).toBe("🥰");
  });

  it("touched 對應 💓", () => {
    expect(REACTION_CONFIG[ReactionType.touched].emoji).toBe("💓");
  });

  it("fire 對應 🔥", () => {
    expect(REACTION_CONFIG[ReactionType.fire].emoji).toBe("🔥");
  });

  it("useful 對應 👍🏻", () => {
    expect(REACTION_CONFIG[ReactionType.useful].emoji).toBe("👍🏻");
  });

  it("sameHere 對應 😳", () => {
    expect(REACTION_CONFIG[ReactionType.sameHere].emoji).toBe("😳");
  });

  it("curious 對應 🧐", () => {
    expect(REACTION_CONFIG[ReactionType.curious].emoji).toBe("🧐");
  });

  it("所有 ReactionType 都有對應 emoji", () => {
    for (const key of Object.values(ReactionType)) {
      expect(REACTION_CONFIG[key]?.emoji).toBeTruthy();
    }
  });
});
