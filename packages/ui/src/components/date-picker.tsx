"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, isValid } from "date-fns";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../lib/utils";

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
  return !isNaN(date.getTime());
}

interface DatePickerProps {
  value: Date | undefined;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, invalid, placeholder = "請選擇日期", className, onChange, onBlur }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(value);
    const [month, setMonth] = React.useState<Date | undefined>(value);
    const [inputValue, setInputValue] = React.useState(formatDate(value));

    return (
      <div className="relative flex gap-2">
        <Input
          ref={ref}
          value={inputValue}
          placeholder={placeholder}
          className={cn("pr-10", className, invalid && "border-red")}
          onChange={(e) => {
            const inputDate = new Date(e.target.value);
            setInputValue(e.target.value);
            if (isValidDate(inputDate)) {
              onChange?.(inputDate);
            } else {
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
              onSelect={(calendarDate) => {
                setDate(calendarDate);
                setInputValue(formatDate(calendarDate));
                setOpen(false);
                onChange?.(calendarDate);
                onBlur?.();
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
