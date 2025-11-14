'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SaveIcon, MailIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { subYears, parse, format, isValid } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';
import { FormDatePicker } from '@/shared/ui/date-picker';
import { FormSelect } from '@/shared/ui/select';
import { FormMultipleSelector } from '@/shared/ui/multiple-selector';
import { Form } from '@/shared/ui/form';
import { Paper } from '@/shared/ui/paper';
import {
  EXPERTISE_AREAS,
  INTEREST_AREAS,
  GENDER_OPTIONS,
  ROLE_OPTIONS,
  EDUCATION_OPTIONS,
  expertiseAreasEnum,
  interestAreasEnum,
  roleEnum,
  useAuth,
  useAuthActions,
  educationStageEnum,
  UpdateUserSchema,
} from '@/entities/user';
import { useNavigationBlockerEffect } from '@/shared/lib/navigation-blocker';
import { useErrorHandler } from '@/shared/lib/error-handler';
import { cn } from '@/shared/lib/cn';
import { Background, Container } from '@/shared/ui/wrapper';

// 建立表單驗證 schema 的函數，支援多語系
const createAccountSettingsSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    professionalField: z
      .array(z.nativeEnum(expertiseAreasEnum))
      .max(5, t('professional_field_max_selection', { count: 5 }))
      .optional(),
    wantToDoList: z
      .array(z.nativeEnum(interestAreasEnum))
      .max(5, t('exploration_field_max_selection', { count: 5 }))
      .optional(),
    birthDay: z
      .date({
        required_error: t('birthday_required'),
      })
      .refine(
        (date) => {
          const minDate = subYears(new Date(), 100);
          const maxDate = subYears(new Date(), 16);
          return date >= minDate && date <= maxDate;
        },
        {
          message: t('birthday_age_requirement'),
        }
      )
      .optional()
      .or(z.string().optional()),
    gender: z.enum(['male', 'female', 'other']).optional(),
    roleList: z.nativeEnum(roleEnum).optional(),
    educationStage: z.nativeEnum(educationStageEnum).optional(),
    email: z.string().email().optional(),
  });

type AccountSettingsFormData = z.infer<
  ReturnType<typeof createAccountSettingsSchema>
>;

interface ActionButtonsProps {
  isSaving?: boolean;
  isLoading?: boolean;
}

const ActionButtons = ({ isSaving, isLoading }: ActionButtonsProps) => {
  const t = useTranslations('account_settings');
  return (
    <Button
      type="submit"
      form="account-settings-form"
      disabled={isSaving || isLoading}
    >
      <SaveIcon className="size-4" />
      {isSaving ? t('saving') : t('save')}
    </Button>
  );
};

interface AccountSettingsEditorLayoutProps extends React.PropsWithChildren {
  actionButtons?: React.ReactNode;
}

const AccountSettingsEditorLayout = ({
  children,
  actionButtons,
}: AccountSettingsEditorLayoutProps) => {
  const t = useTranslations('account_settings');
  return (
    <Paper>
      <div className="space-y-6">
        {/* 標題與操作按鈕 */}
        <div className="flex items-center justify-between border-b border-basic-200 pb-4">
          <h2 className="text-basic-800 text-2xl font-bold">{t('title')}</h2>
          <div className="hidden sm:block">{actionButtons}</div>
        </div>

        {children}

        {/* 底部操作按鈕 */}
        <div className="flex justify-end border-t border-basic-200 pt-4">
          {actionButtons}
        </div>
      </div>
    </Paper>
  );
};

const parseBirthDay = (birthDay?: string | null): Date | undefined => {
  if (!birthDay) return undefined;
  try {
    const parsedBirthday = parse(birthDay, 'yyyy-MM-dd', new Date());
    const validBirthday = isValid(parsedBirthday) ? parsedBirthday : undefined;
    return validBirthday;
  } catch {
    return undefined;
  }
};

export const AccountSettingsEditor = () => {
  const { user } = useAuth();
  const { updateUser } = useAuthActions();
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations('account_settings');

  const accountSettingsSchema = createAccountSettingsSchema(t);

  const form = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      professionalField: user?.professionalField || [],
      wantToDoList: user?.wantToDoList || [],
      birthDay: parseBirthDay(user?.birthDay),
      gender: user?.gender || undefined,
      roleList: user?.roleList?.[0] || undefined,
      educationStage: user?.educationStage || undefined,
      email: user?.email || '',
    },
  });

  const { handleFormError } = useErrorHandler(form);

  const handleSubmit = async (data: AccountSettingsFormData) => {
    try {
      setIsSaving(true);
      const updateData: Partial<UpdateUserSchema> = {
        ...user,
        ...data,
        birthDay:
          data.birthDay instanceof Date
            ? format(data.birthDay, 'yyyy-MM-dd')
            : data.birthDay || user?.birthDay,
        roleList: data.roleList ? [data.roleList] : undefined,
      };
      await updateUser(updateData);
    } catch (error) {
      handleFormError(error, { defaultMessage: t('save_error') });
    } finally {
      setIsSaving(false);
    }
  };

  const { isDirty } = form.formState;

  useNavigationBlockerEffect(isDirty);

  return (
    <Background className="pb-24">
      <Container className="max-w-4xl">
        <Form {...form}>
          <form
            id="account-settings-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <AccountSettingsEditorLayout
              actionButtons={<ActionButtons isSaving={isSaving} />}
            >
              {/* 個人資訊區塊 */}
              <div className="space-y-4">
                <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                  {t('personal_info_title')}
                </h3>

                {/* 電子信箱 */}
                <FormInput
                  control={form.control}
                  name="email"
                  label={t('email_label')}
                  placeholder={t('email_placeholder')}
                  disabled
                  prefixIcon={<MailIcon className="size-4" />}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 生日 */}
                  <FormDatePicker
                    control={form.control}
                    name="birthDay"
                    label={t('birthday_label')}
                    placeholder={t('birthday_placeholder')}
                    disabled={!!user?.birthDay}
                    withIcon
                    fromDate={subYears(new Date(), 100)}
                    toDate={subYears(new Date(), 16)}
                    captionLayout="dropdown-buttons"
                    className={cn(!!user?.birthDay && 'cursor-not-allowed')}
                  />

                  {/* 性別 */}
                  <FormSelect
                    control={form.control}
                    name="gender"
                    label={t('gender_label')}
                    placeholder={t('gender_placeholder')}
                    options={GENDER_OPTIONS}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 身份 */}
                  <FormSelect
                    control={form.control}
                    name="roleList"
                    label={t('role_label')}
                    placeholder={t('role_placeholder')}
                    options={ROLE_OPTIONS}
                  />

                  {/* 教育階段 */}
                  <FormSelect
                    control={form.control}
                    name="educationStage"
                    label={t('education_stage_label')}
                    placeholder={t('education_stage_placeholder')}
                    options={EDUCATION_OPTIONS}
                  />
                </div>
              </div>

              {/* 專業領域區塊 */}
              <div className="space-y-4">
                <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                  {t('professional_field_title')}
                </h3>

                <FormMultipleSelector
                  control={form.control}
                  name="professionalField"
                  label={t('professional_field_label')}
                  placeholder={t('professional_field_placeholder')}
                  defaultOptions={EXPERTISE_AREAS}
                  maxSelected={5}
                  onMaxSelected={(maxLimit) => {
                    toast.error(
                      t('professional_field_max_selection', { count: maxLimit })
                    );
                  }}
                />
              </div>

              {/* 想探索的領域區塊 */}
              <div className="space-y-4">
                <h3 className="text-basic-700 border-l-4 border-primary-base pl-4 text-lg font-semibold">
                  {t('exploration_field_title')}
                </h3>

                <FormMultipleSelector
                  control={form.control}
                  name="wantToDoList"
                  label={t('exploration_field_label')}
                  placeholder={t('exploration_field_placeholder')}
                  defaultOptions={INTEREST_AREAS}
                  maxSelected={5}
                  onMaxSelected={(maxLimit) => {
                    toast.error(
                      t('exploration_field_max_selection', { count: maxLimit })
                    );
                  }}
                />
              </div>
            </AccountSettingsEditorLayout>
          </form>
        </Form>
      </Container>
    </Background>
  );
};
