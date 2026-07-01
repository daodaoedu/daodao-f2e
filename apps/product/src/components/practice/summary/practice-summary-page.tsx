"use client";

import type { PracticeSummary } from "@daodao/api";
import { useRouter } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { FarewellScreen, type FarewellVariant } from "./farewell-screen";
import { isEnded, usePracticeStage } from "./hooks";
import { Surface1Summary } from "./surface-1-summary";
import { Surface2NextIntent } from "./surface-2-next-intent";
import { Surface3ShareCard } from "./surface-3-share-card";
import { SurfaceNavChip } from "./surface-nav-chip";

interface PracticeSummaryPageProps {
  summary: PracticeSummary;
}

/**
 * 實踐完成總結頁面元件
 * @description 依 Surface 架構切換三個畫面：實踐總結、接下來我想、製作分享卡
 */
export function PracticeSummaryPage({ summary }: PracticeSummaryPageProps) {
  const router = useRouter();
  const stage = usePracticeStage(summary);
  const ended = isEnded(stage);

  const [currentSurface, setCurrentSurface] = useState<1 | 2 | 3>(1);
  const [reflectionText, setReflectionText] = useState(summary.reflection ?? "");
  const [selectedCheckInIds, setSelectedCheckInIds] = useState<string[]>(
    summary.selectedCheckInIds ?? []
  );
  const [themeIndex, setThemeIndex] = useState(0);

  // 追蹤本次會話中「接下來我想」的儲存結果，供離開流程判斷 farewell 文案
  const [nextIntentStatus, setNextIntentStatus] = useState<"none" | "draft" | "final">("none");

  const [showFarewell, setShowFarewell] = useState(false);
  const [farewellVariant, setFarewellVariant] = useState<FarewellVariant>("draft-waiting");

  const handleSurfaceChange = (surface: 1 | 2 | 3) => {
    if (!ended && surface !== 1) {
      toast.error("實踐結束後才能使用此功能");
      return;
    }
    setCurrentSurface(surface);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const determineFarewellVariant = (): FarewellVariant => {
    if (ended && reflectionText.trim()) return "completed";
    if (nextIntentStatus === "final") return "direction-saved";
    if (nextIntentStatus === "draft") return "draft-saved";
    return "draft-waiting";
  };

  const handleClose = () => {
    setFarewellVariant(determineFarewellVariant());
    setShowFarewell(true);
  };

  if (showFarewell) {
    return (
      <AnimatePresence>
        <FarewellScreen
          variant={farewellVariant}
          onNavigateToList={() => router.push("/practices")}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="relative w-screen min-h-screen bg-white">
      <button
        type="button"
        onClick={handleClose}
        aria-label="離開實踐總結頁"
        className="fixed right-4 top-4 z-40 flex size-9 items-center justify-center rounded-full bg-white text-logo-gray shadow-sm"
      >
        <X className="size-4" />
      </button>

      <SurfaceNavChip
        currentSurface={currentSurface}
        stage={stage}
        onSurfaceChange={handleSurfaceChange}
      />

      {currentSurface === 1 && (
        <Surface1Summary
          summary={summary}
          stage={stage}
          reflectionText={reflectionText}
          onReflectionChange={setReflectionText}
          onSurfaceChange={handleSurfaceChange}
        />
      )}

      {currentSurface === 2 && (
        <Surface2NextIntent
          summary={summary}
          onSurfaceChange={handleSurfaceChange}
          onIntentSaved={setNextIntentStatus}
        />
      )}

      {currentSurface === 3 && (
        <Surface3ShareCard
          summary={summary}
          reflectionText={reflectionText}
          onReflectionChange={setReflectionText}
          selectedCheckInIds={selectedCheckInIds}
          onSelectedChange={setSelectedCheckInIds}
          themeIndex={themeIndex}
          onThemeChange={setThemeIndex}
          onSurfaceChange={handleSurfaceChange}
        />
      )}
    </div>
  );
}
