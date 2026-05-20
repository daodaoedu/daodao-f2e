"use client";

import { useCurrentUser, useUserMutations } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";

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

export const InteractionSettings = () => {
  const t = useTranslations("interaction_settings");
  const { data: userData, isLoading } = useCurrentUser();
  const { updateCurrentUserWithFormData } = useUserMutations();

  const serverIsOpenProfile = userData?.data?.isOpenProfile ?? true;
  const [localIsOpenProfile, setLocalIsOpenProfile] = useState<boolean | null>(null);
  const isOpenProfile = localIsOpenProfile ?? serverIsOpenProfile;

  const handleToggle = async (value: boolean) => {
    setLocalIsOpenProfile(value);
    try {
      await updateCurrentUserWithFormData({ isOpenProfile: value });
      toast.success(value ? t("set_public_success") : t("set_private_success"));
    } catch {
      setLocalIsOpenProfile(null);
      toast.error(t("update_failed"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-dark">{t("open_profile_label")}</p>
            <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
              {t("open_profile_desc")}
            </p>
          </div>
          <Toggle checked={isOpenProfile} onCheckedChange={handleToggle} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};
