"use client";

import { checkCustomIdAvailability } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { DatePicker } from "@daodao/ui/components/date-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { differenceInYears } from "date-fns";
import { CheckCircleIcon, LoaderIcon, LockIcon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormValues } from "./schema";

interface ProfileSectionProps {
  form: UseFormReturn<OnboardingFormValues>;
}

/**
 * Onboarding Step 1: 個人資料區塊
 * 包含 email、生日、名字、username、個人標語欄位
 */
export const ProfileSection = ({ form }: ProfileSectionProps) => {
  const t = useTranslations("onboarding");

  // customId 即時檢查狀態
  const [customIdStatus, setCustomIdStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 生日驗證狀態
  const birthDate = form.watch("birthDate");
  const birthDateAge = birthDate ? differenceInYears(new Date(), birthDate) : null;
  const isBirthDateValid = birthDateAge === null || birthDateAge >= 16;

  // customId 即時檢查函數（debounced）
  const checkCustomId = useCallback(
    async (customId: string) => {
      // 清除之前的 timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // 如果是空的，不檢查
      if (!customId) {
        setCustomIdStatus("idle");
        return;
      }

      // 本地格式驗證
      const customIdRegex = /^[a-zA-Z0-9]+$/;
      if (customId.length < 3 || customId.length > 15 || !customIdRegex.test(customId)) {
        setCustomIdStatus("idle");
        return;
      }

      setCustomIdStatus("checking");

      // debounce 300ms
      checkTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await checkCustomIdAvailability(customId);

          // 檢查是否有錯誤
          if (response.error) {
            console.error("API error:", response.error);
            setCustomIdStatus("idle");
            return;
          }

          // 檢查可用性
          if (response.data?.data?.available) {
            setCustomIdStatus("available");
          } else {
            setCustomIdStatus("unavailable");
            form.setError("customId", {
              type: "server",
              message: t("steps.profile.usernameUnavailable"),
            });
          }
        } catch (err) {
          console.error("checkCustomIdAvailability error:", err);
          setCustomIdStatus("idle");
        }
      }, 300);
    },
    [form, t]
  );

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="text-center mb-8">
        <h1 className="heading-lg text-text-dark mb-2">{t("steps.profile.title")}</h1>
      </div>

      {/* Email (readonly) */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              {t("steps.profile.email")}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input {...field} readOnly disabled className="bg-very-light-gray pr-10" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <LockIcon className="size-4 text-light-gray" />
                </div>
              </div>
            </FormControl>
            <FormDescription className="text-xs text-light-gray mt-1">
              {t("steps.profile.emailLinked")}
            </FormDescription>
          </FormItem>
        )}
      />

      {/* 生日 */}
      <FormField
        control={form.control}
        name="birthDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              {t("steps.profile.birthDate")}
              <span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder={t("steps.profile.birthDatePlaceholder")}
                minDate={new Date(1900, 0, 1)}
                maxDate={new Date()}
                invalid={!isBirthDateValid}
              />
            </FormControl>
            {birthDate && (
              <FormDescription
                className={cn("text-xs mt-1", isBirthDateValid ? "text-green" : "text-red")}
              >
                {isBirthDateValid ? (
                  <>
                    <CheckCircleIcon className="size-3 inline mr-1" />
                    {t("steps.profile.ageValid")}
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-3 inline mr-1" />
                    {t("steps.profile.ageInvalid")}
                  </>
                )}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 名字 */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              {t("steps.profile.name")}
              <span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("steps.profile.namePlaceholder")}
                className={cn(form.formState.errors.name && "border-red focus-visible:border-red")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 使用者帳號 */}
      <FormField
        control={form.control}
        name="customId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              {t("steps.profile.username")}
              <span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-gray pointer-events-none">
                  @
                </span>
                <Input
                  {...field}
                  placeholder={t("steps.profile.usernamePlaceholder")}
                  className={cn(
                    "pl-10 pr-10 focus-visible:pl-[39px]",
                    form.formState.errors.customId && "border-red focus-visible:border-red",
                    customIdStatus === "available" && "border-green focus-visible:border-green"
                  )}
                  onChange={(e) => {
                    field.onChange(e);
                    // 當使用者輸入時，立即清除舊的驗證狀態
                    if (customIdStatus === "available" || customIdStatus === "unavailable") {
                      setCustomIdStatus("idle");
                      form.clearErrors("customId");
                    }
                    checkCustomId(e.target.value);
                  }}
                />
                {/* 狀態指示器 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {customIdStatus === "checking" && (
                    <LoaderIcon className="size-4 text-light-gray animate-spin" />
                  )}
                  {customIdStatus === "available" && (
                    <CheckCircleIcon className="size-4 text-green" />
                  )}
                  {customIdStatus === "unavailable" && <XCircleIcon className="size-4 text-red" />}
                </div>
              </div>
            </FormControl>
            <FormDescription className="text-xs text-light-gray mt-1">
              {t("steps.profile.usernameHint")}
              {customIdStatus === "available" && (
                <span className="text-green ml-1">
                  <CheckCircleIcon className="size-3 inline mr-1" />
                  {t("steps.profile.usernameValid")}
                </span>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 個人標語 */}
      <FormField
        control={form.control}
        name="personalSlogan"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              {t("steps.profile.bio")}
              <span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("steps.profile.bioPlaceholder")}
                className={cn(
                  "resize-none",
                  form.formState.errors.personalSlogan && "border-red focus-visible:border-red"
                )}
                rows={3}
              />
            </FormControl>
            <FormDescription className="text-xs text-light-gray mt-1 text-right">
              {(field.value || "").length}/150
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
