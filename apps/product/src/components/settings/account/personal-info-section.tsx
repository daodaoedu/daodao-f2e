"use client";

import { useCities, useCountries } from "@daodao/api";
import { useLocale } from "@daodao/i18n";
import {
  FormControl,
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
import { format } from "date-fns";
import { Calendar, Mail, MapPin } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { AccountFormValues } from "./schema";

type SelectOption = {
  value: string;
  label: string;
};

interface PersonalInfoSectionProps {
  form: UseFormReturn<AccountFormValues>;
  educationStageOptions: readonly SelectOption[];
}

export const PersonalInfoSection = ({
  form,
  educationStageOptions,
}: PersonalInfoSectionProps) => {
  const locale = useLocale();
  const selectedCountry = form.watch("country");

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

  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      {/* Email */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">Email</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-light-gray" />
                <Input
                  {...field}
                  disabled
                  className="pl-11 bg-very-light-gray"
                  placeholder="Email"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 生日 */}
      <FormField
        control={form.control}
        name="birthday"
        render={({ field }) => {
          const date = field.value;

          return (
            <FormItem>
              <FormLabel className="block font-medium text-text-dark mb-3">生日</FormLabel>
              <FormControl>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-light-gray" />
                  <Input
                    {...field}
                    value={date ? format(date, "yyyy/MM/dd") : ""}
                    disabled
                    className="pl-11 bg-very-light-gray"
                    placeholder="尚未設定"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
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
                        {locale === "en" ? (country.nameEn || country.name) : country.name}
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

      {/* 教育階段 */}
      <FormField
        control={form.control}
        name="educationStage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">教育階段</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  field.onBlur();
                }}
                disabled={field.disabled}
              >
                <SelectTrigger
                  className={cn(
                    "w-full h-10 px-4 py-2 text-left font-normal text-sm",
                    "border border-bg-gray hover:border-logo-cyan bg-background rounded-lg",
                    "focus-visible:border-2 focus-visible:border-logo-cyan focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#DEF5F5]",
                    form.formState.errors.educationStage && "border-red",
                    "disabled:cursor-not-allowed disabled:border-bg-gray disabled:bg-very-light-gray",
                    "data-placeholder:text-light-gray"
                  )}
                  aria-invalid={!!form.formState.errors.educationStage}
                >
                  <SelectValue placeholder="請選擇教育階段" />
                </SelectTrigger>
                <SelectContent>
                  {educationStageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
