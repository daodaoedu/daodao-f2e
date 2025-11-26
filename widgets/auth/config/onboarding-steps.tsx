import type { ReactNode } from 'react';

export interface OnboardingStep {
  id: number;
  title: string;
  description?: ReactNode;
}

/**
 * Onboarding 流程的步驟配置
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, title: '個人資料' },
  { id: 2, title: '專業與興趣領域' },
  {
    id: 3,
    title: '你如何得知島島阿學?',
    description: (
      <span>
        幫助我們了解如何讓更多人發現島島阿學{' '}
        <span className="text-red-500">*</span>
      </span>
    ),
  },
];

