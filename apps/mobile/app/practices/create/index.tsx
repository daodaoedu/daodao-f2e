import { useRouter } from 'expo-router'
import { YStack, XStack, Text, ScrollView, Card, Button } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, Plus } from '@tamagui/lucide-icons'
import { practiceTemplates } from '@/types/create-practice'
import { colors } from '@/generated/design-tokens'

export default function CreatePracticeScreen() {
  const router = useRouter()

  const categories = [...new Set(practiceTemplates.map(t => t.category))]

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
            建立新實踐
          </Text>
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          {/* Custom Practice */}
          <Card
            padding="$4"
            backgroundColor={colors.primary.palest}
            borderRadius="$md"
            borderWidth={1}
            borderColor={colors.primary.lighter}
            pressStyle={{ scale: 0.98 }}
            onPress={() => router.push('/practices/create/manual/step1')}
            marginBottom="$5"
          >
            <XStack gap="$3" alignItems="center">
              <YStack
                width={56}
                height={56}
                backgroundColor={colors.primary.base}
                borderRadius={28}
                alignItems="center"
                justifyContent="center"
              >
                <Plus size={28} color={colors.basic.white} />
              </YStack>
              <YStack flex={1} gap="$1">
                <Text fontSize={16} fontWeight="600" color={colors.primary.darker}>
                  自訂實踐
                </Text>
                <Text fontSize={13} color={colors.primary.darker} opacity={0.8}>
                  從零開始建立你的實踐計畫
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Templates by Category */}
          {categories.map(category => (
            <YStack key={category} marginBottom="$5">
              <Text fontSize={14} fontWeight="600" color="$color" opacity={0.6} marginBottom="$3">
                {category}
              </Text>
              <YStack gap="$3">
                {practiceTemplates
                  .filter(t => t.category === category)
                  .map(template => (
                    <Card
                      key={template.id}
                      padding="$4"
                      backgroundColor="$background"
                      borderRadius="$md"
                      borderWidth={1}
                      borderColor="$borderColor"
                      pressStyle={{ scale: 0.98 }}
                      onPress={() => router.push(`/practices/create/${template.id}`)}
                    >
                      <XStack gap="$3" alignItems="center">
                        <YStack
                          width={48}
                          height={48}
                          backgroundColor={template.color + '20'}
                          borderRadius={24}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize={24}>{template.icon}</Text>
                        </YStack>
                        <YStack flex={1} gap="$1">
                          <Text fontSize={15} fontWeight="600" color="$color">
                            {template.title}
                          </Text>
                          <Text fontSize={12} color="$color" opacity={0.6} numberOfLines={1}>
                            {template.description}
                          </Text>
                        </YStack>
                      </XStack>
                    </Card>
                  ))}
              </YStack>
            </YStack>
          ))}
        </ScrollView>
      </YStack>
    </SafeAreaView>
  )
}
