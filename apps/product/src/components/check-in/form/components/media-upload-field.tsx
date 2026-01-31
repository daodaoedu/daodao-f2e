import { FileUpload } from "@daodao/ui/components/file-upload";
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

interface IMediaUploadFieldProps {
  form: UseFormReturn<CheckInFormValuesType>;
}

/**
 * 媒體上傳欄位組件
 */
export const MediaUploadField = ({ form }: IMediaUploadFieldProps) => {
  const mediaLength = form.watch("media")?.length || 0;

  return (
    <FormField
      control={form.control}
      name="media"
      render={({ field }) => (
        <FormItem className="mb-16 md:mb-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <FormLabel className="block text-base font-medium text-text-dark">
              上傳照片或影片
            </FormLabel>

            <FormDescription className="text-sm text-light-gray">
              已上傳 {mediaLength}/3 張
            </FormDescription>
          </div>
          <FormControl>
            <FileUpload
              files={field.value}
              onFilesChange={field.onChange}
              accept="image/*,video/*"
              multiple
              maxFiles={3}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
