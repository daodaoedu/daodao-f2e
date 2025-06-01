"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  DateRange,
  DayPickerRangeProps,
  DayPickerSingleProps,
} from "react-day-picker";

import { cn } from "@/utils/cn";
import { Button } from "@/components/atoms/button";
import { Calendar } from "@/components/atoms/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover";
import useControlledState from "@/hooks/useControlledState";

const defaultFormatStr = "yyyy/MM/dd";

interface DatePickerProps extends Omit<DayPickerSingleProps, "mode"> {
  className?: string;
  disabled?: boolean;
  formatStr?: string;
  withIcon?: boolean;
  placeholder?: string;
  defaultDate?: Date;
  date?: Date;
  onChange?: (value?: Date) => void;
}
export function DatePicker({
  className,
  disabled,
  formatStr = defaultFormatStr,
  withIcon,
  placeholder = "選擇日期",
  defaultDate,
  date,
  onChange,
  ...props
}: DatePickerProps) {
  const [internalDate, setInternalDate] = useControlledState(
    defaultDate,
    date,
    onChange
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            "justify-start rounded border border-basic-200",
            !internalDate && "text-muted-foreground",
            disabled && "border-transparent",
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

interface DatePickerWithRangeProps extends Omit<DayPickerRangeProps, "mode"> {
  className?: string;
  disabled?: boolean;
  formatStr?: string;
  separator?: React.ReactNode;
  placeholder?: string;
  withIcon?: boolean;
  defaultDate?: DateRange;
  date?: DateRange;
  onChange?: (value?: DateRange) => void;
}

export function DatePickerWithRange({
  className,
  disabled,
  formatStr = defaultFormatStr,
  separator = "-",
  placeholder = "選擇日期",
  withIcon,
  defaultDate,
  date,
  onChange,
  ...props
}: DatePickerWithRangeProps) {
  const [internalDate, setInternalDate] = useControlledState(
    defaultDate,
    date,
    onChange
  );

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="ghost"
            disabled={disabled}
            className={cn(
              "min-w-48 justify-start rounded border border-basic-200",
              !internalDate && "text-muted-foreground",
              disabled && "border-transparent disabled:opacity-100",
              withIcon && "min-w-56",
              className
            )}
          >
            {withIcon && <CalendarIcon />}
            {internalDate?.from ? (
              internalDate.to ? (
                <>
                  {format(internalDate.from, formatStr)} {separator}{" "}
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
