import { useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { Dayjs } from "dayjs";
import { CalendarPicker } from "@mui/x-date-pickers/CalendarPicker";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import SwapRightIcon from "@/public/assets/icons/swap-right.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { cn } from "@/utils/cn";

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
  isSunday: boolean;
  isSaturday: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== "dayIsBetween" &&
    prop !== "isFirstDay" &&
    prop !== "isLastDay" &&
    prop !== "isSunday" &&
    prop !== "isSaturday",
})<CustomPickerDayProps>(
  ({ theme, dayIsBetween, isFirstDay, isLastDay, isSunday, isSaturday }) => ({
    width: "40px",
    ...(dayIsBetween && {
      borderRadius: 0,
      backgroundColor: theme.palette.primary.main,
      "&, &.Mui-disabled": {
        color: theme.palette.common.white,
      },
      "&:hover, &:focus": {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
    ...(isSunday && {
      borderTopLeftRadius: "0.25rem",
      borderBottomLeftRadius: "0.25rem",
    }),
    ...(isSaturday && {
      borderTopRightRadius: "0.25rem",
      borderBottomRightRadius: "0.25rem",
    }),
    ...(isFirstDay && {
      borderTopLeftRadius: "1.25rem",
      borderBottomLeftRadius: "1.25rem",
    }),
    ...(isLastDay && {
      borderTopRightRadius: "1.25rem",
      borderBottomRightRadius: "1.25rem",
    }),
  })
) as React.ComponentType<CustomPickerDayProps>;

interface DateRangePickerProps {
  startDate: Dayjs;
  endDate: Dayjs;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  separator?: React.ReactNode;
  afterIcon?: React.ReactNode;
  disabledStartDate?: boolean;
  disabledEndDate?: boolean;
  className?: string;
  calendarClassName?: string;
  onStartDateChange?: (date: Dayjs) => void;
  onEndDateChange?: (date: Dayjs) => void;
}

const DateRangePicker = ({
  startDate,
  endDate,
  maxDate,
  minDate,
  separator = <SwapRightIcon className="w-4 h-4 text-basic-black/25" />,
  afterIcon,
  disabledStartDate,
  disabledEndDate,
  className,
  calendarClassName,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const modeRef = useRef<"start" | "end">("start");
  const prevStartDate = useRef(startDate);
  const disabledChangeDate = disabledStartDate && disabledEndDate;

  const handleStartDateChange = (date: Dayjs) => {
    if (disabledEndDate) {
      onStartDateChange?.(date);
      setIsOpen(false);
      return;
    }
    if (endDate.isBefore(date)) {
      onEndDateChange?.(date);
      onStartDateChange?.(endDate);
    } else {
      onStartDateChange?.(date);
    }
    prevStartDate.current = date;
    modeRef.current = "end";
  };

  const handleEndDateChange = (date: Dayjs) => {
    if (disabledStartDate) {
      onEndDateChange?.(date);
    } else if (prevStartDate.current.isAfter(date)) {
      onStartDateChange?.(date);
      onEndDateChange?.(prevStartDate.current);
    } else {
      onStartDateChange?.(prevStartDate.current);
      onEndDateChange?.(date);
    }
    setIsOpen(false);
    modeRef.current = "start";
  };

  const handleChange = (date: Dayjs | null) => {
    if (!date) return;
    if (modeRef.current === "start" && !disabledStartDate) {
      handleStartDateChange(date);
    } else if (!disabledEndDate) {
      handleEndDateChange(date);
    } else {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (disabledChangeDate) return;
    setIsOpen(!isOpen);
    modeRef.current = "start";
  };

  const renderWeekPickerDay = (
    date: Dayjs,
    selectedDates: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) => {
    if (!startDate) {
      return <PickersDay {...pickersDayProps} />;
    }

    const dayIsBetween = date.isBetween(startDate, endDate, null, "[]");
    const isFirstDay = date.isSame(startDate, "day");
    const isLastDay = date.isSame(endDate, "day");
    const isSunday = date.day() === 0;
    const isSaturday = date.day() === 6;

    return (
      <CustomPickersDay
        {...pickersDayProps}
        key={pickersDayProps.key}
        disableMargin
        dayIsBetween={dayIsBetween}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isSunday={isSunday}
        isSaturday={isSaturday}
      />
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          "border border-solid border-basic-200 rounded-lg",
          disabledChangeDate &&
            "cursor-default border-transparent disabled:text-basic-400 disabled:opacity-100",
          className
        )}
        disabled={disabledChangeDate}
        onClick={handleToggle}
      >
        <span>{startDate.format("YYYY/MM/DD")}</span>
        {separator}
        <span>{endDate.format("YYYY/MM/DD")}</span>
        {afterIcon}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={calendarClassName}>
        <DropdownMenuItem>
          <CalendarPicker
            date={startDate}
            onChange={handleChange}
            views={["day"]}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabledChangeDate}
            renderDay={renderWeekPickerDay}
            disableHighlightToday
            classes={{
              root: "[&_.Mui-selected]:!text-basic-white",
            }}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DateRangePicker;
