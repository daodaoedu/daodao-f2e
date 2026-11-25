import { describe, expect, it } from "vitest";
import { groupByRunStatus } from "../group-by-run-status";

const item = (id: number, runStatus: string) => ({ id, runStatus });

describe("groupByRunStatus", () => {
  it("依即將開始、進行中、已結束的順序分區，不受原始順序影響", () => {
    const groups = groupByRunStatus([
      item(1, "ended"),
      item(2, "upcoming"),
      item(3, "ongoing"),
      item(4, "upcoming"),
    ]);
    expect(groups.map((g) => g.status)).toEqual(["upcoming", "ongoing", "ended"]);
    expect(groups[0]?.items.map((i) => i.id)).toEqual([2, 4]);
  });

  it("沒有項目的狀態不出現分區", () => {
    expect(groupByRunStatus([item(1, "ongoing")]).map((g) => g.status)).toEqual(["ongoing"]);
    expect(groupByRunStatus([])).toEqual([]);
  });
});
