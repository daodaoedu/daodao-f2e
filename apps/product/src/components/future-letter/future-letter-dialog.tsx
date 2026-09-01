"use client";

import {
  createFutureLetter,
  deleteFutureLetter,
  type FutureLetterType,
  sendFutureLetter,
  updateFutureLetter,
  useMyPractices,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { DatePicker } from "@daodao/ui/components/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { format, parseISO } from "date-fns";
import { CircleHelp, Feather, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PracticeStatus } from "@/constants/practice-status";
import {
  DeliveryOption,
  type DeliveryOptionType,
  getDeliverAt,
  getDraftCloseAction,
  getFutureLetterCustomDateRange,
  getFutureLetterFormErrors,
  hasFutureLetterContent,
  hasFutureLetterFormErrors,
} from "./future-letter-utils";

const NO_PRACTICE = "none";

interface FutureLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLetter?: FutureLetterType | null;
  onSaved?: () => void | Promise<void>;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  if ("message" in error && typeof error.message === "string") return error.message;
  if ("error" in error && error.error && typeof error.error === "object") {
    if ("message" in error.error && typeof error.error.message === "string") {
      return error.error.message;
    }
  }
  return fallback;
}

export function FutureLetterDialog({
  open,
  onOpenChange,
  initialLetter,
  onSaved,
}: FutureLetterDialogProps) {
  const t = useTranslations("future_letter");
  const { openWarningDialog } = useDialog();
  const [currentSelf, setCurrentSelf] = useState("");
  const [messageToFuture, setMessageToFuture] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOptionType>(
    DeliveryOption.fourteenDays
  );
  const [customDeliveryDate, setCustomDeliveryDate] = useState<Date>();
  const [relatedPractice, setRelatedPractice] = useState(NO_PRACTICE);
  const [draftId, setDraftId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const skipAutoSaveRef = useRef(false);
  const initializedOpenRef = useRef(false);
  const { data: practicesResponse, isLoading: isPracticesLoading } = useMyPractices({ limit: 100 });

  const eligiblePractices = useMemo(
    () =>
      (practicesResponse?.data ?? []).filter(
        (practice) =>
          practice.status === PracticeStatus.active || practice.status === PracticeStatus.completed
      ),
    [practicesResponse]
  );

  useEffect(() => {
    if (!open) {
      initializedOpenRef.current = false;
      return;
    }
    if (initializedOpenRef.current) return;
    initializedOpenRef.current = true;
    setCurrentSelf(initialLetter?.currentSelf ?? "");
    setMessageToFuture(initialLetter?.message ?? "");
    setRelatedPractice(initialLetter?.practiceId ?? NO_PRACTICE);
    setDraftId(initialLetter?.id);
    setDeliveryOption(
      initialLetter?.deliverAt ? DeliveryOption.custom : DeliveryOption.fourteenDays
    );
    setCustomDeliveryDate(initialLetter?.deliverAt ? parseISO(initialLetter.deliverAt) : undefined);
    setIsSubmitting(false);
    skipAutoSaveRef.current = false;
  }, [initialLetter, open]);

  const now = new Date();
  const { minDate: minDeliveryDate, maxDate: maxDeliveryDate } =
    getFutureLetterCustomDateRange(now);
  const errors = getFutureLetterFormErrors({
    currentSelf,
    message: messageToFuture,
    deliveryOption,
    customDeliveryDate,
  });
  const hasContent = hasFutureLetterContent({ currentSelf, message: messageToFuture });
  const selectedDeliverAt = getDeliverAt(deliveryOption, customDeliveryDate, now);

  const getRequestBody = () => ({
    currentSelf,
    message: messageToFuture,
    deliverAt: selectedDeliverAt?.toISOString(),
    practiceId: relatedPractice === NO_PRACTICE ? null : relatedPractice,
  });

  const refreshAndClose = async () => {
    await onSaved?.();
    onOpenChange(false);
  };

  const saveDraft = async (): Promise<boolean> => {
    const action = getDraftCloseAction({ currentSelf, message: messageToFuture }, draftId);
    if (action === "skip") return true;
    if (action === "delete" && draftId) {
      const response = await deleteFutureLetter(draftId);
      if (response.error) {
        toast.error(getApiErrorMessage(response.error, t("letter_save_failed")));
        return false;
      }
      setDraftId(undefined);
      return true;
    }
    const response =
      action === "update" && draftId
        ? await updateFutureLetter(draftId, getRequestBody())
        : await createFutureLetter(getRequestBody());
    if (response.error) {
      toast.error(getApiErrorMessage(response.error, t("letter_save_failed")));
      return false;
    }
    const savedId = draftId ?? response.data?.data?.id;
    if (savedId) setDraftId(savedId);
    return true;
  };

  const handleDialogOpenChange = async (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }
    if (skipAutoSaveRef.current || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const saved = await saveDraft();
      if (!saved) return;
      if (hasContent) toast.success(t("draft_auto_saved"));
      await refreshAndClose();
    } catch (error) {
      console.error("Failed to auto-save future letter draft", error);
      toast.error(t("letter_save_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (isSubmitting || hasFutureLetterFormErrors(errors) || !selectedDeliverAt) return;
    setIsSubmitting(true);
    try {
      const draftResponse = draftId
        ? await updateFutureLetter(draftId, getRequestBody())
        : await createFutureLetter(getRequestBody());
      if (draftResponse.error) {
        toast.error(getApiErrorMessage(draftResponse.error, t("letter_send_failed")));
        return;
      }
      const letterId = draftId ?? draftResponse.data?.data?.id;
      if (!letterId) {
        toast.error(t("letter_send_failed"));
        return;
      }
      const sendResponse = await sendFutureLetter(letterId, {
        deliverAt: selectedDeliverAt.toISOString(),
      });
      if (sendResponse.error) {
        toast.error(getApiErrorMessage(sendResponse.error, t("letter_send_failed")));
        setDraftId(letterId);
        return;
      }
      skipAutoSaveRef.current = true;
      toast.success(t("letter_sent"));
      await refreshAndClose();
    } catch (error) {
      console.error("Failed to send future letter", error);
      toast.error(t("letter_send_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftId || isSubmitting) return;
    const result = await openWarningDialog({
      title: t("delete_draft_title"),
      message: t("delete_draft_message"),
      strict: true,
      buttons: [
        { label: t("delete_cancel"), value: "cancel", variant: "orange" },
        { label: t("delete_permanently"), value: "delete", variant: "outline" },
      ],
    });
    if (result.value !== "delete") return;
    setIsSubmitting(true);
    try {
      const response = await deleteFutureLetter(draftId);
      if (response.error) {
        toast.error(t("letter_delete_failed"));
        return;
      }
      skipAutoSaveRef.current = true;
      toast.success(t("draft_deleted"));
      await refreshAndClose();
    } catch (error) {
      console.error("Failed to delete future letter draft", error);
      toast.error(t("letter_delete_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const saved = await saveDraft();
      if (!saved) return;
      if (hasFutureLetterContent({ currentSelf, message: messageToFuture })) {
        toast.success(t("draft_saved"));
      }
      skipAutoSaveRef.current = true;
      await refreshAndClose();
    } catch (error) {
      console.error("Failed to save draft", error);
      toast.error(t("letter_save_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryOptions = [
    { value: DeliveryOption.sevenDays, label: t("delivery_7d") },
    { value: DeliveryOption.fourteenDays, label: t("delivery_14d") },
    { value: DeliveryOption.oneMonth, label: t("delivery_1m") },
    { value: DeliveryOption.custom, label: t("delivery_custom") },
  ];

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[88vh] w-[min(560px,92vw)] bg-[#F5FFFD] rounded-[28px] border-0 p-6 sm:p-7 overflow-y-auto">
        <DialogHeader className="items-start pt-0 text-left">
          <DialogTitle className="text-left text-[18px] font-bold text-[#0D3036]">{t("dialog_title")}</DialogTitle>
          <DialogDescription className="text-[13px] text-[#536166]">{t("dialog_description")}</DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-5">
          <div className="rounded-2xl bg-[#F7FBFA] p-4 text-sm text-text-secondary">
            <p className="flex items-center gap-2 font-bold text-text-dark">
              <Feather className="size-4 text-logo-cyan" />
              {t("anti_pressure_title")}
            </p>
            <p className="mt-1">{t("anti_pressure_description")}</p>
            <p className="mt-3 flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-logo-cyan" />
              {t("privacy_promise")}
            </p>
          </div>

          <div>
            <label htmlFor="current-self" className="mb-2 block text-sm font-bold text-text-dark">
              {t("field_current_self")}{" "}
              <span className="font-normal text-text-secondary">{t("optional")}</span>
            </label>
            <Textarea
              id="current-self"
              value={currentSelf}
              onChange={(event) => setCurrentSelf(event.target.value)}
              placeholder={t("field_current_self_placeholder")}
              className="min-h-[80px] resize-y rounded-2xl border-[#C1ECFF] bg-white p-3.5 text-sm leading-[1.8] text-[#295E5C] placeholder:text-[#9FB5B8] focus-visible:border-[#16B9B3] focus-visible:ring-4 focus-visible:ring-[rgba(22,185,179,0.16)] focus-visible:ring-offset-0"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <label htmlFor="message-to-future" className="text-sm font-bold text-text-dark">
                {t("field_message_to_future")}{" "}
                <span className="font-normal text-text-secondary">{t("optional")}</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("field_message_help")}
                    className="size-6 text-text-secondary"
                  >
                    <CircleHelp className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[360px] border-0 bg-[#0D3036] p-4 text-[#E7F4F4] shadow-[0_14px_34px_rgba(15,48,54,0.28)] rounded-2xl"
                  side="top"
                  align="start"
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white">如果不知道從哪裡開始，可以試試</p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-[18px] text-[13px] leading-[1.7] text-[rgba(231,244,244,0.9)]">
                        <li>寫一個你只敢跟自己說的理由——你為什麼在做現在做的事</li>
                        <li>寫一個問題給未來的自己——不是要答案，是想知道他後來過得怎麼樣</li>
                        <li>寫一句你今天想對自己說、但說不出口的話</li>
                      </ul>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-sm font-medium text-[#F9E41E]">不需要做的事</p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-[18px] text-[13px] leading-[1.7] text-[rgba(231,244,244,0.9)]">
                        <li>不用寫得像一封「正式的」信，也不用有頭有尾</li>
                        <li>不用假裝自己很正向、很有動力，或很有把握</li>
                        <li>不用承諾未來的自己會做到什麼</li>
                      </ul>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              id="message-to-future"
              value={messageToFuture}
              onChange={(event) => setMessageToFuture(event.target.value)}
              className="min-h-[80px] resize-y rounded-2xl border-[#C1ECFF] bg-white p-3.5 text-sm leading-[1.8] text-[#295E5C] placeholder:text-[#9FB5B8] focus-visible:border-[#16B9B3] focus-visible:ring-4 focus-visible:ring-[rgba(22,185,179,0.16)] focus-visible:ring-offset-0"
            />
          </div>

          {!hasContent && (
            <p className="text-sm text-text-secondary">{t("validation_one_field")}</p>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-text-dark">{t("field_delivery_time")}</span>
              <span className="text-xs text-text-secondary">
                {t("latest_delivery_date", { date: format(maxDeliveryDate, "yyyy/MM/dd") })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {deliveryOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-pressed={deliveryOption === option.value}
                  onClick={() => setDeliveryOption(option.value)}
                  className={
                    deliveryOption === option.value
                      ? "rounded-full border-logo-cyan bg-logo-cyan px-3 text-white hover:bg-logo-cyan/90 hover:text-white"
                      : "rounded-full border-[#E5E7EB] bg-white px-3 text-text-dark hover:border-logo-cyan"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {deliveryOption === DeliveryOption.custom && (
              <div className="mt-3">
                <DatePicker
                  value={customDeliveryDate}
                  minDate={minDeliveryDate}
                  maxDate={maxDeliveryDate}
                  invalid={Boolean(errors.deliverAt)}
                  placeholder={t("custom_date_placeholder")}
                  onChange={setCustomDeliveryDate}
                />
                {errors.deliverAt && (
                  <p className="mt-1 text-xs text-red">{t("validation_delivery_required")}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="related-practice"
              className="mb-2 block text-sm font-bold text-text-dark"
            >
              {t("field_related_practice")}
            </label>
            <Select value={relatedPractice} onValueChange={setRelatedPractice}>
              <SelectTrigger id="related-practice" disabled={isPracticesLoading}>
                <SelectValue
                  placeholder={isPracticesLoading ? t("practices_loading") : t("practice_none")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PRACTICE}>{t("practice_none")}</SelectItem>
                {eligiblePractices.map((practice) => (
                  <SelectItem key={practice.id} value={practice.id}>
                    {practice.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            {draftId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("action_delete_draft")}
                disabled={isSubmitting}
                onClick={handleDeleteDraft}
                className="shrink-0 text-red hover:text-red"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleSaveDraftClick}
              className="rounded-full border-[#DCE9EB] bg-white px-6 text-[#536166] hover:border-[#16B9B3] hover:text-[#16B9B3]"
            >
              {t("action_save_draft")}
            </Button>
            <Button
              disabled={isSubmitting || hasFutureLetterFormErrors(errors)}
              onClick={handleSend}
              className="flex-1 rounded-full bg-[#F9E41E] font-medium text-[#0D3036] hover:bg-[#F9E41E]/90"
            >
              {isSubmitting ? t("action_sending") : t("action_send")}
            </Button>
          </div>
          <p className="text-center text-xs text-text-secondary">{t("close_auto_save_hint")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
