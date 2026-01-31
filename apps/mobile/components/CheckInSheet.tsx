import { useState, useCallback, useEffect } from 'react'
import { Keyboard } from 'react-native'
import { Sheet, YStack, XStack, Text, Button, Input, Spinner } from 'tamagui'
import { Check, X, Sparkles, Share2 } from '@tamagui/lucide-icons'
import { colors } from '@/generated/design-tokens'
import type { Practice } from '@/types/practice'
import { ProgressRing } from './ProgressRing'
import { analyticsService } from '@/services/analytics'

interface CheckInSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  practice: Practice | null
  onCheckIn: (note?: string) => Promise<{ success: boolean; error?: string }>
  onShare?: () => void
}

export function CheckInSheet({
  open,
  onOpenChange,
  practice,
  onCheckIn,
  onShare,
}: CheckInSheetProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setNote('')
      setShowSuccess(false)
    }
  }, [open])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !practice) return

    Keyboard.dismiss()
    setIsSubmitting(true)

    try {
      const result = await onCheckIn(note.trim() || undefined)

      if (result.success) {
        // Track check-in event
        analyticsService.trackCheckIn({
          practice_id: practice.id,
          streak_count: practice.currentStreak + 1,
          has_note: !!note.trim(),
        })
        setShowSuccess(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, note, onCheckIn, practice])

  const handleQuickCheckIn = useCallback(async () => {
    if (isSubmitting || !practice) return

    setIsSubmitting(true)

    try {
      const result = await onCheckIn()

      if (result.success) {
        // Track check-in event
        analyticsService.trackCheckIn({
          practice_id: practice.id,
          streak_count: practice.currentStreak + 1,
          has_note: false,
        })
        setShowSuccess(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, onCheckIn, practice])

  if (!practice) return null

  const progress = practice.targetDays > 0
    ? Math.round((practice.completedDays / practice.targetDays) * 100)
    : 0

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        padding="$4"
        backgroundColor="$background"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
      >
        <Sheet.Handle backgroundColor="$borderColor" />

        {showSuccess ? (
          // Success State
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$4"
            paddingVertical="$8"
          >
            <YStack
              width={100}
              height={100}
              backgroundColor={colors.semantic.success}
              borderRadius={50}
              alignItems="center"
              justifyContent="center"
            >
              <Check size={48} color={colors.basic.white} />
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={24} fontWeight="700" color="$color">
                打卡成功！
              </Text>
              <XStack alignItems="center" gap="$1">
                <Sparkles size={16} color={colors.semantic.warning} />
                <Text fontSize={16} color={colors.semantic.warning}>
                  連續 {practice.currentStreak + 1} 天
                </Text>
              </XStack>
            </YStack>

            {/* Action Buttons */}
            <XStack gap="$3" paddingTop="$4">
              {onShare && (
                <Button
                  size="$4"
                  backgroundColor={colors.primary.base}
                  pressStyle={{ backgroundColor: colors.primary.darker }}
                  onPress={onShare}
                  accessibilityLabel="分享打卡成果"
                >
                  <XStack alignItems="center" gap="$2">
                    <Share2 size={18} color={colors.basic.white} />
                    <Text color={colors.basic.white} fontWeight="600">
                      分享
                    </Text>
                  </XStack>
                </Button>
              )}
              <Button
                size="$4"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor="$borderColor"
                pressStyle={{ backgroundColor: '$backgroundHover' }}
                onPress={() => onOpenChange(false)}
                accessibilityLabel="關閉"
              >
                <Text color="$color" fontWeight="600">
                  完成
                </Text>
              </Button>
            </XStack>
          </YStack>
        ) : (
          // Check-in Form
          <YStack flex={1} gap="$4" paddingTop="$4">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={20} fontWeight="700" color="$color">
                打卡
              </Text>
              <Button
                size="$3"
                circular
                chromeless
                onPress={() => onOpenChange(false)}
                accessibilityLabel="關閉"
              >
                <X size={20} color="$color" />
              </Button>
            </XStack>

            {/* Practice Info */}
            <XStack
              backgroundColor={colors.primary.palest}
              padding="$4"
              borderRadius="$md"
              gap="$4"
              alignItems="center"
            >
              <ProgressRing
                progress={progress}
                size={56}
                strokeWidth={5}
                color={practice.color || colors.primary.base}
                showLabel={false}
              />
              <YStack flex={1} gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.primary.darker}>
                  {practice.title}
                </Text>
                <Text fontSize={13} color={colors.primary.darker} opacity={0.8}>
                  第 {practice.completedDays + 1} 天 / {practice.targetDays} 天
                </Text>
              </YStack>
            </XStack>

            {/* Quick Check-in */}
            <Button
              size="$5"
              backgroundColor={colors.primary.base}
              pressStyle={{ backgroundColor: colors.primary.darker }}
              onPress={handleQuickCheckIn}
              disabled={isSubmitting}
              accessibilityLabel="一鍵打卡"
            >
              {isSubmitting ? (
                <Spinner color={colors.basic.white} />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <Check size={20} color={colors.basic.white} />
                  <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                    一鍵打卡
                  </Text>
                </XStack>
              )}
            </Button>

            {/* Note Input */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color="$color">
                今日心得（選填）
              </Text>
              <Input
                size="$4"
                placeholder="記錄今天的學習心得..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                borderColor={colors.basic[200]}
                focusStyle={{ borderColor: colors.primary.base }}
                accessibilityLabel="打卡心得輸入"
              />
            </YStack>

            {/* Submit with Note */}
            {note.trim() && (
              <Button
                size="$4"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor={colors.primary.base}
                pressStyle={{ backgroundColor: colors.primary.palest }}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text color={colors.primary.base} fontWeight="600">
                  打卡並記錄心得
                </Text>
              </Button>
            )}
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  )
}
