"use client";

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
import { Calendar, Mail } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { AccountFormValues } from "./schema";

type SelectOption = {
  value: string;
  label: string;
};

interface PersonalInfoSectionProps {
  form: UseFormReturn<AccountFormValues>;
  roleOptions: readonly SelectOption[];
  educationStageOptions: readonly SelectOption[];
}

export const PersonalInfoSection = ({
  form,
  roleOptions,
  educationStageOptions,
}: PersonalInfoSectionProps) => {
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
                    placeholder="Email"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* 身份 */}
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block font-medium text-text-dark mb-3">身份</FormLabel>
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
                    form.formState.errors.role && "border-red",
                    "disabled:cursor-not-allowed disabled:border-bg-gray disabled:bg-very-light-gray",
                    "data-placeholder:text-light-gray"
                  )}
                  aria-invalid={!!form.formState.errors.role}
                >
                  <SelectValue placeholder="請選擇身份" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
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
