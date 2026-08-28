"use client";

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
import { cn } from "@daodao/ui/lib/utils";
import { Sparkles, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { WizardMode } from "./schema";

export interface CompletionDialogProps {
  open: boolean;
  mode: WizardMode;
  /** 本次建立的實踐名稱，順序與預覽一致 */
  names: string[];
  onPrimary: () => void;
  onSecondary: () => void;
  onClose: () => void;
}

const useDialogCopy = (mode: WizardMode, count: number) => {
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

  return {
    title,
    primary: isPersonal ? t("wizard_done_primary_personal") : t("wizard_done_primary_template"),
    secondary: isPersonal
      ? t("wizard_done_secondary_personal")
      : t("wizard_done_secondary_template"),
    close: t("wizard_close"),
  };
};

/**
 * 完成彈窗：半透明深色遮罩、右上關閉、標題、名稱膠囊列表、主要／次要按鈕。
 * 進場（motion spring）+ 輕微循環動畫；`prefers-reduced-motion` 時進場 transition 歸零、
 * CSS 動畫以 `motion-reduce:animate-none` 停用。
 * 不含任何累積性計數。
 */
export const CompletionDialog = ({
  open,
  mode,
  names,
  onPrimary,
  onSecondary,
  onClose,
}: CompletionDialogProps) => {
  const copy = useDialogCopy(mode, names.length);
  const prefersReducedMotion = useReducedMotion();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        transition={prefersReducedMotion ? { duration: 0 } : undefined}
        className="w-[calc(100vw-2.5rem)] max-w-[400px] overflow-hidden border-0 bg-white p-6 pt-10"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copy.close}
          onClick={onClose}
          className="absolute top-3 right-3 size-10 rounded-full text-light-gray hover:bg-very-light-gray"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>

        <DialogHeader className="items-center pt-0">
          <span
            aria-hidden="true"
            className={cn(
              "mb-1 inline-flex size-14 items-center justify-center rounded-full bg-light-blue text-logo-cyan",
              "animate-[wizard-float_3s_ease-in-out_infinite] motion-reduce:animate-none"
            )}
          >
            <Sparkles className="size-7" />
          </span>
          <DialogTitle className="text-xl font-semibold text-text-dark">{copy.title}</DialogTitle>
          <DialogDescription className="sr-only">{names.join("、")}</DialogDescription>
        </DialogHeader>

        {names.length > 0 && (
          <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label={copy.title}>
            {names.map((name, index) => (
              <li
                key={`${index}-${name}`}
                className="animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none"
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                <Badge variant="outline-logo" size="default" className="max-w-full break-all">
                  {name}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button type="button" onClick={onPrimary} className="w-full">
            {copy.primary}
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={onSecondary}
            className="min-h-10 text-text-dark"
          >
            {copy.secondary}
          </Button>
        </div>

        <style>{`@keyframes wizard-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
      </DialogContent>
    </Dialog>
  );
};
