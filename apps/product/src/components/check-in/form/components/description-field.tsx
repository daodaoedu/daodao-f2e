import { Textarea } from "@daodao/ui/components/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormValuesType } from "../schema";

interface IDescriptionFieldProps {
  form: UseFormReturn<CheckInFormValuesType>;
}

/**
 * 描述輸入欄位組件
 */
export const DescriptionField = ({ form }: IDescriptionFieldProps) => {
  const descriptionLength = form.watch("description")?.length || 0;

  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <FormLabel className="text-sm text-text-dark font-normal">
              詳細描述
            </FormLabel>

            <FormDescription className="text-sm text-light-gray">
              {descriptionLength}/300
            </FormDescription>
          </div>
          <FormControl>
            <Textarea
              {...field}
              placeholder="簡單紀錄今天的發現，或卡關的地方"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
