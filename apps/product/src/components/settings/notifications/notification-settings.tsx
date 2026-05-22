"use client";

import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useState } from "react";
import {
  updateNotificationPreferences,
  useNotificationPreferences,
} from "@/hooks/use-notifications";

// ============================================================================
// Types
// ============================================================================

interface PreferenceState {
  emailEnabled: boolean;
}

type PreferencesMap = Record<string, PreferenceState>;

// ============================================================================
// Constants
// ============================================================================

const NOTIFICATION_TYPES = [
  { type: "reaction", labelKey: "notif_type_reaction", descriptionKey: "notif_type_reaction_desc" },
  { type: "comment", labelKey: "notif_type_comment", descriptionKey: "notif_type_comment_desc" },
  { type: "UserFollowed", labelKey: "notif_type_follow", descriptionKey: "notif_type_follow_desc" },
  { type: "Connect", labelKey: "notif_type_connect", descriptionKey: "notif_type_connect_desc" },
  {
    type: "ConnectAccepted",
    labelKey: "notif_type_connect_accepted",
    descriptionKey: "notif_type_connect_accepted_desc",
  },
  {
    type: "update-practice-checkin",
    labelKey: "notif_type_practice_checkin",
    descriptionKey: "notif_type_practice_checkin_desc",
  },
  {
    type: "PracticeCreated",
    labelKey: "notif_type_practice_created",
    descriptionKey: "notif_type_practice_created_desc",
  },
  {
    type: "BuddyRequest",
    labelKey: "notif_type_buddy_request",
    descriptionKey: "notif_type_buddy_request_desc",
  },
  {
    type: "WeeklyDigest",
    labelKey: "notif_type_weekly_digest",
    descriptionKey: "notif_type_weekly_digest_desc",
  },
] as const;

const DEFAULT_PREFS: PreferencesMap = Object.fromEntries(
  NOTIFICATION_TYPES.map((t) => [t.type, { emailEnabled: true }])
);

// ============================================================================
// Toggle Component
// ============================================================================

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
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-logo-cyan" : "bg-[#D4E8E6]",
        disabled && "opacity-40 cursor-not-allowed"
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

// ============================================================================
// Main Component
// ============================================================================

export const NotificationSettings = () => {
  const t = useTranslations("account_settings");
  const { data, mutate } = useNotificationPreferences();

  const [globalEnabled, setGlobalEnabled] = useState<boolean | undefined>(undefined);
  const [prefs, setPrefs] = useState<PreferencesMap | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Sync from API response — only runs once data arrives
  useEffect(() => {
    if (!data) return;
    const n01Prefs = (data.data ?? []).filter((p) => p.channel === "N01");
    setGlobalEnabled(n01Prefs.length === 0 || n01Prefs.some((p) => p.isEnabled));
    const newPrefs: PreferencesMap = { ...DEFAULT_PREFS };
    for (const p of data.data ?? []) {
      if (p.channel === "N01" && newPrefs[p.type]) {
        newPrefs[p.type] = { emailEnabled: p.isEnabled };
      }
    }
    setPrefs(newPrefs);
  }, [data]);

  const handleGlobalToggle = async (value: boolean) => {
    setGlobalEnabled(value);
    setIsSaving(true);
    try {
      await updateNotificationPreferences({ globalEnabled: value });
      toast.success(value ? t("notif_enabled") : t("notif_disabled"));
    } catch {
      setGlobalEnabled(!value);
      toast.error(t("save_error"));
    } finally {
      setIsSaving(false);
      mutate();
    }
  };

  const handleTypeToggle = async (notificationType: string, emailEnabled: boolean) => {
    const prev = prefs?.[notificationType];
    setPrefs((p) => ({ ...(p ?? DEFAULT_PREFS), [notificationType]: { emailEnabled } }));
    setIsSaving(true);
    try {
      await updateNotificationPreferences({
        preferences: [{ type: notificationType, channel: "N01", isEnabled: emailEnabled }],
      });
    } catch {
      setPrefs((p) => ({
        ...(p ?? DEFAULT_PREFS),
        [notificationType]: prev ?? { emailEnabled: true },
      }));
      toast.error(t("save_error"));
    } finally {
      setIsSaving(false);
      mutate();
    }
  };

  // 資料尚未載入時顯示 skeleton
  if (globalEnabled === undefined || prefs === undefined) {
    return (
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-24 bg-[#E4EAE9] rounded" />
              <div className="h-3 w-48 bg-[#E4EAE9] rounded" />
            </div>
            <div className="h-6 w-11 bg-[#E4EAE9] rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-[#E4EAE9] rounded mx-1" />
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
            {NOTIFICATION_TYPES.map((item) => (
              <div key={item.type} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-20 bg-[#E4EAE9] rounded" />
                  <div className="h-3 w-36 bg-[#E4EAE9] rounded" />
                </div>
                <div className="h-6 w-11 bg-[#E4EAE9] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 全局開關 */}
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-dark">{t("notif_global_title")}</p>
            <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
              {t("notif_global_desc")}
            </p>
          </div>
          <Toggle
            checked={globalEnabled}
            onCheckedChange={handleGlobalToggle}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* 分項設定 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">{t("notif_email_section")}</h2>
        <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
          {NOTIFICATION_TYPES.map((item) => {
            const isEnabled = prefs[item.type]?.emailEnabled ?? true;
            return (
              <div key={item.type} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-dark">{t(item.labelKey)}</p>
                  <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
                    {t(item.descriptionKey)}
                  </p>
                </div>
                <Toggle
                  checked={isEnabled && globalEnabled}
                  onCheckedChange={(v) => handleTypeToggle(item.type, v)}
                  disabled={!globalEnabled || isSaving}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[#9FB5B8] text-center px-4 leading-relaxed">
        {t("notif_inapp_note")}
      </p>
    </div>
  );
};
