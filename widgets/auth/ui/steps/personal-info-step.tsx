'use client';

import { useFormContext } from 'react-hook-form';
import { subYears } from 'date-fns';
import { AtSignIcon } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { DatePickerWithForm } from '@/shared/ui/date-picker';
import { cn } from '@/shared/lib/cn';
import type { OnboardingFormData } from '../../model';

export const PersonalInfoStep = () => {
  const form = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-6">
      {/* 生日 */}
      <DatePickerWithForm
        control={form.control}
        name="birthDay"
        placeholder="年/月/日"
        withIcon
        fromDate={subYears(new Date(), 100)}
        toDate={subYears(new Date(), 16)}
        captionLayout="dropdown-buttons"
      />

      {/* 你的名字 */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>你的名字</FormLabel>
            <FormControl>
              <Input placeholder="希望大家怎麼稱呼你" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 使用者帳號 */}
      <FormField
        control={form.control}
        name="customId"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>使用者帳號</FormLabel>
            <FormControl>
              <Input
                prefixIcon={<AtSignIcon className="size-4" />}
                placeholder="設定你的專屬帳號"
                {...field}
              />
            </FormControl>
            <FormDescription
              className={cn(
                'mt-2',
                fieldState.error?.message && 'text-destructive'
              )}
            >
              僅可使用英文字母和數字，長度 3-15 個字元
            </FormDescription>
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
              <Textarea placeholder="用一句話介紹自己" rows={3} {...field} />
            </FormControl>
            <p className="body-sm mt-1 text-right text-basic-500">
              {field.value?.length || 0}/150
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
