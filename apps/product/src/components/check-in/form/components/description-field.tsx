"use client";

import { useLocale, useTranslations } from "@daodao/i18n";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Textarea, type TextareaProps } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { forwardRef, useCallback, useLayoutEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT,
  CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT,
  CHECK_IN_NEXT_STEP_WORD_LIMIT,
  countCheckInWords,
} from "../description-answers";
import type { CheckInFormValuesType } from "../schema";

interface IDescriptionFieldProps {
  form: UseFormReturn<CheckInFormValuesType>;
  isEditing?: boolean;
}

const AutoExpandingTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function AutoHeightTextarea(
    { value, onInput, onMouseUp, onTouchEnd, className, ...props },
    forwardedRef
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const userHeight = useRef(0);
    const resize = useCallback(() => {
      const textarea = innerRef.current;
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, userHeight.current, 48), 256)}px`;
    }, []);
    const rememberUserHeight = useCallback(() => {
      if (innerRef.current) userHeight.current = innerRef.current.clientHeight;
    }, []);
    const setRef = useCallback(
      (textarea: HTMLTextAreaElement | null) => {
        innerRef.current = textarea;
        if (typeof forwardedRef === "function") forwardedRef(textarea);
        else if (forwardedRef) forwardedRef.current = textarea;
      },
      [forwardedRef]
    );

    useLayoutEffect(resize, [resize, value]);

    return (
      <Textarea
        {...props}
        ref={setRef}
        value={value}
        rows={1}
        onInput={(event) => {
          onInput?.(event);
          resize();
        }}
        onMouseUp={(event) => {
          onMouseUp?.(event);
          rememberUserHeight();
        }}
        onTouchEnd={(event) => {
          onTouchEnd?.(event);
          rememberUserHeight();
        }}
        className={cn("min-h-12 max-h-64 resize-y overflow-y-auto", className)}
      />
    );
  }
);

/**
 * 打卡行動紀錄與可選的下一步欄位
 */
export const DescriptionField = ({ form, isEditing = false }: IDescriptionFieldProps) => {
  const t = useTranslations("check_in");
  const locale = useLocale();
  const actionObservation = form.watch("actionObservation") ?? "";
  const nextStep = form.watch("nextStep") ?? "";
  const actionObservationWordCount = countCheckInWords(actionObservation, locale);
  const nextStepWordCount = countCheckInWords(nextStep, locale);

  return (
    <div className="mt-4 space-y-4">
      <FormField
        control={form.control}
        name="actionObservation"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <FormLabel required={!isEditing} className="text-base font-medium text-text-dark">
                {t("description_label")}
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">
                {locale === "en" && !isEditing
                  ? t("description_word_count", {
                      count: actionObservationWordCount,
                      max: CHECK_IN_ACTION_OBSERVATION_WORD_LIMIT,
                    })
                  : `${actionObservation.length}/${CHECK_IN_ACTION_OBSERVATION_CHARACTER_LIMIT}`}
              </FormDescription>
            </div>
            <FormControl>
              <AutoExpandingTextarea
                {...field}
                value={field.value ?? ""}
                aria-label={t("description_label")}
                placeholder={t("description_placeholder")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(actionObservation.trim() || nextStep.trim()) && (
        <FormField
          control={form.control}
          name="nextStep"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <FormLabel className="text-sm font-medium text-logo-gray">
                  {t("description_follow_up_next_step")}
                </FormLabel>
                <span className="text-xs text-light-gray">
                  {t("description_word_count", {
                    count: nextStepWordCount,
                    max: CHECK_IN_NEXT_STEP_WORD_LIMIT,
                  })}
                </span>
              </div>
              <FormControl>
                <AutoExpandingTextarea
                  {...field}
                  value={field.value ?? ""}
                  aria-label={t("description_follow_up_next_step")}
                  placeholder={t("description_next_step_placeholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
