"use client";

import { checkCustomIdAvailability, useCities, useCountries } from "@daodao/api";
import { useLocale } from "@daodao/i18n";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { cn } from "@daodao/ui/lib/utils";
import { CheckCircleIcon, LoaderIcon, MapPin, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { PublicInfoFormValues } from "./schema";

interface IBasicInfoSectionProps {
  form: UseFormReturn<PublicInfoFormValues>;
  initialCustomId?: string;
}

export const BasicInfoSection = ({ form, initialCustomId }: IBasicInfoSectionProps) => {
  const locale = useLocale();
  const selectedCountry = form.watch("country");

  // customId 即時檢查狀態
  const [customIdStatus, setCustomIdStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 獲取國家列表
  const { data: countriesData, isLoading: isLoadingCountries } = useCountries();

  // 根據選擇的國家獲取城市列表（傳入 locale 以支援多語系）
  const { data: citiesData, isLoading: isLoadingCities } = useCities({
    country: selectedCountry || undefined,
    locale: locale === "en" ? "en" : "zh-TW",
  });

  const countries = (countriesData?.data ?? []).filter((c) => c.code);
  const cities = (citiesData?.data ?? []).filter((c) => c.code);

  // 當國家變更時，清空城市選擇
  const handleCountryChange = (value: string) => {
    form.setValue("country", value);
    form.setValue("location", "");
  };

  // customId 即時檢查函數（debounced）
  const checkCustomId = useCallback(
    async (customId: string) => {
      // 清除之前的 timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // 如果是空的或與原始值相同，不檢查
      if (!customId || customId === initialCustomId) {
        setCustomIdStatus("idle");
        return;
      }

      // 本地格式驗證（基本格式檢查）
      const customIdRegex = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$/i;
      if (customId.length < 3 || customId.length > 50 || !customIdRegex.test(customId)) {
        setCustomIdStatus("idle");
        return;
      }

      setCustomIdStatus("checking");

      // debounce 500ms
      checkTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await checkCustomIdAvailability(customId);

          // 檢查是否有錯誤
          if (response.error) {
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
              message: "此使用者 ID 已被使用",
            });
          }
        } catch (err) {
          console.error("checkCustomIdAvailability error:", err);
          setCustomIdStatus("idle");
        }
      }, 500);
    },
    [initialCustomId, form]
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
    <div className="bg-white rounded-xl p-4 space-y-4">
      {/* 名稱 */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              名稱<span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="請輸入公開顯示的名稱"
                className={cn(form.formState.errors.name && "border-red focus-visible:border-red")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 使用者 ID */}
      <FormField
        control={form.control}
        name="customId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">
              使用者 ID<span className="text-red ml-1">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder="請輸入使用者 ID"
                  className={cn(
                    "pr-10",
                    form.formState.errors.customId && "border-red focus-visible:border-red",
                    customIdStatus === "available" && "border-green focus-visible:border-green"
                  )}
                  onBlur={field.onBlur}
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
              ID 開頭及結尾僅可使用字符英文字母 (a-z) 與數字。中間可包含底線 (_) 與連字符 (-), 最少
              3 個字符, 最多 50 個字符。
              {customIdStatus === "available" && (
                <span className="text-green ml-1">✓ 此 ID 可以使用</span>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 居住地 - 國家 */}
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">居住地</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-light-gray z-10" />
                <Select
                  value={field.value || ""}
                  onValueChange={handleCountryChange}
                  disabled={field.disabled || isLoadingCountries}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-10 pl-11 pr-4 py-2 text-left font-normal text-sm",
                      "border border-bg-gray hover:border-logo-cyan bg-background rounded-lg",
                      "focus-visible:border-2 focus-visible:border-logo-cyan focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#DEF5F5]",
                      form.formState.errors.country && "border-red",
                      "disabled:cursor-not-allowed disabled:border-bg-gray disabled:bg-very-light-gray",
                      "data-placeholder:text-light-gray"
                    )}
                    aria-invalid={!!form.formState.errors.country}
                  >
                    <SelectValue placeholder={isLoadingCountries ? "載入中..." : "請選擇國家"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {locale === "en" ? country.nameEn || country.name : country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 居住地 - 城市 */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-light-gray z-10" />
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    field.onBlur();
                  }}
                  disabled={field.disabled || !selectedCountry || isLoadingCities}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-10 pl-11 pr-4 py-2 text-left font-normal text-sm",
                      "border border-bg-gray hover:border-logo-cyan bg-background rounded-lg",
                      "focus-visible:border-2 focus-visible:border-logo-cyan focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#DEF5F5]",
                      form.formState.errors.location && "border-red",
                      "disabled:cursor-not-allowed disabled:border-bg-gray disabled:bg-very-light-gray",
                      "data-placeholder:text-light-gray"
                    )}
                    aria-invalid={!!form.formState.errors.location}
                  >
                    <SelectValue
                      placeholder={
                        !selectedCountry
                          ? "請先選擇國家"
                          : isLoadingCities
                            ? "載入中..."
                            : "請選擇城市"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
