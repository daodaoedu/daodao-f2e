import { X } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Text, XStack } from "tamagui";
import { Button } from "@/components/ui/button";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { ICheckInDate } from "../types";
import { CheckInDateButton } from "./check-in-date-button";
import type { ICheckInDateSelectorProps } from "./types";

const ITEM_GAP = 12;

/** 半透明淺青底（對齊 product 的 #E9FEFFB2/70） */
const NAV_BG = "rgba(233, 254, 255, 0.7)";
const NAV_BORDER = "#E9FEFF";

/**
 * 打卡日期選擇器組件 (Mobile)
 * 頂部半透明青色 nav（標題 + 關閉），下方水平滾動顯示所有打卡日期
 */
export const CheckInDateSelector = ({
  checkInDates,
  checkIns,
  activeCheckInId,
  activeDate,
  onCheckInSelect,
  title,
  onClose,
  hidden = false,
  onHeightChange,
}: ICheckInDateSelectorProps) => {
  const tCommon = useMobileTranslation("common");
  const flatListRef = useRef<FlatList<ICheckInDate>>(null);
  const [navHeight, setNavHeight] = useState(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (height > 0 && height !== navHeight) {
        setNavHeight(height);
        onHeightChange?.(height);
      }
    },
    [navHeight, onHeightChange]
  );

  const handleSelect = useCallback(
    (checkInId: string) => {
      onCheckInSelect?.(checkInId);
    },
    [onCheckInSelect]
  );

  // 當 active 狀態變化時，滾動到對應位置（優先用日期比對，支援同日多筆打卡）
  useEffect(() => {
    if (checkInDates.length === 0) return;

    const activeIndex = checkInDates.findIndex((item) =>
      activeDate ? item.date === activeDate : item.id === activeCheckInId
    );
    if (activeIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [activeCheckInId, activeDate, checkInDates]);

  const renderItem = useCallback(
    ({ item, index }: { item: ICheckInDate; index: number }) => (
      <CheckInDateButton
        item={item}
        index={index}
        checkIns={checkIns}
        activeCheckInId={activeCheckInId}
        activeDate={activeDate}
        onSelect={handleSelect}
      />
    ),
    [checkIns, activeCheckInId, activeDate, handleSelect]
  );

  const keyExtractor = useCallback((item: ICheckInDate) => item.id, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  const hasHeader = Boolean(title || onClose);

  return (
    <MotiView
      style={styles.nav}
      onLayout={handleLayout}
      animate={{ translateY: hidden && navHeight > 0 ? -navHeight : 0 }}
      transition={{ type: "timing", duration: 250 }}
    >
      {/* 標題列（標題置中 + 右側關閉），對齊 product 的 nav */}
      {hasHeader && (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$5"
          paddingTop="$3"
        >
          {/* 左側佔位，讓標題置中 */}
          <View style={styles.headerSpacer} />
          <Text fontSize={18} fontWeight="500" color={colors.gray.dark} numberOfLines={1}>
            {title}
          </Text>
          {onClose ? (
            <Button
              size="$3"
              circular
              chromeless
              onPress={onClose}
              accessibilityLabel={tCommon("close")}
            >
              <X size={22} color={colors.gray.mid} />
            </Button>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </XStack>
      )}

      {checkInDates.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={checkInDates}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.list}
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
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  nav: {
    // 固定覆蓋式 nav（對齊 product 的 fixed top nav）
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: NAV_BG,
    borderBottomWidth: 2,
    borderBottomColor: NAV_BORDER,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSpacer: {
    width: 40,
  },
  // 水平 FlatList 在 flex column 中預設會撐滿垂直空間，flexGrow: 0 讓高度依內容決定
  list: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  separator: {
    width: ITEM_GAP,
  },
});
