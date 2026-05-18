"use client";

import { extractOgImage } from "@daodao/api";
import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
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
  const t = useTranslations("practice");
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
          message: t("practice.step4_fetch_not_found"),
        });
      }
    } catch {
      form.setError("resources", {
        type: "manual",
        message: t("practice.step4_fetch_failed"),
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
            <FormLabel className="block text-base font-normal text-text-dark mb-3">{t("practice.step4_tags_label")}</FormLabel>
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
                  {t("practice.step4_tags_edit")}
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
                    message: t("practice.step4_url_https_required"),
                  });
                  return;
                }
              } catch {
                form.setError("resources", {
                  type: "manual",
                  message: t("practice.step4_url_invalid"),
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
                message: trimmedUrl
                  ? t("practice.step4_resource_duplicate_url")
                  : t("practice.step4_resource_duplicate_name"),
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
                {t("practice.step4_resources_label")}
              </FormLabel>
              <FormDescription className="border border-blue bg-light-blue text-sm text-text-dark p-3 rounded-lg mb-4">
                {t("practice.step4_resources_description")}
              </FormDescription>
              <FormControl>
                <div>
                  <Input
                    placeholder={t("practice.step4_resource_name_placeholder")}
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
                      placeholder={t("practice.step4_resource_url_placeholder")}
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
                        {isFetchingTitle ? t("practice.step4_fetching") : t("practice.step4_fetch_title")}
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
                    {t("practice.step4_add_resource")}
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
