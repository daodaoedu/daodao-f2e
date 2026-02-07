import * as Sharing from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import { captureRef, type CaptureOptions } from 'react-native-view-shot'
import type { RefObject } from 'react'
import type { View } from 'react-native'

export interface ShareContent {
  title: string
  message: string
  imageUri?: string
}

export interface CaptureResult {
  success: boolean
  uri?: string
  error?: string
}

export interface ShareResult {
  success: boolean
  error?: string
}

export interface SaveToGalleryResult {
  success: boolean
  error?: string
}

class ShareService {
  /**
   * Capture a view as an image
   */
  async captureView(
    viewRef: RefObject<View>,
    options?: Partial<CaptureOptions>
  ): Promise<CaptureResult> {
    if (!viewRef.current) {
      return { success: false, error: 'View reference is not available' }
    }

    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        ...options,
      })

      return { success: true, uri }
    } catch (error) {
      if (__DEV__) {
        console.error('[Share] Failed to capture view:', error)
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture image',
      }
    }
  }

  /**
   * Share content using the native share dialog
   */
  async share(content: ShareContent): Promise<ShareResult> {
    const isAvailable = await Sharing.isAvailableAsync()
    if (!isAvailable) {
      return { success: false, error: 'Sharing is not available on this device' }
    }

    try {
      // If we have an image, share it with the message
      if (content.imageUri) {
        await Sharing.shareAsync(content.imageUri, {
          mimeType: 'image/png',
          dialogTitle: content.title,
        })
      }

      return { success: true }
    } catch (error) {
      if (__DEV__) {
        console.error('[Share] Failed to share:', error)
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share',
      }
    }
  }

  /**
   * Save image to device gallery
   */
  async saveToGallery(imageUri: string): Promise<SaveToGalleryResult> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        return { success: false, error: '需要相簿存取權限才能儲存圖片' }
      }

      await MediaLibrary.saveToLibraryAsync(imageUri)
      return { success: true }
    } catch (error) {
      if (__DEV__) {
        console.error('[Share] Failed to save to gallery:', error)
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save to gallery',
      }
    }
  }

  /**
   * Generate share text for check-in
   */
  generateCheckInShareText(practiceTitle: string, streakCount: number): string {
    return `我在「${practiceTitle}」已經連續打卡 ${streakCount} 天！🔥 #島島阿學`
  }
}

export const shareService = new ShareService()
