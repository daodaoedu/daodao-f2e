import { describe, expect, it } from "vitest";
import {
  buildMineFilterCounts,
  applyMineFilter,
} from "../mine-filter";
import { FilterStatus } from "@/constants/task-status";

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
    expect(applyMineFilter(tasks, FilterStatus.draft)).toEqual([
      { status: FilterStatus.draft },
    ]);
  });

  it("notStarted filter returns only notStarted tasks", () => {
    expect(applyMineFilter(tasks, FilterStatus.notStarted)).toEqual([
      { status: FilterStatus.notStarted },
    ]);
  });
});
