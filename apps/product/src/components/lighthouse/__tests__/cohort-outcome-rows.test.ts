import { describe, expect, it } from "vitest";
import { isFirstRowOfPerson } from "../cohort-outcome-rows";

describe("isFirstRowOfPerson", () => {
  it("shows a person-level count once per person across that person's practice rows", () => {
    const rows = [
      { userId: 3 },
      { userId: 3 },
      { userId: 6 },
      { userId: 6 },
      { userId: 6 },
      { userId: 9 },
    ];
    expect(rows.map((_, index) => isFirstRowOfPerson(rows, index))).toEqual([
      true,
      false,
      true,
      false,
      false,
      true,
    ]);
  });

  it("treats a single-row person as their own first row", () => {
    expect(isFirstRowOfPerson([{ userId: 1 }], 0)).toBe(true);
  });
});
