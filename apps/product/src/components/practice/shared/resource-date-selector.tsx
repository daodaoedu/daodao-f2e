"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Calendar } from "@daodao/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import {
  getResourceDate,
  getResourceDayNumber,
  isResourceDayInRange,
} from "@/lib/resource-usage-date";

interface ResourceDateSelectorProps {
  dayNumber?: number | null;
  startDate: string;
  durationDays: number;
  onChange: (day: number | null) => void;
  disabled?: boolean;
}

/** Resource scheduling uses the same relative day contract as coach templates. */
export function ResourceDateSelector({
  dayNumber,
  startDate,
  durationDays,
  onChange,
  disabled,
}: ResourceDateSelectorProps) {
  const t = useTranslations("practice");
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const start = getResourceDate(startDate, 1);
  const end = getResourceDate(startDate, durationDays);
  const selected = getResourceDate(startDate, dayNumber);
  const awaitingDate = dayNumber === 0;
  const inRange = !end || isResourceDayInRange(dayNumber, durationDays);
  const unavailable = disabled || !start || !end;
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="text-sm text-text-dark">{t("resource_usage_label")}</legend>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={dayNumber == null ? "default" : "outline"}
          disabled={disabled}
          aria-pressed={dayNumber == null}
          onClick={() => onChange(null)}
        >
          {t("resource_usage_all")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={dayNumber != null ? "default" : "outline"}
          disabled={Boolean(unavailable)}
          aria-pressed={dayNumber != null}
          onClick={() => {
            // Zero is an incomplete form assignment, rejected by both form schemas.
            if (dayNumber == null) onChange(0);
            setOpen(true);
          }}
        >
          {t("resource_usage_date")}
        </Button>
      </div>
      {dayNumber != null && start && end && (
        <Popover open={open && !unavailable} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={Boolean(unavailable)}
              aria-invalid={!inRange}
              aria-describedby={!inRange ? errorId : undefined}
              aria-label={t("resource_usage_choose_date")}
            >
              <CalendarIcon className="size-4 shrink-0" />
              {selected
                ? format(parseISO(selected), "yyyy/MM/dd")
                : t("resource_usage_choose_date")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              required
              selected={selected ? parseISO(selected) : undefined}
              defaultMonth={parseISO(inRange && selected ? selected : start)}
              startMonth={parseISO(start)}
              endMonth={parseISO(end)}
              disabled={(date) =>
                isBefore(date, startOfDay(parseISO(start))) ||
                isAfter(date, startOfDay(parseISO(end)))
              }
              onSelect={(date) => {
                if (!date) return;
                const day = getResourceDayNumber(startDate, format(date, "yyyy-MM-dd"));
                if (day != null && isResourceDayInRange(day, durationDays)) {
                  onChange(day);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      )}
      {dayNumber != null && (!start || !end) && (
        <p className="text-sm text-text-dark">
          {selected?.replaceAll("-", "/")} ({t("resource_day_badge", { day: dayNumber })})
        </p>
      )}
      {!inRange && (
        <p id={errorId} role="alert" className="text-xs text-red">
          {t(awaitingDate ? "resource_usage_choose_date" : "resource_usage_out_of_range")}
        </p>
      )}
    </fieldset>
  );
}
