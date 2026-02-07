import { YStack, Text } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Compass } from '@tamagui/lucide-icons'
import { colors } from '@/generated/design-tokens'

export default function ExploreScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background" padding="$4">
        {/* Header */}
        <Text fontSize={24} fontWeight="700" color="$color" marginBottom="$4">
          探索
        </Text>

        {/* Coming Soon */}
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$4"
        >
          <Compass size={64} color={colors.basic[300]} />
          <YStack alignItems="center" gap="$2">
            <Text fontSize={18} fontWeight="600" color="$color">
              即將推出
            </Text>
            <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
              探索其他學習者的實踐{'\n'}獲得靈感與動力
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
