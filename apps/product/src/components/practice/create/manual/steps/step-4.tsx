"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useCompositionState } from "@daodao/shared";
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
import type { ManualPracticeFormValues } from "../schema";
import { TagEditSheet } from "../tag-edit-sheet";

interface Step4Props {
  form: UseFormReturn<ManualPracticeFormValues>;
}

export const Step4 = ({ form }: Step4Props) => {
  const [isTagEditSheetOpen, setIsTagEditSheetOpen] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const nameComposition = useCompositionState();
  const urlComposition = useCompositionState();

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
                <Button
                  type="button"
                  onClick={() => setIsTagEditSheetOpen(true)}
                  className="w-full"
                >
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

            // 如果有輸入 URL，驗證 URL 格式和 HTTPS
            if (resourceUrl.trim()) {
              const trimmedUrl = resourceUrl.trim();
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

            const newResource = {
              id: Date.now().toString(),
              name: resourceName.trim(),
              url: resourceUrl.trim() || undefined,
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
                    maxLength={20}
                    onChange={(e) => setResourceName(e.target.value)}
                    {...nameComposition.compositionProps}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !nameComposition.isComposing) {
                        e.preventDefault();
                        handleAddResource();
                      }
                    }}
                  />
                  <Input
                    type="url"
                    placeholder="網址（選填），例如 https://www.google.com/"
                    className="w-full mb-3"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    {...urlComposition.compositionProps}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !urlComposition.isComposing) {
                        e.preventDefault();
                        handleAddResource();
                      }
                    }}
                  />
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
                          resource={{
                            id: resource.id,
                            name: resource.name,
                            url: resource.url,
                          }}
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

      <TagEditSheet
        open={isTagEditSheetOpen}
        onOpenChange={setIsTagEditSheetOpen}
        initialTags={form.watch("tags") || []}
        onComplete={(data) => form.setValue("tags", data.selectedTags)}
      />
    </div>
  );
};
