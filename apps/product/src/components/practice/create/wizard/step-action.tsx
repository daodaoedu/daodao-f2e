"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { Input } from "@daodao/ui/components/input";
import { Label } from "@daodao/ui/components/label";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { useId, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { deriveNameFromAction } from "@/lib/practice-create";
import { ACTION_MAX_LENGTH, NAME_MAX_LENGTH, type WizardFormValues } from "./schema";
import { WIZARD_INPUT, WIZARD_TEXT_LINK, WIZARD_TINT_BG } from "./wizard-styles";

export interface StepActionProps {
  form: UseFormReturn<WizardFormValues>;
}

/** Step 1｜實踐行動與命名 */
export const StepAction = ({ form }: StepActionProps) => {
  const t = useTranslations("practice");
  const nameInputId = useId();

  const action = form.watch("action") ?? "";
  const manualName = form.watch("name") ?? "";
  const derivedName = deriveNameFromAction(action);
  /** 靜態狀態顯示值：手動覆寫 > 推導值（皆空 → 淺色提示） */
  const displayName = manualName.trim() || derivedName;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    setDraft(displayName);
    setIsEditing(true);
  };

  /** 離開編輯：非空且異於推導值才存為手動覆寫，否則清空以恢復自動推導 */
  const finishEditing = () => {
    const trimmed = draft.trim();
    const nextName = trimmed !== "" && trimmed !== derivedName ? trimmed : "";
    form.setValue("name", nextName, { shouldDirty: true });
    setIsEditing(false);
  };

  const cancelEditing = () => setIsEditing(false);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="action"
        render={({ field }) => (
          <FormItem>
            <div className="mb-3 flex items-center justify-between">
              <FormLabel required className="text-base font-medium text-text-dark">
                {t("wizard_action_label")}
              </FormLabel>
              <FormDescription className="text-sm text-light-gray">
                {t("wizard_action_count", {
                  count: field.value?.length ?? 0,
                  max: ACTION_MAX_LENGTH,
                })}
              </FormDescription>
            </div>
            <FormControl>
              <Textarea
                {...field}
                rows={3}
                placeholder={t("wizard_action_placeholder")}
                className={cn(
                  "min-h-24 w-full resize-y px-4 py-3 leading-[1.4] focus-visible:px-4 focus-visible:py-3",
                  WIZARD_INPUT
                )}
                maxLength={ACTION_MAX_LENGTH}
                invalid={!!form.formState.errors.action}
                onChange={(event) => {
                  field.onChange(event);
                  if (form.formState.errors.action) form.clearErrors("action");
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 實踐名稱框（POC：淡青底、1px 框、radius 8、padding 12/14） */}
      <div className={cn("rounded-[8px] border border-bg-gray px-3.5 py-3", WIZARD_TINT_BG)}>
        {isEditing ? (
          <>
            <Label
              htmlFor={nameInputId}
              className="mb-2 block text-xs font-normal leading-[1.4] text-light-gray"
            >
              {t("wizard_name_label")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={nameInputId}
                autoFocus
                value={draft}
                maxLength={NAME_MAX_LENGTH}
                placeholder={t("wizard_name_placeholder")}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    finishEditing();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    cancelEditing();
                  }
                }}
                className={cn(
                  "h-9 min-w-0 flex-1 border-logo-cyan px-3 py-1.5 focus-visible:px-3 focus-visible:py-1.5",
                  WIZARD_INPUT
                )}
              />
              <Button
                type="button"
                onClick={finishEditing}
                className="h-9 shrink-0 px-4 text-[13px]"
              >
                {t("wizard_name_done")}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="shrink-0 text-xs text-light-gray">{t("wizard_name_label")}</span>
            {displayName ? (
              <p className="min-w-0 flex-1 truncate text-sm leading-normal text-text-dark">
                {displayName}
              </p>
            ) : (
              <p className="min-w-0 flex-1 truncate text-sm leading-normal text-light-gray">
                {t("wizard_name_auto_hint")}
              </p>
            )}
            <button
              type="button"
              className={cn(WIZARD_TEXT_LINK, "-my-2.5 shrink-0 cursor-pointer")}
              onClick={startEditing}
            >
              {t("wizard_name_edit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
