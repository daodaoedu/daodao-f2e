'use client';

import React, { forwardRef } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  MultipleSelector,
  type MultipleSelectorRef,
} from '@/shared/ui/multiple-selector';
import type { OptionProps } from '@/shared/ui/option';
import { FormFieldWrapper, type BaseFormFieldProps } from '@/shared/ui/form';
import { useCities } from '../model/use-cities';

interface CitySelectorProps {
  value?: string;
  onChange?: (cities: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** 是否在聚焦時觸發搜尋 */
  triggerSearchOnFocus?: boolean;
  /** 隱藏清除全部按鈕 */
  hideClearAllButton?: boolean;
  /** 當選中項目時隱藏 placeholder */
  hidePlaceholderWhenSelected?: boolean;
}

// 共用的 hook 和 UI 元素
const useCitySelectorLogic = () => {
  const { cities, isLoading, error, searchCities } = useCities();
  const t = useTranslations('common');

  // 載入指示器
  const loadingIndicator = (
    <div className="flex items-center justify-center py-2">
      <Loader2 className="size-4 animate-spin" />
      <span className="ml-2 text-sm text-muted-foreground">
        {t('city_selector_loading')}
      </span>
    </div>
  );

  // 空狀態指示器
  const emptyIndicator = (
    <div className="flex items-center justify-center py-2">
      <span className="text-sm text-muted-foreground">
        {error
          ? t('city_selector_load_error', { error })
          : t('city_selector_empty')}
      </span>
    </div>
  );

  // 自定義 valueToOption 函數，將字串值轉換為 OptionProps
  const valueToOption = (value: string): OptionProps => {
    const foundCity = cities.find((city) => city.value === value);
    return foundCity || { value, label: value };
  };

  return {
    cities,
    isLoading,
    error,
    searchCities,
    loadingIndicator,
    emptyIndicator,
    valueToOption,
  };
};

const CitySelector = forwardRef<MultipleSelectorRef, CitySelectorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      disabled = false,
      className,
      triggerSearchOnFocus = true,
      hideClearAllButton = false,
      hidePlaceholderWhenSelected = true,
    },
    ref
  ) => {
    const {
      isLoading,
      error,
      cities,
      searchCities,
      loadingIndicator,
      emptyIndicator,
    } = useCitySelectorLogic();
    const t = useTranslations('common');

    // 如果有錯誤，顯示錯誤狀態
    if (error) {
      return (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            {t('city_selector_error', { error })}
          </p>
        </div>
      );
    }

    return (
      <MultipleSelector
        ref={ref}
        value={value ? cities.filter((city) => city.value === value) : []}
        onChange={(options: OptionProps[]) =>
          onChange?.(options[0]?.value || '')
        }
        onSearchSync={searchCities}
        placeholder={placeholder}
        loadingIndicator={loadingIndicator}
        emptyIndicator={emptyIndicator}
        maxSelected={1}
        disabled={disabled || isLoading}
        className={className}
        triggerSearchOnFocus={triggerSearchOnFocus}
        hideClearAllButton={hideClearAllButton}
        hidePlaceholderWhenSelected={hidePlaceholderWhenSelected}
        delay={300}
        selectFirstItem={false}
        virtualScroll
      />
    );
  }
);

CitySelector.displayName = 'CitySelector';

interface FormCitySelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
  className?: string;
  /** 是否在聚焦時觸發搜尋 */
  triggerSearchOnFocus?: boolean;
  /** 隱藏清除全部按鈕 */
  hideClearAllButton?: boolean;
  /** 當選中項目時隱藏 placeholder */
  hidePlaceholderWhenSelected?: boolean;
}

const FormCitySelector = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required,
  disabled,
  placeholder,
  className,
  triggerSearchOnFocus = true,
  hideClearAllButton = false,
  hidePlaceholderWhenSelected = true,
}: FormCitySelectorProps<TFieldValues, TName>) => {
  const t = useTranslations('common');
  const defaultPlaceholder = placeholder || t('city_selector_default_placeholder');
  return (
    <FormFieldWrapper
      control={control}
      name={name}
      label={label}
      required={required}
    >
      {(field) => (
        <CitySelector
          ref={field.ref}
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
          placeholder={defaultPlaceholder}
          className={className}
          triggerSearchOnFocus={triggerSearchOnFocus}
          hideClearAllButton={hideClearAllButton}
          hidePlaceholderWhenSelected={hidePlaceholderWhenSelected}
        />
      )}
    </FormFieldWrapper>
  );
};

FormCitySelector.displayName = 'FormCitySelector';

export { CitySelector, FormCitySelector };
