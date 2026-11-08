import { describe, expect, it } from "vitest";
import {
  areaLabelKey,
  reportIdFromSearch,
  safeLinkHref,
  statusLabelKey,
} from "../my-bug-reports-view";

// daodao#451 AC-08「我的回報」
describe("my bug reports view helpers", () => {
  it("通知帶的 ?report= 是正整數才指到該則", () => {
    expect(reportIdFromSearch("8")).toBe(8);
    expect(reportIdFromSearch(null)).toBeNull();
    expect(reportIdFromSearch("0")).toBeNull();
    expect(reportIdFromSearch("8abc")).toBeNull();
  });

  it("問題區域只對應表單既有選項，其他值不顯示標籤", () => {
    expect(areaLabelKey("ui")).toBe("bug_area_ui");
    expect(areaLabelKey("performance")).toBe("bug_area_performance");
    expect(areaLabelKey("unknown")).toBeNull();
    expect(areaLabelKey(null)).toBeNull();
  });

  it("狀態對應各自的文字", () => {
    expect(statusLabelKey("pending")).toBe("bug_mine_status_pending");
    expect(statusLabelKey("replied")).toBe("bug_mine_status_replied");
    expect(statusLabelKey("closed")).toBe("bug_mine_status_closed");
  });

  it("相關連結只有 http(s) 才可點", () => {
    expect(safeLinkHref("https://app.daodao.so/x")).toBe("https://app.daodao.so/x");
    expect(safeLinkHref("javascript:alert(1)")).toBeNull();
    expect(safeLinkHref(null)).toBeNull();
  });
});
