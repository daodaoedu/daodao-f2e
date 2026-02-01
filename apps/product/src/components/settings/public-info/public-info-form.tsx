"use client";

import {
  useCurrentUser,
  useUserMutations,
  type UpdateUserRequest,
  setCurrentUserCustomId,
  uploadImage,
} from "@daodao/api";
import { Button } from "@daodao/ui/components/button";
import { Form } from "@daodao/ui/components/form";
import { useNavigationBlockerEffect } from "@daodao/ui/hooks/navigation-blocker";
import { toast } from "@daodao/ui/components/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AvatarUploadSection } from "./avatar-upload-section";
import { BasicInfoSection } from "./basic-info-section";
import { IntroductionSection } from "./introduction-section";
import { SocialLinksSection } from "./social-links-section";
import { type PublicInfoFormValues, publicInfoFormSchema } from "./schema";

export const PublicInfoForm = () => {
  const { data: userData, isLoading, error: userError } = useCurrentUser();
  const { updateCurrentUser } = useUserMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<PublicInfoFormValues>({
    resolver: zodResolver(publicInfoFormSchema),
    defaultValues: {
      photoURL: "",
      name: "",
      customId: "",
      location: "",
      personalSlogan: "",
      selfIntroduction: "",
      personalUrl: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      github: "",
      discord: "",
    },
  });

  // 當用戶資料載入完成時，更新表單預設值
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      const contactList = user.contactList;

      form.reset({
        photoURL: user.photoURL || "",
        name: user.name || "",
        customId: user.customId || "",
        location: user.location || "",
        personalSlogan: user.personalSlogan || "",
        selfIntroduction: user.selfIntroduction || "",
        personalUrl: "",
        facebook: contactList?.facebook || "",
        instagram: contactList?.instagram || "",
        linkedin: contactList?.linkedin || "",
        github: "", // API 中沒有此欄位
        discord: contactList?.discord || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleSubmit = async (values: PublicInfoFormValues) => {
    setIsSubmitting(true);

    try {
      // 先上傳頭像（如果有選擇新頭像）
      let photoURL = values.photoURL;
      if (avatarFile) {
        try {
          const uploadResponse = await uploadImage(avatarFile);
          if (uploadResponse.data?.url) {
            photoURL = uploadResponse.data.url;
          }
        } catch (error) {
          console.error("Failed to upload avatar:", error);
          toast.error("頭像上傳失敗，請稍後再試");
          setIsSubmitting(false);
          return;
        }
      }

      // 準備 API 請求資料
      const updateData: {
        name?: string;
        photoURL?: string;
        location?: string;
        personalSlogan?: string;
        selfIntroduction?: string;
        contactList?: {
          facebook?: string;
          instagram?: string;
          linkedin?: string;
          discord?: string;
          line?: string;
          threads?: string;
        };
      } = {};

      // 更新基本資訊
      if (values.name) {
        updateData.name = values.name;
      }

      if (photoURL) {
        updateData.photoURL = photoURL;
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

      // 更新 customId（如果改變了）
      const currentCustomId = userData?.data?.customId || "";
      if (values.customId && values.customId !== currentCustomId) {
        try {
          const customIdResponse = await setCurrentUserCustomId(values.customId);
          if (customIdResponse.error) {
            const error = customIdResponse.error;
            let errorMessage = "使用者 ID 設置失敗";

            if (typeof error === "object" && error !== null) {
              if ("message" in error && error.message) {
                errorMessage = String(error.message);
              }
            }

            toast.error(errorMessage);
            setIsSubmitting(false);
            return;
          }
        } catch (error) {
          console.error("Failed to set customId:", error);
          toast.error("使用者 ID 設置失敗，請稍後再試");
          setIsSubmitting(false);
          return;
        }
      }

      // 更新社群連結
      const contactList: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        discord?: string;
        line?: string;
        threads?: string;
      } = {};

      if (values.facebook) {
        contactList.facebook = values.facebook;
      }
      if (values.instagram) {
        contactList.instagram = values.instagram;
      }
      if (values.linkedin) {
        contactList.linkedin = values.linkedin;
      }
      if (values.discord) {
        contactList.discord = values.discord;
      }

      if (Object.keys(contactList).length > 0) {
        updateData.contactList = contactList;
      }

      // 調用 API 更新用戶資訊
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
      toast.success("公開資訊設定已更新");
      form.reset(form.getValues()); // 重置 dirty 狀態
      setAvatarFile(null); // 清除頭像檔案
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
        <AvatarUploadSection form={form} avatarFile={avatarFile} onAvatarFileChange={setAvatarFile} />

        <BasicInfoSection form={form} />

        <IntroductionSection form={form} />

        <SocialLinksSection form={form} />

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
