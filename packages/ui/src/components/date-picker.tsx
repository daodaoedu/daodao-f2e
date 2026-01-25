"use client";

import { format, isAfter, isBefore, isValid, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function getRangeErrorMessage(
  date: Date,
  minDate: Date | undefined,
  maxDate: Date | undefined
): string | undefined {
  const dateStartOfDay = startOfDay(date);
  if (minDate && isBefore(dateStartOfDay, startOfDay(minDate))) {
    return `日期不能早於 ${format(minDate, "yyyy/MM/dd")}`;
  }
  if (maxDate && isAfter(dateStartOfDay, startOfDay(maxDate))) {
    return `日期不能晚於 ${format(maxDate, "yyyy/MM/dd")}`;
  }
  return undefined;
}

function formatDate(date: Date | undefined) {
  if (date && isValid(date)) {
    return format(date, "yyyy/MM/dd");
  }
  return "";
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

function isDateInRange(
  date: Date | undefined,
  minDate: Date | undefined,
  maxDate: Date | undefined
) {
  if (!date) {
    return false;
  }
  const dateStartOfDay = startOfDay(date);
  if (minDate && isBefore(dateStartOfDay, startOfDay(minDate))) {
    return false;
  }
  if (maxDate && isAfter(dateStartOfDay, startOfDay(maxDate))) {
    return false;
  }
  return true;
}

interface DatePickerProps {
  value: Date | undefined;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  onError?: (message: string) => void;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      invalid,
      placeholder = "請選擇日期",
      className,
      minDate,
      maxDate,
      onChange,
      onBlur,
      onError,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(value);
    const [month, setMonth] = React.useState<Date | undefined>(value);
    const [inputValue, setInputValue] = React.useState(formatDate(value));
    const [isRangeError, setIsRangeError] = React.useState(false);

    React.useEffect(() => {
      setDate(value);
      setInputValue(formatDate(value));
      setIsRangeError(false);
    }, [value]);

    const handleDateChange = (newDate: Date | undefined) => {
      if (newDate && isDateInRange(newDate, minDate, maxDate)) {
        setDate(newDate);
        setInputValue(formatDate(newDate));
        setIsRangeError(false);
        onChange?.(newDate);
      } else if (!newDate) {
        setDate(undefined);
        setInputValue("");
        setIsRangeError(false);
        onChange?.(undefined);
      }
    };

    const handleRangeError = (inputDate: Date) => {
      setIsRangeError(true);
      const errorMessage = getRangeErrorMessage(inputDate, minDate, maxDate);
      if (errorMessage) {
        onError?.(errorMessage);
      }
    };

    return (
      <div className="relative flex gap-2">
        <Input
          ref={ref}
          value={inputValue}
          placeholder={placeholder}
          className={cn("pr-10", className, (invalid || isRangeError) && "border-red")}
          onChange={(e) => {
            const inputDate = new Date(e.target.value);
            setInputValue(e.target.value);
            if (isValidDate(inputDate)) {
              if (isDateInRange(inputDate, minDate, maxDate)) {
                handleDateChange(inputDate);
              } else {
                onChange?.(undefined);
                setDate(undefined);
                setMonth(undefined);
                handleRangeError(inputDate);
              }
            } else {
              setIsRangeError(false);
              onChange?.(undefined);
              setDate(undefined);
              setMonth(undefined);
            }
          }}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              disabled={(date) =>
                (minDate && isBefore(date, startOfDay(minDate))) ||
                (maxDate && isAfter(date, startOfDay(maxDate))) ||
                false
              }
              onSelect={(calendarDate) => {
                if (calendarDate && isDateInRange(calendarDate, minDate, maxDate)) {
                  handleDateChange(calendarDate);
                  setOpen(false);
                  onBlur?.();
                } else if (!calendarDate) {
                  handleDateChange(undefined);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
