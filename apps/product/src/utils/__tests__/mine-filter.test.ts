import { describe, expect, it } from "vitest";
import { FilterStatus, mapPracticeStatusToTaskStatus } from "@/constants/task-status";
import { applyMineFilter, buildMineFilterCounts, minePracticeStatus } from "../mine-filter";

interface Task {
  status: string;
}

describe("buildMineFilterCounts", () => {
  const tasks: Task[] = [
    { status: FilterStatus.inProgress },
    { status: FilterStatus.inProgress },
    { status: FilterStatus.notStarted },
    { status: FilterStatus.draft },
    { status: FilterStatus.completed },
  ];

  it("all count equals total number of tasks (all statuses)", () => {
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.all]).toBe(5);
  });

  it("inProgress count is correct", () => {
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.inProgress]).toBe(2);
  });

  it("notStarted count is correct", () => {
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.notStarted]).toBe(1);
  });

  it("draft count is correct", () => {
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.draft]).toBe(1);
  });

  it("completed count is correct", () => {
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.completed]).toBe(1);
  });

  it("returns zero for all counts on empty input", () => {
    const counts = buildMineFilterCounts([]);
    expect(counts[FilterStatus.all]).toBe(0);
    expect(counts[FilterStatus.inProgress]).toBe(0);
    expect(counts[FilterStatus.completed]).toBe(0);
  });

  it("all count does NOT equal inProgress count when there are other statuses", () => {
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.all]).not.toBe(counts[FilterStatus.inProgress]);
  });
});

describe("applyMineFilter", () => {
  const tasks: Task[] = [
    { status: FilterStatus.inProgress },
    { status: FilterStatus.notStarted },
    { status: FilterStatus.draft },
    { status: FilterStatus.completed },
  ];

  it("all filter returns all tasks", () => {
    expect(applyMineFilter(tasks, FilterStatus.all)).toEqual(tasks);
  });

  it("inProgress filter returns only inProgress tasks", () => {
    expect(applyMineFilter(tasks, FilterStatus.inProgress)).toEqual([
      { status: FilterStatus.inProgress },
    ]);
  });

  it("completed filter returns only completed tasks", () => {
    expect(applyMineFilter(tasks, FilterStatus.completed)).toEqual([
      { status: FilterStatus.completed },
    ]);
  });

  it("draft filter returns only draft tasks", () => {
    expect(applyMineFilter(tasks, FilterStatus.draft)).toEqual([{ status: FilterStatus.draft }]);
  });

  it("notStarted filter returns only notStarted tasks", () => {
    expect(applyMineFilter(tasks, FilterStatus.notStarted)).toEqual([
      { status: FilterStatus.notStarted },
    ]);
  });
});

describe("minePracticeStatus：燈塔場次實踐在「我的」列表不顯示草稿（daodao#544）", () => {
  const period = { startDate: "2026-12-06", endDate: "2026-12-19" };
  const at = (ymd: string) => new Date(`${ymd}T12:00:00`);
  const cohortDraft = { status: "draft" as const, isCohortPractice: true, ...period };

  it("依實踐自身起訖日顯示未開始／進行中／已完成，並標記打卡前需啟用", () => {
    expect(minePracticeStatus(cohortDraft, at("2026-12-05"))).toEqual({
      status: "not_started",
      needsActivation: true,
      lockBeforeStartDate: true,
    });
    expect(minePracticeStatus(cohortDraft, at("2026-12-06")).status).toBe("active");
    expect(minePracticeStatus(cohortDraft, at("2026-12-20")).status).toBe("completed");
  });

  it("不把燈塔場次 draft 算進草稿篩選，個人草稿照舊", () => {
    const tasks = [
      {
        status: mapPracticeStatusToTaskStatus(
          minePracticeStatus(cohortDraft, at("2026-12-10")).status ?? "draft"
        ),
      },
      {
        status: mapPracticeStatusToTaskStatus(
          minePracticeStatus({ status: "draft", ...period }, at("2026-12-10")).status ?? "draft"
        ),
      },
    ];
    const counts = buildMineFilterCounts(tasks);
    expect(counts[FilterStatus.draft]).toBe(1);
    expect(counts[FilterStatus.inProgress]).toBe(1);
  });

  it("共同挑戰與已啟用的場次實踐不受影響", () => {
    expect(minePracticeStatus({ ...cohortDraft, isChallenge: true }, at("2026-12-10"))).toEqual({
      status: "draft",
      needsActivation: false,
      lockBeforeStartDate: false,
    });
    expect(
      minePracticeStatus({ ...cohortDraft, status: "active" }, at("2026-12-10")).needsActivation
    ).toBe(false);
  });
});
