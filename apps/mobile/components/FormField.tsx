import { YStack, Text, Input, TextArea } from 'tamagui'
import { colors } from '@/generated/design-tokens'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children?: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <YStack gap="$2">
      <XStack alignItems="center" gap="$1">
        <Text fontSize={14} fontWeight="500" color="$color">
          {label}
        </Text>
        {required && (
          <Text fontSize={14} color={colors.semantic.error}>
            *
          </Text>
        )}
      </XStack>
      {children}
      {error && (
        <Text fontSize={12} color={colors.semantic.error}>
          {error}
        </Text>
      )}
    </YStack>
  )
}

import { XStack } from 'tamagui'

interface FormInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  multiline?: boolean
  numberOfLines?: number
  maxLength?: number
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required,
  multiline,
  numberOfLines = 3,
  maxLength,
}: FormInputProps) {
  const InputComponent = multiline ? TextArea : Input

  return (
    <FormField label={label} error={error} required={required}>
      <InputComponent
        size="$4"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        borderColor={error ? colors.semantic.error : colors.basic[200]}
        focusStyle={{ borderColor: error ? colors.semantic.error : colors.primary.base }}
        {...(multiline && { numberOfLines, textAlignVertical: 'top' as const })}
        maxLength={maxLength}
      />
      {maxLength && (
        <Text fontSize={11} color="$color" opacity={0.5} textAlign="right">
          {value.length}/{maxLength}
        </Text>
      )}
    </FormField>
  )
}
