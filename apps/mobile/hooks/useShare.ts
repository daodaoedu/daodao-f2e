import { useState, useCallback, useRef, type MutableRefObject, type RefObject } from 'react'
import type { View } from 'react-native'
import { shareService } from '@/services/share'
import { analyticsService } from '@/services/analytics'

interface UseShareOptions {
  practiceId: string
  practiceTitle: string
  streakCount: number
}

interface UseShareReturn {
  viewRef: MutableRefObject<View | null>
  isCapturing: boolean
  isSharing: boolean
  isSaving: boolean
  share: () => Promise<{ success: boolean; error?: string }>
  saveToGallery: () => Promise<{ success: boolean; error?: string }>
}

export function useShare(options: UseShareOptions): UseShareReturn {
  const { practiceId, practiceTitle, streakCount } = options
  const viewRef = useRef<View | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [capturedUri, setCapturedUri] = useState<string | null>(null)

  const captureIfNeeded = useCallback(async (): Promise<string | null> => {
    if (capturedUri) return capturedUri

    setIsCapturing(true)
    try {
      const result = await shareService.captureView(viewRef as RefObject<View>)
      if (result.success && result.uri) {
        setCapturedUri(result.uri)
        return result.uri
      }
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [capturedUri])

  const share = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsSharing(true)
    try {
      const uri = await captureIfNeeded()
      if (!uri) {
        return { success: false, error: '無法擷取圖片' }
      }

      const shareText = shareService.generateCheckInShareText(practiceTitle, streakCount)
      const result = await shareService.share({
        title: '分享打卡成果',
        message: shareText,
        imageUri: uri,
      })

      if (result.success) {
        // Track share event
        analyticsService.trackShareCheckIn({ practice_id: practiceId })
      }

      return result
    } finally {
      setIsSharing(false)
    }
  }, [captureIfNeeded, practiceId, practiceTitle, streakCount])

  const saveToGallery = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsSaving(true)
    try {
      const uri = await captureIfNeeded()
      if (!uri) {
        return { success: false, error: '無法擷取圖片' }
      }

      return await shareService.saveToGallery(uri)
    } finally {
      setIsSaving(false)
    }
  }, [captureIfNeeded])

  return {
    viewRef,
    isCapturing,
    isSharing,
    isSaving,
    share,
    saveToGallery,
  }
}
