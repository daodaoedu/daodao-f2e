import { useRef, useCallback, useEffect } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import type { ICheckInDateSelectorProps } from "./types";
import { CheckInDateButton } from "./check-in-date-button";
import type { ICheckInDate } from "../types";

const ITEM_GAP = 12;

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
  const flatListRef = useRef<FlatList<ICheckInDate>>(null);

  const handleSelect = useCallback(
    (checkInId: string) => {
      onCheckInSelect?.(checkInId);
    },
    [onCheckInSelect]
  );

  // 當 activeCheckInId 變化時，滾動到對應位置
  useEffect(() => {
    if (!activeCheckInId || checkInDates.length === 0) return;

    const activeIndex = checkInDates.findIndex(
      (item) => item.id === activeCheckInId
    );
    if (activeIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [activeCheckInId, checkInDates]);

  const renderItem = useCallback(
    ({ item, index }: { item: ICheckInDate; index: number }) => (
      <CheckInDateButton
        item={item}
        index={index}
        checkIns={checkIns}
        activeCheckInId={activeCheckInId}
        onSelect={handleSelect}
      />
    ),
    [checkIns, activeCheckInId, handleSelect]
  );

  const keyExtractor = useCallback((item: ICheckInDate) => item.id, []);

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  if (checkInDates.length === 0) {
    return null;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={checkInDates}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      ItemSeparatorComponent={ItemSeparator}
      onScrollToIndexFailed={(info) => {
        // Handle scroll failure gracefully
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
          });
        }, 100);
      }}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    width: ITEM_GAP,
  },
});
