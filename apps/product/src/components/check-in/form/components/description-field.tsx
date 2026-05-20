import { useTranslations } from "@daodao/i18n";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Textarea } from "@daodao/ui/components/textarea";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormValuesType } from "../schema";

interface IDescriptionFieldProps {
  form: UseFormReturn<CheckInFormValuesType>;
  /** 插入在 label 和 textarea 之間的額外內容 */
  beforeTextarea?: ReactNode;
}

/**
 * 描述輸入欄位組件
 */
export const DescriptionField = ({ form, beforeTextarea }: IDescriptionFieldProps) => {
  const t = useTranslations("check_in");
  const descriptionLength = form.watch("description")?.length || 0;

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <FormLabel className="text-base font-medium text-text-dark">{t("description_label")}</FormLabel>

            <FormDescription className="text-sm text-light-gray">
              {descriptionLength}/300
            </FormDescription>
          </div>
          {beforeTextarea}
          <FormControl>
            <Textarea {...field} placeholder={t("description_placeholder")} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
