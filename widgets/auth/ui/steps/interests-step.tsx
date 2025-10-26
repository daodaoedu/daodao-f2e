'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { CheckboxWithForm } from '@/shared/ui/checkbox';
import { EXPERTISE_AREAS, INTEREST_AREAS } from '@/entities/user';
import type { RenderOptionProps } from '@/shared/ui/option';
import type { OnboardingFormData } from '../../model';

// 自定義渲染選項，讓選項看起來像按鈕
const renderAreaOption = ({
  Option,
  isChecked,
  isDisabled,
  label,
}: RenderOptionProps) => (
  <Option
    isChecked={isChecked}
    isDisabled={isDisabled}
    className={cn(
      'rounded-full border px-5 py-1.5 text-sm transition-all duration-200',
      isDisabled ? 'bg-basic-100' : 'hover:border-primary hover:bg-primary/5'
    )}
  >
    {label}
  </Option>
);

export const InterestsStep = () => {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-8">
      {/* 專業領域 */}
      <CheckboxWithForm
        control={form.control}
        name="professionalField"
        label="你的專業或正在學習的領域"
        options={EXPERTISE_AREAS}
        required
        maxSelection={5}
        showCounter
        className="flex flex-wrap gap-3"
        renderOption={renderAreaOption}
      />

      {/* 興趣領域 */}
      <CheckboxWithForm
        control={form.control}
        name="interestList"
        label="你有興趣探索的領域"
        options={INTEREST_AREAS}
        required
        maxSelection={5}
        showCounter
        className="flex flex-wrap gap-3"
        renderOption={renderAreaOption}
      />
    </div>
  );
};
