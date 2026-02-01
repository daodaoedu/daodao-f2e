import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { CreatePracticeProvider } from '@/providers/CreatePracticeProvider'
import { practiceTemplates } from '@/types/create-practice'

export default function ManualCreateLayout() {
  const { templateId } = useLocalSearchParams<{ templateId?: string }>()

  const initialValues = useMemo(() => {
    if (!templateId) return undefined
    const template = practiceTemplates.find(t => t.id === templateId)
    return template?.defaultValues
  }, [templateId])

  return (
    <CreatePracticeProvider initialValues={initialValues}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </CreatePracticeProvider>
  )
}
