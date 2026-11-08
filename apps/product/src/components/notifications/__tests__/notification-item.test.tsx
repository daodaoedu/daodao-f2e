import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../../../../packages/i18n/src/locales/zh-TW/notification.json";
import { type INotificationData, NotificationItem } from "../notification-item";

vi.mock("@daodao/i18n", () => ({
  useTranslations:
    () =>
    (key: string, values: Record<string, string | number> = {}) => {
      let text = messages[key as keyof typeof messages] ?? key;
      for (const [name, value] of Object.entries(values))
        text = text.replace(`{${name}}`, String(value));
      return text;
    },
}));
vi.mock("@daodao/assets", () => ({ ArrowRightOutlineSvg: () => null, MoreSvg: () => null }));
vi.mock("@daodao/ui/components/avatar", () => ({
  Avatar: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AvatarFallback: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  AvatarImage: () => null,
}));
vi.mock("@daodao/ui/components/button", () => ({
  Button: ({ children }: React.PropsWithChildren) => <button type="button">{children}</button>,
}));
vi.mock("@daodao/ui/components/custom-link", () => ({
  CustomLink: ({ children }: React.PropsWithChildren) => <a href="/">{children}</a>,
}));
vi.mock("@daodao/ui/components/dropdown-menu", () => ({
  DropdownMenu: () => null,
  DropdownMenuContent: () => null,
  DropdownMenuItem: () => null,
  DropdownMenuTrigger: () => null,
}));
vi.mock("@daodao/ui/lib/utils", () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
}));

function render(type: string, details: Record<string, unknown> = {}) {
  const item = {
    id: "1",
    type,
    actor: { name: "教練" },
    time: "剛剛",
    isRead: false,
    ...details,
  } as INotificationData;
  return renderToStaticMarkup(<NotificationItem notification={item} />);
}

describe("cohort notification content", () => {
  it("identifies an invitation and its cohort", () => {
    const html = render("cohort-invitation", { cohortName: "秋季場次" });
    expect(html).toContain("邀請你加入場次");
    expect(html).toContain("秋季場次");
    expect(html).not.toContain("發出了一則通知");
  });
  it("identifies removal without attributing it to the recipient", () => {
    const html = render("cohort-member-removed", { cohortName: "秋季場次" });
    expect(html).toContain("你已被移出場次");
    expect(html).toContain("秋季場次");
  });
  it("keeps historical invitation message when structured name is missing", () => {
    expect(render("cohort-invitation", { message: "邀請你加入歷史場次" })).toContain(
      "邀請你加入歷史場次"
    );
  });
  it("explains missing historical cohort information", () => {
    expect(render("cohort-invitation")).toContain("場次邀請");
    expect(render("cohort-member-removed")).toContain("你已被移出一個場次");
  });
  it("treats blank historical values as missing", () => {
    expect(render("cohort-invitation", { cohortName: "  ", message: "  " })).toContain("場次邀請");
  });
  it.each(["CohortJoined", "CohortMessage"])("keeps meaningful messages for %s", (type) => {
    expect(render(type, { message: "有一位學員加入了本期。" })).toContain("有一位學員加入了本期。");
  });
  it("identifies existing wish and roadmap events", () => {
    expect(render("wish-linked", { entityTitle: "通知改善" })).toContain(
      "你的願望已連結到路線圖項目「通知改善」"
    );
    expect(render("roadmap-shipped", { entityTitle: "通知改善" })).toContain(
      "你支持的路線圖項目「通知改善」已上線"
    );
  });
  it("keeps existing follow notifications", () => {
    expect(render("follow-user")).toContain("關注了你");
  });
});

describe("FeedbackReplied notification（daodao#451）", () => {
  it("以島島團隊身分顯示，即使 actor 帶了 id／customId 也不連到個人頁", () => {
    const html = render("feedback-replied", {
      actor: { id: "admin-uuid", customId: "admin-ming", name: "島島團隊" },
      entityTitle: "按鈕沒反應",
    });
    expect(html).toContain("島島團隊回覆了你的錯誤回報「按鈕沒反應」");
    expect(html).not.toContain("<a");
  });

  it("一般通知仍連到觸發者個人頁", () => {
    expect(
      render("follow-user", { actor: { id: "u1", customId: "coach", name: "教練" } })
    ).toContain("<a");
  });
});
