"use client";

import { type CreateWishBody, type RoadmapCategory, useCreateWish } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { Progress } from "@daodao/ui/components/progress";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { categoryKey, ROADMAP_CATEGORIES, WISH_DRAFT_KEY, WISH_DRAFT_TTL_MS } from "./constants";

interface WishDraft {
  category: RoadmapCategory | null;
  situation: string;
  desire: string;
  contactEmail: string;
  savedAt: number;
}

interface WishWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
  /** 未登入送出時呼叫；草稿已存於 localStorage */
  onRequireLogin: () => void;
}

const SITUATION_MIN = 10;
const TOTAL_STEPS = 3;

const emptyDraft = (): WishDraft => ({
  category: null,
  situation: "",
  desire: "",
  contactEmail: "",
  savedAt: Date.now(),
});

function loadDraft(): WishDraft | null {
  try {
    const raw = localStorage.getItem(WISH_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WishDraft;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > WISH_DRAFT_TTL_MS) {
      localStorage.removeItem(WISH_DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function WishWizardModal({
  open,
  onOpenChange,
  isAuthenticated,
  onRequireLogin,
}: WishWizardModalProps) {
  const t = useTranslations("roadmap");
  const { create } = useCreateWish();

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<WishDraft>(emptyDraft);

  // 開啟時回填草稿
  useEffect(() => {
    if (open) {
      const restored = loadDraft();
      setDraft(restored ?? emptyDraft());
      setStep(1);
      setDone(false);
    }
  }, [open]);

  // 即時保存草稿（未送出完成前）
  const persist = useCallback((next: WishDraft) => {
    setDraft(next);
    try {
      localStorage.setItem(WISH_DRAFT_KEY, JSON.stringify({ ...next, savedAt: Date.now() }));
    } catch {
      // localStorage 不可用時忽略
    }
  }, []);

  const clearDraft = () => {
    try {
      localStorage.removeItem(WISH_DRAFT_KEY);
    } catch {
      // ignore
    }
  };

  const canNext =
    (step === 1 && draft.category !== null) ||
    (step === 2 && draft.situation.trim().length >= SITUATION_MIN) ||
    (step === 3 && draft.desire.trim().length > 0);

  const isEmailValid =
    !draft.contactEmail.trim() ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim());

  const handleSubmit = async () => {
    if (!draft.category) return;
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setSubmitting(true);
    try {
      const body: CreateWishBody = {
        category: draft.category,
        situation: draft.situation.trim(),
        desire: draft.desire.trim(),
        ...(draft.contactEmail.trim() ? { contact_email: draft.contactEmail.trim() } : {}),
      };
      await create(body);
      clearDraft();
      setDone(true);
      toast.success(t("toast_wish_success"));
    } catch {
      toast.error(t("toast_wish_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-logo-cyan/15">
              <Check className="size-7 text-logo-cyan" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle>{t("done_title")}</DialogTitle>
              <DialogDescription>{t("done_desc")}</DialogDescription>
            </DialogHeader>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {t("done_close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("wizard_title")}</DialogTitle>
              <DialogDescription>
                {step <= TOTAL_STEPS
                  ? t("step_label", { current: step, total: TOTAL_STEPS })
                  : t("confirm_title")}
              </DialogDescription>
            </DialogHeader>

            <Progress value={(Math.min(step, TOTAL_STEPS + 1) / (TOTAL_STEPS + 1)) * 100} />

            <div className="min-h-[180px] py-2">
              {step === 1 && (
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-text-dark">
                    {t("step1_title")}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {ROADMAP_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => persist({ ...draft, category: c })}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                          draft.category === c
                            ? "border-logo-cyan bg-light-blue text-text-dark"
                            : "border-light-gray/50 bg-basic-white text-light-gray hover:border-logo-cyan/60"
                        )}
                        aria-pressed={draft.category === c}
                      >
                        {t(categoryKey(c))}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <div>
                  <label
                    htmlFor="wish-situation"
                    className="mb-2 block text-sm font-medium text-text-dark"
                  >
                    {t("step2_title")}
                  </label>
                  <Textarea
                    id="wish-situation"
                    rows={5}
                    value={draft.situation}
                    placeholder={t("step2_placeholder")}
                    onChange={(e) => persist({ ...draft, situation: e.target.value })}
                  />
                  {draft.situation.trim().length > 0 &&
                    draft.situation.trim().length < SITUATION_MIN && (
                      <p className="mt-1 text-xs text-red">{t("step2_min")}</p>
                    )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <label
                    htmlFor="wish-desire"
                    className="mb-2 block text-sm font-medium text-text-dark"
                  >
                    {t("step3_title")}
                  </label>
                  <Textarea
                    id="wish-desire"
                    rows={5}
                    value={draft.desire}
                    placeholder={t("step3_placeholder")}
                    onChange={(e) => persist({ ...draft, desire: e.target.value })}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-light-gray">{t("confirm_category")}</p>
                    <p className="text-text-dark">
                      {draft.category ? t(categoryKey(draft.category)) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-light-gray">{t("confirm_situation")}</p>
                    <p className="whitespace-pre-line text-text-dark">{draft.situation}</p>
                  </div>
                  <div>
                    <p className="text-light-gray">{t("confirm_desire")}</p>
                    <p className="whitespace-pre-line text-text-dark">{draft.desire}</p>
                  </div>
                  <div>
                    <label htmlFor="wish-contact" className="mb-1 block font-medium text-text-dark">
                      {t("contact_label")}
                    </label>
                    <Input
                      id="wish-contact"
                      type="email"
                      value={draft.contactEmail}
                      placeholder={t("contact_placeholder")}
                      onChange={(e) => persist({ ...draft, contactEmail: e.target.value })}
                    />
                    {!isEmailValid && (
                      <p className="mt-1 text-xs text-red">{t("validation_email_invalid")}</p>
                    )}
                    <p className="mt-1 text-xs text-light-gray">{t("contact_hint")}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 1 || submitting}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                {t("prev")}
              </Button>
              {step <= TOTAL_STEPS ? (
                <Button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                  {t("next")}
                </Button>
              ) : (
                <Button type="button" disabled={submitting || !isEmailValid} onClick={handleSubmit}>
                  {submitting ? t("submitting") : t("submit")}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
