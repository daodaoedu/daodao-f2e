"use client";

import { Button } from "@daodao/ui/components/button";
import { Download, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      // prompt failed — hide banner regardless
    }
    setShowBanner(false);
    deferredPromptRef.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    deferredPromptRef.current = null;
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 safe-area-inset-bottom p-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-background p-4 shadow-lg">
        <div className="flex-1">
          <p className="font-medium text-sm">安裝島島阿學</p>
          <p className="text-muted-foreground text-xs">加到主畫面，享受更好的體驗</p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          <Download className="mr-1 size-4" />
          安裝
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground"
          aria-label="關閉"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
