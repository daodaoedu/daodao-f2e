import { describe, expect, it, vi } from "vitest";
import { createTimeSpentReporter } from "../services/time-spent-reporter";

describe("createTimeSpentReporter", () => {
  it("停留滿 5 秒才回報，帶上秒數", () => {
    let now = 1_000;
    const post = vi.fn();
    const reporter = createTimeSpentReporter({ now: () => now, post });

    now += 4_000;
    reporter.send();
    expect(post).not.toHaveBeenCalled();

    now += 2_000;
    reporter.send();
    expect(post).toHaveBeenCalledExactlyOnceWith(6);
  });

  // daodao#369：刪除實踐後跳頁，unmount 仍送 POST /practices/<id>/time-spent，server 回 404
  it("stop 之後不再回報", () => {
    let now = 0;
    const post = vi.fn();
    const reporter = createTimeSpentReporter({ now: () => now, post });

    now += 30_000;
    reporter.stop();
    reporter.send();

    expect(post).not.toHaveBeenCalled();
  });
});
