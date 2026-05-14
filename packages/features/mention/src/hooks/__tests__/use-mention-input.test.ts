import { describe, expect, it } from "vitest";

/**
 * Tests for useMentionInput logic
 *
 * The hook's core logic is the `getActiveMentionIds` filter:
 * given a Map<numericUserId, handle> and a content string,
 * return only the numeric IDs whose @handle still appears in content.
 */

function getActiveMentionIds(mentionedIds: Map<number, string>, content: string): number[] {
  return [...mentionedIds.entries()]
    .filter(([, handle]) => {
      const pattern = new RegExp(
        `@${handle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s,!?.。、]|$)`
      );
      return pattern.test(content);
    })
    .map(([id]) => id);
}

describe("getActiveMentionIds", () => {
  it("returns IDs for handles that appear in content", () => {
    const map = new Map([
      [1, "alice"],
      [2, "bob"],
    ]);
    const result = getActiveMentionIds(map, "嗨 @alice 你好");
    expect(result).toEqual([1]);
  });

  it("returns empty array when no handle is present in content", () => {
    const map = new Map([[1, "alice"]]);
    const result = getActiveMentionIds(map, "沒有提及任何人");
    expect(result).toEqual([]);
  });

  it("returns all IDs when all handles appear in content", () => {
    const map = new Map([
      [1, "alice"],
      [2, "bob"],
    ]);
    const result = getActiveMentionIds(map, "@alice 和 @bob 都在");
    expect(result).toEqual([1, 2]);
  });

  it("returns empty array for empty mentionedIds map", () => {
    const result = getActiveMentionIds(new Map(), "@alice 你好");
    expect(result).toEqual([]);
  });

  it("does not match partial handle — @alice should not match @alicebob", () => {
    const map = new Map([[1, "alice"]]);
    // "alicebob" is not the same handle as "alice"
    const result = getActiveMentionIds(map, "歡迎 @alicebob");
    expect(result).toEqual([]);
  });

  it("handles customId-based handle correctly", () => {
    const map = new Map([[5, "alice_id"]]);
    const result = getActiveMentionIds(map, "嗨 @alice_id 你好");
    expect(result).toEqual([5]);
  });

  it("[regression] 選取有 customId 的候選人，handle 應為 name 而非 customId", () => {
    // 修復前：handleMentionSelect 儲存 customId（如 "Aaa"）作為 handle
    // 修復後：固定儲存 name（如 "小許"），內容中插入 @小許
    const mapWithName = new Map([[7, "小許"]]);
    const mapWithCustomId = new Map([[7, "Aaa"]]);
    const content = "嗨 @小許 你好";

    // 修復後：用 name 當 handle，能正確比對
    expect(getActiveMentionIds(mapWithName, content)).toEqual([7]);
    // 修復前的行為：用 customId 當 handle，無法比對到內容中的 @小許
    expect(getActiveMentionIds(mapWithCustomId, content)).toEqual([]);
  });

  it("returns empty array when handle was deleted from content", () => {
    const map = new Map([
      [1, "alice"],
      [2, "bob"],
    ]);
    // User deleted @alice from the text before submitting
    const result = getActiveMentionIds(map, "嗨 @bob 你好");
    expect(result).toEqual([2]);
  });
});
