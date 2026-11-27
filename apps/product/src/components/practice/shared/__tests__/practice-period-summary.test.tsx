import { NextIntlClientProvider } from "@daodao/i18n";
import { Progress } from "@daodao/ui/components/progress";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../../../../../packages/i18n/src/locales/en/practice.json";
import zh from "../../../../../../../packages/i18n/src/locales/zh-TW/practice.json";
import { PracticePeriodSummary } from "../practice-period-summary";

function renderPeriod(
  startDate = "2026-11-19",
  durationDays: number | null = 21,
  locale = "zh-TW"
) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={locale}
      timeZone="Asia/Taipei"
      messages={{ practice: locale === "en" ? en : zh }}
    >
      <PracticePeriodSummary startDate={startDate} durationDays={durationDays} />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 26, 12));
});
afterEach(() => vi.useRealTimers());

describe("practice period summary", () => {
  it.each([
    [125, 100],
    [-5, 0],
  ])("keeps shared progress semantics within the same bounds as its fill (%s)", (value, expected) => {
    const markup = renderToStaticMarkup(<Progress value={value} aria-label="Progress" />);
    expect(markup).toContain(`aria-valuenow="${expected}"`);
  });

  it("shows the inclusive range and elapsed calendar days independently of check-in progress", () => {
    const markup = renderPeriod();
    expect(markup).toContain('dateTime="2026-11-19"');
    expect(markup).toContain("2026/12/09");
    expect(markup).toContain("已進行 7/21 天");
    expect(markup).toContain("剩下 14 天");
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-valuenow="33.33333333333333"');
    expect(markup).toContain('aria-valuetext="已進行 7/21 天"');
    expect(markup).toContain('aria-label="實踐期間進度"');
  });

  it.each([
    [new Date(2026, 10, 18, 23, 59), 0, 21],
    [new Date(2026, 10, 19, 12), 0, 21],
    [new Date(2026, 11, 9, 23, 59), 20, 1],
    [new Date(2026, 11, 10, 0), 21, 0],
  ])("clamps days and progress at calendar boundaries (%s)", (now, elapsed, remaining) => {
    vi.setSystemTime(now);
    const markup = renderPeriod();
    expect(markup).toContain(`已進行 ${elapsed}/21 天`);
    expect(markup).toContain(`剩下 ${remaining} 天`);
    if (elapsed === 0) expect(markup).toContain('aria-valuenow="0"');
    if (elapsed === 21) expect(markup).toContain('aria-valuenow="100"');
  });

  it.each([null, 0, -1, 1.5, Number.NaN])("omits an unknown or invalid duration (%s)", (days) => {
    expect(renderPeriod("2026-11-19", days)).toBe("");
  });

  it.each([
    "",
    "2026-02-30",
    "invalid",
  ])("does not fabricate missing/invalid dates (%s)", (date) => {
    expect(renderPeriod(date)).toBe("");
  });

  it("renders English day counts and the progress accessible name", () => {
    const markup = renderPeriod("2026-11-19", 21, "en");
    expect(markup).toContain("7/21 days elapsed");
    expect(markup).toContain("14 days remaining");
    expect(markup).toContain('aria-label="Practice period progress"');
  });
});
