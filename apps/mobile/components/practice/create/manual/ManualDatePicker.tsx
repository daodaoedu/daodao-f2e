import { Calendar as CalendarIcon } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Modal, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

interface ManualDatePickerProps {
  value?: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  minDate: string; // yyyy-MM-dd
  maxDate: string; // yyyy-MM-dd
  placeholder: string;
  invalid?: boolean;
}

/**
 * 日期選擇欄位（對齊 product DatePicker）：點擊欄位後開啟日曆，
 * 日曆限制在 minDate ~ maxDate 之間，選定後回填 yyyy-MM-dd。
 */
export function ManualDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
  invalid = false,
}: ManualDatePickerProps) {
  const [open, setOpen] = useState(false);
  const cyan = colors.logo.cyan;
  const display = value ? value.replaceAll("-", "/") : placeholder;

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          height={48}
          borderRadius={8}
          borderWidth={1}
          // 對齊 product DatePicker / Input：border-bg-gray
          borderColor={invalid ? colors.semantic.error : colors.gray.light}
          backgroundColor={colors.basic.white}
        >
          <Text fontSize={15} color={value ? colors.text.dark : colors.text.muted}>
            {display}
          </Text>
          <CalendarIcon size={20} color={colors.text.muted} />
        </XStack>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            padding: 24,
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <YStack
              backgroundColor={colors.basic.white}
              borderRadius={16}
              overflow="hidden"
              padding="$2"
            >
              <Calendar
                minDate={minDate}
                maxDate={maxDate}
                current={value || minDate}
                markedDates={
                  value ? { [value]: { selected: true, selectedColor: cyan } } : undefined
                }
                onDayPress={(day: { dateString: string }) => {
                  onChange(day.dateString);
                  setOpen(false);
                }}
                theme={{
                  selectedDayBackgroundColor: cyan,
                  selectedDayTextColor: colors.basic.white,
                  todayTextColor: cyan,
                  arrowColor: cyan,
                  textDayFontWeight: "500",
                }}
              />
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
