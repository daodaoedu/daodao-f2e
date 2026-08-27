"use client";

import {
  drawInspirationCard,
  selectInspirationDraw,
  useTodayDraws,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface InspirationDrawDialogProps {
  /** 抽卡對象挑戰；null 表示關閉 */
  challengeId: number | null;
  onOpenChange: (open: boolean) => void;
}

const extractErrorMessage = (error: unknown, fallback: string): string =>
  (error as { error?: { message?: string } })?.error?.message ?? fallback;

/**
 * 靈感卡抽卡彈窗（openspec: challenge-inspiration-deck）
 *
 * 每日最多 3 抽（排除本日已抽與曾選定，由後端保證）；抽完可選定一張為今日卡片，可重選。
 */
export const InspirationDrawDialog = ({ challengeId, onOpenChange }: InspirationDrawDialogProps) => {
  const t = useTranslations("challenge");
  const [isBusy, setIsBusy] = useState(false);
  const { data, mutate } = useTodayDraws(challengeId ?? undefined, challengeId !== null);
  const today = data?.data;

  const handleDraw = async () => {
    if (challengeId === null || isBusy) return;
    setIsBusy(true);
    const response = await drawInspirationCard(challengeId);
    setIsBusy(false);
    if (response.error) {
      toast.error(extractErrorMessage(response.error, t("draw_failed")));
      return;
    }
    mutate();
  };

  const handleSelect = async (drawId: number) => {
    if (challengeId === null || isBusy) return;
    setIsBusy(true);
    const response = await selectInspirationDraw(challengeId, drawId);
    setIsBusy(false);
    if (response.error) {
      toast.error(extractErrorMessage(response.error, t("select_failed")));
      return;
    }
    mutate();
  };

  return (
    <Dialog open={challengeId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-logo-cyan" />
            {t("draw_dialog_title")}
          </DialogTitle>
          <DialogDescription>{t("draw_dialog_subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {today && today.draws.length === 0 && (
            <p className="py-4 text-center text-sm text-text-dark">{t("draw_empty_hint")}</p>
          )}

          {today?.draws.map((draw) => (
            <div
              key={draw.drawId}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border p-4",
                draw.isSelected
                  ? "border-logo-cyan bg-light-blue"
                  : "border-very-light-gray bg-basic-white"
              )}
            >
              <p className="text-sm text-bg-dark">{draw.content}</p>
              {draw.isSelected ? (
                <Badge variant="outline-logo" size="sm" className="shrink-0">
                  {t("draw_selected")}
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={isBusy}
                  onClick={() => handleSelect(draw.drawId)}
                >
                  {t("draw_select")}
                </Button>
              )}
            </div>
          ))}

          {today && (
            <p className="text-center text-xs text-text-dark">
              {today.remaining > 0
                ? t("draw_remaining", { count: today.remaining })
                : t("draw_none_left")}
            </p>
          )}

          <Button
            className="w-full"
            disabled={isBusy || (today !== undefined && today.remaining === 0)}
            onClick={handleDraw}
          >
            <Sparkles className="size-4.5" />
            {isBusy ? t("drawing") : t("draw_button")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
