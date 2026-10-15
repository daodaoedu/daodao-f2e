import { describe, expect, it } from "vitest";
import { createOnboardingFormSchema } from "../schema";

const profile = {
  email: "onboarding@example.com",
  birthDate: new Date(1992, 1, 20),
  name: "Test Person",
  customId: "testperson",
  personalSlogan: "Learning every day",
};

describe("onboarding form validation", () => {
  it("reports both missing fields in the fixed flow to the form resolver", () => {
    const result = createOnboardingFormSchema(undefined, { requireFixedFields: true }).safeParse(
      profile
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        professionalFields: ["validation.professionalFieldsRequired"],
        interests: ["validation.interestsRequired"],
      });
    }
  });

  it.each([
    ["professionalFields", { interests: ["design"] }],
    ["interests", { professionalFields: ["design"] }],
  ])("reports the missing %s field independently", (field, selection) => {
    const result = createOnboardingFormSchema(undefined, { requireFixedFields: true }).safeParse({
      ...profile,
      ...selection,
      referralSource: "friend",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toHaveProperty(field);
  });

  it("accepts complete fixed-flow answers", () => {
    expect(
      createOnboardingFormSchema(undefined, { requireFixedFields: true }).safeParse({
        ...profile,
        professionalFields: ["design"],
        interests: ["design"],
        referralSource: "friend",
      }).success
    ).toBe(true);
  });

  it("does not require fixed fields for dynamic flows", () => {
    expect(
      createOnboardingFormSchema().safeParse({ ...profile, dynamicAnswers: { "1": ["design"] } })
        .success
    ).toBe(true);
  });
});
