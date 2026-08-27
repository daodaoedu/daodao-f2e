import { describe, expect, it } from "vitest";
import { groupEventsByMonth } from "@/utils/space-calendar";
import { autoNameForUrl } from "@/utils/space-link-name";

describe("autoNameForUrl (FR-8.4/8.5)", () => {
  it("maps well-known services to readable names", () => {
    expect(autoNameForUrl("https://docs.google.com/document/d/abc")).toBe("Google 文件");
    expect(autoNameForUrl("https://meet.google.com/abc-defg-hij")).toBe("Google Meet");
    expect(autoNameForUrl("https://www.notion.so/workspace/page")).toBe("Notion");
    expect(autoNameForUrl("https://youtu.be/xyz")).toBe("YouTube");
  });

  it("annotates PDF links (FR-8.5)", () => {
    expect(autoNameForUrl("https://example.com/weekly-report_final.pdf")).toBe(
      "weekly report final（PDF）"
    );
  });

  it("falls back to a cleaned filename, then the domain", () => {
    expect(autoNameForUrl("https://example.com/reading-list_2026")).toBe("reading list 2026");
    expect(autoNameForUrl("https://www.example.com/")).toBe("example.com");
  });
});

describe("groupEventsByMonth (FR-9.3)", () => {
  const event = (id: number, startDate: string) => ({
    id,
    title: "",
    startDate,
    endDate: null,
    startTime: null,
    endTime: null,
    location: null,
    url: null,
  });

  it("sorts by date and groups by month", () => {
    const groups = groupEventsByMonth([event(2, "2026-10-05"), event(1, "2026-09-20")]);
    expect(groups.map((group) => group.label)).toEqual(["9 月", "10 月"]);
    expect(groups[0]?.rows[0]?.id).toBe(1);
  });

  it("includes the year in labels when events cross years", () => {
    const groups = groupEventsByMonth([event(1, "2026-12-20"), event(2, "2027-01-03")]);
    expect(groups.map((group) => group.label)).toEqual(["2026 年 12 月", "2027 年 1 月"]);
  });
});
