"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import DocSvg from "@/public/assets/icons/doc.svg";
import { resourceAPI } from "@/services/resources/core/api";
import {
  createResourceFormSchema,
  CreateResourceFormSchema,
} from "@/services/resources/core/schema";
import {
  resourceTypes,
  costTypes,
  targetAudienceTypes,
} from "@/features/resources/constants";
import { toast } from "sonner";
import { Background, Container, Paper } from "@/components/ui/wrapper";
import { BackButton } from "@/components/ui/back-button";
import { Text, Title } from "@/components/ui/typography";
import { UploadFile } from "@/components/ui/upload-file";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Progress } from "@/components/ui/progress";

export default function CreateResourcePage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateResourceFormSchema>({
    resolver: zodResolver(createResourceFormSchema),
    defaultValues: {
      name: "",
      url: "",
      imageUrl: "",
      description: "",
      videoUrl: "",
      type: "",
      level: "",
      cost: "",
      majorCategory: "",
      subCategory: "",
      tags: [],
    },
  });

  const onSubmit = async (formData: CreateResourceFormSchema) => {
    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        tags,
      };

      await resourceAPI.create("/resources", { arg: submitData });

      toast.success("資源分享成功！");

      router.push("/search");
    } catch (error) {
      console.error("提交資源時發生錯誤:", error);
      toast.error("提交失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Background>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Container>
            <BackButton label="返回" />

            <Title as="h1" size="xl" className="mt-3 mb-10">
              分享資源
            </Title>

            <Paper>
              <Title as="h2" size="lg" className="mb-2 text-center">
                主要資訊
              </Title>
              <Text size="lg" className="mb-10 text-basic-500 text-center">
                填寫相關資訊幫助其他人了解這個資源
              </Text>

              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="flex-[2]">
                    <FormLabel required>封面圖</FormLabel>
                    <UploadFile>
                      <Plus size={24} />
                      選擇封面
                    </UploadFile>
                  </div>

                  <div className="flex-[5] space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>資源名稱</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="資源名稱，最少需填入 5 個字元"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>資源連結</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="請輸入以 https:// 開頭的網址"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>介紹</FormLabel>
                      <FormControl>
                        <MarkdownEditor
                          placeholder="請簡單介紹這個資源的特色和適合對象"
                          maxLength={999}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>介紹影片</FormLabel>
                      <FormDescription>
                        關於這個資源的相關影片，可提供您製作的影片、或是來自資源作者的內容
                      </FormDescription>
                      <div className="flex gap-4">
                        <FormControl>
                          <Input
                            placeholder="複製 YouTube 影片網址"
                            {...field}
                          />
                        </FormControl>
                        <Button type="button" variant="outline">
                          <Plus size={15} />
                          嵌入
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel required>類別</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 mb-6">
                    <FormField
                      control={form.control}
                      name="majorCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>主分類</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="language">
                                語言與文學
                              </SelectItem>
                              <SelectItem value="math">數學與邏輯</SelectItem>
                              <SelectItem value="comsci">資訊與工程</SelectItem>
                              <SelectItem value="natusci">自然科學</SelectItem>
                              <SelectItem value="humanity">人文社會</SelectItem>
                              <SelectItem value="art">藝術與設計</SelectItem>
                              <SelectItem value="business">
                                商業與管理
                              </SelectItem>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>子分類</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!form.watch("majorCategory")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="請先選擇主分類" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch("majorCategory") === "language" && (
                                <>
                                  <SelectItem value="chinese">中文</SelectItem>
                                  <SelectItem value="english">英文</SelectItem>
                                  <SelectItem value="japanese">日文</SelectItem>
                                  <SelectItem value="other_language">
                                    其他語言
                                  </SelectItem>
                                </>
                              )}
                              {form.watch("majorCategory") === "comsci" && (
                                <>
                                  <SelectItem value="programming">
                                    程式設計
                                  </SelectItem>
                                  <SelectItem value="ai">人工智慧</SelectItem>
                                  <SelectItem value="data_science">
                                    資料科學
                                  </SelectItem>
                                  <SelectItem value="web_dev">
                                    網頁開發
                                  </SelectItem>
                                  <SelectItem value="app_dev">
                                    應用程式開發
                                  </SelectItem>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>資源類型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resourceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
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

                  <div className="flex items-center flex-wrap gap-3 mt-4">
                    <p className="body-md text-basic-500 shrink-0">
                      建議標籤：
                    </p>
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
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer bg-primary-lightest"
                          onClick={() => {
                            if (!tags.includes(tag)) {
                              const newTags = [...tags, tag];
                              setTags(newTags);
                              form.setValue("tags", newTags);
                            }
                          }}
                        >
                          # {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>費用</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {costTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>適合</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {targetAudienceTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
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
            </Paper>
          </Container>
          <footer className="sticky bottom-0 bg-basic-white py-4 shadow-2xl shadow-basic-300 z-10">
            <Container className="flex justify-end items-center gap-10">
              <div className="flex flex-1 body-md">
                <div className="flex-1 space-y-3">
                  <div>主要資訊</div>
                  <Progress className="rounded-r-none" value={1} />
                  <div className="body-sm">開始是成功的一半</div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>心得</div>
                  <Progress className="rounded-l-none border-l border-primary-base" />
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <DocSvg className="size-4" />
                  儲存草稿
                </Button>
                <Button size="lg" type="button" disabled={isSubmitting}>
                  <ArrowRight size={16} />
                  {isSubmitting ? "處理中..." : "下一步"}
                </Button>
              </div>
            </Container>
          </footer>
        </form>
      </Form>
    </Background>
  );
}
