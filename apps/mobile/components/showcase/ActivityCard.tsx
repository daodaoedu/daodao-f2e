import { ArrowRight, ThumbsUp } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text, View, XStack } from "tamagui";
import { colors } from "@/generated/design-tokens";

interface ActivityCardProps {
  eventText: string;
  label: string;
  onPress?: () => void;
}

/**
 * 互動事件卡片（讚/留言等通知），對齊 apps/product 的 ActivityCard
 */
export function ActivityCard({ eventText, label, onPress }: ActivityCardProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <XStack
        alignItems="center"
        gap="$3"
        backgroundColor={colors.basic.white}
        borderRadius={16}
        padding="$4"
        borderWidth={1}
        borderColor="#E8F8FF"
      >
        <View
          width={36}
          height={36}
          borderRadius={18}
          backgroundColor={`${colors.primary.base}1A`}
          alignItems="center"
          justifyContent="center"
        >
          <ThumbsUp size={16} color={colors.primary.base} />
        </View>
        <View flex={1}>
          <View
            alignSelf="flex-start"
            backgroundColor={`${colors.primary.base}1A`}
            borderRadius={999}
            paddingHorizontal="$2"
            paddingVertical={2}
            marginBottom="$1"
          >
            <Text fontSize={12} fontWeight="500" color={colors.primary.base}>
              {label}
            </Text>
          </View>
          <Text fontSize={14} color={colors.text.dark}>
            {eventText}
          </Text>
        </View>
        {onPress && <ArrowRight size={20} color={colors.primary.base} />}
      </XStack>
    </Pressable>
  );
}
