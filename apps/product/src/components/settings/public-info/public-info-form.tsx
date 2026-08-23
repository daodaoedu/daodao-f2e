"use client";

import { useCities, useCurrentUser, useMutate, useUserMutations } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { toast } from "@daodao/ui/components/sonner";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { mutate as globalMutate } from "swr";
import {
  applyOnboardingUpdateFromResponse,
  refreshOnboardingStatus,
} from "@/components/task-guide/onboarding-progress-context";
import { AvatarUploadSection } from "./avatar-upload-section";
import { BasicInfoSection } from "./basic-info-section";
import { IntroductionSection } from "./introduction-section";
import { PrivacySection } from "./privacy-section";
import { createPublicInfoFormSchema, type PublicInfoFormValues } from "./schema";
import { SocialLinksSection } from "./social-links-section";

export const PublicInfoForm = () => {
  const locale = useLocale();
  const t = useTranslations("app_product");
  const { data: userData, isLoading, error: userError } = useCurrentUser();
  const { updateCurrentUserWithFormData } = useUserMutations();
  const mutate = useMutate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 使用 search 參數精確搜尋用戶的城市，以獲取 countryCode
  const userLocation = userData?.data?.location;
  const { data: citiesData, isLoading: isCitiesLoading } = useCities({
    search: userLocation || undefined,
    locale: locale === "en" ? "en" : "zh-TW",
  });

  const form = useForm<PublicInfoFormValues>({
    resolver: zodResolver(createPublicInfoFormSchema(t)),
    defaultValues: {
      photoURL: "",
      name: "",
      customId: "",
      country: "",
      location: "",
      personalSlogan: "",
      selfIntroduction: "",
      personalUrl: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      github: "",
      discord: "",
      line: "",
      threads: "",
      hideConnectionsCount: false,
    },
  });

  // 當用戶資料載入完成時，更新表單預設值
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      const contactList = user.contactList;

      // 若 user 有設定 location，需等 citiesData 載入後才能解出 countryCode
      // 避免先以 country:"" 重置，導致城市 select 顯示空白
      if (user.location && isCitiesLoading) return;

      // 根據 location 找到對應的 countryCode
      let countryCode = "";
      if (user.location && citiesData?.data) {
        const city = citiesData.data.find((c) => c.code === user.location);
        if (city?.countryCode) {
          countryCode = city.countryCode;
        }
      }

      form.reset({
        photoURL: user.photoURL || "",
        name: user.name || "",
        customId: user.customId || "",
        country: countryCode,
        location: user.location || "",
        personalSlogan: user.personalSlogan || "",
        selfIntroduction: user.selfIntroduction || "",
        personalUrl: contactList?.website || "",
        facebook: contactList?.facebook || "",
        instagram: contactList?.instagram || "",
        linkedin: contactList?.linkedin || "",
        github: contactList?.github || "",
        discord: contactList?.discord || "",
        line: contactList?.line || "",
        threads: contactList?.threads || "",
        hideConnectionsCount:
          (user as { hideConnectionsCount?: boolean }).hideConnectionsCount ?? false,
      });
    }
  }, [userData, citiesData, form.reset]);

  const handleSubmit = async (values: PublicInfoFormValues) => {
    setIsSubmitting(true);

    try {
      // 準備 API 請求資料
      const updateData: {
        name?: string;
        customId?: string;
        location?: string;
        personalSlogan?: string;
        selfIntroduction?: string;
        hideConnectionsCount?: boolean;
        contactList?: {
          facebook?: string;
          instagram?: string;
          linkedin?: string;
          discord?: string;
          github?: string;
          website?: string;
          line?: string;
          threads?: string;
        };
      } = {};

      // 更新基本資訊
      if (values.name) {
        updateData.name = values.name;
      }

      // 更新 customId（如果改變了）
      const currentCustomId = userData?.data?.customId || "";
      if (values.customId && values.customId !== currentCustomId) {
        updateData.customId = values.customId;
      }

      if (values.location) {
        updateData.location = values.location;
      }

      if (values.personalSlogan) {
        updateData.personalSlogan = values.personalSlogan;
      }

      if (values.selfIntroduction) {
        updateData.selfIntroduction = values.selfIntroduction;
      }

      // 更新隱私設定
      updateData.hideConnectionsCount = values.hideConnectionsCount ?? false;

      // 更新社群連結（使用空字串以便後端清空欄位）
      updateData.contactList = {
        facebook: values.facebook,
        instagram: values.instagram,
        linkedin: values.linkedin,
        discord: values.discord,
        github: values.github,
        website: values.personalUrl,
        line: values.line,
        threads: values.threads,
      };

      // 調用 FormData API 更新用戶資訊（包含圖片上傳）
      const response = await updateCurrentUserWithFormData(updateData, avatarFile || undefined);

      // 立即重置表單狀態，在 SWR refetch 之前解除導航阻擋
      form.reset(form.getValues());
      setAvatarFile(null);
      toast.success(t("public_info_updated"));

      // 刷新用戶資料
      await mutate(["/api/v1/users/me"] as const);
      globalMutate("/api/v1/users/settings-summary");
      if (!applyOnboardingUpdateFromResponse(response)) {
        refreshOnboardingStatus();
      }
    } catch (error) {
      console.error("Failed to update user:", error);

      // 處理錯誤
      let errorMessage = t("update_failed_retry");

      if (error instanceof Error) {
        errorMessage = error.message;

        // 處理驗證錯誤詳情
        const errorWithDetails = error as Error & {
          details?: Array<{ path?: string; message?: string }>;
        };
        if (errorWithDetails.details && Array.isArray(errorWithDetails.details)) {
          errorWithDetails.details.forEach((detail) => {
            if (detail.path && detail.message) {
              // 將錯誤設置到對應的表單欄位
              const formFieldMap: Record<string, keyof PublicInfoFormValues> = {
                name: "name",
                photoURL: "photoURL",
                location: "location",
                personalSlogan: "personalSlogan",
                selfIntroduction: "selfIntroduction",
                customId: "customId",
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
          const firstDetail = errorWithDetails.details[0];
          if (firstDetail?.message) {
            errorMessage = firstDetail.message;
          }
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useNavigationBlockerEffect(form.formState.isDirty || !!avatarFile);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-dark">{t("loading")}</p>
      </div>
    );
  }

  // 錯誤狀態
  if (userError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red">{t("public_info_load_failed")}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <AvatarUploadSection
          form={form}
          avatarFile={avatarFile}
          onAvatarFileChange={setAvatarFile}
        />

        <BasicInfoSection form={form} initialCustomId={userData?.data?.customId || ""} />

        <IntroductionSection form={form} />

        <SocialLinksSection form={form} />

        <PrivacySection form={form} />

        {/* 儲存按鈕 */}
        <footer className="fixed bottom-20 left-0 right-0 z-20 flex justify-center gap-6 border-t border-light-gray bg-very-light-gray p-6 md:bottom-0">
          <Button
            type="submit"
            variant="orange"
            className="w-full sm:max-w-[288px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </footer>
      </form>
    </Form>
  );
};
