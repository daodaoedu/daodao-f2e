import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Text, YStack } from 'tamagui'
import { colors } from '@/generated/design-tokens'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showLabel?: boolean
  label?: string
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = colors.primary.base,
  backgroundColor = colors.basic[200],
  showLabel = true,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

  return (
    <YStack alignItems="center" justifyContent="center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {showLabel && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={size * 0.22} fontWeight="700" color="$color">
              {Math.round(clampedProgress)}%
            </Text>
            {label && (
              <Text fontSize={size * 0.12} color="$color" opacity={0.6}>
                {label}
              </Text>
            )}
          </YStack>
        )}
      </View>
    </YStack>
  )
}
