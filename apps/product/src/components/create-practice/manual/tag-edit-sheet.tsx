"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
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
import { useIsMobile } from "@daodao/shared";
import { Check, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PinList,
  type PinListItem,
} from "@daodao/ui/components/animate-ui/components/community/pin-list";

interface TagEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTags?: string[];
  initialKeyword?: string;
  onComplete: (data: TagEditData) => void;
}

export interface TagEditData {
  selectedTags: string[];
}

const AVAILABLE_TAGS = [
  "讀唇語",
  "講唇語",
  "教學閱讀策略",
  "諮詢患者改善聽力",
] as const;

// Zod schema for form validation
const tagEditFormSchema = z.object({
  keyword: z.string().default(""),
  selectedTags: z.array(z.string()).default([]),
});

type TagEditFormValues = z.infer<typeof tagEditFormSchema>;

export const TagEditSheet = ({
  open,
  onOpenChange,
  initialTags = [],
  initialKeyword = "",
  onComplete,
}: TagEditSheetProps) => {
  const isMobile = useIsMobile();

  const form = useForm<TagEditFormValues>({
    resolver: zodResolver(tagEditFormSchema),
    defaultValues: {
      keyword: initialKeyword,
      selectedTags: initialTags,
    },
  });

  // Reset form when initial values change
  React.useEffect(() => {
    form.reset({
      keyword: initialKeyword,
      selectedTags: initialTags,
    });
  }, [initialKeyword, initialTags, open]);

  const onSubmit = (values: TagEditFormValues) => {
    onComplete({
      selectedTags: values.selectedTags,
    });
    onOpenChange(false);
  };

  const handleAddCustomKeyword = () => {
    const keyword = form.getValues("keyword").trim();
    if (keyword && !form.getValues("selectedTags").includes(keyword)) {
      form.setValue("selectedTags", [
        ...form.getValues("selectedTags"),
        keyword,
      ]);
      form.setValue("keyword", "");
    }
  };

  const selectedTags = form.watch("selectedTags");

  // Convert tags to PinList items with stable IDs
  // Use useMemo to prevent recreating the array on every render
  const pinListItems: PinListItem[] = React.useMemo(() => {
    // Combine available tags and custom tags (selected tags that are not in AVAILABLE_TAGS)
    const customTags = selectedTags.filter(
      (tag) => !AVAILABLE_TAGS.includes(tag as (typeof AVAILABLE_TAGS)[number])
    );
    const allTags = [...AVAILABLE_TAGS, ...customTags];

    // Generate stable IDs based on tag name
    const tagToIdMap = new Map<string, number>();
    let idCounter = 1;
    allTags.forEach((tag) => {
      if (!tagToIdMap.has(tag)) {
        tagToIdMap.set(tag, idCounter++);
      }
    });

    return allTags.map((tag) => ({
      id: tagToIdMap.get(tag) ?? 0,
      name: tag,
      info: "",
      icon: Tag,
      pinned: selectedTags.includes(tag),
    }));
  }, [selectedTags]);

  const handleToggleTag = (item: PinListItem) => {
    const currentTags = form.getValues("selectedTags");
    if (item.pinned) {
      // Add tag
      if (!currentTags.includes(item.name)) {
        form.setValue("selectedTags", [...currentTags, item.name]);
      }
    } else {
      // Remove tag
      form.setValue(
        "selectedTags",
        currentTags.filter((t) => t !== item.name)
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-bg-dark">編輯標籤</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form className="flex-1 flex flex-col">
            <div className="flex-1 px-4">
              {/* Keyword Input */}
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem className="mb-8">
                    <FormLabel className="block text-base font-medium mb-3 text-text-dark">
                      關鍵字
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="輸入自訂關鍵字"
                        className="w-full"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomKeyword();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags List using PinList */}
              <div className="mb-16 md:mb-8">
                <PinList
                  items={pinListItems}
                  labels={{
                    pinned: "已選用標籤",
                    unpinned: "可用標籤",
                  }}
                  onItemToggle={handleToggleTag}
                  className="flex flex-col-reverse"
                  pinnedSectionClassName="bg-light-blue border border-blue rounded-lg p-3"
                />
              </div>
            </div>

            {/* Complete Button */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6">
              <Button
                type="button"
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
              >
                <Check className="size-4.5" />
                完成
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
