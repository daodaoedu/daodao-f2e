import { describe, expect, it } from "vitest";
import {
  type ActivityPreviewContext,
  type ActivityPreviewForm,
  buildActivityPreview,
  normalizeMeetingUrl,
  resolvePreviewHost,
  resolvePreviewRunStatus,
} from "../activity-preview";

const form: ActivityPreviewForm = {
  displayName: "  2026 冬季讀書會  ",
  tagline: "  一起讀完一本書  ",
  startDate: "2026-12-01",
  endDate: "2026-12-31",
  timezone: "Asia/Taipei",
  interactionModes: ["sync", "physical"],
  sessions: [
    {
      id: "a",
      sessionDate: "2026-12-03",
      startTime: "19:00",
      endTime: "",
      recurrenceGroupId: null,
      recurrenceRule: null,
    },
    {
      id: "b",
      sessionDate: "",
      startTime: "",
      endTime: "",
      recurrenceGroupId: null,
      recurrenceRule: null,
    },
  ],
  location: "台北市大安區",
  feeType: "free",
  feeAmount: "",
  signupMethod: "island_form",
  externalSignupUrl: "",
  templateCount: 2,
};

const context: ActivityPreviewContext = {
  cohortId: 42,
  programName: "微小實驗",
  programDescription: null,
  organization: { name: "島島阿學", bio: "學習社群", externalLink: null },
  host: { userId: 7, name: "小島", avatar: null, identifier: null },
  untitledName: "未命名場次",
};

describe("buildActivityPreview（daodao#543 AC-02／AC-07）", () => {
  it("使用目前表單值，以未加入探索者視角呈現且不可加入", () => {
    const preview = buildActivityPreview(form, context, "2026-11-17");
    expect(preview).toMatchObject({
      id: 42,
      displayName: "2026 冬季讀書會",
      tagline: "一起讀完一本書",
      programName: "微小實驗",
      organizationName: "島島阿學",
      host: context.host,
      interactionModes: ["sync", "physical"],
      location: "台北市大安區",
      isJoined: false,
      canJoin: false,
      joinToken: null,
      templateCount: 2,
      runStatus: "upcoming",
    });
  });

  it("只帶已填日期的聚會時段，空白時間轉成 null", () => {
    const preview = buildActivityPreview(form, context, "2026-11-17");
    expect(preview.sessions).toEqual([
      {
        id: 1,
        sessionDate: "2026-12-03",
        startTime: "19:00",
        endTime: null,
        recurrenceGroupId: null,
        recurrenceRule: null,
      },
    ]);
  });

  it("只有非同步互動時不顯示聚會時段，與儲存結果一致", () => {
    const preview = buildActivityPreview(
      { ...form, interactionModes: ["async"] },
      context,
      "2026-11-17"
    );
    expect(preview.sessions).toEqual([]);
  });

  it("標題空白時顯示未命名，簡介與地點空白時為 null", () => {
    const preview = buildActivityPreview(
      { ...form, displayName: "  ", tagline: " ", location: "" },
      context,
      "2026-11-17"
    );
    expect(preview.displayName).toBe("未命名場次");
    expect(preview.tagline).toBeNull();
    expect(preview.location).toBeNull();
  });

  it("付費場次帶金額並固定外部報名；免費場次不帶金額", () => {
    const paid = buildActivityPreview(
      {
        ...form,
        feeType: "paid",
        feeAmount: "500",
        signupMethod: "island_form",
        externalSignupUrl: " https://forms.example/a ",
      },
      context,
      "2026-11-17"
    );
    expect(paid).toMatchObject({
      feeType: "paid",
      feeAmount: 500,
      signupMethod: "external",
      externalSignupUrl: "https://forms.example/a",
    });
    const free = buildActivityPreview({ ...form, feeAmount: "500" }, context, "2026-11-17");
    expect(free.feeAmount).toBeNull();
    expect(free.externalSignupUrl).toBeNull();
  });
});

describe("resolvePreviewRunStatus", () => {
  it.each([
    ["2026-11-30", "upcoming"],
    ["2026-12-01", "ongoing"],
    ["2026-12-31", "ongoing"],
    ["2027-01-01", "ended"],
  ] as const)("今天 %s → %s", (today, expected) => {
    expect(resolvePreviewRunStatus("2026-12-01", "2026-12-31", today)).toBe(expected);
  });
});

describe("resolvePreviewHost：與公開活動頁發起人順序一致", () => {
  const orgOwners = [
    { userId: 3, nickname: "後來的負責人", createdAt: "2026-05-01T00:00:00.000Z" },
    { userId: 2, nickname: "最早的負責人", createdAt: "2026-01-01T00:00:00.000Z" },
  ];

  it("優先使用已加入、最早加入的場次 owner", () => {
    const host = resolvePreviewHost(
      [
        {
          userId: 9,
          nickname: "邀請中",
          role: "owner",
          status: "invited",
          joinedAt: null,
        },
        {
          userId: 8,
          nickname: "助教",
          role: "assistant",
          status: "joined",
          joinedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          userId: 5,
          nickname: "場次發起人",
          role: "owner",
          status: "joined",
          joinedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
      orgOwners,
      "島島阿學"
    );
    expect(host).toEqual({ userId: 5, name: "場次發起人", avatar: null, identifier: null });
  });

  it("沒有場次 owner 時用最早加入的組織 owner", () => {
    expect(resolvePreviewHost([], orgOwners, "島島阿學").name).toBe("最早的負責人");
  });

  it("owner 沒暱稱或沒有 owner 時顯示組織名稱", () => {
    expect(
      resolvePreviewHost(
        [],
        [{ userId: 2, nickname: null, createdAt: "2026-01-01T00:00:00.000Z" }],
        "島島阿學"
      ).name
    ).toBe("島島阿學");
    expect(resolvePreviewHost([], [], "島島阿學")).toEqual({
      userId: null,
      name: "島島阿學",
      avatar: null,
      identifier: null,
    });
  });
});

describe("normalizeMeetingUrl（daodao#543 AC-03）", () => {
  it.each([
    ["meet.google.com/pgj-tkub-njb", "https://meet.google.com/pgj-tkub-njb"],
    ["  Meet.Google.com/pgj-tkub-njb ", "https://Meet.Google.com/pgj-tkub-njb"],
    ["https://meet.google.com/pgj-tkub-njb", "https://meet.google.com/pgj-tkub-njb"],
    ["https://zoom.us/j/123", "https://zoom.us/j/123"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeMeetingUrl(input)).toBe(expected);
  });

  it.each([null, "", "   "])("空值（%s）回傳 null", (input) => {
    expect(normalizeMeetingUrl(input)).toBeNull();
  });
});
