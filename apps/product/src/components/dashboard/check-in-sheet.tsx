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
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { Textarea } from "@daodao/ui/components/textarea";
import { FileUpload } from "@daodao/ui/components/file-upload";
import { cn } from "@daodao/ui/lib/utils";
import { useIsMobile } from "@daodao/shared";
import { Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
} from "@daodao/assets";

interface CheckInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  onComplete: (data: CheckInData) => void;
}

export interface CheckInData {
  mood: MoodType | null;
  tags: string[];
  thoughts: string;
  media: File[];
}

type MoodType =
  | "hopeless"
  | "frustrated"
  | "bored"
  | "neutral"
  | "fine"
  | "happy";

const MOOD_OPTIONS: Array<{
  id: MoodType;
  label: string;
  emoji: React.FC<React.SVGProps<SVGSVGElement>>;
}> = [
  { id: "hopeless", label: "想放棄", emoji: HopelessSvg },
  { id: "frustrated", label: "受挫", emoji: FrustratedSvg },
  { id: "bored", label: "無聊", emoji: BoredSvg },
  { id: "neutral", label: "普通", emoji: NeutralSvg },
  { id: "fine", label: "還不錯", emoji: FineSvg },
  { id: "happy", label: "開心", emoji: HappySvg },
];

const AVAILABLE_TAGS = [
  "練習",
  "新概念",
  "實作",
  "有趣",
  "創造",
  "困難",
  "刻意練習",
] as const;

// Zod schema for form validation
const checkInFormSchema = z.object({
  mood: z
    .enum(["hopeless", "frustrated", "bored", "neutral", "fine", "happy"])
    .nullable(),
  tags: z.array(z.string()).default([]),
  thoughts: z.string().default(""),
  media: z.array(z.instanceof(File)).default([]),
});

type CheckInFormValues = z.infer<typeof checkInFormSchema>;

export const CheckInSheet = ({
  open,
  onOpenChange,
  taskTitle,
  onComplete,
}: CheckInSheetProps) => {
  const isMobile = useIsMobile();

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      mood: null,
      tags: [],
      thoughts: "",
      media: [],
    },
  });


  const onSubmit = (values: CheckInFormValues) => {
    onComplete({
      mood: values.mood,
      tags: values.tags,
      thoughts: values.thoughts,
      media: values.media,
    });
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
          <SheetTitle>打卡</SheetTitle>
          <SheetDescription className="sr-only">
            記錄你的學習進度和心情
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6">
            {/* Activity Title */}
            <h2 className="text-md leading-8 font-medium text-bg-dark wrap-break-word mb-8">
              {taskTitle}
            </h2>

            {/* Mood Selection */}
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="block text-base font-medium mb-3 text-text-dark">
                    心情如何?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      className="flex justify-between"
                    >
                      {MOOD_OPTIONS.map(({ id, label, emoji: Emoji }) => {
                        const isSelected = field.value === id;
                        return (
                          <label
                            key={id}
                            className={cn(
                              "flex flex-col items-center gap-1 opacity-30 transition-opacity cursor-pointer",
                              isSelected &&  "opacity-100"
                            )}
                          >
                            <RadioGroupItem
                              value={id}
                              className="sr-only"
                              aria-label={label}
                            />
                            <Emoji className="size-12" />
                            <span className="text-xs text-gray-700">
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thought Sharing */}
            <div className="mb-8">
              <h3 className="text-base font-medium mb-3 text-text-dark">
                想法分享
              </h3>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-wrap gap-x-2 gap-y-3 mb-3">
                        {AVAILABLE_TAGS.map((tag) => {
                          const isSelected = field.value?.includes(tag);
                          return (
                            <div key={tag} className="flex items-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked: boolean) => {
                                  const currentTags = field.value || [];
                                  const newTags = checked
                                    ? [...currentTags, tag]
                                    : currentTags.filter(
                                        (t: string) => t !== tag
                                      );
                                  field.onChange(newTags);
                                }}
                                className="sr-only"
                              />
                              <label
                                className={cn(
                                  "px-5 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1 cursor-pointer",
                                  isSelected
                                    ? "bg-logo-cyan text-white border-logo-cyan"
                                    : "bg-white text-gray-700 border-logo-cyan hover:bg-logo-cyan/10"
                                )}
                                onClick={() => {
                                  const currentTags = field.value || [];
                                  const newTags = isSelected
                                    ? currentTags.filter(
                                        (t: string) => t !== tag
                                      )
                                    : [...currentTags, tag];
                                  field.onChange(newTags);
                                }}
                              >
                                <span>{tag}</span>
                                {isSelected && (
                                  <X
                                    className="size-4"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentTags = field.value || [];
                                      field.onChange(
                                        currentTags.filter(
                                          (t: string) => t !== tag
                                        )
                                      );
                                    }}
                                  />
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thoughts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">想法分享</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="分享一下你的心得,或是遇到的困難"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Media Upload */}
            <FormField
              control={form.control}
              name="media"
              render={({ field }) => (
                <FormItem className="mb-16 md:mb-8">
                  <FormLabel className="block text-base font-medium mb-3">
                    上傳照片或影片
                  </FormLabel>
                  <FormControl>
                    <FileUpload
                      files={field.value}
                      onFilesChange={field.onChange}
                      accept="image/*,video/*"
                      multiple
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Complete Button */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6 -mx-6 -mb-6">
              <Button type="submit" className="w-full">
                <Check className="size-4.5" />
                完成打卡
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
