import { useTagPrompts } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CheckInFormValuesType } from "../schema";

const isHiddenTag = (tag: string) =>
  tag === "實作" || tag.trim().toLowerCase() === "practice";

interface ITagSelectorProps {
  form: UseFormReturn<CheckInFormValuesType>;
  /** API 無資料時的備用標籤列表（例如 mock 環境） */
  fallbackTags?: string[];
}

/**
 * 標籤選擇器組件
 */
export const TagSelector = ({ form, fallbackTags }: ITagSelectorProps) => {
  const t = useTranslations("check_in");
  const [customTagInput, setCustomTagInput] = useState("");
  const locale = useLocale();
  const tags = form.watch("tags");

  // 取得引導句列表（用於顯示標籤選項）
  const { data: tagPromptsData } = useTagPrompts({
    usageType: "checkin",
    locale: locale === "en" ? "en" : "zh-TW",
  });

  // 從引導句列表中提取標籤名稱（限制 8 個）
  const availableTagsFromApi = useMemo(() => {
    if (!tagPromptsData?.data) return [];
    return tagPromptsData.data
      .map((item: { tagName: string }) => item.tagName)
      .filter((tag) => !isHiddenTag(tag))
      .slice(0, 8);
  }, [tagPromptsData]);

  // API 無資料時使用 fallbackTags
  const baseTagList = (availableTagsFromApi.length > 0 ? availableTagsFromApi : (fallbackTags ?? []))
    .filter((tag) => !isHiddenTag(tag));

  // 合併 API 取得的標籤和使用者自訂的標籤
  const availableTags = useMemo(
    () => Array.from(new Set([...baseTagList, ...(tags || [])])),
    [baseTagList, tags]
  );

  const handleAddCustomTag = () => {
    const trimmedTag = customTagInput.trim();
    if (!trimmedTag) return;

    const currentTags = form.getValues("tags") || [];
    const tagExists = currentTags.includes(trimmedTag);

    if (!tagExists) {
      form.setValue("tags", [...currentTags, trimmedTag]);
    }
    setCustomTagInput("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => {
        const handleToggle = (tag: string) => {
          const currentTags = field.value || [];
          const isSelected = currentTags.includes(tag);
          const newTags = isSelected
            ? currentTags.filter((t: string) => t !== tag)
            : [...currentTags, tag];
          field.onChange(newTags);
        };

        return (
          <FormItem className="mb-3">
            <FormControl>
              <div>
                <div className="mb-3 flex flex-wrap gap-x-2 gap-y-2">
                  {availableTags.map((tag) => {
                    const isSelected = field.value?.includes(tag);
                    const checkboxId = `tag-${tag}`;
                    return (
                      <div key={tag} className="flex items-center">
                        <Checkbox id={checkboxId} checked={isSelected} className="sr-only" />
                        <label
                          htmlFor={checkboxId}
                          className={cn(
                            "flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
                            isSelected
                              ? "bg-logo-gray text-white border-logo-gray"
                              : "bg-white text-gray-700 border-logo-cyan hover:bg-logo-cyan/10"
                          )}
                          onClick={() => handleToggle(tag)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleToggle(tag);
                            }
                          }}
                        >
                          <span>{tag}</span>
                          {isSelected && (
                            <X
                              className="size-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentTags = field.value || [];
                                field.onChange(currentTags.filter((t: string) => t !== tag));
                              }}
                            />
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {/* 自訂標籤輸入框 */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder={t("custom_tag_placeholder")}
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="flex-1"
                    aria-label={t("custom_tag_placeholder")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="blue"
                    onClick={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                    aria-label={t("add_tag")}
                    className="h-8"
                  >
                    <Plus className="size-4" />
                    {t("add")}
                  </Button>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
