import { describe, expect, it } from "vitest";
import en from "../locales/en.json";

describe("practice detail page English strings (#721)", () => {
  it('uses "Duplicate" for action_copy', () => {
    expect(en.practice.action_copy).toBe("Duplicate");
  });

  it('uses "Activity" for action_browse_activity', () => {
    expect(en.practice.action_browse_activity).toBe("Activity");
  });

  it('uses "Check-ins" for tab_checkins', () => {
    expect(en.practice.tab_checkins).toBe("Check-ins");
  });

  it('uses "Resources" for tab_resources', () => {
    expect(en.practice.tab_resources).toBe("Resources");
  });
});
