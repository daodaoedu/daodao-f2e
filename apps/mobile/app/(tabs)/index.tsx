import { useCallback, useMemo } from 'react'
import { RefreshControl, Alert, Pressable, StyleSheet, Dimensions, View as RNView } from 'react-native'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Spinner, } from 'tamagui'

const { width: screenWidth } = Dimensions.get('window')
import { SafeAreaView } from 'react-native-safe-area-context'
import { Target, MoreHorizontal, SlidersHorizontal } from '@tamagui/lucide-icons'
import { usePractices, useCheckIn } from '@/hooks/usePractices'
import { PracticeCard, HomeBanner } from '@/components'
import { colors } from '@/generated/design-tokens'
import type { Practice } from '@/types/practice'

// Mock data - 4 種顏色的卡片 (進行中)
const MOCK_PRACTICES: Practice[] = [
  {
    id: '1',
    title: '學習做甜點',
    description: '看食譜書和 Youtube 教學，每週末做一次',
    targetDays: 30,
    completedDays: 2,
    currentStreak: 2,
    longestStreak: 2,
    frequency: 'weekly',
    todayCheckedIn: false,
    isCompleted: false,
    status: 'draft',
    theme: 'yellow',
    tags: ['料理', '烘焙'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '學習 React Hooks',
    description: '每天學習 1.5 小時的 React Hooks 課程，包含理論學習、實作練習和筆記整理',
    targetDays: 14,
    completedDays: 7,
    currentStreak: 5,
    longestStreak: 7,
    frequency: 'daily',
    todayCheckedIn: false,
    isCompleted: false,
    status: 'in-progress',
    theme: 'blue',
    tags: ['程式', 'React', '前端'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: '練習冥想',
    description: '每天練習冥想 10 分鐘，包含正念冥想、呼吸練習和身體掃描',
    targetDays: 21,
    completedDays: 3,
    currentStreak: 3,
    longestStreak: 3,
    frequency: 'daily',
    todayCheckedIn: false,
    isCompleted: false,
    status: 'not-started',
    theme: 'pink',
    tags: ['健康', '冥想', '正念'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: '閱讀英文文章',
    description: '每天閱讀一篇英文新聞或部落格文章，累積單字量',
    targetDays: 30,
    completedDays: 10,
    currentStreak: 10,
    longestStreak: 10,
    frequency: 'daily',
    todayCheckedIn: true,
    isCompleted: false,
    status: 'in-progress',
    theme: 'green',
    tags: ['語言', '英文', '閱讀'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock data - 已完成的實踐
const MOCK_COMPLETED: Practice[] = [
  {
    id: '5',
    title: '練習冥想',
    description: '每天練習冥想 10 分鐘，包含正念冥想、呼吸練習和身體掃描',
    targetDays: 21,
    completedDays: 21,
    currentStreak: 0,
    longestStreak: 21,
    frequency: 'daily',
    todayCheckedIn: false,
    isCompleted: true,
    status: 'completed',
    theme: 'blue',
    tags: ['正念冥想', 'Youtube', '放鬆', '專注', '健康'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const {
    activePractices,
    completedPractices,
    isLoading,
    mutate,
  } = usePractices()
  const { checkIn, isChecking } = useCheckIn()

  // 使用 mock data 或真實數據
  const inProgressPractices = useMemo(() => {
    const realPractices = activePractices.filter(p => !p.isCompleted)
    // 如果沒有真實數據，使用 mock data
    return realPractices.length > 0 ? realPractices : MOCK_PRACTICES
  }, [activePractices])

  // 已完成的實踐
  const displayedCompletedPractices = useMemo(() => {
    return completedPractices.length > 0 ? completedPractices : MOCK_COMPLETED
  }, [completedPractices])

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

  const handleAddPractice = useCallback(() => {
    router.push('/practices/create')
  }, [router])

  const handleSettings = useCallback(() => {
    router.push('/settings')
  }, [router])

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.primary.base} />
        </YStack>
      </SafeAreaView>
    )
  }

  // Banner 高度 (與 HomeBanner 同步)
  const bannerHeight = Math.round(screenWidth / (195 / 60)) + 22

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }} edges={['top']}>
      {/* Fixed Banner */}
      <RNView style={styles.fixedBanner}>
        <HomeBanner />
      </RNView>

      {/* 固定頂部右上角設定按鈕 */}
      <RNView style={styles.fixedHeader}>
        <XStack justifyContent="flex-end" paddingHorizontal="$5" paddingVertical="$3">
          <Pressable onPress={handleSettings} hitSlop={8}>
            <SlidersHorizontal size={24} color={colors.text.dark} />
          </Pressable>
        </XStack>
      </RNView>

      <ScrollView
        flex={1}
        backgroundColor="transparent"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={colors.primary.base}
          />
        }
        contentContainerStyle={{ paddingTop: bannerHeight - 30 }}
      >
        <YStack>
          {/* 進行中區塊 - 淡灰背景（對應 Product 的 very-light-gray） */}
          <YStack
            backgroundColor="#F7F8F8"
            paddingTop="$5"
            gap="$5"
            minHeight={400}
          >

            {/* 進行中標題 */}
            <XStack
              paddingHorizontal="$5"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize={18} fontWeight="500" color="$color">
                進行中
              </Text>
              <Pressable hitSlop={8}>
                <MoreHorizontal size={24} color={colors.basic[400]} />
              </Pressable>
            </XStack>

            {/* 橫向滾動卡片 */}
            {inProgressPractices.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              >
                {inProgressPractices.map(practice => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    onPress={() => handlePracticePress(practice.id)}
                    onCheckIn={() => handleCheckIn(practice.id)}
                    isCheckingIn={isChecking}
                    variant="gradient"
                  />
                ))}
              </ScrollView>
            ) : (
              <YStack
                marginHorizontal="$5"
                padding="$6"
                alignItems="center"
                justifyContent="center"
                gap="$3"
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Target size={48} color={colors.basic[300]} />
                <Text fontSize={16} color="$color" opacity={0.6} textAlign="center">
                  還沒有進行中的實踐
                </Text>
                <Text
                  fontSize={14}
                  color={colors.primary.base}
                  onPress={handleAddPractice}
                >
                  建立第一個實踐
                </Text>
              </YStack>
            )}

            {/* 已完成區塊 */}
            {displayedCompletedPractices.length > 0 && (
              <YStack gap="$3" paddingHorizontal="$5" paddingBottom={120}>
                <Text fontSize={18} fontWeight="500" color="$color">
                  已完成
                </Text>
                <YStack gap="$3">
                  {displayedCompletedPractices.map(practice => (
                    <PracticeCard
                      key={practice.id}
                      practice={practice}
                      onPress={() => handlePracticePress(practice.id)}
                      showCheckInButton={false}
                      variant="completed"
                    />
                  ))}
                </YStack>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fixedBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    pointerEvents: 'none',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
  },
})
