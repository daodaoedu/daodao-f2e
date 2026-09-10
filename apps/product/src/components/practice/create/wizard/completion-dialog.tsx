"use client";

import { BgRadialSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { WizardMode } from "./schema";
import { WIZARD_TEXT_LINK, WIZARD_TINT_BG } from "./wizard-styles";

export interface CompletionDialogProps {
  open: boolean;
  mode: WizardMode;
  /** 本次建立的實踐名稱，順序與預覽一致 */
  names: string[];
  /** 第一個實踐的開始日（YYYY/MM/DD）；模版版本不帶 */
  startDateText?: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onClose: () => void;
}

const useDialogCopy = (mode: WizardMode, count: number, startDateText?: string) => {
  const t = useTranslations("practice");
  const isPersonal = mode === WizardMode.personal;
  const isMulti = count > 1;

  let title: string;
  if (isPersonal) {
    title = isMulti
      ? t("wizard_done_title_personal_multi", { count })
      : t("wizard_done_title_personal");
  } else {
    title = isMulti
      ? t("wizard_done_title_template_multi", { count })
      : t("wizard_done_title_template");
  }

  let body: string | null = null;
  if (isPersonal) {
    const date = startDateText ?? t("wizard_done_body_today");
    body = isMulti
      ? t("wizard_done_body_personal_multi", { date })
      : t("wizard_done_body_personal", { date });
  }

  return {
    title,
    body,
    primary: isPersonal ? t("wizard_done_primary_personal") : t("wizard_done_primary_template"),
    secondary: isPersonal
      ? t("wizard_done_secondary_personal")
      : t("wizard_done_secondary_template"),
    close: t("wizard_close"),
  };
};

/**
 * 完成彈窗（POC）：半透明深色遮罩、右上關閉、山丘＋太陽插圖（ripple／bob／twinkle）、
 * 標題、說明句、名稱膠囊列表、主要按鈕、底線次要連結。
 * `prefers-reduced-motion` 時進場 transition 歸零、CSS 動畫以 `motion-reduce:animate-none` 停用。
 * 不含任何累積性計數。
 */
export const CompletionDialog = ({
  open,
  mode,
  names,
  startDateText,
  onPrimary,
  onSecondary,
  onClose,
}: CompletionDialogProps) => {
  const copy = useDialogCopy(mode, names.length, startDateText);
  const prefersReducedMotion = useReducedMotion();
  const anim = (name: string) => `animate-[${name}] motion-reduce:animate-none`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[rgba(15,48,54,0.42)]"
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        className="w-[calc(100vw-3rem)] max-w-[360px] overflow-hidden rounded-3xl border-0 bg-white px-6 pt-7 pb-6 text-center shadow-[0_24px_60px_rgba(15,48,54,0.22)]"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copy.close}
          onClick={onClose}
          className="absolute top-3 right-3 z-[2] size-9 rounded-full bg-very-light-gray/60 text-light-gray hover:bg-light-blue hover:text-logo-cyan"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>

        {/* 放射背景 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 h-40 w-60 -translate-x-1/2"
        >
          <BgRadialSvg
            className={cn(
              "h-[222px] w-60 opacity-70",
              anim("wizard-breathe_5s_0.3s_ease-in-out_infinite")
            )}
          />
        </div>

        {/* 山丘＋太陽插圖 */}
        <div
          aria-hidden="true"
          className={cn(
            "relative mx-auto mb-4 h-12 w-24",
            anim("wizard-rise_0.4s_0.06s_ease-out_both")
          )}
        >
          <div
            className={cn(
              "absolute bottom-0 left-1/2 size-[118px] -translate-x-1/2 rounded-full border-2 border-logo-cyan",
              anim("wizard-ripple_2.6s_0.5s_ease-out_infinite")
            )}
          />
          <div
            className={cn("absolute inset-0", anim("wizard-bob_3.4s_0.5s_ease-in-out_infinite"))}
          >
            <div className="h-12 w-24 rounded-t-full bg-logo-cyan" />
            <div
              className={cn(
                "absolute -top-3.5 -right-2.5 size-[22px] rounded-full bg-[oklch(0.9_0.19_96)]",
                anim("wizard-twinkle_2.2s_0.8s_ease-in-out_infinite")
              )}
            />
          </div>
        </div>

        <DialogHeader className="gap-0 pt-0">
          <DialogTitle
            className={cn(
              "mb-2 text-[22px] font-semibold leading-[1.4] text-bg-dark",
              anim("wizard-rise_0.4s_0.1s_ease-out_both")
            )}
          >
            {copy.title}
          </DialogTitle>
          {copy.body ? (
            <DialogDescription
              className={cn(
                "mb-4 text-sm leading-[1.7] text-text-dark",
                anim("wizard-rise_0.4s_0.14s_ease-out_both")
              )}
            >
              {copy.body}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{names.join("、")}</DialogDescription>
          )}
        </DialogHeader>

        {names.length > 0 && (
          <ul
            className={cn(
              "mb-5 flex flex-col gap-1.5",
              anim("wizard-rise_0.4s_0.18s_ease-out_both")
            )}
            aria-label={copy.title}
          >
            {names.map((name, index) => (
              <li
                key={`${index}-${name}`}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm leading-normal break-all text-text-dark",
                  WIZARD_TINT_BG
                )}
              >
                <span
                  className="size-[5px] shrink-0 rounded-full bg-logo-cyan"
                  aria-hidden="true"
                />
                {name}
              </li>
            ))}
          </ul>
        )}

        <Button type="button" onClick={onPrimary} className="h-11 w-full">
          {copy.primary}
        </Button>
        <button
          type="button"
          onClick={onSecondary}
          className={cn(WIZARD_TEXT_LINK, "mx-auto mt-1 cursor-pointer")}
        >
          {copy.secondary}
        </button>

        <style>{`
@keyframes wizard-rise{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
@keyframes wizard-ripple{0%{opacity:.55;transform:translateX(-50%) scale(.75)}100%{opacity:0;transform:translateX(-50%) scale(1.25)}}
@keyframes wizard-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes wizard-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.85)}}
@keyframes wizard-breathe{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:.5;transform:scale(1.04)}}
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
