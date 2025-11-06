'use client';

import { useFormContext } from 'react-hook-form';
import { FormRadioGroup } from '@/shared/ui/radio-group';
import { cn } from '@/shared/lib/cn';
import { REFERRAL_SOURCES } from '@/entities/user';
import type { RenderOptionFn } from '@/shared/ui/option';
import type { OnboardingFormData } from '../../model';

const renderReferralOption: RenderOptionFn = ({
  Option,
  isChecked,
  isDisabled,
  label,
}) => (
  <Option
    isChecked={isChecked}
    isDisabled={isDisabled}
    className={cn(
      'flex items-center space-x-3 rounded-lg border p-4 transition-all duration-200 text-left',
      'hover:border-primary hover:bg-primary/5',
      isChecked
        ? 'border-primary bg-primary/10'
        : 'border-gray-200 bg-white'
    )}
  >
    {/* Radio 圖標 */}
    <div className="flex size-4 items-center justify-center rounded-full border border-primary">
      {isChecked && (
        <div className="size-2 rounded-full bg-primary" />
      )}
    </div>
    
    <div className="flex-1">
      <div className="text-base font-medium text-gray-900">
        {label}
      </div>
    </div>
  </Option>
);

export const ReferralSourceStep = () => {
  const form = useFormContext<OnboardingFormData>();

  return (
    <FormRadioGroup
      control={form.control}
      name="referralSource"
      options={REFERRAL_SOURCES}
      renderOption={renderReferralOption}
      className="space-y-4"
    />
  );
};
