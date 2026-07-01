"use client";

import type { PracticeSummary } from "@daodao/api";
import { toast } from "@daodao/ui/components/sonner";
import { useState } from "react";
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
  const stage = usePracticeStage(summary);
  const ended = isEnded(stage);

  const [currentSurface, setCurrentSurface] = useState<1 | 2 | 3>(1);
  const [reflectionText, setReflectionText] = useState(summary.reflection ?? "");
  const [selectedCheckInIds, setSelectedCheckInIds] = useState<string[]>(
    summary.selectedCheckInIds ?? []
  );
  const [themeIndex, setThemeIndex] = useState(0);

  const handleSurfaceChange = (surface: 1 | 2 | 3) => {
    if (!ended && surface !== 1) {
      toast.error("實踐結束後才能使用此功能");
      return;
    }
    setCurrentSurface(surface);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative w-screen min-h-screen bg-white">
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
        <Surface2NextIntent summary={summary} onSurfaceChange={handleSurfaceChange} />
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
