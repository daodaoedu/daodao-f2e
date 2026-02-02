"use client";

import { useFormContext } from "react-hook-form";
import {
  costTypeOptions,
  resourceTypeOptions,
  targetAudienceTypeOptions,
} from "@/features/resources/constants";
import type { ResourceFormSchema } from "@/services/resources/core/schema";
import { Badge } from "@/shared/ui/badge";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

type ResourceCategorizationSchema = Pick<
  ResourceFormSchema,
  "type" | "level" | "cost" | "majorCategory" | "subCategory" | "tags"
>;

export default function ResourceCategorizationFields() {
  const form = useFormContext<ResourceCategorizationSchema>();

  return (
    <div className="space-y-10">
      <div>
        <FormLabel required>類別</FormLabel>
        <div className="mb-6 ml-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="majorCategory"
            render={({ field: { ref, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>主分類</FormLabel>
                <Select onValueChange={onChange} {...field}>
                  <FormControl>
                    <SelectTrigger ref={ref}>
                      <SelectValue placeholder="選擇" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="language">語言與文學</SelectItem>
                    <SelectItem value="math">數學與邏輯</SelectItem>
                    <SelectItem value="comsci">資訊與工程</SelectItem>
                    <SelectItem value="natusci">自然科學</SelectItem>
                    <SelectItem value="humanity">人文社會</SelectItem>
                    <SelectItem value="art">藝術與設計</SelectItem>
                    <SelectItem value="business">商業與管理</SelectItem>
                    <SelectItem value="health">健康與醫療</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subCategory"
            render={({ field: { ref, onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>子分類</FormLabel>
                <Select
                  onValueChange={onChange}
                  disabled={!form.watch("majorCategory")}
                  value={value ?? undefined}
                  {...field}
                >
                  <FormControl>
                    <SelectTrigger ref={ref}>
                      <SelectValue placeholder="請先選擇主分類" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {form.watch("majorCategory") === "language" && (
                      <>
                        <SelectItem value="chinese">中文</SelectItem>
                        <SelectItem value="english">英文</SelectItem>
                        <SelectItem value="japanese">日文</SelectItem>
                        <SelectItem value="other_language">其他語言</SelectItem>
                      </>
                    )}
                    {form.watch("majorCategory") === "comsci" && (
                      <>
                        <SelectItem value="programming">程式設計</SelectItem>
                        <SelectItem value="ai">人工智慧</SelectItem>
                        <SelectItem value="data_science">資料科學</SelectItem>
                        <SelectItem value="web_dev">網頁開發</SelectItem>
                        <SelectItem value="app_dev">應用程式開發</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="type"
        render={({ field: { ref, onChange, ...field } }) => (
          <FormItem>
            <FormLabel required>資源類型</FormLabel>
            <Select onValueChange={onChange} {...field}>
              <FormControl>
                <SelectTrigger ref={ref}>
                  <SelectValue placeholder="選擇" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {resourceTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel required>自訂標籤</FormLabel>
        <div className="mb-2">
          <Input placeholder="輸入自訂標籤後按 Enter 新增" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="body-md shrink-0 text-basic-500">建議標籤：</p>
          <div className="flex flex-wrap gap-2">
            {[
              "環保",
              "監控工具",
              "生產力工具",
              "AI工具",
              "自主學習",
              "程式設計",
              "資料科學",
              "語言學習",
            ].map((tag) => (
              <Badge key={tag} variant="outline" className="cursor-pointer bg-primary-lightest">
                # {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="cost"
        render={({ field: { ref, onChange, ...field } }) => (
          <FormItem>
            <FormLabel required>費用</FormLabel>
            <Select onValueChange={onChange} {...field}>
              <FormControl>
                <SelectTrigger ref={ref}>
                  <SelectValue placeholder="選擇" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {costTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="level"
        render={({ field: { ref, onChange, ...field } }) => (
          <FormItem>
            <FormLabel required>適合</FormLabel>
            <Select onValueChange={onChange} {...field}>
              <FormControl>
                <SelectTrigger ref={ref}>
                  <SelectValue placeholder="選擇" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {targetAudienceTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
