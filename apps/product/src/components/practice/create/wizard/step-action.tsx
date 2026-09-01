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
import { useId, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { deriveNameFromAction } from "@/lib/practice-create";
import { ACTION_MAX_LENGTH, NAME_MAX_LENGTH, type WizardFormValues } from "./schema";

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
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="action"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-3">
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
                className="w-full min-h-24 resize-y"
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

      <div className="space-y-2">
        {isEditing ? (
          <>
            <Label htmlFor={nameInputId} className="text-base font-medium text-text-dark">
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
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={finishEditing}>
                {t("wizard_name_done")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-base font-medium text-text-dark">{t("wizard_name_label")}</p>
            <div className="flex items-center justify-between gap-3 min-h-10">
              {displayName ? (
                <p className="text-base text-text-dark break-all">{displayName}</p>
              ) : (
                <p className="text-base text-light-gray">{t("wizard_name_auto_hint")}</p>
              )}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-10 shrink-0 px-2 text-logo-cyan"
                onClick={startEditing}
              >
                {t("wizard_name_edit")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
