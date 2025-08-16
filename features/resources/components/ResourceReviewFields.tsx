'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Text, Title } from '@/components/ui/typography';
import {
  ResourceFormSchema,
  ResourceReviewFormSchema,
} from '@/services/resources';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Rating } from '@/components/ui/rating';
import { MultipleSelector } from '@/components/ui/multiple-selector';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  contentFeaturesOptions,
  resourceUsageOptions,
  timeUsageOptions,
} from '@/features/resources';

type ResourceReviewSchema = Pick<ResourceFormSchema, 'review'>;

interface ResourceReviewFieldsProps {
  isReviewNested?: boolean;
}

export default function ResourceReviewFields({
  isReviewNested = false,
}: ResourceReviewFieldsProps) {
  const form = useFormContext<
    ResourceReviewFormSchema | ResourceReviewSchema
  >();

  const prefixKey = isReviewNested ? 'review.' : '';

  return (
    <>
      <Title as="h2" size="lg" className="mb-2 text-center">
        心得
      </Title>
      <Text size="lg" className="mb-10 text-center text-basic-500">
        分享心得讓其他人更了解這個資源
      </Text>

      <div className="space-y-10">
        <div>
          <FormLabel required>影響力指標</FormLabel>

          <div className="flex flex-wrap gap-x-3 gap-y-6 rounded-lg border border-solid border-basic-100 p-6">
            <FormField
              control={form.control}
              name={`${prefixKey}overallImpact`}
              render={({ field }) => (
                <FormItem className="basis-full">
                  <div className="flex flex-col items-center justify-center">
                    <FormLabel className="body-md mb-2">綜合影響力</FormLabel>
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
              name={`${prefixKey}changeMindset`}
              render={({ field }) => (
                <FormItem className="flex-1 basis-2/5">
                  <div className="mb-2 flex items-center gap-3">
                    <FormLabel className="body-md mb-0 flex-1 text-right">
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
              name={`${prefixKey}gainPerspectives`}
              render={({ field }) => (
                <FormItem className="flex-1 basis-2/5">
                  <div className="mb-2 flex items-center gap-3">
                    <FormLabel className="body-md mb-0 flex-1 text-right">
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
              name={`${prefixKey}solveProblems`}
              render={({ field }) => (
                <FormItem className="flex-1 basis-2/5">
                  <div className="mb-2 flex items-center gap-3">
                    <FormLabel className="body-md mb-0 flex-1 text-right">
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
              name={`${prefixKey}achieveGoals`}
              render={({ field }) => (
                <FormItem className="flex-1 basis-2/5">
                  <div className="mb-2 flex items-center gap-3">
                    <FormLabel className="body-md mb-0 flex-1 text-right">
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
          name={`${prefixKey}content`}
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
          name={`${prefixKey}contentFeatures`}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>內容特色</FormLabel>
              <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {contentFeaturesOptions.map((item) => (
                  <FormItem
                    key={item.value}
                    className="relative m-0 flex items-center gap-2 rounded-lg border border-solid border-basic-200"
                  >
                    <FormLabel
                      className="body-md m-0 flex flex-1 cursor-pointer items-center gap-2 p-3 font-normal"
                      htmlFor={item.value}
                    >
                      <FormControl>
                        <Checkbox
                          id={item.value}
                          checked={
                            field.value?.[
                              item.value as keyof typeof field.value
                            ] ?? false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange({
                                ...field.value,
                                [item.value]: true,
                              });
                            } else {
                              field.onChange({
                                ...field.value,
                                [item.value]: false,
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
          <div className="mb-6 ml-6 space-y-6">
            <FormField
              control={form.control}
              name={`${prefixKey}timeUsage`}
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
                      {timeUsageOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
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
              name={`${prefixKey}resourceUsage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>能否搭配運用資源</FormLabel>
                  <MultipleSelector
                    options={resourceUsageOptions}
                    onChange={(options) => field.onChange(
                      options.reduce((acc, option) => {
                        acc[option.value] = true;
                        return acc;
                      }, Object.fromEntries(Object.keys(field.value ?? {}).map((key) => [key, false] as [string, boolean])))
                    )}
                    value={Object.entries(field.value ?? {})
                      .map(([key, value]) => resourceUsageOptions.find(
                        (option) => option.value === key && value
                      ))
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
    </>
  );
}
