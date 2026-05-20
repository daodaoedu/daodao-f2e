"use client";

import { useSettingsCompletion } from "@daodao/api";
import { ArrowRightOutlineSvg, TelescopeSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  AlertCircle,
  Archive,
  Bell,
  BadgeCheck,
  HeartHandshake,
  LibraryBig,
  LogOut,
  MessagesSquare,
  Settings,
  SquareUser,
} from "lucide-react";
import { useOnboardingProgress } from "@/components/task-guide/onboarding-progress-context";
import { useLogoutDialog } from "@/hooks/use-logout-dialog";

type SettingsItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  completionKey?: "preferences" | "account" | "publicInfo";
};

function SettingsItemLink({ item, isIncomplete }: { item: SettingsItem; isIncomplete?: boolean }) {
  const Icon = item.icon;
  return (
    <CustomLink
      href={item.href}
      className="flex items-center gap-2 py-4 px-3 hover:bg-light-blue transition-colors"
      aria-label={item.label}
    >
      <Icon className="size-4.5 text-light-gray shrink-0" />
      <span className="flex-1 text-base text-text-dark">{item.label}</span>
      {isIncomplete && <AlertCircle className="size-4 text-orange shrink-0" />}
      <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
    </CustomLink>
  );
}

export const SettingsList = () => {
  const t = useTranslations("account_settings");
  const { openLogoutDialog, isLoggingOut } = useLogoutDialog();
  const { data } = useSettingsCompletion();
  const { taskList, completedTasks, badgeGranted } = useOnboardingProgress();
  const hasEarlyUserBadge =
    badgeGranted || (taskList.length > 0 && completedTasks >= taskList.length);

  const socialItems: SettingsItem[] = [
    {
      id: "interaction",
      label: t("settings_interaction"),
      icon: MessagesSquare,
      href: "/settings/interaction",
    },
    {
      id: "following",
      label: t("settings_following"),
      icon: TelescopeSvg,
      href: "/settings/following",
    },
    {
      id: "connections",
      label: t("settings_connections"),
      icon: HeartHandshake,
      href: "/settings/connections",
    },
  ];

  const settingsItems: SettingsItem[] = [
    {
      id: "preferences",
      label: t("settings_preferences"),
      icon: LibraryBig,
      href: "/settings/preferences",
      completionKey: "preferences",
    },
    {
      id: "account",
      label: t("settings_account"),
      icon: Settings,
      href: "/settings/account",
      completionKey: "account",
    },
    {
      id: "public-info",
      label: t("settings_public_info"),
      icon: SquareUser,
      href: "/settings/public-info",
      completionKey: "publicInfo",
    },
    {
      id: "notifications",
      label: t("settings_notifications"),
      icon: Bell,
      href: "/settings/notifications",
    },
    {
      id: "archived",
      label: t("settings_archived"),
      icon: Archive,
      href: "/settings/archived",
    },
  ];

  const handleLogout = async () => {
    await openLogoutDialog();
  };

  return (
    <div className="flex flex-col gap-4">
      {data && data.completed < data.total && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-orange/10 border border-orange/20">
          <span className="text-sm text-orange">{t("settings_completion_prompt")}</span>
        </div>
      )}
      {data && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-white">
          <span className="text-sm text-text-gray">{t("profile_completeness")}</span>
          <span className="ml-auto text-sm font-medium text-text-dark">
            {data.completed}/{data.total}
          </span>
        </div>
      )}
      {hasEarlyUserBadge && (
        <div className="flex items-center gap-3 rounded-lg border border-logo-orange/25 bg-white px-3 py-3 shadow-sm">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-logo-orange/15 text-logo-orange">
            <BadgeCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-dark">Early User Badge</p>
            <p className="text-xs leading-4 text-text-gray">{t("early_user_badge_desc")}</p>
          </div>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {[...socialItems, ...settingsItems].map((item) => {
          const isIncomplete =
            item.completionKey !== undefined &&
            data?.sections !== undefined &&
            data.sections[item.completionKey] === false;

          return (
            <li key={item.id}>
              <div className="rounded bg-white overflow-hidden">
                <SettingsItemLink item={item} isIncomplete={isIncomplete} />
              </div>
            </li>
          );
        })}
      </ul>

      {/* 登出按鈕 */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 p-3 rounded bg-white hover:bg-red/10 transition-colors text-red disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("logout")}
      >
        <LogOut className="size-4.5 shrink-0" />
        <span className="flex-1 text-base text-left">{isLoggingOut ? t("logout_loading") : t("logout")}</span>
      </button>
    </div>
  );
};
