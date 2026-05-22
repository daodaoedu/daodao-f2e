"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { Globe, Lock, Timer } from "lucide-react";

export type PrivacyStatus = "private" | "public" | "delayed";

const PRIVACY_OPTION_ICONS: {
  value: PrivacyStatus;
  icon: typeof Lock;
}[] = [
  {
    value: "private",
    icon: Lock,
  },
  {
    value: "public",
    icon: Globe,
  },
  {
    value: "delayed",
    icon: Timer,
  },
];

interface PrivacyStatusSelectorProps {
  value: PrivacyStatus;
  onChange: (value: PrivacyStatus) => void;
  className?: string;
}

export function PrivacyStatusSelector({ value, onChange, className }: PrivacyStatusSelectorProps) {
  const t = useTranslations("app_product");
  const privacyText = {
    private: {
      label: t("practice_visibility_private"),
      description: t("practice_visibility_private_desc"),
    },
    public: {
      label: t("practice_visibility_public"),
      description: t("practice_visibility_public_desc"),
    },
    delayed: {
      label: t("practice_visibility_delayed"),
      description: t("practice_visibility_delayed_desc"),
    },
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-text-dark mb-3">
        {t("practice_visibility_question")}
      </p>
      <div className="flex flex-col gap-2">
        {PRIVACY_OPTION_ICONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          const text = privacyText[option.value];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-logo-cyan bg-[#F5FFFD]"
                  : "border-[#E0ECF0] bg-white hover:border-logo-cyan/50"
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0",
                  isSelected ? "bg-logo-cyan text-white" : "bg-[#F0F8FA] text-text-dark/60"
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-logo-cyan" : "text-text-dark"
                  )}
                >
                  {text.label}
                </p>
                <p className="text-xs text-text-dark/50">{text.description}</p>
              </div>
              {isSelected && (
                <div className="size-4 rounded-full bg-logo-cyan flex items-center justify-center shrink-0">
                  <div className="size-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
