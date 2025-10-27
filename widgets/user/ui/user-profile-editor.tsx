'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SaveIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { DatePickerWithForm } from '@/shared/ui/date-picker';
import { RadioGroupWithForm } from '@/shared/ui/radio-group';
import { MultipleSelector } from '@/shared/ui/multiple-selector';
import { SelectWithForm } from '@/shared/ui/select';
import { CheckboxFieldWithForm } from '@/shared/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Paper } from '@/shared/ui/paper';
import type { UserValidatorsUpdateUserSchema } from '@/generated/models';
import { useNavigationBlocker } from '@/shared/lib/navigation-blocker';
import { useTranslation } from '@/shared/lib/translation';
import {
  GENDER_OPTIONS,
  EDUCATION_OPTIONS,
  EXPERTISE_AREAS,
  INTEREST_AREAS,
  REFERRAL_SOURCES,
  ROLE_OPTIONS,
} from '@/entities/user';
import { AREA_OPTIONS } from '@/entities/area/model/constants';
import type { TranslationKeys } from '@/shared/config/i18n';
import { useErrorHandler } from '@/shared/lib/error-handler';

// 表單驗證 schema
const userProfileSchema = z.object({
  name: z.string().max(50, '姓名不能超過 50 字').optional(),
  photoURL: z.string().url('請輸入有效的圖片網址').optional().or(z.literal('')),
  personalSlogan: z
    .string()
    .min(1, '標語不可為空')
    .max(100, '個人標語不能超過 100 字')
    .optional(),
  selfIntroduction: z.string().max(500, '自我介紹不能超過 500 字').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDay: z.string().optional(),
  educationStage: z.enum(['university', 'high', 'other']).optional(),
  location: z.string().optional(),
  contactList: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      line: z.string().optional(),
      discord: z.string().optional(),
    })
    .optional(),
  tagList: z.array(z.string()).optional(),
  interestList: z.array(z.string()).optional(),
  wantToDoList: z.array(z.string()).optional(),
  roleList: z.array(z.string()).optional(),
  professionalField: z
    .array(
      z.enum([
        'information_and_communication_technologies_icts',
        'business_administration_and_law',
        'arts_and_humanities',
        'natural_sciences_mathematics_and_statistics',
        'engineering_manufacturing_and_construction',
        'health_and_welfare',
        'education',
        'social_sciences_journalism_and_information',
        'language_skills_and_knowledge',
        'services',
        'agriculture_forestry_fisheries_and_veterinary',
        'others',
      ])
    )
    .optional(),
  preferences: z.record(z.unknown()).optional(),
  isOpenLocation: z.boolean().optional(),
  isOpenProfile: z.boolean().optional(),
  isSubscribeEmail: z.boolean().optional(),
  referralSource: z
    .string()
    .min(1, '推薦來源至少需要 1 個字元')
    .max(100, '推薦來源不能超過 100 字')
    .optional(),
  share: z.string().max(500, '分享內容不能超過 500 字').optional(),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileEditorProps {
  initialData?: Partial<UserValidatorsUpdateUserSchema>;
  onSave: (data: UserProfileFormData) => Promise<void> | void;
  onCancel: () => void;
}

const commonTags = [
  { value: 'frontend', label: '前端開發' },
  { value: 'backend', label: '後端開發' },
  { value: 'design', label: '設計' },
  { value: 'marketing', label: '行銷' },
  { value: 'data', label: '資料分析' },
  { value: 'ai', label: '人工智慧' },
  { value: 'startup', label: '新創' },
  { value: 'education', label: '教育' },
];

export const UserProfileEditor = ({
  initialData,
  onSave,
  onCancel,
}: UserProfileEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      photoURL: initialData?.photoURL || '',
      personalSlogan: initialData?.personalSlogan || '',
      selfIntroduction: initialData?.selfIntroduction || '',
      gender: initialData?.gender || undefined,
      birthDay: initialData?.birthDay || '',
      educationStage: initialData?.educationStage || undefined,
      location: initialData?.location || '',
      contactList: {
        instagram: initialData?.contactList?.instagram || '',
        facebook: initialData?.contactList?.facebook || '',
        line: initialData?.contactList?.line || '',
        discord: initialData?.contactList?.discord || '',
      },
      tagList: initialData?.tagList || [],
      interestList: initialData?.interestList || [],
      wantToDoList: initialData?.wantToDoList || [],
      roleList: initialData?.roleList || [],
      professionalField: initialData?.professionalField || [],
      preferences: initialData?.preferences || {},
      isOpenLocation: initialData?.isOpenLocation ?? true,
      isOpenProfile: initialData?.isOpenProfile ?? true,
      isSubscribeEmail: initialData?.isSubscribeEmail ?? false,
      referralSource: initialData?.referralSource || '',
      share: typeof initialData?.share === 'string' ? initialData.share : '',
    },
  });

  const { handleFormError } = useErrorHandler(form);

  const handleSubmit = async (data: UserProfileFormData) => {
    try {
      setIsSaving(true);
      await onSave(data);
    } catch (error) {
      handleFormError(error, { defaultMessage: '儲存失敗，請稍後再試' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  const { setIsBlocked } = useNavigationBlocker();

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsBlocked(isDirty);
    return () => {
      setIsBlocked(false);
    };
  }, [isDirty, setIsBlocked]);

  return (
    <Paper className="mx-auto max-w-4xl">
      <div className="space-y-6">
        {/* 標題與操作按鈕 */}
        <div className="flex items-center justify-between border-b border-basic-200 pb-4">
          <h2 className="text-basic-800 text-2xl font-bold">編輯個人資料</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <XIcon className="size-4" />
              取消
            </Button>
            <Button
              type="submit"
              form="profile-form"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <SaveIcon className="size-4" />
              {isSaving ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form
            id="profile-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* 基本資訊區塊 */}
            <div className="space-y-6">
              <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                基本資訊
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 姓名 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入您的姓名..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 個人標語 */}
                <FormField
                  control={form.control}
                  name="personalSlogan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>個人標語</FormLabel>
                      <FormControl>
                        <Input placeholder="用一句話介紹自己..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 大頭照網址 */}
                <FormField
                  control={form.control}
                  name="photoURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>大頭照網址</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入圖片網址..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 性別 */}
                <RadioGroupWithForm
                  control={form.control}
                  name="gender"
                  label="性別"
                  options={GENDER_OPTIONS}
                  className="flex gap-4"
                />

                {/* 教育階段 */}
                <RadioGroupWithForm
                  control={form.control}
                  name="educationStage"
                  label="教育階段"
                  options={EDUCATION_OPTIONS}
                  className="flex gap-4"
                />

                {/* 所在地區 */}
                <SelectWithForm
                  control={form.control}
                  name="location"
                  label="所在地區"
                  placeholder="請選擇所在地區"
                  options={AREA_OPTIONS.map(
                    (option: { value: string; label: TranslationKeys }) => ({
                      value: option.value,
                      label: t(option.label),
                    })
                  )}
                />
              </div>

              {/* 生日 */}
              <DatePickerWithForm
                control={form.control}
                name="birthDay"
                placeholder="選擇生日"
                captionLayout="dropdown-buttons"
              />
            </div>

            {/* 自我介紹區塊 */}
            <div className="space-y-6">
              <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                自我介紹
              </h3>

              <FormField
                control={form.control}
                name="selfIntroduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>自我介紹</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="分享你的學習經歷、興趣或專業背景..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="share"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>可以和夥伴分享的事物</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="分享你可以提供給其他學習夥伴的資源、經驗或協助..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 聯絡方式區塊 */}
            <div className="space-y-6">
              <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                聯絡方式
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactList.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="your_instagram_handle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactList.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="your.facebook.profile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactList.line"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LINE ID</FormLabel>
                      <FormControl>
                        <Input placeholder="your_line_id" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactList.discord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord</FormLabel>
                      <FormControl>
                        <Input placeholder="username#1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 標籤與興趣區塊 */}
            <div className="space-y-6">
              <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                標籤與興趣
              </h3>

              <div className="space-y-6">
                {/* 技能標籤 */}
                <FormField
                  control={form.control}
                  name="tagList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>技能標籤</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          value={
                            field.value?.map((tag) => ({
                              value: tag,
                              label: tag,
                            })) || []
                          }
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          defaultOptions={commonTags}
                          placeholder="選擇或新增技能標籤..."
                          creatable
                          maxSelected={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 興趣領域 */}
                <FormField
                  control={form.control}
                  name="interestList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>興趣領域</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          value={
                            field.value?.map((interest) => ({
                              value: interest,
                              label:
                                INTEREST_AREAS.find(
                                  (opt) => opt.value === interest
                                )?.label || interest,
                            })) || []
                          }
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          defaultOptions={INTEREST_AREAS}
                          placeholder="選擇或新增興趣領域..."
                          creatable
                          maxSelected={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 想要學習的內容 */}
                <FormField
                  control={form.control}
                  name="wantToDoList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>想要學習的內容</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          value={
                            field.value?.map((item) => ({
                              value: item,
                              label: item,
                            })) || []
                          }
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          placeholder="新增想要學習的內容..."
                          creatable
                          maxSelected={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 角色身份 */}
                <FormField
                  control={form.control}
                  name="roleList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色身份</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          value={
                            field.value?.map((role) => ({
                              value: role,
                              label: role,
                            })) || []
                          }
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          defaultOptions={ROLE_OPTIONS}
                          placeholder="選擇或新增角色身份..."
                          creatable
                          maxSelected={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 專業領域 */}
                <FormField
                  control={form.control}
                  name="professionalField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>專業領域</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          value={
                            field.value?.map((item) => ({
                              value: item,
                              label:
                                EXPERTISE_AREAS.find(
                                  (opt) => opt.value === item
                                )?.label || item,
                            })) || []
                          }
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          defaultOptions={EXPERTISE_AREAS}
                          placeholder="選擇專業領域..."
                          maxSelected={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 隱私設定區塊 */}
            <div className="space-y-6">
              <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                隱私設定
              </h3>

              <div className="space-y-4">
                <CheckboxFieldWithForm
                  control={form.control}
                  name="isOpenLocation"
                  label="公開地區資訊"
                />

                <CheckboxFieldWithForm
                  control={form.control}
                  name="isOpenProfile"
                  label="公開個人資料"
                />

                <CheckboxFieldWithForm
                  control={form.control}
                  name="isSubscribeEmail"
                  label="訂閱電子報"
                />
              </div>
            </div>

            {/* 其他資訊區塊 */}
            <div className="space-y-6">
              <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                其他資訊
              </h3>

              <SelectWithForm
                control={form.control}
                name="referralSource"
                label="推薦來源"
                placeholder="您是如何得知我們的？"
                options={REFERRAL_SOURCES}
              />
            </div>
          </form>
        </Form>
      </div>
    </Paper>
  );
};
