import { useState, useCallback } from 'react'
import { Alert, RefreshControl } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Button, Spinner } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronLeft,
  Check,
  Flame,
  Calendar,
  MoreVertical,
  Pencil,
} from '@tamagui/lucide-icons'
import { usePractice, useCheckIn } from '@/hooks/usePractices'
import { ProgressRing, CheckInSheet, CheckInList, ShareCheckInSheet } from '@/components'
import { colors } from '@/generated/design-tokens'
import type { CheckIn } from '@/types/practice'

// Mock check-in data for now
const mockCheckIns: CheckIn[] = [
  { id: '1', practiceId: '1', note: '今天學了新的概念，很有收穫！', createdAt: new Date().toISOString() },
  { id: '2', practiceId: '1', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', practiceId: '1', note: '堅持就是勝利', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
]

export default function PracticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { practice, isLoading, mutate } = usePractice(id)
  const { checkIn, isChecking } = useCheckIn()

  const [showCheckInSheet, setShowCheckInSheet] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)

  const handleCheckIn = useCallback(async (note?: string) => {
    if (!id) return { success: false, error: '無效的實踐 ID' }

    const result = await checkIn({ practiceId: id, note })

    if (result.success) {
      await mutate()
    } else if (result.error) {
      Alert.alert('打卡失敗', result.error)
    }

    return result
  }, [id, checkIn, mutate])

  const handleRefresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    )
  }

  if (!practice) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            找不到此實踐
          </Text>
          <Button onPress={() => router.back()}>
            <Text>返回</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    )
  }

  const progress = practice.targetDays > 0
    ? Math.round((practice.completedDays / practice.targetDays) * 100)
    : 0

  const cardColor = practice.color || colors.primary.base

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        flex={1}
        backgroundColor="$background"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={colors.primary.base}
          />
        }
      >
        {/* Header */}
        <XStack padding="$4" justifyContent="space-between" alignItems="center">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>

          <Button
            size="$4"
            circular
            chromeless
            accessibilityLabel="更多選項"
          >
            <MoreVertical size={20} color="$color" />
          </Button>
        </XStack>

        <YStack padding="$4" gap="$5">
          {/* Progress Section */}
          <YStack alignItems="center" gap="$4">
            <ProgressRing
              progress={progress}
              size={140}
              strokeWidth={12}
              color={cardColor}
              label="完成"
            />

            <YStack alignItems="center" gap="$1">
              <Text fontSize={24} fontWeight="700" color="$color">
                {practice.title}
              </Text>
              {practice.description && (
                <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
                  {practice.description}
                </Text>
              )}
            </YStack>
          </YStack>

          {/* Stats Cards */}
          <XStack gap="$3">
            <YStack
              flex={1}
              backgroundColor={colors.primary.palest}
              padding="$4"
              borderRadius="$md"
              alignItems="center"
              gap="$1"
            >
              <Text fontSize={24} fontWeight="700" color={colors.primary.darker}>
                {practice.completedDays}
              </Text>
              <Text fontSize={12} color={colors.primary.darker} opacity={0.8}>
                已完成天數
              </Text>
            </YStack>

            <YStack
              flex={1}
              backgroundColor={colors.semantic.warning + '15'}
              padding="$4"
              borderRadius="$md"
              alignItems="center"
              gap="$1"
            >
              <XStack alignItems="center" gap="$1">
                <Flame size={20} color={colors.semantic.warning} />
                <Text fontSize={24} fontWeight="700" color={colors.semantic.warning}>
                  {practice.currentStreak}
                </Text>
              </XStack>
              <Text fontSize={12} color={colors.semantic.warning}>
                連續天數
              </Text>
            </YStack>

            <YStack
              flex={1}
              backgroundColor={colors.basic[100]}
              padding="$4"
              borderRadius="$md"
              alignItems="center"
              gap="$1"
            >
              <Text fontSize={24} fontWeight="700" color="$color">
                {practice.targetDays}
              </Text>
              <Text fontSize={12} color="$color" opacity={0.6}>
                目標天數
              </Text>
            </YStack>
          </XStack>

          {/* Check-in Button */}
          {!practice.todayCheckedIn ? (
            <Button
              size="$5"
              backgroundColor={cardColor}
              pressStyle={{ opacity: 0.8 }}
              onPress={() => setShowCheckInSheet(true)}
              disabled={isChecking}
              accessibilityLabel="打卡"
            >
              {isChecking ? (
                <Spinner color={colors.basic.white} />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <Check size={20} color={colors.basic.white} />
                  <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                    今日打卡
                  </Text>
                </XStack>
              )}
            </Button>
          ) : (
            <YStack
              backgroundColor={colors.semantic.success + '15'}
              padding="$4"
              borderRadius="$md"
              alignItems="center"
              gap="$1"
            >
              <XStack alignItems="center" gap="$2">
                <Check size={20} color={colors.semantic.success} />
                <Text fontSize={16} fontWeight="600" color={colors.semantic.success}>
                  今日已完成
                </Text>
              </XStack>
            </YStack>
          )}

          {/* Action Buttons */}
          <XStack gap="$3">
            <Button
              flex={1}
              size="$4"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="$borderColor"
              onPress={() => router.push(`/practices/${id}/calendar`)}
            >
              <XStack alignItems="center" gap="$2">
                <Calendar size={18} color="$color" />
                <Text color="$color">日曆</Text>
              </XStack>
            </Button>

            <Button
              flex={1}
              size="$4"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="$borderColor"
              onPress={() => router.push(`/practices/${id}/edit`)}
            >
              <XStack alignItems="center" gap="$2">
                <Pencil size={18} color="$color" />
                <Text color="$color">編輯</Text>
              </XStack>
            </Button>
          </XStack>

          {/* Check-in History */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="600" color="$color">
              打卡紀錄
            </Text>
            <CheckInList checkIns={mockCheckIns} />
          </YStack>
        </YStack>
      </ScrollView>

      {/* Check-in Sheet */}
      <CheckInSheet
        open={showCheckInSheet}
        onOpenChange={setShowCheckInSheet}
        practice={practice}
        onCheckIn={handleCheckIn}
        onShare={() => {
          setShowCheckInSheet(false)
          setTimeout(() => setShowShareSheet(true), 300)
        }}
      />

      {/* Share Sheet */}
      <ShareCheckInSheet
        open={showShareSheet}
        onOpenChange={setShowShareSheet}
        practice={practice}
        streakCount={practice.currentStreak + 1}
      />
    </SafeAreaView>
  )
}
