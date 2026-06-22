import { type MutableRefObject, type RefObject, useCallback, useRef, useState } from "react";
import type { View } from "react-native";
import { useMobileTranslation } from "@/i18n";
import { analyticsService } from "@/services/analytics";
import { shareService } from "@/services/share";

interface IUseShareOptions {
  practiceId: string;
  practiceTitle: string;
  streakCount: number;
}

interface IUseShareReturn {
  viewRef: MutableRefObject<View | null>;
  isCapturing: boolean;
  isSharing: boolean;
  isSaving: boolean;
  share: () => Promise<{ success: boolean; error?: string }>;
  saveToGallery: () => Promise<{ success: boolean; error?: string }>;
}

export function useShare(options: IUseShareOptions): IUseShareReturn {
  const t = useMobileTranslation("mobile.shareCheckIn");
  const { practiceId, practiceTitle, streakCount } = options;
  const viewRef = useRef<View | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const captureIfNeeded = useCallback(async (): Promise<string | null> => {
    if (capturedUri) return capturedUri;

    setIsCapturing(true);
    try {
      const result = await shareService.captureView(viewRef as RefObject<View>);
      if (result.success && result.uri) {
        setCapturedUri(result.uri);
        return result.uri;
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [capturedUri]);

  const share = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsSharing(true);
    try {
      const uri = await captureIfNeeded();
      if (!uri) {
        return { success: false, error: t("capture_failed") };
      }

      const shareText = t("share_text", { title: practiceTitle, count: streakCount });
      const result = await shareService.share({
        title: t("share_result"),
        message: shareText,
        imageUri: uri,
      });

      if (result.success) {
        // Track share event
        analyticsService.trackShareCheckIn({ practice_id: practiceId });
      }

      return result;
    } finally {
      setIsSharing(false);
    }
  }, [captureIfNeeded, practiceId, practiceTitle, streakCount, t]);

  const saveToGallery = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsSaving(true);
    try {
      const uri = await captureIfNeeded();
      if (!uri) {
        return { success: false, error: t("capture_failed") };
      }

      const result = await shareService.saveToGallery(uri);
      if (!result.success && result.error === "photo_library_permission_required") {
        return { ...result, error: t("permission_message") };
      }
      return result;
    } finally {
      setIsSaving(false);
    }
  }, [captureIfNeeded, t]);

  return {
    viewRef,
    isCapturing,
    isSharing,
    isSaving,
    share,
    saveToGallery,
  };
}
