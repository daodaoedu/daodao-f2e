"use client";

import {
  PinList,
  type PinListItem,
} from "@daodao/ui/components/animate-ui/components/community/pin-list";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export interface TagEditData {
  selectedTags: string[];
}

const SEARCH_TAGS: string[] = [];

// Zod schema for form validation
const tagEditFormSchema = z.object({
  keyword: z.string().default(""),
  selectedTags: z.array(z.string()).default([]),
});

type TagEditFormValues = z.infer<typeof tagEditFormSchema>;

/**
 * 編輯標籤 Sheet 的內容組件（不包含 Sheet 外層）
 * 可用於 SheetManager 通過 useTagEditSheet hook 使用
 */
export const TagEditSheetContent = ({
  initialTags = [],
  initialKeyword = "",
  onComplete,
  onClose,
}: {
  initialTags?: string[];
  initialKeyword?: string;
  onComplete: (data: TagEditData) => void;
  onClose?: () => void;
}) => {
  const form = useForm<TagEditFormValues>({
    resolver: zodResolver(tagEditFormSchema),
    defaultValues: {
      keyword: initialKeyword,
      selectedTags: initialTags,
    },
  });

  const keyword = form.watch("keyword");
  const selectedTags = form.watch("selectedTags");

  // Reset form when initial values change
  React.useEffect(() => {
    form.reset({
      keyword: initialKeyword,
      selectedTags: initialTags,
    });
  }, [initialKeyword, initialTags, form]);

  const onSubmit = (values: TagEditFormValues) => {
    onComplete({
      selectedTags: values.selectedTags,
    });
    onClose?.();
  };

  const pinListItems: PinListItem[] = React.useMemo(() => {
    const availableTags = SEARCH_TAGS.filter((tag) => !selectedTags.includes(tag));
    const allTags = [...availableTags, ...selectedTags];

    const keywordItem =
      keyword && !allTags.includes(keyword)
        ? {
            id: keyword,
            name: keyword,
            pinned: selectedTags.includes(keyword),
          }
        : null;

    const items: PinListItem[] = [];

    // Add keyword item if exists
    if (keywordItem) {
      items.push(keywordItem);
    }

    // Add other tags
    allTags.forEach((tag) => {
      items.push({
        id: tag,
        name: tag,
        pinned: selectedTags.includes(tag),
      });
    });

    return items;
  }, [selectedTags, keyword]);

  // Transform items to apply custom styles and adjust order
  const transformItems = React.useCallback(
    (items: PinListItem[]): PinListItem[] => {
      // Transform items: apply custom styles for keyword based on pinned state
      const transformed = items.map((item) => {
        // Check if this is the current keyword
        const isKeyword = keyword && item.name === keyword;

        if (isKeyword) {
          // If pinned, use default pinned style (no custom className)
          // If unpinned, use custom style for keyword
          return {
            ...item,
            className: item.pinned ? undefined : "bg-bg-gray border border-very-light-gray",
          };
        }

        return item;
      });

      // Separate items into pinned and unpinned groups
      const pinnedItems: PinListItem[] = [];
      const unpinnedItems: PinListItem[] = [];

      transformed.forEach((item) => {
        if (item.pinned) {
          pinnedItems.push(item);
        } else if (SEARCH_TAGS.includes(item.name) || (keyword && item.name === keyword)) {
          unpinnedItems.push(item);
        }
      });
      unpinnedItems.sort((a) => (a.name === keyword ? -1 : 1));

      return [...unpinnedItems, ...pinnedItems];
    },
    [keyword]
  );

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
    <Form {...form}>
      <form className="flex-1 h-full flex flex-col">
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
                  <Input {...field} placeholder="輸入自訂關鍵字" className="w-full" />
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
              unpinnedPlaceholder={<div className="text-light-gray bg-very-light-gray border border-bg-gray py-[50px] text-center">無符合標籤</div>}
              onItemToggle={handleToggleTag}
              transformItems={transformItems}
              className="flex flex-col-reverse"
              pinnedSectionClassName="bg-light-blue border border-blue rounded-lg p-3"
            />
          </div>
        </div>

        {/* Complete Button */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-light-gray bg-white p-6">
          <Button type="button" className="w-full" onClick={form.handleSubmit(onSubmit)}>
            <Check className="size-4.5" />
            完成
          </Button>
        </div>
      </form>
    </Form>
  );
};
