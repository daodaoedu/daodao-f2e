import { useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Dayjs } from 'dayjs';
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import SwapRightIcon from '@/public/assets/icons/swap-right.svg';
import CalendarIcon from '@/public/assets/icons/calendar.svg';

import useClickOutside from '@/hooks/useClickOutside';
import { cn } from '@/utils/cn';

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  dayIsBetween: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay }) => ({
  ...(dayIsBetween && {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(isFirstDay && {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  }),
  ...(isLastDay && {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  }),
})) as React.ComponentType<CustomPickerDayProps>;

interface DateRangePickerProps {
  startDate: Dayjs;
  endDate: Dayjs;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  className?: string;
  onStartDateChange: (date: Dayjs) => void;
  onEndDateChange: (date: Dayjs) => void;
}

const DateRangePicker = ({
  startDate,
  endDate,
  maxDate,
  minDate,
  className,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const modeRef = useRef<'start' | 'end'>('start');
  const { ref } = useClickOutside<HTMLDivElement>({ setState: setIsOpen });
  const prevStartDate = useRef(startDate);

  const handleStartDateChange = (date: Dayjs) => {
    if (endDate.isBefore(date)) {
      onEndDateChange(date);
      onStartDateChange(endDate);
    } else {
      onStartDateChange(date);
    }
    prevStartDate.current = date;
    modeRef.current = 'end';
  };

  const handleEndDateChange = (date: Dayjs) => {
    if (prevStartDate.current.isAfter(date)) {
      onStartDateChange(date);
      onEndDateChange(prevStartDate.current);
    } else {
      onStartDateChange(prevStartDate.current);
      onEndDateChange(date);
    }
    setIsOpen(false);
    modeRef.current = 'start';
  };

  const handleChange = (date: Dayjs | null) => {
    if (!date) return;
    if (modeRef.current === 'start') {
      handleStartDateChange(date);
    } else {
      handleEndDateChange(date);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    modeRef.current = 'start';
  };

  const renderWeekPickerDay = (
    date: Dayjs,
    selectedDates: Array<Dayjs | null>,
    pickersDayProps: PickersDayProps<Dayjs>
  ) => {
    if (!startDate) {
      return <PickersDay {...pickersDayProps} />;
    }

    const dayIsBetween = date.isBetween(startDate, endDate, null, '[]');
    const isFirstDay = date.isSame(startDate, 'day');
    const isLastDay = date.isSame(endDate, 'day');

    return (
      <CustomPickersDay
        {...pickersDayProps}
        key={pickersDayProps.key}
        disableMargin
        dayIsBetween={dayIsBetween}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    );
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={handleToggle}>
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            'border border-solid border-basic-200 rounded-lg',
            className
          )}
        >
          <span>{startDate.format('YYYY/MM/DD')}</span>
          <SwapRightIcon className="w-4 h-4 text-basic-black/25" />
          <span>{endDate.format('YYYY/MM/DD')}</span>
          <CalendarIcon className="w-4 h-4 text-primary-base" />
        </div>
      </button>
      <div
        className={cn(
          'absolute top-full mt-1 z-20',
          'bg-basic-white shadow-lg rounded-xl',
          'transition-[transform,opacity] origin-top',
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        )}
      >
        <CalendarPicker
          date={startDate}
          onChange={handleChange}
          views={['day']}
          minDate={minDate}
          maxDate={maxDate}
          renderDay={renderWeekPickerDay}
          classes={{
            root: '[&_.Mui-selected]:!text-basic-white',
          }}
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
