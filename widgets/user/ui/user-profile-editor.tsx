'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AtSignIcon, SaveIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';
import { FormTextarea } from '@/shared/ui/textarea';
import { FormAvatarPicker } from '@/shared/ui/image-picker';
import { Form } from '@/shared/ui/form';
import { Paper } from '@/shared/ui/paper';
import type { UserValidatorsUserSuccessResponseSchemaData } from '@/generated/models';
import { useNavigationBlocker } from '@/shared/lib/navigation-blocker';
import { useErrorHandler } from '@/shared/lib/error-handler';
import { useAuth, useAuthActions } from '@/entities/user';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/skeleton';

// 表單驗證 schema
const userProfileSchema = z.object({
  name: z.string().max(50, '姓名不能超過 50 字').optional(),
  photoURL: z.string().url('請輸入有效的圖片網址').optional().or(z.literal('')),
  customId: z.string().optional(),
  personalSlogan: z
    .string()
    .min(1, '請輸入個人標語')
    .max(150, '個人標語不能超過 150 字'),
  selfIntroduction: z.string().max(500, '自我介紹不能超過 350 字').optional(),
  location: z.string().optional(),
  contactList: z
    .object({
      website: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      discord: z.string().optional(),
    })
    .optional(),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileEditorProps {
  initialData?: Partial<UserValidatorsUserSuccessResponseSchemaData>;
  onClose: () => void;
}

interface ActionButtonsProps {
  onCancel?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  className?: string;
}

const ActionButtons = ({
  onCancel,
  isSaving,
  isLoading,
  className,
}: ActionButtonsProps) => (
  <div className={cn('flex flex-col gap-2 sm:flex-row sm:gap-4', className)}>
    <Button
      type="button"
      variant="outline"
      onClick={onCancel}
      disabled={isSaving || isLoading}
      className="flex flex-1 items-center gap-2"
    >
      <XIcon className="size-4" />
      取消
    </Button>
    <Button
      type="submit"
      form="profile-form"
      disabled={isSaving || isLoading}
      className="flex flex-1 items-center gap-2"
    >
      <SaveIcon className="size-4" />
      {isSaving ? '儲存中...' : '儲存'}
    </Button>
  </div>
);

interface UserProfileEditorLayoutProps extends React.PropsWithChildren {
  actionButtons?: React.ReactNode;
}

const UserProfileEditorLayout = ({
  children,
  actionButtons,
}: UserProfileEditorLayoutProps) => (
  <Paper>
    <div className="space-y-6">
      {/* 標題與操作按鈕 */}
      <div className="flex items-center justify-between border-b border-basic-200 pb-4">
        <h2 className="text-basic-800 text-2xl font-bold">編輯個人資料</h2>
        <div className="hidden sm:block">{actionButtons}</div>
      </div>

      {children}

      {/* 底部操作按鈕 */}
      <div className="flex justify-center border-t border-basic-200 pt-4 *:w-full *:*:flex-1 *:gap-4 *:px-4">
        {actionButtons}
      </div>
    </div>
  </Paper>
);

export const UserProfileEditorLoading = () => (
  <UserProfileEditorLayout actionButtons={<ActionButtons isLoading />}>
    <Skeleton className="h-48 w-full bg-basic-100" />
    <Skeleton className="h-48 w-full bg-basic-100" />
    <Skeleton className="h-48 w-full bg-basic-100" />
  </UserProfileEditorLayout>
);

export const UserProfileEditor = ({
  initialData,
  onClose,
}: UserProfileEditorProps) => {
  const { user } = useAuth();
  const { updateUser } = useAuthActions();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      photoURL: initialData?.photoURL || '',
      customId: initialData?.customId || '',
      personalSlogan: initialData?.personalSlogan || '',
      selfIntroduction: initialData?.selfIntroduction || '',
      location: initialData?.location || '',
      contactList: {
        // website: initialData?.contactList?.website || '',
        facebook: initialData?.contactList?.facebook || '',
        instagram: initialData?.contactList?.instagram || '',
        // linkedin: initialData?.contactList?.linkedin || '',
        // github: initialData?.contactList?.github || '',
        discord: initialData?.contactList?.discord || '',
      },
    },
  });

  const { handleFormError } = useErrorHandler(form);

  const handleSubmit = async (data: UserProfileFormData) => {
    try {
      setIsSaving(true);
      await updateUser({
        interestList: user?.interestList || [],
        share: user?.share || '',
        preferences: user?.preferences || {},
        professionalField: user?.professionalField || [],
        ...data,
      });
      onClose();
    } catch (error) {
      handleFormError(error, { defaultMessage: '儲存失敗，請稍後再試' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
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
    <Form {...form}>
      <form
        id="profile-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
      >
        <UserProfileEditorLayout
          actionButtons={
            <ActionButtons onCancel={handleCancel} isSaving={isSaving} />
          }
        >
          {/* 基本資訊區塊 */}
          <div className="space-y-4">
            <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
              基本資訊
            </h3>

            <div className="flex flex-col items-center gap-8 sm:flex-row">
              {/* 大頭照上傳 */}
              <FormAvatarPicker
                control={form.control}
                name="photoURL"
                size={128}
              />

              <div className="flex w-full flex-col gap-4">
                {/* 使用者名稱 */}
                <FormInput
                  control={form.control}
                  name="name"
                  label="使用者名稱"
                  placeholder="請輸入您的使用者名稱..."
                />

                {/* 使用者帳號 */}
                <FormInput
                  control={form.control}
                  name="customId"
                  label="使用者帳號"
                  placeholder="請輸入您的使用者帳號..."
                  prefixIcon={<AtSignIcon className="size-4" />}
                />
              </div>
            </div>

            {/* 居住地 */}
            <FormInput
              control={form.control}
              name="location"
              label="居住地"
              placeholder="請輸入您的居住地..."
            />

            {/* 個人標語 */}
            <FormInput
              control={form.control}
              name="personalSlogan"
              label="個人標語"
              placeholder="用一句話介紹自己..."
            />
          </div>

          {/* 其他社群區塊 */}
          <div className="space-y-6">
            <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
              其他社群
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                control={form.control}
                name="contactList.instagram"
                label="Instagram"
                placeholder="your_instagram_handle"
              />

              <FormInput
                control={form.control}
                name="contactList.facebook"
                label="Facebook"
                placeholder="your.facebook.profile"
              />

              {/* <FormInput
                control={form.control}
                name="contactList.line"
                label="LINE ID"
                placeholder="your_line_id"
              /> */}

              <FormInput
                control={form.control}
                name="contactList.discord"
                label="Discord"
                placeholder="username#1234"
              />
            </div>
          </div>

          {/* 自我介紹區塊 */}
          <div className="space-y-6">
            <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
              自我介紹
            </h3>

            <FormTextarea
              control={form.control}
              name="selfIntroduction"
              placeholder="分享你的學習經歷、興趣或專業背景..."
              className="min-h-32"
            />
          </div>
        </UserProfileEditorLayout>
      </form>
    </Form>
  );
};
