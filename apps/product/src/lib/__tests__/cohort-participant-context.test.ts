import { describe, expect, it } from "vitest";
import { parseCohortParticipantRefs } from "../cohort-participant-context";

describe("participant navigation references", () => {
  it("preserves roster order and participant/practice pairing", () => {
    expect(parseCohortParticipantRefs("2:40,5:21")).toEqual([
      { userId: 2, practiceId: 40 },
      { userId: 5, practiceId: 21 },
    ]);
  });
  it.each([
    null,
    "",
    "2:40:7",
    "2e2:40",
    "2:40,bad,5:21",
    "9007199254740992:1",
    "2:40,2:41",
    "2:0",
    "-1:40",
    "2:1.5",
    " 2:40",
  ])("rejects invalid contexts rather than shifting the selected participant: %s", (value) => {
    expect(parseCohortParticipantRefs(value)).toEqual([]);
  });
});
