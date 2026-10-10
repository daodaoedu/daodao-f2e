import { createFormControl } from "react-hook-form";
import { describe, expect, it } from "vitest";
import {
  createEducationStageChangeHandler,
  setUserSelectedFields,
  toAccountFormValues,
} from "../form-state";
import type { AccountFormValues } from "../schema";

// 模擬 /users/me 的回應：未填的欄位 server 回 null（daodao#296 冒煙帳號即為此狀態）
const serverUser = {
  email: "qa@example.test",
  birthDay: null,
  positionList: [],
  educationStage: "other",
  professionalField: null,
  interestList: null,
};

/** 建一個與帳號設定頁同形狀的表單，並追蹤 formState.isDirty（navigation blocker 讀的就是它） */
const setupForm = () => {
  const form = createFormControl<AccountFormValues>({
    defaultValues: {
      email: "",
      birthday: undefined,
      position: [],
      educationStage: "",
      professionalFields: [],
      explorationFields: [],
    },
  });
  const state = { isDirty: false };
  form.subscribe({
    formState: { isDirty: true },
    callback: (s) => {
      state.isDirty = Boolean(s.isDirty);
    },
  });
  form.reset(toAccountFormValues(serverUser));
  // 與 FormField（Controller）的 field.onChange 相同：使用者改值會標記 dirty
  const educationField = {
    onChange: (value: string) =>
      form.setValue("educationStage", value, { shouldDirty: true, shouldTouch: true }),
    onBlur: () => {},
  };
  return { form, state, onEducationStageChange: createEducationStageChangeHandler(educationField) };
};

describe("account form dirty state (daodao#296)", () => {
  it("toAccountFormValues 把 server 的 null 正規化成表單初始值", () => {
    expect(toAccountFormValues(serverUser)).toEqual({
      email: "qa@example.test",
      birthday: undefined,
      position: [],
      educationStage: "other",
      professionalFields: [],
      explorationFields: [],
    });
  });

  it("AC-01：Radix Select 在載入後自動回呼 onValueChange('') 不算修改，也不清掉既有值", () => {
    const { form, state, onEducationStageChange } = setupForm();
    expect(state.isDirty).toBe(false);

    onEducationStageChange("");

    expect(form.getValues("educationStage")).toBe("other");
    expect(state.isDirty).toBe(false);
  });

  it("AC-02：使用者改選教育階段 → dirty", () => {
    const { state, onEducationStageChange } = setupForm();
    onEducationStageChange("master");
    expect(state.isDirty).toBe(true);
  });

  it("AC-02：從 sheet 改身份／領域 → dirty；改回原值 → 不再 dirty", () => {
    const { form, state } = setupForm();

    setUserSelectedFields(form.setValue, "professionalFields", ["design"]);
    expect(state.isDirty).toBe(true);

    setUserSelectedFields(form.setValue, "professionalFields", []);
    expect(state.isDirty).toBe(false);
  });

  it("AC-02：按「清除」清空既有身份 → dirty", () => {
    const { form, state } = setupForm();
    form.reset(toAccountFormValues({ ...serverUser, positionList: ["student"] }));
    expect(state.isDirty).toBe(false);

    setUserSelectedFields(form.setValue, "position", []);
    expect(state.isDirty).toBe(true);
  });
});
