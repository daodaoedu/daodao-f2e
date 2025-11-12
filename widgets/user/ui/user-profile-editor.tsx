'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AtSignIcon, SaveIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';
import { FormTextarea } from '@/shared/ui/textarea';
import { FormAvatarPicker } from '@/shared/ui/image-picker';
import { Form } from '@/shared/ui/form';
import { Paper } from '@/shared/ui/paper';
import type { UserProfile } from '@/entities/user';
import { useNavigationBlocker } from '@/shared/lib/navigation-blocker';
import { useErrorHandler } from '@/shared/lib/error-handler';
import { useAuth, useAuthActions } from '@/entities/user';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/skeleton';
import { DynamicContactSelector } from '@/entities/user/ui';
import { CONTACT_PLATFORM_OPTIONS } from '@/entities/user/model/constants';
import { FormCitySelector } from '@/entities/area/ui';

// 建立表單驗證 schema 的函數，支援多語系
const createUserProfileSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    name: z
      .string()
      .max(50, t('name_max_length', { count: 50 }))
      .optional(),
    photoURL: z
      .string()
      .url(t('photo_url_invalid'))
      .optional()
      .or(z.literal('')),
    customId: z.string().optional(),
    personalSlogan: z
      .string()
      .min(1, t('personal_slogan_required'))
      .max(150, t('personal_slogan_max_length', { count: 150 })),
    selfIntroduction: z
      .string()
      .max(350, t('self_introduction_max_length', { count: 350 }))
      .optional(),
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

type UserProfileFormData = z.infer<ReturnType<typeof createUserProfileSchema>>;

interface UserProfileEditorProps {
  initialData?: Partial<UserProfile>;
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
}: ActionButtonsProps) => {
  const t = useTranslations('user_profile');
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:gap-4', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSaving || isLoading}
        className="flex flex-1 items-center gap-2"
      >
        <XIcon className="size-4" />
        {t('cancel')}
      </Button>
      <Button
        type="submit"
        form="profile-form"
        disabled={isSaving || isLoading}
        className="flex flex-1 items-center gap-2"
      >
        <SaveIcon className="size-4" />
        {isSaving ? t('saving') : t('save')}
      </Button>
    </div>
  );
};

interface UserProfileEditorLayoutProps extends React.PropsWithChildren {
  actionButtons?: React.ReactNode;
}

const UserProfileEditorLayout = ({
  children,
  actionButtons,
}: UserProfileEditorLayoutProps) => {
  const t = useTranslations('user_profile');
  return (
    <Paper>
      <div className="space-y-6">
        {/* 標題與操作按鈕 */}
        <div className="flex items-center justify-between border-b border-basic-200 pb-4">
          <h2 className="text-basic-800 text-2xl font-bold">
            {t('edit_profile_title')}
          </h2>
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
};

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
  const t = useTranslations('user_profile');

  const userProfileSchema = createUserProfileSchema(t);

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
        website: '',
        facebook: initialData?.contactList?.facebook || '',
        instagram: initialData?.contactList?.instagram || '',
        linkedin: '',
        github: '',
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
      handleFormError(error, { defaultMessage: t('save_error') });
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
              {t('basic_info_title')}
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
                  label={t('name_label')}
                  placeholder={t('name_placeholder')}
                />

                {/* 使用者帳號 */}
                <FormInput
                  control={form.control}
                  name="customId"
                  label={t('custom_id_label')}
                  placeholder={t('custom_id_placeholder')}
                  prefixIcon={<AtSignIcon className="size-4" />}
                />
              </div>
            </div>

            {/* 居住地 */}
            <FormCitySelector
              control={form.control}
              name="location"
              label={t('location_label')}
              placeholder={t('location_placeholder')}
            />

            {/* 個人標語 */}
            <FormTextarea
              control={form.control}
              name="personalSlogan"
              label={t('personal_slogan_label')}
              placeholder={t('personal_slogan_placeholder')}
              rows={2}
            />
          </div>

          {/* 其他社群區塊 */}
          <div className="space-y-6">
            <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
              {t('social_media_title')}
            </h3>
            <DynamicContactSelector
              control={form.control}
              name="contactList"
              options={CONTACT_PLATFORM_OPTIONS}
              platformPlaceholder={t('platform_placeholder')}
              valuePlaceholder={t('contact_value_placeholder')}
            />
          </div>

          {/* 自我介紹區塊 */}
          <div className="space-y-6">
            <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
              {t('self_introduction_title')}
            </h3>

            <FormTextarea
              control={form.control}
              name="selfIntroduction"
              placeholder={t('self_introduction_placeholder')}
              className="min-h-32"
            />
          </div>
        </UserProfileEditorLayout>
      </form>
    </Form>
  );
};
