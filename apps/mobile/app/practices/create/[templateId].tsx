import { useLocalSearchParams, useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, Check, Calendar, Target } from '@tamagui/lucide-icons'
import { practiceTemplates } from '@/types/create-practice'
import { colors } from '@/generated/design-tokens'

export default function TemplatePreviewScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>()
  const router = useRouter()

  const template = practiceTemplates.find(t => t.id === templateId)

  if (!template) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize={16} color="$color" opacity={0.6}>
            找不到此模板
          </Text>
          <Button onPress={() => router.back()}>
            <Text>返回</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    )
  }

  const handleUseTemplate = () => {
    // Navigate to manual flow with template values
    router.push({
      pathname: '/practices/create/manual/step1',
      params: { templateId: template.id },
    })
  }

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
            模板預覽
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {/* Template Header */}
          <YStack alignItems="center" gap="$4" marginBottom="$6">
            <YStack
              width={100}
              height={100}
              backgroundColor={`${template.color}20`}
              borderRadius={50}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={48}>{template.icon}</Text>
            </YStack>
            <YStack alignItems="center" gap="$2">
              <Text fontSize={24} fontWeight="700" color="$color">
                {template.title}
              </Text>
              <Text fontSize={14} color="$color" opacity={0.6} textAlign="center">
                {template.description}
              </Text>
            </YStack>
          </YStack>

          {/* Template Details */}
          <YStack gap="$4" marginBottom="$6">
            <YStack
              padding="$4"
              backgroundColor={colors.basic[100]}
              borderRadius="$md"
              gap="$3"
            >
              <XStack alignItems="center" gap="$3">
                <Calendar size={20} color={template.color} />
                <YStack flex={1}>
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    頻率
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {template.defaultValues.frequency === 'daily' ? '每日' : '每週'}
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Target size={20} color={template.color} />
                <YStack flex={1}>
                  <Text fontSize={13} color="$color" opacity={0.6}>
                    目標天數
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {template.defaultValues.targetDays} 天
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            {/* Tags */}
            {template.defaultValues.tags && template.defaultValues.tags.length > 0 && (
              <YStack gap="$2">
                <Text fontSize={13} color="$color" opacity={0.6}>
                  標籤
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {template.defaultValues.tags.map(tag => (
                    <YStack
                      key={tag}
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      backgroundColor={`${template.color}15`}
                      borderRadius="$sm"
                    >
                      <Text fontSize={13} color={template.color}>
                        {tag}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" gap="$3" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={template.color}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleUseTemplate}
          >
            <XStack alignItems="center" gap="$2">
              <Check size={20} color={colors.basic.white} />
              <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                使用此模板
              </Text>
            </XStack>
          </Button>
          <Button
            size="$4"
            backgroundColor="transparent"
            borderWidth={1}
            borderColor="$borderColor"
            onPress={() => router.push('/practices/create/manual/step1')}
          >
            <Text color="$color" fontWeight="500">
              自訂設定
            </Text>
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
