"use client";

import { useCurrentUser, useUserMutations, type UpdateUserRequest } from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { toast } from "@daodao/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FieldSelectionSection } from "./field-selection-section";
import { PersonalInfoSection } from "./personal-info-section";
import {
  type AccountFormValues,
  AVAILABLE_FIELDS,
  accountFormSchema,
  EDUCATION_STAGE_OPTIONS,
  ROLE_OPTIONS,
} from "./schema";

// 角色值對應：API 使用中文，表單使用英文
const ROLE_MAP: Record<string, string> = {
  學生: "student",
  社會人士: "professional",
  教師: "teacher",
  其他: "other",
};

const REVERSE_ROLE_MAP: Record<string, string> = {
  student: "學生",
  professional: "社會人士",
  teacher: "教師",
  other: "其他",
};

// 將 API 的 roleList 值對應到表單值
const mapApiRoleToForm = (apiRoleList: string[] | null | undefined): string => {
  if (!apiRoleList || apiRoleList.length === 0) return "";
  const firstRole = apiRoleList[0];
  return firstRole ? ROLE_MAP[firstRole] || "" : "";
};

// 將表單的 role 值對應到 API 值
const mapFormRoleToApi = (formValue: string): string[] | undefined => {
  if (!formValue) return undefined;
  const apiRole = REVERSE_ROLE_MAP[formValue];
  return apiRole ? [apiRole] : undefined;
};

// 將 API 的 educationStage 值對應到表單值
const mapApiEducationStageToForm = (
  apiValue: "university" | "high" | "other" | null | undefined
): string => {
  if (!apiValue) return "";
  if (apiValue === "university") return "university";
  if (apiValue === "high") return "senior";
  return "other";
};

// 將表單的 educationStage 值對應到 API 值
const mapFormEducationStageToApi = (
  formValue: string
): "university" | "high" | "other" | undefined => {
  if (formValue === "university") return "university";
  if (formValue === "senior" || formValue === "junior" || formValue === "elementary") return "high";
  if (formValue === "graduate") return "university";
  if (formValue === "other" || formValue === "unlimited") return "other";
  return undefined;
};

export const AccountForm = () => {
  const { data: userData, isLoading, error: userError } = useCurrentUser();
  const { updateCurrentUser } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: "",
      birthday: undefined,
      role: "",
      educationStage: "",
      professionalFields: [],
      explorationFields: [],
    },
  });

  // 當用戶資料載入完成時，更新表單預設值
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      form.reset({
        email: user.email || "",
        birthday: user.birthDay ? parse(user.birthDay, "yyyy-MM-dd", new Date()) : undefined,
        role: mapApiRoleToForm(user.roleList),
        educationStage: mapApiEducationStageToForm(user.educationStage),
        professionalFields: user.tagList || [],
        explorationFields: user.interestList || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleSubmit = async (values: AccountFormValues) => {
    setIsSubmitting(true);

    try {
      // 準備 API 請求資料
      const updateData: {
        birthDay?: string;
        roleList?: string[];
        educationStage?: "university" | "high" | "other";
        tagList?: string[];
        interestList?: string[];
      } = {};

      // 轉換生日
      if (values.birthday) {
        updateData.birthDay = format(values.birthday, "yyyy-MM-dd");
      }

      // 轉換角色（單一值轉為陣列，並轉換為中文）
      const apiRoleList = mapFormRoleToApi(values.role);
      if (apiRoleList) {
        updateData.roleList = apiRoleList;
      }

      // 轉換教育階段
      const apiEducationStage = mapFormEducationStageToApi(values.educationStage);
      if (apiEducationStage) {
        updateData.educationStage = apiEducationStage;
      }

      // 轉換專業領域和探索領域
      if (values.professionalFields.length > 0) {
        updateData.tagList = values.professionalFields;
      }

      if (values.explorationFields.length > 0) {
        updateData.interestList = values.explorationFields;
      }

      // 調用 API
      const response = await updateCurrentUser(updateData as UpdateUserRequest);

      // 檢查錯誤
      if (response.error) {
        const error = response.error;
        let errorMessage = "更新失敗，請稍後再試";

        if (typeof error === "object" && error !== null) {
          // 檢查是否有 details 陣列
          if ("details" in error && Array.isArray(error.details)) {
            const details = error.details as Array<{ path?: string; message?: string }>;

            // 處理每個欄位錯誤
            details.forEach((detail) => {
              if (detail.path && detail.message) {
                // 將錯誤設置到對應的表單欄位
                const formFieldMap: Record<string, keyof AccountFormValues> = {
                  birthDay: "birthday",
                  roleList: "role",
                  educationStage: "educationStage",
                  tagList: "professionalFields",
                  interestList: "explorationFields",
                };

                const formField = formFieldMap[detail.path];
                if (formField) {
                  form.setError(formField, {
                    type: "server",
                    message: detail.message,
                  });
                }
              }
            });

            // 使用第一個具體錯誤訊息作為 toast 訊息
            const firstDetail = details[0];
            if (firstDetail?.message) {
              errorMessage = firstDetail.message;
            }
          } else if ("message" in error && error.message) {
            // 如果沒有 details，使用頂層 message
            errorMessage = String(error.message);
          }
        }

        console.error("Failed to update user:", response.error);
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // 成功
      toast.success("帳號設定已更新");
      form.reset(form.getValues()); // 重置 dirty 狀態
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("更新失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  useNavigationBlockerEffect(form.formState.isDirty);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-dark">載入中...</p>
      </div>
    );
  }

  // 錯誤狀態
  if (userError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red">載入用戶資料失敗，請稍後再試</p>
      </div>
    );
  }

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
            disabled={isSubmitting}
          >
            {isSubmitting ? "儲存中..." : "儲存"}
          </Button>
        </footer>
      </form>
    </Form>
  );
};
