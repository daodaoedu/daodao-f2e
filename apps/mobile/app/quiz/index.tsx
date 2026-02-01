import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Card, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, ChevronRight, Clock, HelpCircle } from '@tamagui/lucide-icons'
import { availableQuizzes } from '@/types/quiz'
import { colors } from '@/generated/design-tokens'

export default function QuizListScreen() {
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
            性格測驗
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {/* Intro */}
          <YStack
            padding="$4"
            backgroundColor={colors.primary.palest}
            borderRadius="$md"
            marginBottom="$5"
            gap="$2"
          >
            <XStack alignItems="center" gap="$2">
              <HelpCircle size={20} color={colors.primary.base} />
              <Text fontSize={15} fontWeight="600" color={colors.primary.darker}>
                探索你的學習風格
              </Text>
            </XStack>
            <Text fontSize={13} color={colors.primary.darker} opacity={0.8}>
              透過測驗了解自己的學習偏好，獲得個人化的學習建議，解鎖專屬的學習島嶼！
            </Text>
          </YStack>

          {/* Quiz List */}
          <YStack gap="$4">
            {availableQuizzes.map(quiz => (
              <Card
                key={quiz.id}
                padding="$4"
                backgroundColor="$background"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
                pressStyle={{ scale: 0.98 }}
                onPress={() => router.push(`/quiz/${quiz.id}`)}
              >
                <XStack gap="$4" alignItems="center">
                  <YStack
                    width={56}
                    height={56}
                    backgroundColor={colors.primary.palest}
                    borderRadius={28}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={28}>{quiz.icon}</Text>
                  </YStack>

                  <YStack flex={1} gap="$1">
                    <Text fontSize={16} fontWeight="600" color="$color">
                      {quiz.title}
                    </Text>
                    <Text fontSize={13} color="$color" opacity={0.6} numberOfLines={2}>
                      {quiz.description}
                    </Text>
                    <XStack gap="$3" marginTop="$1">
                      <XStack alignItems="center" gap="$1">
                        <HelpCircle size={14} color="$color" opacity={0.5} />
                        <Text fontSize={12} color="$color" opacity={0.5}>
                          {quiz.questionCount} 題
                        </Text>
                      </XStack>
                      <XStack alignItems="center" gap="$1">
                        <Clock size={14} color="$color" opacity={0.5} />
                        <Text fontSize={12} color="$color" opacity={0.5}>
                          {quiz.estimatedTime}
                        </Text>
                      </XStack>
                    </XStack>
                  </YStack>

                  <ChevronRight size={20} color="$color" opacity={0.4} />
                </XStack>
              </Card>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  )
}
