import { useRef, useCallback, useEffect } from "react";
import { ScrollView, FlatList } from "react-native";
import { XStack } from "tamagui";
import type { ICheckInDateSelectorProps } from "./types";
import { CheckInDateButton } from "./check-in-date-button";

/**
 * 打卡日期選擇器組件 (Mobile)
 * 水平滾動顯示所有打卡日期
 */
export const CheckInDateSelector = ({
  checkInDates,
  checkIns,
  activeCheckInId,
  onCheckInSelect,
}: ICheckInDateSelectorProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSelect = useCallback(
    (checkInId: string) => {
      onCheckInSelect?.(checkInId);
    },
    [onCheckInSelect]
  );

  // 當 activeCheckInId 變化時，滾動到對應位置
  useEffect(() => {
    if (!activeCheckInId) return;

    const activeIndex = checkInDates.findIndex(
      (item) => item.id === activeCheckInId
    );
    if (activeIndex >= 0 && scrollViewRef.current) {
      // 計算滾動位置（每個按鈕 48px + 間距 12px）
      const scrollX = Math.max(0, activeIndex * 60 - 100);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [activeCheckInId, checkInDates]);

  if (checkInDates.length === 0) {
    return null;
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <XStack gap="$3">
        {checkInDates.map((item, index) => (
          <CheckInDateButton
            key={item.id}
            item={item}
            index={index}
            checkIns={checkIns}
            activeCheckInId={activeCheckInId}
            onSelect={handleSelect}
          />
        ))}
      </XStack>
    </ScrollView>
  );
};
