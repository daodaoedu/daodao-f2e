"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Button } from "@daodao/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { Textarea } from "@daodao/ui/components/textarea";
import { useIsMobile } from "@daodao/shared";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface CreateCustomPracticeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createPracticeFormSchema = z.object({
  title: z.string().min(1, "請輸入實踐名稱"),
  description: z.string().min(1, "請輸入實踐描述"),
  category: z.string().optional(),
});

type CreatePracticeFormValues = z.infer<typeof createPracticeFormSchema>;

export const CreateCustomPracticeSheet = ({
  open,
  onOpenChange,
}: CreateCustomPracticeSheetProps) => {
  const isMobile = useIsMobile();

  const form = useForm<CreatePracticeFormValues>({
    resolver: zodResolver(createPracticeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const onSubmit = (values: CreatePracticeFormValues) => {
    // TODO: 處理建立實踐的邏輯
    console.log("建立實踐:", values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>建立自己的實踐</SheetTitle>
          <SheetDescription className="sr-only">
            填寫實踐的詳細資訊
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 mt-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="block text-base font-medium mb-3 text-text-dark">
                    實踐名稱
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="例如：每天學習 React 1 小時"
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="block text-base font-medium mb-3 text-text-dark">
                    實踐描述
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="描述一下這個實踐的內容和目標..."
                      className="rounded-xl min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (Optional) */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="mb-16 md:mb-8">
                  <FormLabel className="block text-base font-medium mb-3 text-text-dark">
                    分類（選填）
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="例如：程式設計、設計、語言學習..."
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
              <Button type="submit" className="w-full">
                <Check className="size-4.5" />
                建立實踐
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

