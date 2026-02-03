import { useCallback, useState, useRef } from 'react'
import { Pressable, StyleSheet, View as RNView, Linking, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Card, Avatar, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import LottieView from 'lottie-react-native'
import {
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  MapPin,
  Check,
  FlaskConical,
  Flag,
  StickyNote,
} from '@tamagui/lucide-icons'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { colors } from '@/generated/design-tokens'
import activeShaper1Json from '@/assets/animations/active-shaper-1.json'
import type { SocialLink } from '@/types/user'

const screenWidth = 390 // Fixed width for consistency
const bannerImage = require('@/assets/images/user-mobile-banner.png')
const logoImage = require('@/assets/images/logo.png')
const BANNER_HEIGHT = 420

// 社群圖標組件
function LineIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#06C755" />
      <Path
        d="M26 14.5C26 10.08 21.52 6.5 16 6.5C10.48 6.5 6 10.08 6 14.5C6 18.48 9.66 21.78 14.52 22.4C14.88 22.48 15.38 22.64 15.5 22.94C15.6 23.22 15.56 23.64 15.54 23.92L15.4 24.76C15.36 25.04 15.16 25.94 16 25.6C16.84 25.26 21.68 22.28 23.9 19.72C25.34 18.14 26 16.4 26 14.5Z"
        fill="white"
      />
    </Svg>
  )
}

function FacebookIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#1877F2" />
      <Path
        d="M22 16C22 12.68 19.32 10 16 10C12.68 10 10 12.68 10 16C10 18.98 12.14 21.46 15 21.92V17.5H13.5V16H15V14.88C15 13.42 15.88 12.62 17.2 12.62C17.82 12.62 18.48 12.72 18.48 12.72V14.16H17.76C17.06 14.16 16.84 14.58 16.84 15.02V16H18.42L18.16 17.5H16.84V21.92C19.7 21.46 22 18.98 22 16Z"
        fill="white"
      />
    </Svg>
  )
}

function InstagramIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#E4405F" />
      <Path
        d="M16 11.5C13.52 11.5 11.5 13.52 11.5 16C11.5 18.48 13.52 20.5 16 20.5C18.48 20.5 20.5 18.48 20.5 16C20.5 13.52 18.48 11.5 16 11.5ZM16 19C14.34 19 13 17.66 13 16C13 14.34 14.34 13 16 13C17.66 13 19 14.34 19 16C19 17.66 17.66 19 16 19Z"
        fill="white"
      />
      <Circle cx="20.75" cy="11.25" r="1" fill="white" />
      <Path
        d="M20 9H12C10.34 9 9 10.34 9 12V20C9 21.66 10.34 23 12 23H20C21.66 23 23 21.66 23 20V12C23 10.34 21.66 9 20 9ZM21.5 20C21.5 20.83 20.83 21.5 20 21.5H12C11.17 21.5 10.5 20.83 10.5 20V12C10.5 11.17 11.17 10.5 12 10.5H20C20.83 10.5 21.5 11.17 21.5 12V20Z"
        fill="white"
      />
    </Svg>
  )
}

function ThreadsIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#000000" />
      <Path
        d="M20.2 14.1C20.1 13.3 19.7 12.6 19.1 12.1C18.4 11.5 17.5 11.2 16.6 11.3C15.5 11.4 14.5 12 13.9 12.9C13.3 13.8 13.1 14.9 13.4 15.9C13.7 16.9 14.4 17.7 15.3 18.2C16.2 18.6 17.2 18.6 18.1 18.2C19 17.8 19.7 17 20 16.1C20.3 15.4 20.3 14.7 20.2 14.1ZM16 20.5C14.3 20.5 12.7 19.8 11.5 18.6C10.3 17.4 9.6 15.8 9.6 14.1C9.6 12.4 10.3 10.8 11.5 9.6C12.7 8.4 14.3 7.7 16 7.7C17.7 7.7 19.3 8.4 20.5 9.6C21.7 10.8 22.4 12.4 22.4 14.1C22.4 15.8 21.7 17.4 20.5 18.6C19.3 19.8 17.7 20.5 16 20.5ZM16 6.5C13.9 6.5 11.9 7.3 10.4 8.8C8.9 10.3 8.1 12.3 8.1 14.4C8.1 16.5 8.9 18.5 10.4 20C11.9 21.5 13.9 22.3 16 22.3C18.1 22.3 20.1 21.5 21.6 20C23.1 18.5 23.9 16.5 23.9 14.4C23.9 12.3 23.1 10.3 21.6 8.8C20.1 7.3 18.1 6.5 16 6.5Z"
        fill="white"
      />
    </Svg>
  )
}

function LinkedInIcon({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#0A66C2" />
      <Path
        d="M11.5 9.5C11.5 10.6 10.6 11.5 9.5 11.5C8.4 11.5 7.5 10.6 7.5 9.5C7.5 8.4 8.4 7.5 9.5 7.5C10.6 7.5 11.5 8.4 11.5 9.5ZM11.5 13H7.5V24.5H11.5V13ZM17.5 13H13.5V24.5H17.5V18.4C17.5 15 21.9 14.7 21.9 18.4V24.5H26V17.1C26 11.2 19.1 11.4 17.5 14.3V13Z"
        fill="white"
      />
    </Svg>
  )
}

type TabType = 'practices' | 'plans' | 'ideas'

export default function ProfileScreen() {
  const router = useRouter()
  useCurrentUser()
  const [includeCompleted, setIncludeCompleted] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('practices')
  const [showTopNav, setShowTopNav] = useState(false)
  const scrollY = useRef(new Animated.Value(0)).current

  // 滾動閾值 - 與 Product 一致
  const SCROLL_THRESHOLD = 167

  // Banner opacity 隨滾動變化（1 -> 0.3）
  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  })

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const offsetY = event.nativeEvent.contentOffset.y
        setShowTopNav(offsetY > SCROLL_THRESHOLD)
      },
    }
  )

  const tabs: { key: TabType; label: string; icon: typeof FlaskConical; disabled?: boolean }[] = [
    { key: 'practices', label: '主題實踐', icon: FlaskConical },
    { key: 'plans', label: '學習計劃', icon: Flag, disabled: true },
    { key: 'ideas', label: '想法', icon: StickyNote, disabled: true },
  ]

  // Mock 用戶資料 - 之後從 API 取得
  const mockUser = {
    name: 'John Doe',
    location: 'Taiwan',
    bio: 'I am a software engineer',
    avatar: undefined,
  }

  // Mock 社群連結
  const mockSocialLinks: SocialLink[] = [
    { platform: 'line', url: 'https://line.me/ti/p/@example' },
    { platform: 'facebook', url: 'https://facebook.com/example' },
  ]

  // Mock 主題實踐資料
  const mockPractices: Array<{
    id: string
    status: 'draft' | 'in-progress' | 'completed'
    title: string
    description: string
    tags: string[]
  }> = [
    {
      id: '1',
      status: 'draft',
      title: '閱讀原子習慣',
      description: '點精油,跟着 Youtube 教學做',
      tags: ['閱讀', '原子習慣', '心理學'],
    },
    {
      id: '2',
      status: 'in-progress',
      title: '閱讀原子習慣',
      description: '點精油,跟着 Youtube 教學做',
      tags: ['閱讀', '原子習慣'],
    },
  ]

  // 強制使用 mock 資料來測試 UI（之後改為實際資料）
  const displayUser = mockUser
  const socialLinks = mockSocialLinks
  const learningType = '我是注重推理的探探島！'

  // 根據篩選條件顯示的實踐列表
  const displayedPractices = includeCompleted
    ? mockPractices
    : mockPractices.filter(p => p.status !== 'completed')

  // 獲取狀態標籤配置
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: '草稿', bg: colors.background.gray, color: colors.text.dark }
      case 'in-progress':
      case 'active':
        return { label: '進行中', bg: 'transparent', color: colors.logo.cyan, border: colors.logo.cyan }
      case 'completed':
        return { label: '已完成', bg: colors.logo.cyan, color: colors.text.light }
      default:
        return { label: '進行中', bg: 'transparent', color: colors.logo.cyan, border: colors.logo.cyan }
    }
  }

  const handleRetakeQuiz = useCallback(() => {
    router.push('/quiz/learning-type')
  }, [router])

  const handleViewDetails = useCallback(() => {
    router.push('/quiz/learning-type/result')
  }, [router])

  const handleSettings = useCallback(() => {
    router.push('/settings')
  }, [router])

  const handleSocialPress = useCallback((url: string) => {
    Linking.openURL(url)
  }, [])

  const handlePracticePress = useCallback((id: string) => {
    router.push(`/practices/${id}`)
  }, [router])

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'line':
        return <LineIcon />
      case 'facebook':
        return <FacebookIcon />
      case 'instagram':
        return <InstagramIcon />
      case 'threads':
        return <ThreadsIcon />
      case 'linkedin':
        return <LinkedInIcon />
      default:
        return null
    }
  }

  return (
    <RNView style={styles.container}>
      {/* 固定背景層 - 淡藍色底色（最底層） */}
      <RNView style={styles.fixedBackground} />

      {/* 固定 Banner - 會隨滾動變淡（在背景上方） */}
      <Animated.View style={[styles.fixedBannerContainer, { opacity: bannerOpacity }]}>
        <Animated.Image
          source={bannerImage}
          style={styles.fixedBanner}
          resizeMode="cover"
        />
      </Animated.View>

      {/* 固定頂部導航 - Logo、標題、設定 */}
      <SafeAreaView style={styles.fixedHeader} edges={['top']}>
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$3"
          justifyContent="space-between"
          alignItems="center"
        >
          <Animated.Image
            source={logoImage}
            style={styles.logo}
          />
          <Text fontSize={18} fontWeight="500" color={colors.text.dark}>
            我的小島
          </Text>
          <Pressable onPress={handleSettings} hitSlop={8}>
            <SlidersHorizontal size={24} color={colors.text.dark} />
          </Pressable>
        </XStack>
      </SafeAreaView>

      {/* 固定 Lottie 動畫 - 會隨滾動變淡 */}
      <Animated.View style={[styles.fixedLottie, { opacity: bannerOpacity }]}>
        <LottieView
          source={activeShaper1Json}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>

      {/* 固定學習類型卡片 - 會隨滾動變淡 */}
      <Animated.View style={[styles.fixedLearningCard, { opacity: bannerOpacity }]}>
        <Card
          backgroundColor="rgba(255, 255, 255, 0.7)"
          borderRadius={20}
          padding="$4"
          borderWidth={1}
          borderColor={colors.border.lightCyan}
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
            <Text fontSize={14} fontWeight="500" color={colors.logo.cyan}>
              學習類型
            </Text>
            <Pressable onPress={handleRetakeQuiz}>
              <XStack alignItems="center" gap="$1">
                <RefreshCw size={16} color={colors.text.muted} />
                <Text fontSize={12} color={colors.text.dark}>
                  重新測驗
                </Text>
              </XStack>
            </Pressable>
          </XStack>
          <Text fontSize={16} fontWeight="500" color={colors.text.dark} marginBottom="$3">
            {learningType}
          </Text>
          <Button
            backgroundColor={colors.logo.orange}
            borderRadius="$md"
            height={44}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleViewDetails}
          >
            <XStack alignItems="center" gap="$1">
              <Text color={colors.text.light} fontWeight="500">
                觀看詳細說明
              </Text>
              <ChevronRight size={16} color={colors.text.light} />
            </XStack>
          </Button>
        </Card>
      </Animated.View>

      {/* 主內容層 - 在最上方 */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 頂部 Tab 導航 - 滾動後顯示 */}
        {showTopNav && (
          <RNView style={styles.topNav}>
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <Pressable
                  key={tab.key}
                  style={styles.topNavItem}
                  onPress={() => !tab.disabled && setActiveTab(tab.key)}
                  disabled={tab.disabled}
                >
                  <RNView style={[
                    styles.topNavIcon,
                    isActive && styles.topNavIconActive,
                  ]}>
                    <Icon size={24} color={isActive ? colors.logo.cyan : colors.text.dark} />
                  </RNView>
                  <Text
                    fontSize={12}
                    color={colors.text.dark}
                    opacity={isActive ? 1 : 0.5}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              )
            })}
          </RNView>
        )}

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* 頂部佔位區域 - 透明背景，高度等於固定元素區域 */}
          <RNView style={styles.headerContainer} />

          {/* 主要內容區 - 透明背景，讓固定背景色透出 */}
          <YStack
            paddingTop="$3"
            paddingHorizontal="$5"
            paddingBottom={120}
            minHeight={300}
          >
            {/* 用戶資料卡片 - 與 Product UserInfoCard 對齊 */}
            <Card
              backgroundColor={colors.background.light}
              borderRadius={16}
              padding={24}
              marginBottom={24}
              borderWidth={1}
              borderColor={colors.border.light}
              elevate
              elevation={2}
            >
              {/* 頭像和基本資訊 */}
              <XStack gap={16} alignItems="center">
                <Avatar circular size={96}>
                  {displayUser.avatar ? (
                    <Avatar.Image source={{ uri: displayUser.avatar }} />
                  ) : (
                    <Avatar.Fallback
                      backgroundColor={colors.background.veryLightGray}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={24} fontWeight="500" color={colors.text.dark}>
                        {displayUser.name?.charAt(0) || '?'}
                      </Text>
                    </Avatar.Fallback>
                  )}
                </Avatar>

                <YStack flex={1} gap={4}>
                  <Text fontSize={22} fontWeight="500" color={colors.basic.black} numberOfLines={1}>
                    {displayUser.name}
                  </Text>
                  {displayUser.location && (
                    <XStack alignItems="center" gap={8}>
                      <MapPin size={18} color={colors.logo.cyan} />
                      <Text fontSize={12} color={colors.logo.cyan}>
                        {displayUser.location}
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </XStack>

              {/* 個人簡介 */}
              {displayUser.bio && (
                <Text fontSize={12} color={colors.text.dark} marginTop={16}>
                  {displayUser.bio}
                </Text>
              )}

              {/* 社群媒體連結 */}
              {socialLinks.length > 0 && (
                <XStack gap={12} marginTop={16}>
                  {socialLinks.map((link: SocialLink) => (
                    <Pressable
                      key={link.platform}
                      onPress={() => handleSocialPress(link.url)}
                      hitSlop={8}
                    >
                      {getSocialIcon(link.platform)}
                    </Pressable>
                  ))}
                </XStack>
              )}
            </Card>

            {/* 主題實踐區塊 - 與 Product PracticeSection 對齊 */}
            <Card
              backgroundColor={colors.background.light}
              borderRadius={16}
              padding={24}
              borderWidth={1}
              borderColor={colors.border.light}
              elevate
              elevation={2}
            >
              {/* 標題和篩選 */}
              <XStack justifyContent="space-between" alignItems="center" marginBottom={24}>
                <Text fontSize={18} fontWeight="500" color={colors.basic.black}>
                  主題實踐
                </Text>
                <XStack alignItems="center" gap={8}>
                  <Pressable
                    onPress={() => setIncludeCompleted(!includeCompleted)}
                    style={[
                      styles.checkbox,
                      includeCompleted && styles.checkboxActive,
                    ]}
                  >
                    {includeCompleted && (
                      <Check size={14} color={colors.text.light} />
                    )}
                  </Pressable>
                  <Text fontSize={14} color={colors.text.dark}>
                    包含已完成
                  </Text>
                </XStack>
              </XStack>

              {/* 實踐列表 - 與 Product 結構對齊 */}
              <YStack gap={10}>
                {displayedPractices.length > 0 ? (
                  displayedPractices.map(practice => {
                    const statusBadge = getStatusBadge(practice.status || 'in-progress')
                    const displayTags = practice.tags?.slice(0, 2) || []
                    const remainingTagsCount = (practice.tags?.length || 0) - 2

                    return (
                      <Pressable
                        key={practice.id}
                        onPress={() => handlePracticePress(practice.id)}
                      >
                        <YStack
                          padding={16}
                          borderRadius={8}
                          borderBottomWidth={1}
                          borderBottomColor={colors.background.gray}
                          backgroundColor={colors.background.light}
                        >
                          {/* 狀態標籤 + Tags */}
                          <XStack justifyContent="space-between" alignItems="center" marginBottom={8}>
                            {/* 狀態標籤 */}
                            <XStack
                              backgroundColor={statusBadge.bg}
                              paddingHorizontal={8}
                              paddingVertical={2}
                              borderRadius={9999}
                              borderWidth={statusBadge.border ? 1 : 0}
                              borderColor={statusBadge.border}
                            >
                              <Text fontSize={12} color={statusBadge.color}>
                                {statusBadge.label}
                              </Text>
                            </XStack>

                            {/* Tags */}
                            <XStack gap={8} alignItems="center">
                              {displayTags.map(tag => (
                                <XStack
                                  key={tag}
                                  backgroundColor={colors.background.gray}
                                  paddingHorizontal={8}
                                  paddingVertical={2}
                                  borderRadius={9999}
                                >
                                  <Text fontSize={12} color={colors.text.muted}>
                                    {tag}
                                  </Text>
                                </XStack>
                              ))}
                              {remainingTagsCount > 0 && (
                                <Text fontSize={12} color={colors.basic[400]}>
                                  +{remainingTagsCount}
                                </Text>
                              )}
                            </XStack>
                          </XStack>

                          {/* 標題 + 描述 + 箭頭 */}
                          <XStack alignItems="center" gap={8}>
                            <YStack flex={1}>
                              <Text
                                fontSize={16}
                                fontWeight="500"
                                color={colors.text.dark}
                                numberOfLines={1}
                                marginBottom={4}
                              >
                                {practice.title}
                              </Text>
                              <Text
                                fontSize={12}
                                color={colors.text.dark}
                                numberOfLines={1}
                              >
                                {practice.description || ''}
                              </Text>
                            </YStack>
                            <ChevronRight size={20} color={colors.text.muted} />
                          </XStack>
                        </YStack>
                      </Pressable>
                    )
                  })
                ) : (
                  <YStack padding={32} alignItems="center" justifyContent="center">
                    <Text fontSize={14} color={colors.basic[400]}>
                      尚無主題實踐
                    </Text>
                  </YStack>
                )}
              </YStack>
            </Card>
          </YStack>
        </Animated.ScrollView>
      </SafeAreaView>
    </RNView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B8E8FD',
  },
  fixedBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#B8E8FD',
    zIndex: 0,
  },
  fixedBannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: BANNER_HEIGHT,
    zIndex: 1,
  },
  fixedBanner: {
    width: screenWidth,
    height: BANNER_HEIGHT,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  fixedLottie: {
    position: 'absolute',
    top: 100,
    left: screenWidth / 2 - 75,
    width: 150,
    height: 150,
    zIndex: 2,
  },
  fixedLearningCard: {
    position: 'absolute',
    top: 260,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  safeArea: {
    flex: 1,
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topNavIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavIconActive: {
    // 選中狀態下圖標顏色由 Icon 組件控制
  },
  headerContainer: {
    height: BANNER_HEIGHT - 30,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#16B9B3',
    borderColor: '#16B9B3',
  },
})
