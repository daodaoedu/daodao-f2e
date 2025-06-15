"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DocSvg from "@/public/assets/icons/doc.svg";
import { Checkbox } from "@/components/ui/checkbox";
import { Background, Container, Paper } from "@/components/ui/wrapper";
import { BackButton } from "@/components/ui/back-button";
import { Text, Title } from "@/components/ui/typography";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Progress } from "@/components/ui/progress";
import { mutations } from "@/utils/http";
import {
  createResourceReviewFormSchema,
  CreateResourceReviewFormSchema,
} from "@/services/resources/reviews/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rating } from "@/components/ui/rating";
import { MultipleSelector, Option } from "@/components/ui/multiple-selector";

const resourceUsageOptions: Option[] = [
  {
    value: "withOnlineCourses",
    label: "是，搭配線上課程",
  },
  {
    value: "withBooks",
    label: "是，搭配相關書籍",
  },
  {
    value: "withOtherTools",
    label: "是，搭配相關工具",
  },
  {
    value: "withCommunity",
    label: "是，參與了社群或討論",
  },
  {
    value: "onlyThisResource",
    label: "否，僅使用該資源",
  },
  {
    value: "notApplicableResource",
    label: "不適用",
  },
];

export default function ReviewResourcePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateResourceReviewFormSchema>({
    resolver: zodResolver(createResourceReviewFormSchema),
    defaultValues: {
      content: "",
      overallImpact: 0,
      changeMindset: 0,
      solveProblems: 0,
      gainPerspectives: 0,
      achieveGoals: 0,
      timeUsage: "",
      contentFeatures: {
        wellStructured: false,
        practiceFocused: false,
        wellRoundedConcepts: false,
        thoughtProvoking: false,
        progressiveLearning: false,
        problemBased: false,
        realWorldExamples: false,
        interactive: false,
        visuallyRich: false,
      },
      resourceUsage: {
        withOtherTools: false,
        withCommunity: false,
        withOnlineCourses: false,
        withBooks: false,
        onlyThisResource: false,
        notApplicableResource: false,
      },
      tags: [],
    },
  });

  const onSubmit = async (formData: CreateResourceReviewFormSchema) => {
    try {
      setIsSubmitting(true);

      // 假設這裡會將心得與前一頁的資源資料一起提交
      await mutations.post("/resources/reviews", { arg: formData });

      toast.success("資源心得分享成功！");

      router.push("/search");
    } catch (error) {
      console.error("提交資源心得時發生錯誤:", error);
      toast.error("提交失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevStep = () => {
    router.back();
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
                心得
              </Title>
              <Text size="lg" className="mb-10 text-basic-500 text-center">
                分享心得讓其他人更了解這個資源
              </Text>

              <div className="space-y-10">
                <div>
                  <FormLabel required>影響力指標</FormLabel>

                  <div className="flex flex-wrap gap-x-3 gap-y-6 p-6 border border-solid border-basic-100 rounded-lg">
                    <FormField
                      control={form.control}
                      name="overallImpact"
                      render={({ field }) => (
                        <FormItem className="basis-full">
                          <div className="flex flex-col justify-center items-center">
                            <FormLabel className="body-md mb-2">
                              綜合影響力
                            </FormLabel>
                            <FormControl>
                              <Rating
                                value={field.value}
                                onValueChange={field.onChange}
                                max={5}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="changeMindset"
                      render={({ field }) => (
                        <FormItem className="flex-1 basis-2/5">
                          <div className="flex items-center gap-3 mb-2">
                            <FormLabel className="flex-1 body-md text-right mb-0">
                              改變思維方式
                            </FormLabel>
                            <FormControl className="flex-1">
                              <Rating
                                value={field.value}
                                onValueChange={field.onChange}
                                max={5}
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="body-sm mb-0 text-center">
                            改變看事情的方式，形成了新的思維模式
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gainPerspectives"
                      render={({ field }) => (
                        <FormItem className="flex-1 basis-2/5">
                          <div className="flex items-center gap-3 mb-2">
                            <FormLabel className="flex-1 body-md text-right mb-0">
                              獲得新觀點
                            </FormLabel>
                            <FormControl className="flex-1">
                              <Rating
                                value={field.value}
                                onValueChange={field.onChange}
                                max={5}
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="body-sm mb-0 text-center">
                            獲得新知識或視野，豐富了理解基礎
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="solveProblems"
                      render={({ field }) => (
                        <FormItem className="flex-1 basis-2/5">
                          <div className="flex items-center gap-3 mb-2">
                            <FormLabel className="flex-1 body-md text-right mb-0">
                              解決實際問題
                            </FormLabel>
                            <FormControl className="flex-1">
                              <Rating
                                value={field.value}
                                onValueChange={field.onChange}
                                max={5}
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="body-sm mb-0 text-center">
                            解決真實問題或提供實戰觀點
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="achieveGoals"
                      render={({ field }) => (
                        <FormItem className="flex-1 basis-2/5">
                          <div className="flex items-center gap-3 mb-2">
                            <FormLabel className="flex-1 body-md text-right mb-0">
                              達成具體目標
                            </FormLabel>
                            <FormControl className="flex-1">
                              <Rating
                                value={field.value}
                                onValueChange={field.onChange}
                                max={5}
                              />
                            </FormControl>
                          </div>
                          <FormDescription className="body-sm mb-0 text-center">
                            應用所學的知識和技巧，實現預定的目標
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>內容</FormLabel>
                      <FormControl>
                        <MarkdownEditor
                          placeholder="最少需填入 20 個字元"
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
                  name="contentFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>內容特色</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                        {(
                          [
                            { id: "wellStructured", label: "結構清晰" },
                            {
                              id: "practiceFocused",
                              label: "實用導向",
                            },
                            {
                              id: "wellRoundedConcepts",
                              label: "觀念完整",
                            },
                            {
                              id: "thoughtProvoking",
                              label: "靈感啟發",
                            },
                            { id: "progressiveLearning", label: "循序漸進" },
                            { id: "problemBased", label: "問題導向" },
                            { id: "realWorldExamples", label: "具體案例" },
                            { id: "interactive", label: "具互動性" },
                            { id: "visuallyRich", label: "圖文並茂" },
                          ] as const
                        ).map((item) => (
                          <FormItem
                            key={item.id}
                            className="flex items-center border border-solid border-basic-200 rounded-lg relative gap-2 m-0"
                          >
                            <FormLabel
                              className="cursor-pointer flex-1 m-0 p-3 flex items-center gap-2"
                              htmlFor={item.id}
                            >
                              <FormControl>
                                <Checkbox
                                  id={item.id}
                                  checked={field.value[item.id] ?? false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange({
                                        ...field.value,
                                        [item.id]: true,
                                      });
                                    } else {
                                      field.onChange({
                                        ...field.value,
                                        [item.id]: false,
                                      });
                                    }
                                  }}
                                />
                              </FormControl>
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel required>怎麼使用</FormLabel>
                  <div className="ml-6 mb-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="timeUsage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>時間運用方式</FormLabel>
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
                              {[
                                {
                                  id: "daily",
                                  label: "每天學習 1-2 小時",
                                },
                                {
                                  id: "weekly",
                                  label: "每週集中學習幾天",
                                },
                                {
                                  id: "fragmented",
                                  label: "利用碎片時間學習",
                                },
                                {
                                  id: "notApplicable",
                                  label: "不適用",
                                },
                              ].map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.label}
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
                      name="resourceUsage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>能否搭配運用資源</FormLabel>
                          <MultipleSelector
                            defaultOptions={resourceUsageOptions}
                            onChange={(options) =>
                              field.onChange(
                                options.reduce((acc, option) => {
                                  acc[option.value] = true;
                                  return acc;
                                }, {} as Record<string, boolean>)
                              )
                            }
                            value={Object.entries(field.value)
                              .map(([key, value]) =>
                                resourceUsageOptions.find(
                                  (option) => option.value === key && value
                                )
                              )
                              .filter((option) => option !== undefined)}
                            emptyIndicator="沒資料"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </Paper>
          </Container>
          <footer className="sticky bottom-0 bg-basic-white py-4 shadow-2xl shadow-basic-300 z-10">
            <Container className="flex justify-end items-center gap-10">
              <div className="flex flex-1 body-md">
                <div className="flex-1 space-y-3">
                  <div>主要資訊</div>
                  <Progress className="rounded-r-none" value={100} />
                  <div className="body-sm">就快完成了</div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>心得</div>
                  <Progress
                    className="rounded-l-none border-l border-primary-base"
                    value={1}
                  />
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handlePrevStep}
                >
                  <ArrowLeft size={16} />
                  上一步
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <DocSvg className="size-4" />
                  儲存草稿
                </Button>
                <Button size="lg" type="submit" disabled={isSubmitting}>
                  <Check size={16} />
                  {isSubmitting ? "處理中..." : "完成"}
                </Button>
              </div>
            </Container>
          </footer>
        </form>
      </Form>
    </Background>
  );
}
