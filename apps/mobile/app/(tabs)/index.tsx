import { useCallback, useMemo } from 'react'
import { RefreshControl, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Spinner } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Flame, Target, CheckCircle, Calendar } from '@tamagui/lucide-icons'
import { usePractices, useCheckIn } from '@/hooks/usePractices'
import { PracticeCard, StatCard, ProgressRing } from '@/components'
import { colors } from '@/generated/design-tokens'
import { useAuth } from '@/providers/AuthProvider'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    activePractices,
    todayPending,
    todayCompleted,
    stats,
    isLoading,
    mutate,
  } = usePractices()
  const { checkIn, isChecking } = useCheckIn()

  // 使用 useMemo 優化計算
  const todayProgress = useMemo(() => {
    return stats.totalToday > 0
      ? Math.round((stats.completedToday / stats.totalToday) * 100)
      : 0
  }, [stats.completedToday, stats.totalToday])

  const handleRefresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  const handlePracticePress = useCallback((id: string) => {
    router.push(`/practices/${id}`)
  }, [router])

  const handleCheckIn = useCallback(async (practiceId: string) => {
    const result = await checkIn({ practiceId })

    if (!result.success && result.error) {
      Alert.alert('打卡失敗', result.error)
    }
  }, [checkIn])

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    )
  }

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
        <YStack padding="$4" gap="$5">
          {/* Header */}
          <YStack gap="$1">
            <Text fontSize={14} color="$color" opacity={0.6}>
              {new Date().toLocaleDateString('zh-TW', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text fontSize={24} fontWeight="700" color="$color">
              {user?.name ? `${user.name}，` : ''}加油！
            </Text>
          </YStack>

          {/* Today Progress Card */}
          <YStack
            backgroundColor={colors.primary.palest}
            padding="$5"
            borderRadius="$md"
            gap="$4"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.primary.darker}>
                  今日進度
                </Text>
                <Text fontSize={14} color={colors.primary.darker} opacity={0.8}>
                  {stats.completedToday} / {stats.totalToday} 項已完成
                </Text>
              </YStack>
              <ProgressRing
                progress={todayProgress}
                size={72}
                strokeWidth={7}
                color={colors.primary.base}
              />
            </XStack>

            {todayPending.length > 0 && (
              <Text fontSize={13} color={colors.primary.darker} opacity={0.7}>
                還有 {todayPending.length} 項待完成
              </Text>
            )}
          </YStack>

          {/* Stats Row */}
          <XStack gap="$3">
            <StatCard
              label="連續天數"
              value={stats.currentStreak}
              icon={<Flame size={18} color={colors.semantic.warning} />}
            />
            <StatCard
              label="進行中"
              value={stats.activePractices}
              icon={<Target size={18} color={colors.primary.base} />}
            />
          </XStack>

          {/* Today's Pending */}
          {todayPending.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Calendar size={18} color="$color" />
                <Text fontSize={16} fontWeight="600" color="$color">
                  今日待完成
                </Text>
              </XStack>
              <YStack gap="$3">
                {todayPending.map(practice => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    onPress={() => handlePracticePress(practice.id)}
                    onCheckIn={() => handleCheckIn(practice.id)}
                    isCheckingIn={isChecking}
                  />
                ))}
              </YStack>
            </YStack>
          )}

          {/* Today's Completed */}
          {todayCompleted.length > 0 && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <CheckCircle size={18} color={colors.semantic.success} />
                <Text fontSize={16} fontWeight="600" color="$color">
                  今日已完成
                </Text>
              </XStack>
              <YStack gap="$3">
                {todayCompleted.map(practice => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    onPress={() => handlePracticePress(practice.id)}
                    showCheckInButton={false}
                  />
                ))}
              </YStack>
            </YStack>
          )}

          {/* Empty State */}
          {activePractices.length === 0 && (
            <YStack
              padding="$6"
              alignItems="center"
              justifyContent="center"
              gap="$3"
            >
              <Target size={48} color={colors.basic[300]} />
              <Text fontSize={16} color="$color" opacity={0.6} textAlign="center">
                還沒有進行中的實踐
              </Text>
              <Text
                fontSize={14}
                color={colors.primary.base}
                onPress={() => router.push('/(tabs)/create')}
              >
                建立第一個實踐
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
