import { useRouter } from 'expo-router'
import { YStack, XStack, Text, Card, ScrollView } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  BookOpen,
  Dumbbell,
  Brain,
  Palette,
  Code,
  Music,
  Pencil,
  ChevronRight,
} from '@tamagui/lucide-icons'
import { colors } from '@/generated/design-tokens'

interface TemplateItem {
  id: string
  title: string
  description: string
  icon: typeof BookOpen
  color: string
}

const templates: TemplateItem[] = [
  {
    id: 'reading',
    title: '閱讀',
    description: '每日閱讀 30 分鐘',
    icon: BookOpen,
    color: colors.practice.blue,
  },
  {
    id: 'exercise',
    title: '運動',
    description: '每日運動健身',
    icon: Dumbbell,
    color: colors.practice.green,
  },
  {
    id: 'meditation',
    title: '冥想',
    description: '每日靜心冥想',
    icon: Brain,
    color: colors.practice.pink,
  },
  {
    id: 'creative',
    title: '創作',
    description: '每日創意練習',
    icon: Palette,
    color: colors.practice.yellow,
  },
  {
    id: 'coding',
    title: '程式',
    description: '每日寫程式',
    icon: Code,
    color: colors.primary.base,
  },
  {
    id: 'music',
    title: '音樂',
    description: '每日練習樂器',
    icon: Music,
    color: colors.semantic.warning,
  },
]

export default function CreateScreen() {
  const router = useRouter()

  const handleTemplatePress = (templateId: string) => {
    router.push(`/practices/create/${templateId}`)
  }

  const handleCustomPress = () => {
    router.push('/practices/create/manual')
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$4" gap="$5">
          {/* Header */}
          <YStack gap="$2">
            <Text fontSize={24} fontWeight="700" color="$color">
              建立實踐
            </Text>
            <Text fontSize={14} color="$color" opacity={0.6}>
              選擇模板快速開始，或自訂你的實踐
            </Text>
          </YStack>

          {/* Custom Create */}
          <Card
            padding="$4"
            backgroundColor={colors.primary.palest}
            borderRadius="$md"
            pressStyle={{ scale: 0.98 }}
            onPress={handleCustomPress}
          >
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={48}
                  height={48}
                  backgroundColor={colors.primary.base}
                  borderRadius="$sm"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Pencil size={24} color={colors.basic.white} />
                </YStack>
                <YStack>
                  <Text fontSize={16} fontWeight="600" color={colors.primary.darker}>
                    自訂實踐
                  </Text>
                  <Text fontSize={13} color={colors.primary.darker} opacity={0.8}>
                    完全自訂你的學習目標
                  </Text>
                </YStack>
              </XStack>
              <ChevronRight size={20} color={colors.primary.darker} />
            </XStack>
          </Card>

          {/* Templates */}
          <YStack gap="$3">
            <Text fontSize={16} fontWeight="600" color="$color">
              快速模板
            </Text>

            <YStack gap="$3">
              {templates.map(template => {
                const Icon = template.icon
                return (
                  <Card
                    key={template.id}
                    padding="$4"
                    backgroundColor="$background"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    pressStyle={{ scale: 0.98 }}
                    onPress={() => handleTemplatePress(template.id)}
                  >
                    <XStack alignItems="center" justifyContent="space-between">
                      <XStack alignItems="center" gap="$3">
                        <YStack
                          width={44}
                          height={44}
                          backgroundColor={`${template.color}20`}
                          borderRadius="$sm"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon size={22} color={template.color} />
                        </YStack>
                        <YStack>
                          <Text fontSize={15} fontWeight="600" color="$color">
                            {template.title}
                          </Text>
                          <Text fontSize={13} color="$color" opacity={0.6}>
                            {template.description}
                          </Text>
                        </YStack>
                      </XStack>
                      <ChevronRight size={20} color="$color" opacity={0.4} />
                    </XStack>
                  </Card>
                )
              })}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
