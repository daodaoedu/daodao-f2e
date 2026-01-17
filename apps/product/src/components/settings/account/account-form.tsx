"use client";

import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FieldSelectionSection } from "./field-selection-section";
import { PersonalInfoSection } from "./personal-info-section";
import {
  AVAILABLE_FIELDS,
  EDUCATION_STAGE_OPTIONS,
  ROLE_OPTIONS,
  accountFormSchema,
  type AccountFormValues,
} from "./schema";

export const AccountForm = () => {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "aaa@gmail.com",
      birthday: new Date("2004-02-23"),
      role: "",
      educationStage: "",
      professionalFields: ["資訊與資訊通信科技(ICT)", "法律", "商業與管理"],
      explorationFields: [
        "資訊與電腦科學",
        "語言",
        "商管與理財",
        "社會創新與永續",
      ],
    },
  });

  const handleSubmit = async (values: AccountFormValues) => {
    // TODO: 整合 API
    console.log("Form values:", values);
  };

  useNavigationBlockerEffect(form.formState.isDirty);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PersonalInfoSection
          form={form}
          roleOptions={ROLE_OPTIONS}
          educationStageOptions={EDUCATION_STAGE_OPTIONS}
        />

        <FieldSelectionSection
          form={form}
          fieldName="professionalFields"
          label="專業領域"
          availableFields={AVAILABLE_FIELDS}
          maxSelection={5}
        />

        <FieldSelectionSection
          form={form}
          fieldName="explorationFields"
          label="想探索的領域"
          availableFields={AVAILABLE_FIELDS}
          maxSelection={5}
        />

        {/* 儲存按鈕 */}
        <footer className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 p-6 border-t border-light-gray bg-very-light-gray">
          <Button
            type="submit"
            variant="orange"
            className="w-full sm:max-w-[288px]"
          >
            儲存
          </Button>
        </footer>
      </form>
    </Form>
  );
};
