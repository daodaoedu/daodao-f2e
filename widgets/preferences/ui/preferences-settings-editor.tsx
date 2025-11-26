'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SaveIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { FormCheckboxGroup } from '@/shared/ui/checkbox';
import { Form } from '@/shared/ui/form';
import { Paper } from '@/shared/ui/paper';
import { useAuth } from '@/entities/user';
import { useNavigationBlockerEffect } from '@/shared/lib/navigation-blocker';
import { useErrorHandler } from '@/shared/lib/error-handler';
import { Background, Container } from '@/shared/ui/wrapper';
import { client } from '@/shared/api/client';
import { useMutate } from '@/shared/api';

// 建立表單驗證 schema 的函數，支援多語系
const createPreferencesSettingsSchema = (
  t: ReturnType<typeof useTranslations>
) =>
  z.object({
    goals: z
      .array(z.string())
      .min(1, t('goals_min_selection'))
      .max(3, t('goals_max_selection')),
    learningStyle: z
      .array(z.string())
      .min(1, t('learning_style_min_selection'))
      .max(3, t('learning_style_max_selection')),
    timeCommitment: z
      .array(z.string())
      .min(1, t('time_commitment_min_selection'))
      .max(3, t('time_commitment_max_selection')),
    interactionStyle: z
      .array(z.string())
      .min(1, t('interaction_style_min_selection'))
      .max(3, t('interaction_style_max_selection')),
    feedbackStyle: z
      .array(z.string())
      .min(1, t('feedback_style_min_selection'))
      .max(3, t('feedback_style_max_selection')),
  });

type PreferencesSettingsFormData = z.infer<
  ReturnType<typeof createPreferencesSettingsSchema>
>;

interface ActionButtonsProps {
  isSaving?: boolean;
  isLoading?: boolean;
}

const ActionButtons = ({ isSaving, isLoading }: ActionButtonsProps) => {
  const t = useTranslations('preferences_settings');
  return (
    <Button
      type="submit"
      form="preferences-settings-form"
      disabled={isSaving || isLoading}
    >
      <SaveIcon className="size-4" />
      {isSaving ? t('saving') : t('save')}
    </Button>
  );
};

interface PreferencesSettingsEditorLayoutProps extends React.PropsWithChildren {
  actionButtons?: React.ReactNode;
}

const PreferencesSettingsEditorLayout = ({
  children,
  actionButtons,
}: PreferencesSettingsEditorLayoutProps) => {
  const t = useTranslations('preferences_settings');
  return (
    <Paper>
      <div className="space-y-6">
        {/* 標題與操作按鈕 */}
        <div className="flex items-center justify-between border-b border-basic-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-basic-800 text-2xl font-bold">{t('title')}</h2>
            <p className="text-sm text-basic-600">{t('subtitle')}</p>
          </div>
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

// 選項定義與映射
// 注意：這裡的 preferenceTypeId 和 optionId 需要根據實際 API 定義調整
const PREFERENCE_TYPE_MAP = {
  goals: 1,
  learningStyle: 2,
  timeCommitment: 3,
  interactionStyle: 4,
  feedbackStyle: 5,
} as const;

const GOALS_OPTIONS = [
  { value: 'career_skills', optionId: 1 },
  { value: 'personal_interests', optionId: 2 },
  { value: 'project_preparation', optionId: 3 },
  { value: 'deepen_knowledge', optionId: 4 },
  { value: 'academic_preparation', optionId: 5 },
];

const LEARNING_STYLE_OPTIONS = [
  { value: 'step_by_step', optionId: 1 },
  { value: 'free_exploration', optionId: 2 },
  { value: 'project_based', optionId: 3 },
  { value: 'structured_flexible', optionId: 4 },
  { value: 'practical_application', optionId: 5 },
];

const TIME_COMMITMENT_OPTIONS = [
  { value: 'short_daily', optionId: 1 },
  { value: 'weekly_focused', optionId: 2 },
  { value: 'deep_sessions', optionId: 3 },
  { value: 'irregular', optionId: 4 },
];

const INTERACTION_STYLE_OPTIONS = [
  { value: 'solo', optionId: 1 },
  { value: 'peer_support', optionId: 2 },
  { value: 'mentor_guidance', optionId: 3 },
  { value: 'feedback', optionId: 4 },
  { value: 'teaching_others', optionId: 5 },
];

const FEEDBACK_STYLE_OPTIONS = [
  { value: 'detailed_explanation', optionId: 1 },
  { value: 'encouragement', optionId: 2 },
  { value: 'thoughtful_questions', optionId: 3 },
  { value: 'examples', optionId: 4 },
  { value: 'actionable_guidance', optionId: 5 },
];

// 所有選項的映射表，用於查找 optionId
const ALL_OPTIONS_MAP = {
  goals: GOALS_OPTIONS,
  learningStyle: LEARNING_STYLE_OPTIONS,
  timeCommitment: TIME_COMMITMENT_OPTIONS,
  interactionStyle: INTERACTION_STYLE_OPTIONS,
  feedbackStyle: FEEDBACK_STYLE_OPTIONS,
} as const;

// 將表單數據轉換為 API 格式
const convertFormDataToApiFormat = (
  formData: PreferencesSettingsFormData
): Array<{
  preferenceTypeId: number;
  optionId: number;
  isSelected: boolean;
}> => {
  const result: Array<{
    preferenceTypeId: number;
    optionId: number;
    isSelected: boolean;
  }> = [];

  Object.entries(formData).forEach(([key, selectedValues]) => {
    const preferenceTypeId =
      PREFERENCE_TYPE_MAP[key as keyof typeof PREFERENCE_TYPE_MAP];
    const options = ALL_OPTIONS_MAP[key as keyof typeof ALL_OPTIONS_MAP];

    if (preferenceTypeId && options) {
      options.forEach((option) => {
        result.push({
          preferenceTypeId,
          optionId: option.optionId,
          isSelected: selectedValues.includes(option.value),
        });
      });
    }
  });

  return result;
};

export const PreferencesSettingsEditor = () => {
  const { user } = useAuth();
  const mutate = useMutate();
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations('preferences_settings');

  const preferencesSettingsSchema = createPreferencesSettingsSchema(t);

  // 從 user.preferences 中解析初始值
  // 注意：這裡假設 API 返回的格式可能是數組格式或對象格式
  const getInitialValues = (): PreferencesSettingsFormData => {
    const preferences = user?.preferences;

    // 如果 preferences 是數組格式（API 格式），需要轉換
    if (Array.isArray(preferences)) {
      const result: PreferencesSettingsFormData = {
        goals: [],
        learningStyle: [],
        timeCommitment: [],
        interactionStyle: [],
        feedbackStyle: [],
      };

      preferences.forEach(
        (pref: {
          preferenceTypeId: number;
          optionId: number;
          isSelected: boolean;
        }) => {
          const { preferenceTypeId, optionId, isSelected } = pref;
          if (!isSelected) return;

          // 根據 preferenceTypeId 找到對應的 key 和 option
          const typeKey = Object.entries(PREFERENCE_TYPE_MAP).find(
            ([, id]) => id === preferenceTypeId
          )?.[0] as keyof typeof PREFERENCE_TYPE_MAP | undefined;

          if (typeKey) {
            const options = ALL_OPTIONS_MAP[typeKey];
            const option = options.find((opt) => opt.optionId === optionId);
            if (option) {
              result[typeKey].push(option.value);
            }
          }
        }
      );
    }

    // 如果是對象格式（舊格式或直接格式）
    const prefObj = preferences as Record<string, string[]> | null | undefined;

    return {
      goals: prefObj?.goals || [],
      learningStyle: prefObj?.learningStyle || [],
      timeCommitment: prefObj?.timeCommitment || [],
      interactionStyle: prefObj?.interactionStyle || [],
      feedbackStyle: prefObj?.feedbackStyle || [],
    };
  };

  const form = useForm<PreferencesSettingsFormData>({
    resolver: zodResolver(preferencesSettingsSchema),
    defaultValues: getInitialValues(),
  });

  const { handleFormError } = useErrorHandler(form);

  const handleSubmit = async (data: PreferencesSettingsFormData) => {
    try {
      setIsSaving(true);
      // 將表單數據轉換為 API 格式
      const apiFormat = convertFormDataToApiFormat(data);

      const { data: response, error } = await client.PUT(
        '/api/v1/users/me/preferences',
        {
          body: {
            preferences: apiFormat,
          },
        }
      );

      if (error) throw error;

      // 更新 SWR cache - 重新验证用户数据以获取最新 preferences
      await mutate(['/api/v1/users/me'], undefined, { revalidate: true });

      // 更新 preferences endpoint cache
      await mutate(['/api/v1/users/me/preferences'], response, {
        revalidate: false,
      });

      toast.success(t('save_success'));
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
            id="preferences-settings-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <PreferencesSettingsEditorLayout
              actionButtons={<ActionButtons isSaving={isSaving} />}
            >
              {/* 目標區塊 */}
              <div className="space-y-4">
                <FormCheckboxGroup
                  control={form.control}
                  name="goals"
                  label={t('goals_label')}
                  options={GOALS_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(`goals_options.${opt.value}`),
                  }))}
                  required
                  maxSelection={3}
                  showCounter
                  className="grid gap-2"
                />
              </div>

              {/* 學習方式區塊 */}
              <div className="space-y-4">
                <FormCheckboxGroup
                  control={form.control}
                  name="learningStyle"
                  label={t('learning_style_label')}
                  options={LEARNING_STYLE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(`learning_style_options.${opt.value}`),
                  }))}
                  required
                  maxSelection={3}
                  showCounter
                  className="grid gap-2"
                />
              </div>

              {/* 時間投入區塊 */}
              <div className="space-y-4">
                <FormCheckboxGroup
                  control={form.control}
                  name="timeCommitment"
                  label={t('time_commitment_label')}
                  options={TIME_COMMITMENT_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(`time_commitment_options.${opt.value}`),
                  }))}
                  required
                  maxSelection={3}
                  showCounter
                  className="grid gap-2"
                />
              </div>

              {/* 互動方式區塊 */}
              <div className="space-y-4">
                <FormCheckboxGroup
                  control={form.control}
                  name="interactionStyle"
                  label={t('interaction_style_label')}
                  options={INTERACTION_STYLE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(`interaction_style_options.${opt.value}`),
                  }))}
                  required
                  maxSelection={3}
                  showCounter
                  className="grid gap-2"
                />
              </div>

              {/* 反饋方式區塊 */}
              <div className="space-y-4">
                <FormCheckboxGroup
                  control={form.control}
                  name="feedbackStyle"
                  label={t('feedback_style_label')}
                  options={FEEDBACK_STYLE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: t(`feedback_style_options.${opt.value}`),
                  }))}
                  required
                  maxSelection={3}
                  showCounter
                  className="grid gap-2"
                />
              </div>
            </PreferencesSettingsEditorLayout>
          </form>
        </Form>
      </Container>
    </Background>
  );
};
