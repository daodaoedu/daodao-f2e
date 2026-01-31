import { useMemo } from 'react'
import { YStack, XStack, Text, Card, Button, Spinner } from 'tamagui'
import { Check, Flame, ChevronRight } from '@tamagui/lucide-icons'
import { colors } from '@/generated/design-tokens'
import type { Practice } from '@/types/practice'
import { ProgressRing } from './ProgressRing'

interface PracticeCardProps {
  practice: Practice
  onPress?: () => void
  onCheckIn?: () => void
  showCheckInButton?: boolean
  isCheckingIn?: boolean
}

export function PracticeCard({
  practice,
  onPress,
  onCheckIn,
  showCheckInButton = true,
  isCheckingIn = false,
}: PracticeCardProps) {
  const progress = useMemo(() => {
    return practice.targetDays > 0
      ? Math.round((practice.completedDays / practice.targetDays) * 100)
      : 0
  }, [practice.completedDays, practice.targetDays])

  const cardColor = practice.color || colors.primary.base

  const accessibilityLabel = useMemo(() => {
    const status = practice.todayCheckedIn ? '已完成' : '待完成'
    const streak = practice.currentStreak > 0 ? `，連續 ${practice.currentStreak} 天` : ''
    return `${practice.title}，${status}，進度 ${progress}%${streak}`
  }, [practice.title, practice.todayCheckedIn, practice.currentStreak, progress])

  return (
    <Card
      padding="$4"
      backgroundColor="$background"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="點擊查看詳情"
    >
      <XStack gap="$4" alignItems="center">
        {/* Progress Ring */}
        <ProgressRing
          progress={progress}
          size={64}
          strokeWidth={6}
          color={cardColor}
          showLabel={false}
        />

        {/* Content */}
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2">
            <Text
              fontSize={16}
              fontWeight="600"
              color="$color"
              numberOfLines={1}
              flex={1}
            >
              {practice.title}
            </Text>
            {practice.todayCheckedIn && (
              <XStack
                backgroundColor={colors.semantic.success}
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$sm"
                accessibilityLabel="今日已完成"
              >
                <Check size={12} color={colors.basic.white} />
              </XStack>
            )}
          </XStack>

          <XStack alignItems="center" gap="$3">
            <Text fontSize={13} color="$color" opacity={0.6}>
              {practice.completedDays}/{practice.targetDays} 天
            </Text>

            {practice.currentStreak > 0 && (
              <XStack alignItems="center" gap="$1">
                <Flame size={14} color={colors.semantic.warning} />
                <Text fontSize={13} color={colors.semantic.warning}>
                  {practice.currentStreak} 天連續
                </Text>
              </XStack>
            )}
          </XStack>

          {practice.tags.length > 0 && (
            <XStack gap="$1" flexWrap="wrap" marginTop="$1">
              {practice.tags.slice(0, 3).map(tag => (
                <XStack
                  key={tag}
                  backgroundColor={colors.basic[100]}
                  paddingHorizontal="$2"
                  paddingVertical={2}
                  borderRadius="$none"
                >
                  <Text fontSize={11} color="$color" opacity={0.7}>
                    {tag}
                  </Text>
                </XStack>
              ))}
            </XStack>
          )}
        </YStack>

        {/* Actions */}
        <XStack alignItems="center" gap="$2">
          {showCheckInButton && !practice.todayCheckedIn && (
            <Button
              size="$3"
              backgroundColor={cardColor}
              pressStyle={{ opacity: 0.8 }}
              onPress={(e) => {
                e.stopPropagation()
                onCheckIn?.()
              }}
              circular
              disabled={isCheckingIn}
              accessibilityRole="button"
              accessibilityLabel={`打卡 ${practice.title}`}
              accessibilityHint="點擊完成今日打卡"
            >
              {isCheckingIn ? (
                <Spinner size="small" color={colors.basic.white} />
              ) : (
                <Check size={18} color={colors.basic.white} />
              )}
            </Button>
          )}
          <ChevronRight size={20} color="$color" opacity={0.4} />
        </XStack>
      </XStack>
    </Card>
  )
}
