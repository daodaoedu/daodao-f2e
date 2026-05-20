"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { Globe, Lock, Timer } from "lucide-react";

export type PrivacyStatus = "private" | "public" | "delayed";

interface PrivacyStatusSelectorProps {
  value: PrivacyStatus;
  onChange: (value: PrivacyStatus) => void;
  className?: string;
}

export function PrivacyStatusSelector({ value, onChange, className }: PrivacyStatusSelectorProps) {
  const t = useTranslations("practice");

  const PRIVACY_OPTIONS: {
    value: PrivacyStatus;
    label: string;
    description: string;
    icon: typeof Lock;
  }[] = [
    {
      value: "private",
      label: t("privacy_private_label"),
      description: t("privacy_private_desc"),
      icon: Lock,
    },
    {
      value: "public",
      label: t("privacy_public_label"),
      description: t("privacy_public_desc"),
      icon: Globe,
    },
    {
      value: "delayed",
      label: t("privacy_delayed_label"),
      description: t("privacy_delayed_desc"),
      icon: Timer,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-text-dark mb-3">{t("privacy_who_can_see")}</p>
      <div className="flex flex-col gap-2">
        {PRIVACY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
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
                  {option.label}
                </p>
                <p className="text-xs text-text-dark/50">{option.description}</p>
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
