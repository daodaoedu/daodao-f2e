import { useState } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Button, Spinner } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, Check, Calendar, Target, Bell, Tag } from '@tamagui/lucide-icons'
import { useCreatePractice } from '@/providers/CreatePracticeProvider'
import { StepIndicator } from '@/components'
import { api } from '@/services/api-client'
import { colors } from '@/generated/design-tokens'

export default function Step5Screen() {
  const router = useRouter()
  const { form, currentStep, totalSteps, prevStep, resetForm } = useCreatePractice()
  const { watch, handleSubmit } = form

  const [isSubmitting, setIsSubmitting] = useState(false)

  const values = watch()

  const handleBack = () => {
    prevStep()
    router.back()
  }

  const onSubmit = async (data: typeof values) => {
    setIsSubmitting(true)

    try {
      await api.post('/practices', data)

      Alert.alert(
        '建立成功',
        '你的實踐已建立，開始你的旅程吧！',
        [
          {
            text: '確定',
            onPress: () => {
              resetForm()
              router.replace('/(tabs)')
            },
          },
        ]
      )
    } catch (error) {
      Alert.alert(
        '建立失敗',
        error instanceof Error ? error.message : '請稍後再試'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const frequencyLabel = {
    daily: '每日',
    weekly: '每週',
    custom: '自訂',
  }[values.frequency]

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack padding="$4" alignItems="center" gap="$3">
          <Button
            size="$4"
            circular
            chromeless
            onPress={handleBack}
            accessibilityLabel="返回"
          >
            <ChevronLeft size={24} color="$color" />
          </Button>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color="$color">
              確認送出
            </Text>
            <Text fontSize={12} color="$color" opacity={0.6}>
              步驟 {currentStep} / {totalSteps}
            </Text>
          </YStack>
        </XStack>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$4">
            {/* Preview Card */}
            <YStack
              padding="$5"
              backgroundColor={values.color ? values.color + '15' : colors.primary.palest}
              borderRadius="$md"
              borderWidth={1}
              borderColor={values.color ? values.color + '30' : colors.primary.lighter}
              alignItems="center"
              gap="$3"
            >
              <YStack
                width={64}
                height={64}
                backgroundColor={values.color || colors.primary.base}
                borderRadius={32}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={28} color={colors.basic.white}>
                  {values.icon || '✨'}
                </Text>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Text fontSize={20} fontWeight="700" color="$color">
                  {values.title || '未命名實踐'}
                </Text>
                {values.description && (
                  <Text fontSize={13} color="$color" opacity={0.6} textAlign="center">
                    {values.description}
                  </Text>
                )}
              </YStack>
            </YStack>

            {/* Details */}
            <YStack
              padding="$4"
              backgroundColor={colors.basic[100]}
              borderRadius="$md"
              gap="$4"
            >
              <XStack alignItems="center" gap="$3">
                <Calendar size={20} color={values.color || colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    執行頻率
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {frequencyLabel}
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Target size={20} color={values.color || colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    目標天數
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {values.targetDays} 天
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3">
                <Bell size={20} color={values.color || colors.primary.base} />
                <YStack flex={1}>
                  <Text fontSize={12} color="$color" opacity={0.6}>
                    每日提醒
                  </Text>
                  <Text fontSize={15} fontWeight="500" color="$color">
                    {values.reminderEnabled ? `已開啟（${values.reminderTime}）` : '未開啟'}
                  </Text>
                </YStack>
              </XStack>

              {values.tags && values.tags.length > 0 && (
                <XStack alignItems="flex-start" gap="$3">
                  <Tag size={20} color={values.color || colors.primary.base} />
                  <YStack flex={1} gap="$2">
                    <Text fontSize={12} color="$color" opacity={0.6}>
                      標籤
                    </Text>
                    <XStack gap="$2" flexWrap="wrap">
                      {values.tags.map(tag => (
                        <YStack
                          key={tag}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          backgroundColor={values.color ? values.color + '20' : colors.primary.palest}
                          borderRadius="$sm"
                        >
                          <Text fontSize={12} color={values.color || colors.primary.base}>
                            {tag}
                          </Text>
                        </YStack>
                      ))}
                    </XStack>
                  </YStack>
                </XStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            size="$5"
            backgroundColor={values.color || colors.primary.base}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner color={colors.basic.white} />
            ) : (
              <XStack alignItems="center" gap="$2">
                <Check size={20} color={colors.basic.white} />
                <Text color={colors.basic.white} fontWeight="600" fontSize={16}>
                  建立實踐
                </Text>
              </XStack>
            )}
          </Button>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
