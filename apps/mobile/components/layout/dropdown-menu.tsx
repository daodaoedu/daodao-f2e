import { MoreHorizontal } from "@tamagui/lucide-icons";
import type { ReactNode } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { Button } from "@/components/ui/button";
export interface DropdownMenuItemConfig {
  key: string;
  icon: ReactNode;
  label: string;
  color?: string;
  onPress: () => void;
}

interface DropdownMenuProps {
  open: boolean;
  onToggle: () => void;
  items: DropdownMenuItemConfig[];
}

/**
 * 通用的「更多」下拉選單按鈕，用於卡片右上角的操作選單（檢舉/追蹤/瀏覽活動等）
 */
export function DropdownMenu({ open, onToggle, items }: DropdownMenuProps) {
  return (
    <View style={{ position: "relative" }}>
      <Button size="$3" circular chromeless hitSlop={8} onPress={onToggle}>
        <MoreHorizontal size={18} color="#9CA3AF" />
      </Button>

      {open && (
        <YStack
          position="absolute"
          right={0}
          top="100%"
          marginTop={4}
          zIndex={20}
          backgroundColor="white"
          borderRadius={16}
          paddingVertical="$2"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.15}
          shadowRadius={8}
          elevation={5}
          minWidth={140}
        >
          {items.map((item) => (
            <Button
              key={item.key}
              chromeless
              onPress={item.onPress}
              justifyContent="flex-start"
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <XStack gap="$3" alignItems="center">
                {item.icon}
                <Text fontSize={14} color={item.color ?? "#295E5C"}>
                  {item.label}
                </Text>
              </XStack>
            </Button>
          ))}
        </YStack>
      )}
    </View>
  );
}
