import { useTagPrompts } from "@daodao/api";
import { useLocale } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTagPrompt } from "../hooks/use-tag-prompt";
import type { CheckInFormValuesType } from "../schema";

interface ITagSelectorProps {
  form: UseFormReturn<CheckInFormValuesType>;
}

/**
 * 標籤選擇器組件
 */
export const TagSelector = ({ form }: ITagSelectorProps) => {
  const [customTagInput, setCustomTagInput] = useState("");
  const [promptEnabled, setPromptEnabled] = useState(false);
  const locale = useLocale();
  const tags = form.watch("tags");
  const { fetchAndAddPrompt } = useTagPrompt(form);

  // 取得引導句列表（用於顯示標籤選項）
  const { data: tagPromptsData } = useTagPrompts({
    usageType: "checkin",
    locale: locale === "en" ? "en" : "zh-TW",
  });

  // 從引導句列表中提取標籤名稱（限制 8 個）
  const availableTagsFromApi = useMemo(() => {
    if (!tagPromptsData?.data) return [];
    return tagPromptsData.data.map((item: { tagName: string }) => item.tagName).slice(0, 8);
  }, [tagPromptsData]);

  // 合併 API 取得的標籤和使用者自訂的標籤
  const availableTags = useMemo(
    () => Array.from(new Set([...availableTagsFromApi, ...(tags || [])])),
    [availableTagsFromApi, tags]
  );

  const handleAddCustomTag = async () => {
    const trimmedTag = customTagInput.trim();
    if (!trimmedTag) return;

    const currentTags = form.getValues("tags") || [];
    const tagExists = currentTags.includes(trimmedTag);

    if (!tagExists) {
      form.setValue("tags", [...currentTags, trimmedTag]);
      if (promptEnabled) {
        await fetchAndAddPrompt(trimmedTag);
      }
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
        const handleToggle = async (tag: string) => {
          const currentTags = field.value || [];
          const isSelected = currentTags.includes(tag);
          const newTags = isSelected
            ? currentTags.filter((t: string) => t !== tag)
            : [...currentTags, tag];
          field.onChange(newTags);

          // 當選中標籤且引導句開啟時，取得該標籤的引導句並更新 description
          if (!isSelected && promptEnabled) {
            await fetchAndAddPrompt(tag);
          }
        };

        return (
          <FormItem className="mb-3">
            <FormControl>
              <div>
                {/* 引導句開關 */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={promptEnabled}
                    onClick={() => setPromptEnabled((v) => !v)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      promptEnabled ? "bg-logo-gray" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                        promptEnabled ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className="text-sm text-gray-500">引導句</span>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-3 mb-3">
                  {availableTags.map((tag) => {
                    const isSelected = field.value?.includes(tag);
                    const checkboxId = `tag-${tag}`;
                    return (
                      <div key={tag} className="flex items-center">
                        <Checkbox id={checkboxId} checked={isSelected} className="sr-only" />
                        <label
                          htmlFor={checkboxId}
                          className={cn(
                            "px-5 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1 cursor-pointer",
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
                    placeholder="輸入自訂標籤"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="flex-1"
                    aria-label="輸入自訂標籤"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="blue"
                    onClick={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                    aria-label="加入標籤"
                    className="h-8"
                  >
                    <Plus className="size-4" />
                    加入
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
