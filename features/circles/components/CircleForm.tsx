import Link from 'next/link';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paper } from '@/components/ui/paper';
import { Selector } from '@/components/ui/select';
import { Text, Title } from '@/components/ui/typography';
import { Checkbox, CheckboxWithForm } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { MultipleSelector } from '@/components/ui/multiple-selector';
import { OptionProps } from '@/components/ui/option';
import { Switch } from '@/components/ui/switch';
import { UploadImage } from '@/components/ui/upload-image';
import { ACTIVITY_CATEGORIES, CATEGORIES } from '@/constants/category';
import { EDUCATION } from '@/constants/member';
import { AREAS, ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';
import { FormProvider, useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CircleFormSchema,
  circleFormSchema,
  CircleSchema,
} from '@/services/circles';
import { useCreateCircle, useUpdateCircle } from '../hooks';

type CircleFormProps = {
  values?: CircleSchema;
  onSuccess?: () => void;
};

export function CircleForm({ values, onSuccess }: CircleFormProps) {
  const isCreateMode = !values;

  const { trigger: createCircle, isMutating: isCreating } = useCreateCircle({
    onSuccess: () => {
      toast.success('揪團發起成功');
      onSuccess?.();
    },
  });

  const { trigger: updateCircle, isMutating: isUpdating } = useUpdateCircle(
    values?._id,
    {
      onSuccess: () => {
        toast.success('揪團更新成功');
        onSuccess?.();
      },
    }
  );

  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const originPhotoURL = useRef(values?.photoURL);

  const form = useForm<CircleFormSchema>({
    resolver: zodResolver(circleFormSchema),
    defaultValues: values ?? {
      title: '',
      photoURL: '',
      photoAlt: '',
      activityCategory: [],
      category: [],
      participator: 1,
      area: '',
      time: '',
      partnerStyle: '',
      partnerEducationStep: [],
      motivation: '',
      content: '',
      outcome: '',
      notice: '',
      deadline: undefined,
      isNeedDeadline: false,
      tagList: [],
      isGrouping: true,
    },
  });

  const isSubmitting = isCreating || isUpdating;

  const checkIsPhysicalArea = (value: string) => AREAS.some((area) => area.value === value);

  const handleSubmit = (data: CircleFormSchema) => {
    if (isCreateMode) {
      createCircle(data);
    } else {
      updateCircle(data);
    }
  };

  useEffect(() => {
    if (values?.photoURL) {
      originPhotoURL.current = values.photoURL;
    }
  }, [values?.photoURL]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Paper className="p-10 mb-4">
          <Title as="h1" size="md" className="text-center mb-2">
            {isCreateMode ? '發起揪團' : '編輯揪團'}
          </Title>
          <Text size="sm" className="text-center mb-10">
            填寫完整資訊可以幫助其他夥伴更了解揪團內容哦！
          </Text>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>主題</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="為你的揪團取個響亮的主題吧！"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>活動圖片</FormLabel>
                  <FormControl>
                    <UploadImage
                      ratio={2 / 1}
                      value={field.value ? [field.value] : []}
                      onPreviewsChange={(previews: string[]) => {
                        field.onChange(previews[0]);
                      }}
                    >
                      <Plus size={24} />
                      選擇封面
                    </UploadImage>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CheckboxWithForm
              control={form.control}
              name="activityCategory"
              label="揪團類型"
              options={ACTIVITY_CATEGORIES}
              className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
              renderOption={({ Option, isChecked, label }) => (
                <Option className="border-none flex items-center text-sm gap-1">
                  <Checkbox
                    checked={isChecked}
                    className="pointer-events-none"
                  />
                  {label}
                </Option>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>學習領域</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={CATEGORIES.filter((option) => field.value?.includes(option.value))}
                      onChange={(options: OptionProps[]) => field.onChange(options.map((o) => o.value))}
                      options={CATEGORIES}
                      placeholder="這個活動的學習領域？"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>期望的夥伴人數</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="請輸入整數，需大於 0，不可超過 100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>地點</FormLabel>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 h-10">
                      <FormItem className="flex items-center gap-4">
                        <FormControl>
                          <Checkbox
                            checked={checkIsPhysicalArea(field.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange(AREAS[0].value);
                              } else {
                                field.onChange(TBD_OPTION.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm mb-0">
                          實體活動
                        </FormLabel>
                      </FormItem>
                      <Selector
                        value={
                          checkIsPhysicalArea(field.value) ? field.value : ''
                        }
                        options={AREAS}
                        placeholder="地點"
                        disabled={!checkIsPhysicalArea(field.value)}
                        onValueChange={(value) => {
                          if (checkIsPhysicalArea(field.value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </div>
                    <FormItem className="flex items-center gap-4 h-10">
                      <FormControl>
                        <Checkbox
                          checked={field.value === ONLINE_OPTION.value}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked ? ONLINE_OPTION.value : TBD_OPTION.value
                            );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm mb-0">
                        {ONLINE_OPTION.label}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-4 h-10">
                      <FormControl>
                        <Checkbox
                          checked={field.value === TBD_OPTION.value}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked ? TBD_OPTION.value : ONLINE_OPTION.value
                            );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm mb-0">
                        {TBD_OPTION.label}
                      </FormLabel>
                    </FormItem>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>時間</FormLabel>
                  <FormControl>
                    <Input placeholder="希望在什麼時間舉行？" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Paper>

        <Paper className="p-10 mb-4">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="partnerStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>想找的夥伴</FormLabel>
                  <FormControl>
                    <Input placeholder="想找什麼類型的夥伴？" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partnerEducationStep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>適合的教育階段</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={EDUCATION.filter((option) => field.value?.includes(option.value))}
                      onChange={(options: OptionProps[]) => field.onChange(options.map((o) => o.value))}
                      options={EDUCATION}
                      placeholder="活動適合什麼教育階段的夥伴？"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>揪團動機</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="讓大家更了解你為什麼發起這次揪團～"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>揪團內容與運作方式</FormLabel>
                  <FormControl>
                    <MarkdownEditor
                      placeholder="說明你的揪團活動內容、運作方式，邀請志同道合的夥伴一起來參與！"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>期待成果</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="希望大家參與後能有的收獲或達成的目標"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>注意事項</FormLabel>
                  <FormControl>
                    <MarkdownEditor
                      placeholder="如參與者必須參與的次數和遵守的規則等"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標籤</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={(field.value || []).map((v: string) => ({
                        label: v,
                        value: v,
                      }))}
                      onChange={(options: OptionProps[]) => field.onChange(options.map((o) => o.value))}
                      placeholder="搜尋或新增標籤"
                      creatable
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-basic-300 mt-1">
                    標籤填寫完成後，會用 Hashtag 的形式呈現，例如： #一起學日文
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Paper>

        <Paper className="p-10 mb-4">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>揪團期限</FormLabel>
                <div className="flex items-center gap-2 h-10">
                  <FormItem className="flex items-center gap-1">
                    <FormControl>
                      <Checkbox
                        checked={form.watch('isNeedDeadline')}
                        onCheckedChange={(checked) => form.setValue('isNeedDeadline', !!checked)}
                      />
                    </FormControl>
                    <FormLabel className="font-normal mb-0 text-sm">
                      自訂
                    </FormLabel>
                  </FormItem>
                  {form.watch('isNeedDeadline') && (
                    <FormControl>
                      <DatePicker
                        {...field}
                        value={
                          form.watch('isNeedDeadline') && field.value
                            ? new Date(field.value)
                            : undefined
                        }
                        onChange={(value) => {
                          field.onChange(value?.toISOString() ?? undefined);
                        }}
                        className="w-full"
                      />
                    </FormControl>
                  )}
                </div>
                <FormItem className="flex items-center gap-1 h-10">
                  <FormControl>
                    <Checkbox
                      checked={!form.watch('isNeedDeadline')}
                      onCheckedChange={(checked) => form.setValue('isNeedDeadline', !checked)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal mb-0 text-sm">
                    不限
                  </FormLabel>
                </FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </Paper>

        {!isCreateMode && (
          <Paper className="mb-4">
            <FormField
              control={form.control}
              name="isGrouping"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="mb-0 text-base">
                    {field.value ? '開放揪團中' : '已關閉揪團'}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Paper>
        )}

        <FormItem className="flex items-center justify-center my-4 gap-1">
          <FormControl>
            <Checkbox
              checked={isTermsChecked}
              onCheckedChange={(checked) => setIsTermsChecked(!!checked)}
            />
          </FormControl>
          <FormLabel className="text-sm text-basic-400 mb-0 text-balance">
            請確認揪團未涉及不雅內容並符合本網站
            {' '}
            <Link href="/terms/service" target="_blank" className="underline">
              使用者條款
            </Link>
          </FormLabel>
          <FormMessage />
        </FormItem>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full max-w-56"
            size="lg"
            disabled={isSubmitting || !isTermsChecked}
          >
            {isCreateMode ? '送出' : '發布修改'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
