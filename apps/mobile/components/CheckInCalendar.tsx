import { useMemo } from "react";
import { Calendar, type DateData, LocaleConfig } from "react-native-calendars";
import { YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileI18n } from "@/i18n";

const CALENDAR_LOCALE_TODAY: Record<string, string> = {
  "zh-TW": "今天",
  en: "Today",
};

function buildCalendarLocale(locale: string) {
  const monthDate = new Date(Date.UTC(2024, 0, 1));
  const sunday = new Date(Date.UTC(2024, 0, 7));
  const monthName = (month: number, format: Intl.DateTimeFormatOptions["month"]) => {
    monthDate.setUTCMonth(month);
    return new Intl.DateTimeFormat(locale, { month: format, timeZone: "UTC" }).format(monthDate);
  };
  const dayName = (day: number, format: Intl.DateTimeFormatOptions["weekday"]) => {
    sunday.setUTCDate(7 + day);
    return new Intl.DateTimeFormat(locale, { weekday: format, timeZone: "UTC" }).format(sunday);
  };

  return {
    monthNames: Array.from({ length: 12 }, (_, month) => monthName(month, "long")),
    monthNamesShort: Array.from({ length: 12 }, (_, month) => monthName(month, "short")),
    dayNames: Array.from({ length: 7 }, (_, day) => dayName(day, "long")),
    dayNamesShort: Array.from({ length: 7 }, (_, day) => dayName(day, "short")),
    today: CALENDAR_LOCALE_TODAY[locale] ?? CALENDAR_LOCALE_TODAY.en,
  };
}

LocaleConfig.locales["zh-TW"] = buildCalendarLocale("zh-TW");
LocaleConfig.locales.en = buildCalendarLocale("en");
LocaleConfig.defaultLocale = "zh-TW";

interface CheckInCalendarProps {
  checkInDates: string[]; // ISO date strings (YYYY-MM-DD)
  color?: string;
  onDayPress?: (date: DateData) => void;
  currentMonth?: string; // YYYY-MM format
  onMonthChange?: (month: DateData) => void;
}

interface IMarkedDates {
  [date: string]: {
    selected?: boolean;
    selectedColor?: string;
    marked?: boolean;
    dotColor?: string;
  };
}

export function CheckInCalendar({
  checkInDates,
  color = colors.primary.base,
  onDayPress,
  currentMonth,
  onMonthChange,
}: CheckInCalendarProps) {
  const { locale } = useMobileI18n();
  LocaleConfig.defaultLocale = locale;

  const markedDates = useMemo<IMarkedDates>(() => {
    const marks: IMarkedDates = {};

    checkInDates.forEach((date) => {
      marks[date] = {
        selected: true,
        selectedColor: color,
      };
    });

    // Mark today
    const today = new Date().toISOString().split("T")[0];
    if (!marks[today]) {
      marks[today] = {
        marked: true,
        dotColor: colors.primary.base,
      };
    }

    return marks;
  }, [checkInDates, color]);

  return (
    <YStack>
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        firstDay={0}
        enableSwipeMonths
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: colors.basic[500],
          selectedDayBackgroundColor: color,
          selectedDayTextColor: colors.basic.white,
          todayTextColor: colors.primary.base,
          dayTextColor: colors.basic[600],
          textDisabledColor: colors.basic[300],
          dotColor: colors.primary.base,
          selectedDotColor: colors.basic.white,
          arrowColor: colors.primary.base,
          monthTextColor: colors.basic.black,
          textDayFontWeight: "500",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "500",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />
    </YStack>
  );
}
