"use client";

import { useTranslations } from "@daodao/i18n";
import { FormControl, FormField, FormItem } from "@daodao/ui/components/form";
import { cn } from "@daodao/ui/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { PublicInfoFormValues } from "./schema";

interface IPrivacySectionProps {
  form: UseFormReturn<PublicInfoFormValues>;
}

function Toggle({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        checked ? "bg-logo-cyan" : "bg-[#D4E8E6]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export const PrivacySection = ({ form }: IPrivacySectionProps) => {
  const t = useTranslations("public_info_settings");
  return (
    <div className="bg-white rounded-xl overflow-hidden divide-y divide-[#E4EAE9]">
      <FormField
        control={form.control}
        name="hideConnectionsCount"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-dark">{t("hide_connections_count_label")}</p>
                <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
                  {t("hide_connections_count_desc")}
                </p>
              </div>
              <FormControl>
                <Toggle checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
