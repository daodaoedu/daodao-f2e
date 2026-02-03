import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Card, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Palette,
  Shield,
  HelpCircle,
  FileText,
  Info,
} from '@tamagui/lucide-icons'
import { colors } from '@/generated/design-tokens'

interface SettingItem {
  icon: typeof User
  label: string
  description?: string
  route: string
}

const settingGroups: { title: string; items: SettingItem[] }[] = [
  {
    title: '帳號',
    items: [
      {
        icon: User,
        label: '帳號設定',
        description: '管理你的個人資料',
        route: '/settings/account',
      },
      {
        icon: Bell,
        label: '通知設定',
        description: '管理提醒和通知偏好',
        route: '/settings/notifications',
      },
    ],
  },
  {
    title: '外觀',
    items: [
      {
        icon: Palette,
        label: '外觀設定',
        description: '深色模式、主題顏色',
        route: '/settings/appearance',
      },
    ],
  },
  {
    title: '其他',
    items: [
      {
        icon: Shield,
        label: '隱私權政策',
        route: '/settings/privacy',
      },
      {
        icon: FileText,
        label: '服務條款',
        route: '/settings/terms',
      },
      {
        icon: HelpCircle,
        label: '幫助中心',
        route: '/settings/help',
      },
      {
        icon: Info,
        label: '關於',
        route: '/settings/about',
      },
    ],
  },
]

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <Text fontSize={18} fontWeight="600" color="$color">
            設定
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$5">
            {settingGroups.map(group => (
              <YStack key={group.title} gap="$3">
                <Text fontSize={13} fontWeight="600" color="$color" opacity={0.5} paddingLeft="$1">
                  {group.title}
                </Text>
                <Card
                  backgroundColor="$background"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor="$borderColor"
                  overflow="hidden"
                >
                  {group.items.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <XStack
                        key={item.route}
                        padding="$4"
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottomWidth={index < group.items.length - 1 ? 1 : 0}
                        borderBottomColor="$borderColor"
                        pressStyle={{ backgroundColor: '$backgroundHover' }}
                        onPress={() => router.push(item.route as `${string}:${string}`)}
                      >
                        <XStack alignItems="center" gap="$3" flex={1}>
                          <YStack
                            width={36}
                            height={36}
                            backgroundColor={colors.basic[100]}
                            borderRadius={18}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon size={18} color={colors.primary.base} />
                          </YStack>
                          <YStack flex={1}>
                            <Text fontSize={15} color="$color">
                              {item.label}
                            </Text>
                            {item.description && (
                              <Text fontSize={12} color="$color" opacity={0.5}>
                                {item.description}
                              </Text>
                            )}
                          </YStack>
                        </XStack>
                        <ChevronRight size={18} color="$color" opacity={0.4} />
                      </XStack>
                    )
                  })}
                </Card>
              </YStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  )
}
