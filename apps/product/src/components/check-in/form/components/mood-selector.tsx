import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@daodao/ui/components/form";
import { useTranslations } from "@daodao/i18n";
import { RadioGroup, RadioGroupItem } from "@daodao/ui/components/radio-group";
import { cn } from "@daodao/ui/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import { MOOD_OPTIONS } from "@/constants/mood";
import type { CheckInFormValuesType } from "../schema";

interface IMoodSelectorProps {
  form: UseFormReturn<CheckInFormValuesType>;
}

/**
 * 心情選擇器組件
 */
export const MoodSelector = ({ form }: IMoodSelectorProps) => {
  const t = useTranslations("check_in");

  return (
    <FormField
      control={form.control}
      name="mood"
      render={({ field }) => (
        <FormItem className="mb-8">
          <FormLabel className="block text-base font-medium mb-3 text-text-dark">
            {t("mood_question")}
          </FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              className="flex justify-between"
            >
              {MOOD_OPTIONS.map(({ id, label, emoji: Emoji }) => {
                const translatedLabel = t(`moods.${id}`);
                const isSelected = field.value === id;
                const inputId = `mood-${id}`;
                return (
                  <label
                    key={id}
                    htmlFor={inputId}
                    className={cn(
                      "flex flex-col items-center gap-1 opacity-30 transition-opacity cursor-pointer",
                      isSelected && "opacity-100"
                    )}
                  >
                    <RadioGroupItem
                      value={id}
                      id={inputId}
                      className="sr-only"
                      aria-label={translatedLabel}
                    />
                    <Emoji className="size-12" />
                    <span className="text-xs text-gray-700">{translatedLabel || label}</span>
                  </label>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
