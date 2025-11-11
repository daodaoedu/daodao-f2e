'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/shared/i18n/navigation';
import { useAuth, useAuthActions , getUserProfileBasePath } from '@/entities/user';
import { useDialog } from '@/contexts/Dialog';
import { Form, parseSchemaAutoFocus } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';
import { Background, Container, Paper } from '@/shared/ui/wrapper';
import { Image } from '@/shared/ui/image';
import { Progress } from '@/shared/ui/progress';
import getEnv from '@/shared/config/env';
import { PersonalInfoStep, InterestsStep, ReferralSourceStep } from './steps';
import { onboardingSchema, type OnboardingFormData } from '../model';
import { ONBOARDING_STEPS } from '../config';

export const AuthOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { user } = useAuth();
  const { openDialog } = useDialog();
  const { updateUser } = useAuthActions();
  const searchParams = getEnv().isClientSide
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const redirectTo = searchParams?.get('rt') || '/';

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
  });

  const progress = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  const handleNextStep = async () => {
    let stepSchema;

    switch (currentStep) {
      case 1:
        stepSchema = onboardingSchema.pick({
          birthDay: true,
          name: true,
          customId: true,
          personalSlogan: true,
        });
        break;
      case 2:
        stepSchema = onboardingSchema.pick({
          professionalField: true,
          interestList: true,
        });
        break;
      case 3:
        stepSchema = onboardingSchema.pick({
          referralSource: true,
        });
        break;
      default:
        return;
    }

    parseSchemaAutoFocus({
      form,
      schema: stepSchema,
      onSuccess: () => {
        if (currentStep < ONBOARDING_STEPS.length) {
          setCurrentStep(currentStep + 1);
        }
      },
    });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: OnboardingFormData) => {
    try {
      await updateUser(data);

      openDialog({
        title: `${data.name}，歡迎加入島島阿學！`,
        size: 'md',
        content: (
          <Image
            src="/assets/images/social-validation.png"
            alt="dao-dao-island"
            className="mx-auto"
            width={272}
            height={211}
          />
        ),
        cancelText: '稍後設定',
        cancelBtnProps: {
          variant: 'outline',
        },
        confirmText: '前往完成偏好設定獲得個人化推薦',
        footerButtonsClassName: 'flex-col-reverse',
        footerDescription: (
          <p className="body-sm mt-4 rounded bg-basic-100 px-5 py-2 text-center text-basic-400">
            記得到信箱收我們的歡迎信哦！
          </p>
        ),
        onConfirm: () => {
          router.replace(getUserProfileBasePath(user));
        },
        onCancel: () => {
          router.push(redirectTo);
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Onboarding submission error:', error);
    }
  };

  // 當步驟改變時滾動到頂部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <InterestsStep />;
      case 3:
        return <ReferralSourceStep />;
      default:
        return null;
    }
  };

  return (
    <Background>
      <Container className="max-w-4xl pb-12">
        <Paper className="p-6 md:p-10">
          {/* 進度指示器 */}
          <div className="mb-8">
            <div className="mb-4 text-sm text-gray-500">
              {currentStep} / {ONBOARDING_STEPS.length}
            </div>
            <Progress value={progress} className="h-2" />

            {/* 步驟圓點指示器 */}
            <div className="mt-2 flex items-center justify-between">
              {ONBOARDING_STEPS.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex size-2 rounded-full transition-colors',
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-200 text-gray-500'
                  )}
                />
              ))}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* 步驟標題 */}
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  {ONBOARDING_STEPS[currentStep - 1]?.title}
                </h1>
                <p className="text-gray-600">
                  {ONBOARDING_STEPS[currentStep - 1]?.description}
                </p>
              </div>

              {/* 步驟內容 */}
              <div className="min-h-[400px]">{renderStepContent()}</div>

              {/* 導航按鈕 */}
              <div className="flex justify-between pt-6">
                {currentStep !== 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevStep}
                    className="-ml-4 px-4"
                  >
                    <ChevronLeftIcon className="size-6" />
                    上一步
                  </Button>
                )}

                {currentStep < ONBOARDING_STEPS.length ? (
                  <Button
                    key="next"
                    type="button"
                    variant="ghost"
                    onClick={handleNextStep}
                    className="-mr-4 ml-auto px-4"
                  >
                    下一步
                    <ChevronRightIcon className="size-6" />
                  </Button>
                ) : (
                  <Button key="submit" type="submit" className="w-32">
                    完成註冊
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Paper>
      </Container>
    </Background>
  );
};
