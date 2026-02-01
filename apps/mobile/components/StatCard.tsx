import { YStack, XStack, Text, Card } from 'tamagui'
import { TrendingUp, TrendingDown } from '@tamagui/lucide-icons'
import type { ReactNode } from 'react'
import { colors } from '@/generated/design-tokens'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = colors.primary.base,
}: StatCardProps) {
  return (
    <Card
      flex={1}
      padding="$4"
      backgroundColor="$background"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      pressStyle={{ scale: 0.98 }}
    >
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={12} color="$color" opacity={0.6}>
            {label}
          </Text>
          {icon}
        </XStack>

        <XStack alignItems="baseline" gap="$2">
          <Text fontSize={28} fontWeight="700" color={color}>
            {value}
          </Text>

          {trend && (
            <XStack alignItems="center" gap="$1">
              {trend.isPositive ? (
                <TrendingUp size={14} color={colors.semantic.success} />
              ) : (
                <TrendingDown size={14} color={colors.semantic.error} />
              )}
              <Text
                fontSize={12}
                color={trend.isPositive ? colors.semantic.success : colors.semantic.error}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>
    </Card>
  )
}
