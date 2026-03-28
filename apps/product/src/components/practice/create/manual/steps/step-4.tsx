"use client";

import { extractOgImage } from "@daodao/api";
import { ArrowRightOutlineSvg } from "@daodao/assets";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ResourceCard } from "@/components/practice/shared";
import { useTagEditSheet } from "@/hooks/use-tag-edit-sheet";
import type { ManualPracticeFormValues } from "../schema";

interface Step4Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step4 = ({ form }: Step4Props) => {
  const [resourceName, setResourceName] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);

  const handleFetchTitle = async () => {
    const trimmedUrl = resourceUrl.trim();
    if (!trimmedUrl) return;

    // 先驗證 URL 格式，避免送出無效請求
    try {
      new URL(trimmedUrl);
    } catch {
      return;
    }

    setIsFetchingTitle(true);
    try {
      // 使用 og-image API 擷取頁面標題（title 為選填欄位）
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      );
      const result = await Promise.race([extractOgImage({ url: trimmedUrl }), timeout]);
      if (result.success && result.data.title) {
        setResourceName(result.data.title.slice(0, 100));
      } else {
        form.setError("resources", {
          type: "manual",
          message: "找不到網頁標題，請手動輸入",
        });
      }
    } catch {
      form.setError("resources", {
        type: "manual",
        message: "擷取網頁標題失敗，請手動輸入",
      });
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const { openTagEditSheet } = useTagEditSheet({
    initialTags: form.watch("tags") || [],
    onComplete: (data) => {
      form.setValue("tags", data.selectedTags);
    },
  });

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="block text-base font-normal text-text-dark mb-3">標籤</FormLabel>
            <FormControl>
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(field.value || []).map((tag) => (
                    <Badge key={tag} variant="outline-blue" size="lg" className="rounded-lg">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button type="button" onClick={openTagEditSheet} className="w-full">
                  編輯
                  <ArrowRightOutlineSvg className="size-4.5" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="resources"
        render={({ field }) => {
          const resources = field.value || [];

          const handleAddResource = () => {
            if (!resourceName.trim()) {
              return;
            }

            const trimmedName = resourceName.trim();
            const trimmedUrl = resourceUrl.trim();

            // 如果有輸入 URL，驗證 URL 格式和 HTTPS
            if (trimmedUrl) {
              try {
                const url = new URL(trimmedUrl);
                if (url.protocol !== "https:") {
                  form.setError("resources", {
                    type: "manual",
                    message: "網址必須使用 HTTPS",
                  });
                  return;
                }
              } catch {
                form.setError("resources", {
                  type: "manual",
                  message: "請輸入有效的網址",
                });
                return;
              }
            }

            // 檢查是否已存在相同的資源
            // 如果有 URL：檢查 URL 是否已存在（URL 是唯一標識）
            // 如果沒有 URL：檢查名稱是否已存在（名稱是唯一標識）
            const isDuplicate = resources.some((resource) => {
              if (trimmedUrl) {
                // 有 URL 時，比較 URL（忽略大小寫和尾部斜線）
                return (
                  resource.url &&
                  resource.url.toLowerCase().replace(/\/$/, "") ===
                    trimmedUrl.toLowerCase().replace(/\/$/, "")
                );
              }
              // 沒有 URL 時，比較名稱（忽略大小寫和首尾空白）
              return resource.name.toLowerCase().trim() === trimmedName.toLowerCase();
            });

            if (isDuplicate) {
              form.setError("resources", {
                type: "manual",
                message: trimmedUrl ? "此網址的資源已經添加過了" : "此名稱的資源已經添加過了",
              });
              return;
            }

            const newResource = {
              id: Date.now().toString(),
              name: trimmedName,
              url: trimmedUrl || undefined,
            };

            field.onChange([...resources, newResource]);
            setResourceName("");
            setResourceUrl("");
            form.clearErrors("resources");
          };

          const handleRemoveResource = (id: string) => {
            field.onChange(resources.filter((r) => r.id !== id));
          };

          return (
            <FormItem>
              <FormLabel className="block text-base font-normal text-text-dark mb-3">
                使用的資源
              </FormLabel>
              <FormDescription className="border border-blue bg-light-blue text-sm text-text-dark p-3 rounded-lg mb-4">
                你的練習會用到什麼參考資料、課程或教學呢？
                <br />
                歡迎分享出來，讓更多人在旅途中不迷路✨
              </FormDescription>
              <FormControl>
                <div>
                  <Input
                    placeholder="資源名稱"
                    className="w-full mb-3"
                    value={resourceName}
                    maxLength={100}
                    onChange={(e) => setResourceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddResource();
                      }
                    }}
                  />
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="url"
                      placeholder="網址（選填），例如 https://www.google.com/"
                      className="flex-1"
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddResource();
                        }
                      }}
                    />
                    {resourceUrl.trim() && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFetchTitle}
                        disabled={isFetchingTitle}
                        className="shrink-0"
                      >
                        {isFetchingTitle ? "擷取中..." : "擷取名稱"}
                      </Button>
                    )}
                  </div>
                  <FormMessage className="mb-3" />
                  <Button
                    type="button"
                    onClick={handleAddResource}
                    className="w-full mb-5"
                    disabled={!resourceName.trim()}
                  >
                    新增
                    <ArrowRightOutlineSvg className="size-4.5" />
                  </Button>
                  {resources.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {resources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          onRemove={() => handleRemoveResource(resource.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>
          );
        }}
      />
    </div>
  );
};
