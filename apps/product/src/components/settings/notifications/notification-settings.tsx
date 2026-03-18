"use client";

import { useState, useEffect } from "react";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import {
  useNotificationPreferences,
  updateNotificationPreferences,
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
  { type: "reaction", label: "反應", description: "有人對你的內容按了反應" },
  { type: "comment", label: "留言與 @", description: "有人留言或 @ 提及了你" },
  { type: "follow-user", label: "關注", description: "有人關注了你" },
  { type: "connect", label: "連結請求", description: "有人向你發出連結請求" },
  { type: "agree-connect", label: "連結確認", description: "對方同意了你的連結請求" },
  { type: "update-practice-checkin", label: "關注的實踐更新", description: "你關注的實踐有新打卡" },
  { type: "practice-started", label: "關注的人開始實踐", description: "你關注的人開始了新主題實踐" },
  { type: "buddy-request", label: "Buddy 請求", description: "有人邀請你成為實踐夥伴" },
  { type: "weekly", label: "週報", description: "每週一的島嶼探索摘要" },
];

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
  const { data, mutate } = useNotificationPreferences();

  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [prefs, setPrefs] = useState<PreferencesMap>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);

  // Sync from API response
  useEffect(() => {
    if (!data) return;
    setGlobalEnabled(data.globalEnabled);
    const newPrefs: PreferencesMap = { ...DEFAULT_PREFS };
    for (const p of data.preferences) {
      if (p.channel === "N01" && newPrefs[p.notificationType]) {
        newPrefs[p.notificationType] = { emailEnabled: p.isEnabled };
      }
    }
    setPrefs(newPrefs);
  }, [data]);

  const handleGlobalToggle = async (value: boolean) => {
    setGlobalEnabled(value);
    setIsSaving(true);
    try {
      await updateNotificationPreferences({ globalEnabled: value });
      mutate();
      toast.success(value ? "已開啟通知" : "已關閉通知");
    } catch {
      setGlobalEnabled(!value);
      toast.error("儲存失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeToggle = async (notificationType: string, emailEnabled: boolean) => {
    const prev = prefs[notificationType];
    setPrefs((p) => ({ ...p, [notificationType]: { emailEnabled } }));
    setIsSaving(true);
    try {
      await updateNotificationPreferences({
        preferences: [{ notificationType, channel: "N01", isEnabled: emailEnabled }],
      });
      mutate();
    } catch {
      setPrefs((p) => ({ ...p, [notificationType]: prev ?? { emailEnabled: true } }));
      toast.error("儲存失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 全局開關 */}
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-dark">通知總開關</p>
            <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
              關閉後將停止所有 Email 通知，通知中心仍繼續累積
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
        <h2 className="text-xs font-medium text-[#9FB5B8] px-1">Email 通知設定</h2>
        <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#E4EAE9]">
          {NOTIFICATION_TYPES.map((item) => {
            const isEnabled = prefs[item.type]?.emailEnabled ?? true;
            return (
              <div key={item.type} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-dark">{item.label}</p>
                  <p className="text-xs text-[#9FB5B8] mt-0.5 leading-relaxed">
                    {item.description}
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
        In-App 通知中心（島嶼上的通知鈴）永遠開啟，只有 Email 可以關閉
      </p>
    </div>
  );
};
