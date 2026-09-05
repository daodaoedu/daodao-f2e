"use client";

import { drawInspirationCard, selectInspirationDraw, useTodayDraws } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface InspirationDrawDialogProps {
  challengeId: number | null;
  onOpenChange: (open: boolean) => void;
}

type ViewState = "deck" | "shuffling" | "drawn";

const extractErrorMessage = (error: unknown, fallback: string): string =>
  (error as { error?: { message?: string } })?.error?.message ?? fallback;

export const InspirationDrawDialog = ({
  challengeId,
  onOpenChange,
}: InspirationDrawDialogProps) => {
  const t = useTranslations("challenge");
  const [isBusy, setIsBusy] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("deck");
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, mutate } = useTodayDraws(challengeId ?? undefined, challengeId !== null);
  const today = data?.data;
  const draws = today?.draws ?? [];
  const canDraw = today !== undefined && today.remaining > 0;
  const activeDraw = draws[activeIndex];

  useEffect(() => {
    if (challengeId === null) {
      setViewState("deck");
      setActiveIndex(0);
    } else if (draws.length > 0 && viewState === "deck") {
      setViewState("drawn");
      setActiveIndex(draws.length - 1);
    }
  }, [challengeId, draws.length, viewState]);

  const handleDraw = useCallback(async () => {
    if (challengeId === null || isBusy || !canDraw) return;
    setIsBusy(true);
    setViewState("shuffling");
    await new Promise((r) => setTimeout(r, 800));
    const response = await drawInspirationCard(challengeId);
    setIsBusy(false);
    if (response.error) {
      toast.error(extractErrorMessage(response.error, t("draw_failed")));
      setViewState(draws.length > 0 ? "drawn" : "deck");
      return;
    }
    await mutate();
    setViewState("drawn");
    setActiveIndex(draws.length);
  }, [challengeId, isBusy, canDraw, draws.length, mutate, t]);

  const handleSelect = useCallback(
    async (drawId: number) => {
      if (challengeId === null || isBusy) return;
      setIsBusy(true);
      const response = await selectInspirationDraw(challengeId, drawId);
      setIsBusy(false);
      if (response.error) {
        toast.error(extractErrorMessage(response.error, t("select_failed")));
        return;
      }
      mutate();
    },
    [challengeId, isBusy, mutate, t]
  );

  const hintText =
    today === undefined
      ? ""
      : today.remaining > 0
        ? t("draw_remaining", { count: today.remaining })
        : t("draw_none_left");

  return (
    <Dialog open={challengeId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-[28px] border-none p-7 text-center shadow-[0_20px_50px_rgba(15,48,54,0.25)]">
        <style>{`
          @keyframes shuffleA { 0%,100% { transform:translate(-14px,6px) rotate(-9deg); } 50% { transform:translate(14px,-6px) rotate(7deg); } }
          @keyframes shuffleB { 0%,100% { transform:translate(12px,-4px) rotate(8deg); } 50% { transform:translate(-12px,5px) rotate(-6deg); } }
        `}</style>

        <button
          type="button"
          aria-label={t("draw_close")}
          className="absolute top-4 right-4 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-transparent text-text-dark transition-colors hover:bg-light-blue"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-[18px]" />
        </button>

        <p className="m-0 text-xs font-medium text-logo-cyan">{t("challenge_tag")}</p>
        <h2 className="mt-2 m-0 text-xl font-bold text-text-dark">{t("draw_dialog_title")}</h2>

        <div className="relative mx-auto mt-5 mb-1 flex h-[236px] w-full items-center justify-center">
          {viewState === "deck" && (
            <button
              type="button"
              aria-label={t("draw_button")}
              className="relative h-[220px] w-[160px] cursor-pointer border-none bg-transparent p-0 disabled:cursor-default disabled:opacity-50"
              onClick={handleDraw}
              disabled={!canDraw}
            >
              <span className="absolute inset-0 rounded-[20px] border-2 border-logo-cyan/35 bg-[oklch(0.962_0.032_211.1)] -rotate-[8deg]" />
              <span className="absolute inset-0 rounded-[20px] border-2 border-logo-cyan/50 bg-[oklch(0.9_0.068_190.3)] rotate-[4deg]" />
              <span className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-logo-cyan shadow-[0_10px_24px_rgba(15,48,54,0.18)]">
                <span className="block size-24 rounded-t-full bg-white/[0.28]" />
              </span>
            </button>
          )}

          {viewState === "shuffling" && (
            <div className="relative h-[220px] w-[160px]">
              <span className="absolute inset-0 rounded-[20px] bg-[oklch(0.9_0.068_190.3)] [animation:shuffleA_520ms_ease-in-out_infinite]" />
              <span className="absolute inset-0 rounded-[20px] bg-logo-cyan [animation:shuffleB_520ms_ease-in-out_infinite]" />
            </div>
          )}

          {viewState === "drawn" && activeDraw && (
            <div className="flex h-[220px] w-[200px] flex-col items-center justify-center rounded-[20px] border-2 border-logo-cyan/25 bg-basic-white px-5 py-7 shadow-[0_8px_20px_rgba(15,48,54,0.1)]">
              {activeDraw.isSelected ? (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-logo-cyan px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  <Check className="size-[11px]" strokeWidth={3.5} />
                  {t("draw_today_action")}
                </span>
              ) : (
                <span className="mx-auto mb-3.5 block h-7 w-14 rounded-t-full bg-logo-cyan/25" />
              )}
              <p className="m-0 text-center text-lg font-semibold leading-relaxed text-text-dark [text-wrap:pretty]">
                {activeDraw.content}
              </p>
            </div>
          )}

          {viewState === "drawn" && !activeDraw && draws.length === 0 && (
            <p className="text-sm text-text-dark/50">{t("draw_empty_hint")}</p>
          )}
        </div>

        {draws.length > 1 && viewState === "drawn" && (
          <div className="mb-2.5 flex justify-center gap-1.5" role="group" aria-label={t("draw_switcher_label")}>
            {draws.map((draw, i) => (
              <button
                key={draw.drawId}
                type="button"
                aria-label={`${i + 1}`}
                className={cn(
                  "size-2.5 cursor-pointer rounded-full border-none p-0 transition-colors",
                  i === activeIndex ? "bg-logo-cyan" : "bg-logo-cyan/25"
                )}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}

        <p className="mb-4.5 text-center text-[13px] text-text-dark/50">{hintText}</p>

        <div className="flex flex-wrap justify-center gap-2">
          {viewState === "drawn" && activeDraw && !activeDraw.isSelected && (
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-none bg-logo-cyan px-5 font-[inherit] text-base text-white transition-[filter] hover:brightness-[1.06] disabled:opacity-50"
              disabled={isBusy}
              onClick={() => handleSelect(activeDraw.drawId)}
            >
              {t("draw_select")}
            </button>
          )}
          {canDraw && viewState === "drawn" && (
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-none bg-logo-cyan px-5 font-[inherit] text-base text-white transition-[filter] hover:brightness-[1.06] disabled:opacity-50"
              disabled={isBusy}
              onClick={handleDraw}
            >
              {isBusy ? t("drawing") : t("draw_again")}
            </button>
          )}
          {viewState === "deck" && canDraw && (
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-none bg-logo-cyan px-5 font-[inherit] text-base text-white transition-[filter] hover:brightness-[1.06]"
              onClick={handleDraw}
            >
              {t("draw_button")}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
