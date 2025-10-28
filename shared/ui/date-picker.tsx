'use client';

import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  DateRange,
  DayPickerRangeProps,
  DayPickerSingleProps,
} from 'react-day-picker';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import useControlledState from '@/shared/lib/use-controlled-state';
import {
  FormField, FormItem, FormLabel, FormMessage,
} from './form';

const defaultFormatStr = 'yyyy/MM/dd';

interface DatePickerProps extends Omit<DayPickerSingleProps, 'mode'> {
  className?: string;
  disabled?: boolean;
  formatStr?: string;
  withIcon?: boolean;
  placeholder?: string;
  defaultValue?: Date;
  value?: Date;
  onChange?: (value?: Date) => void;
}
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      className,
      disabled,
      formatStr = defaultFormatStr,
      withIcon,
      placeholder = '選擇日期',
      defaultValue,
      value,
      onChange,
      ...props
    }: DatePickerProps,
    ref
  ) => {
    const [internalDate, setInternalDate] = useControlledState(
      defaultValue,
      value,
      onChange
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            disabled={disabled}
            className={cn(
              'justify-start rounded border border-basic-200',
              !internalDate && 'text-muted-foreground',
              disabled && 'border-transparent',
              className
            )}
          >
            {withIcon && <CalendarIcon />}
            {internalDate ? (
              format(internalDate, formatStr)
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={setInternalDate}
            initialFocus
            {...props}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

interface DateRangePickerProps extends Omit<DayPickerRangeProps, 'mode'> {
  className?: string;
  disabled?: boolean;
  formatStr?: string;
  separator?: React.ReactNode;
  placeholder?: string;
  withIcon?: boolean;
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (value?: DateRange) => void;
}

export const DateRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(
  (
    {
      className,
      disabled,
      formatStr = defaultFormatStr,
      separator = '-',
      placeholder = '選擇日期',
      withIcon,
      defaultValue,
      value,
      onChange,
      ...props
    }: DateRangePickerProps,
    ref
  ) => {
    const [internalDate, setInternalDate] = useControlledState(
      defaultValue,
      value,
      onChange
    );

    return (
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id="date"
              variant="ghost"
              disabled={disabled}
              className={cn(
                'min-w-48 justify-start rounded border border-basic-200',
                !internalDate && 'text-muted-foreground',
                disabled && 'border-transparent disabled:opacity-100',
                withIcon && 'min-w-56',
                className
              )}
            >
              {withIcon && <CalendarIcon />}
              {internalDate?.from ? (
                internalDate.to ? (
                  <>
                    {format(internalDate.from, formatStr)}
                    {' '}
                    {separator}
                    {' '}
                    {format(internalDate.to, formatStr)}
                  </>
                ) : (
                  format(internalDate.from, formatStr)
                )
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={internalDate?.from}
              selected={internalDate}
              onSelect={setInternalDate}
              numberOfMonths={2}
              {...props}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends DatePickerProps,
    Omit<ControllerProps<TFieldValues, TName>, 'render' | 'defaultValue'> {}

export const FormDatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    ...props
  }: FormDatePickerProps<TFieldValues, TName>) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1">
          <FormLabel required>生日</FormLabel>
          <DatePicker captionLayout="dropdown-buttons" {...field} {...props} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
