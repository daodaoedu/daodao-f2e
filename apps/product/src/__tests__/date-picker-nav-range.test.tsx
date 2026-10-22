import { DatePicker } from "@daodao/ui/components/date-picker";
import { addDays } from "date-fns";
import type * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFutureLetterCustomDateRange } from "@/components/future-letter/future-letter-utils";

/**
 * daodao#337 regression guard。
 *
 * DatePicker 用 `captionLayout="dropdown"`，沒給 startMonth／endMonth 時 react-day-picker
 * 會把可翻範圍預設成 `startOfYear(today − 100y)`～`endOfYear(today)`：minDate／maxDate 跨年時
 * 跨年那段選不到，onboarding 生日（minDate 1900）也翻不到 1926 年以前。
 *
 * Popover 關著時不會渲染月曆，這裡把 Popover 換成直接渲染 children，檢查月曆的年份下拉。
 */
vi.mock("@daodao/ui/components/popover", () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return { Popover: Passthrough, PopoverTrigger: Passthrough, PopoverContent: Passthrough };
});
// Button 透過 next-intl 拿 router，node 環境載不到 next/navigation；這裡用不到導頁
vi.mock("@daodao/i18n/navigation", () => ({ useRouter: () => ({ back: () => {} }) }));

function yearOptions(props: React.ComponentProps<typeof DatePicker>) {
  const html = renderToStaticMarkup(<DatePicker {...props} />);
  return [...html.matchAll(/<option value="(\d{4})"/g)].map((m) => Number(m[1]));
}

describe("DatePicker 可翻月份範圍跟著 minDate／maxDate（daodao#337）", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("寫信給未來的自己：上限跨年時，年份下拉要有上限那年，且不早於下限那年", () => {
    const now = new Date(2026, 9, 13);
    vi.setSystemTime(now);
    const { minDate, maxDate } = getFutureLetterCustomDateRange(now);

    const years = yearOptions({ value: undefined, minDate, maxDate });

    expect(maxDate.getFullYear()).toBe(2027);
    expect(years).toEqual([2026, 2027]);
  });

  it("手動建立實踐開始日期：12/20 時上限 +14 天跨年，可翻到隔年", () => {
    const now = new Date(2026, 11, 20);
    vi.setSystemTime(now);

    const years = yearOptions({ value: undefined, minDate: now, maxDate: addDays(now, 14) });

    expect(years).toEqual([2026, 2027]);
  });

  it("onboarding 生日：年份下拉從 1900 到今年", () => {
    const now = new Date(2026, 9, 13);
    vi.setSystemTime(now);

    const years = yearOptions({ value: undefined, minDate: new Date(1900, 0, 1), maxDate: now });

    expect(years[0]).toBe(1900);
    expect(years.at(-1)).toBe(2026);
  });

  it("沒給 minDate／maxDate 時維持套件預設範圍", () => {
    vi.setSystemTime(new Date(2026, 9, 13));

    const years = yearOptions({ value: undefined });

    expect(years[0]).toBe(1926);
    expect(years.at(-1)).toBe(2026);
  });
});
