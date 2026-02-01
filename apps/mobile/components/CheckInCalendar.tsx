import { useMemo } from 'react'
import { Calendar, type DateData, LocaleConfig } from 'react-native-calendars'
import { YStack } from 'tamagui'
import { colors } from '@/generated/design-tokens'

// 設定中文語系
LocaleConfig.locales['zh-TW'] = {
  monthNames: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
}
LocaleConfig.defaultLocale = 'zh-TW'

interface CheckInCalendarProps {
  checkInDates: string[] // ISO date strings (YYYY-MM-DD)
  color?: string
  onDayPress?: (date: DateData) => void
  currentMonth?: string // YYYY-MM format
  onMonthChange?: (month: DateData) => void
}

interface MarkedDates {
  [date: string]: {
    selected?: boolean
    selectedColor?: string
    marked?: boolean
    dotColor?: string
  }
}

export function CheckInCalendar({
  checkInDates,
  color = colors.primary.base,
  onDayPress,
  currentMonth,
  onMonthChange,
}: CheckInCalendarProps) {
  const markedDates = useMemo<MarkedDates>(() => {
    const marks: MarkedDates = {}

    checkInDates.forEach(date => {
      marks[date] = {
        selected: true,
        selectedColor: color,
      }
    })

    // Mark today
    const today = new Date().toISOString().split('T')[0]
    if (!marks[today]) {
      marks[today] = {
        marked: true,
        dotColor: colors.primary.base,
      }
    }

    return marks
  }, [checkInDates, color])

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
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
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
          textDayFontWeight: '500',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />
    </YStack>
  )
}
