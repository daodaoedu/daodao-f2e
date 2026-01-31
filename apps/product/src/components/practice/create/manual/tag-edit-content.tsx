"use client";

import { suggestTags } from "@daodao/api";
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

  // Cache for tag suggestions to avoid re-fetching same keywords
  const tagCacheRef = React.useRef<Map<string, string[]>>(new Map());
  const [tagSuggestions, setTagSuggestions] = React.useState<string[]>([]);
  // Track the current keyword being queried to prevent race conditions
  const currentQueryKeywordRef = React.useRef<string>("");

  // Fetch tag suggestions when keyword exists
  const trimmedKeyword = keyword.trim();
  const shouldFetchSuggestions = trimmedKeyword.length > 0;

  // Fetch tag suggestions with debounce and cache check
  React.useEffect(() => {
    if (!shouldFetchSuggestions) {
      setTagSuggestions([]);
      currentQueryKeywordRef.current = "";
      return;
    }

    // Check cache first
    const cachedTags = tagCacheRef.current.get(trimmedKeyword);
    if (cachedTags) {
      setTagSuggestions(cachedTags);
      currentQueryKeywordRef.current = trimmedKeyword;
      return;
    }

    // Update current query keyword
    currentQueryKeywordRef.current = trimmedKeyword;

    // Debounce API call
    const timeoutId = setTimeout(async () => {
      // Double-check if keyword hasn't changed during debounce
      if (currentQueryKeywordRef.current !== trimmedKeyword) {
        return;
      }

      try {
        const response = await suggestTags({
          q: trimmedKeyword,
          limit: "20",
        });

        // Check if keyword still matches when response arrives (prevent race condition)
        if (currentQueryKeywordRef.current !== trimmedKeyword) {
          return;
        }

        if (response.data?.data && Array.isArray(response.data.data)) {
          const tagNames = response.data.data.map((tag: { name: string }) => tag.name);
          // Store in cache
          tagCacheRef.current.set(trimmedKeyword, tagNames);
          setTagSuggestions(tagNames);
        } else {
          setTagSuggestions([]);
        }
      } catch (error) {
        console.error("Failed to fetch tag suggestions:", error);
        // Only update state if keyword still matches
        if (currentQueryKeywordRef.current === trimmedKeyword) {
          setTagSuggestions([]);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      // If effect is cleaning up, mark that this query is no longer current
      if (currentQueryKeywordRef.current === trimmedKeyword) {
        currentQueryKeywordRef.current = "";
      }
    };
  }, [trimmedKeyword, shouldFetchSuggestions]);

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

  // Get available tags from API or cache
  const availableTagsFromAPI = React.useMemo(() => {
    if (trimmedKeyword.length > 0 && shouldFetchSuggestions) {
      return tagSuggestions;
    }
    return [];
  }, [trimmedKeyword, shouldFetchSuggestions, tagSuggestions]);

  const pinListItems: PinListItem[] = React.useMemo(() => {
    // Filter out already selected tags from available tags
    const availableTags = availableTagsFromAPI.filter((tag) => !selectedTags.includes(tag));
    const allTags = [...availableTags, ...selectedTags];

    // Create keyword item if keyword exists and is not in allTags
    const keywordItem =
      keyword.trim() && !allTags.includes(keyword.trim())
        ? {
            id: keyword.trim(),
            name: keyword.trim(),
            pinned: selectedTags.includes(keyword.trim()),
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
  }, [selectedTags, keyword, availableTagsFromAPI]);

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
        } else if (
          availableTagsFromAPI.includes(item.name) ||
          (keyword.trim() && item.name === keyword.trim())
        ) {
          unpinnedItems.push(item);
        }
      });
      unpinnedItems.sort((a) => (a.name === keyword.trim() ? -1 : 1));

      return [...unpinnedItems, ...pinnedItems];
    },
    [keyword, availableTagsFromAPI]
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
              unpinnedPlaceholder={
                <div className="text-light-gray bg-very-light-gray border border-bg-gray py-[50px] text-center">
                  無符合標籤
                </div>
              }
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
