import { describe, expect, it } from "vitest";
import {
  DeliveryOption,
  getDeliverAt,
  getDraftCloseAction,
  getFutureLetterCustomDateRange,
  getFutureLetterFormErrors,
  hasFutureLetterContent,
  hasFutureLetterFormErrors,
} from "../future-letter-utils";

describe("future letter form helpers", () => {
  const now = new Date("2026-08-18T10:00:00.000Z");

  it("allows sending when either letter field has content", () => {
    const errors = getFutureLetterFormErrors({
      currentSelf: "現在有點迷惘",
      message: "",
      deliveryOption: DeliveryOption.fourteenDays,
    });

    expect(errors).toEqual({});
    expect(hasFutureLetterFormErrors(errors)).toBe(false);
  });

  it("treats whitespace-only fields as empty", () => {
    const values = { currentSelf: " \n", message: "\t" };

    expect(hasFutureLetterContent(values)).toBe(false);
    expect(
      getFutureLetterFormErrors({
        ...values,
        deliveryOption: DeliveryOption.fourteenDays,
      })
    ).toEqual({ content: "required" });
  });

  it("deletes an existing draft when both fields are cleared", () => {
    expect(getDraftCloseAction({ currentSelf: " ", message: "\n" }, "draft-id")).toBe("delete");
    expect(getDraftCloseAction({ currentSelf: " ", message: "\n" }, undefined)).toBe("skip");
  });

  it("requires a date only for the custom option", () => {
    expect(
      getFutureLetterFormErrors({
        currentSelf: "現在的狀態",
        message: "給未來的話",
        deliveryOption: DeliveryOption.custom,
      })
    ).toEqual({ deliverAt: "required" });
  });

  it("calculates preset delivery dates from the current instant", () => {
    expect(getDeliverAt(DeliveryOption.sevenDays, undefined, now)?.toISOString()).toBe(
      "2026-08-25T10:01:00.000Z"
    );
    expect(getDeliverAt(DeliveryOption.fourteenDays, undefined, now)?.toISOString()).toBe(
      "2026-09-01T10:00:00.000Z"
    );
  });

  it("caps a custom delivery instant at the 90-day boundary", () => {
    const maxDay = new Date("2026-11-16T00:00:00.000Z");
    expect(getDeliverAt(DeliveryOption.custom, maxDay, now)?.toISOString()).toBe(
      "2026-11-16T10:00:00.000Z"
    );
  });

  it("uses the FRD custom delivery range of 3 to 90 days", () => {
    expect(getFutureLetterCustomDateRange(now)).toEqual({
      minDate: new Date("2026-08-21T10:00:00.000Z"),
      maxDate: new Date("2026-11-16T10:00:00.000Z"),
    });
  });
});
