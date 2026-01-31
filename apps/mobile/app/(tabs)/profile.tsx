import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Card, ScrollView, Avatar, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Settings,
  ChevronRight,
  Award,
  BarChart3,
  BookMarked,
  LogOut,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
} from '@tamagui/lucide-icons'
import { useAuth } from '@/providers/AuthProvider'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePractices } from '@/hooks/usePractices'
import { IslandList } from '@/components'
import { colors } from '@/generated/design-tokens'
import type { SocialLink } from '@/types/user'

const socialIcons = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  website: Globe,
  instagram: Instagram,
}

export default function ProfileScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user } = useCurrentUser()
  const { stats } = usePractices()

  const handleSignOut = async () => {
    await signOut()
  }

  const menuItems = [
    {
      icon: BarChart3,
      label: '學習統計',
      onPress: () => router.push('/settings/stats'),
    },
    {
      icon: Award,
      label: '成就徽章',
      onPress: () => router.push('/settings/achievements'),
    },
    {
      icon: BookMarked,
      label: '已封存實踐',
      onPress: () => router.push('/settings/archived'),
    },
    {
      icon: Settings,
      label: '設定',
      onPress: () => router.push('/settings'),
    },
  ]

  const renderSocialLink = (link: SocialLink) => {
    const Icon = socialIcons[link.platform]
    return (
      <Button
        key={link.platform}
        size="$3"
        circular
        backgroundColor={colors.basic[100]}
        pressStyle={{ backgroundColor: colors.basic[200] }}
        accessibilityLabel={`${link.platform} 連結`}
      >
        <Icon size={18} color={colors.basic[500]} />
      </Button>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$4" gap="$5">
          {/* Profile Header */}
          <Card
            padding="$5"
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <YStack gap="$4">
              <XStack gap="$4" alignItems="center">
                <Avatar circular size="$6">
                  {user?.avatar ? (
                    <Avatar.Image source={{ uri: user.avatar }} />
                  ) : (
                    <Avatar.Fallback
                      backgroundColor={colors.primary.lighter}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={24} fontWeight="600" color={colors.primary.darker}>
                        {user?.name?.charAt(0) || '?'}
                      </Text>
                    </Avatar.Fallback>
                  )}
                </Avatar>

                <YStack flex={1} gap="$1">
                  <Text fontSize={20} fontWeight="700" color="$color">
                    {user?.name || '使用者'}
                  </Text>
                  <Text fontSize={14} color="$color" opacity={0.6}>
                    {user?.email || ''}
                  </Text>
                </YStack>
              </XStack>

              {/* Bio */}
              {user?.bio && (
                <Text fontSize={14} color="$color" opacity={0.8}>
                  {user.bio}
                </Text>
              )}

              {/* Social Links */}
              {user?.socialLinks && user.socialLinks.length > 0 && (
                <XStack gap="$2" flexWrap="wrap">
                  {user.socialLinks.map(renderSocialLink)}
                </XStack>
              )}
            </YStack>
          </Card>

          {/* Stats Summary */}
          <XStack gap="$3">
            <Card flex={1} padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <YStack alignItems="center" gap="$1">
                <Text fontSize={24} fontWeight="700" color={colors.primary.base}>
                  {stats.totalCheckIns}
                </Text>
                <Text fontSize={12} color="$color" opacity={0.6}>
                  總打卡次數
                </Text>
              </YStack>
            </Card>
            <Card flex={1} padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <YStack alignItems="center" gap="$1">
                <Text fontSize={24} fontWeight="700" color={colors.semantic.warning}>
                  {stats.currentStreak}
                </Text>
                <Text fontSize={12} color="$color" opacity={0.6}>
                  連續天數
                </Text>
              </YStack>
            </Card>
            <Card flex={1} padding="$4" backgroundColor="$background" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
              <YStack alignItems="center" gap="$1">
                <Text fontSize={24} fontWeight="700" color={colors.semantic.success}>
                  {stats.totalPractices}
                </Text>
                <Text fontSize={12} color="$color" opacity={0.6}>
                  實踐項目
                </Text>
              </YStack>
            </Card>
          </XStack>

          {/* Learning Islands */}
          {user?.islands && user.islands.length > 0 && (
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} fontWeight="600" color="$color">
                  我的學習島嶼
                </Text>
                <Text fontSize={13} color={colors.primary.base}>
                  {user.islands.filter(i => i.unlocked).length} / {user.islands.length} 已解鎖
                </Text>
              </XStack>
              <IslandList islands={user.islands} />
            </YStack>
          )}

          {/* Menu Items */}
          <Card
            backgroundColor="$background"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <XStack
                  key={item.label}
                  padding="$4"
                  alignItems="center"
                  justifyContent="space-between"
                  borderBottomWidth={index < menuItems.length - 1 ? 1 : 0}
                  borderBottomColor="$borderColor"
                  pressStyle={{ backgroundColor: '$backgroundHover' }}
                  onPress={item.onPress}
                >
                  <XStack alignItems="center" gap="$3">
                    <Icon size={20} color="$color" />
                    <Text fontSize={15} color="$color">
                      {item.label}
                    </Text>
                  </XStack>
                  <ChevronRight size={18} color="$color" opacity={0.4} />
                </XStack>
              )
            })}
          </Card>

          {/* Sign Out */}
          <Button
            size="$4"
            backgroundColor="transparent"
            borderWidth={1}
            borderColor={colors.semantic.error}
            pressStyle={{ backgroundColor: `${colors.semantic.error}10` }}
            onPress={handleSignOut}
          >
            <XStack alignItems="center" gap="$2">
              <LogOut size={18} color={colors.semantic.error} />
              <Text color={colors.semantic.error} fontWeight="600">
                登出
              </Text>
            </XStack>
          </Button>

          {/* Version */}
          <Text
            fontSize={12}
            color="$color"
            opacity={0.4}
            textAlign="center"
            marginTop="$2"
          >
            版本 1.0.0
          </Text>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
