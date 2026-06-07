"use client";

import { useSettingsCompletion } from "@daodao/api";
import { ArrowRightOutlineSvg, TelescopeSvg } from "@daodao/assets";
import { useLocale, useTranslations } from "@daodao/i18n";
import { usePathname, useSearchParams } from "@daodao/i18n/navigation";
import { languageOptions } from "@daodao/i18n/routing";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  AlertCircle,
  Archive,
  BadgeCheck,
  Bell,
  Globe,
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
  labelKey: Parameters<ReturnType<typeof useTranslations<"app_product">>>[0];
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  completionKey?: "preferences" | "account" | "publicInfo";
};

const socialItems: SettingsItem[] = [
  {
    id: "interaction",
    labelKey: "settings_interaction",
    icon: MessagesSquare,
    href: "/settings/interaction",
  },
  {
    id: "following",
    labelKey: "settings_following",
    icon: TelescopeSvg,
    href: "/settings/following",
  },
  {
    id: "connections",
    labelKey: "settings_connections",
    icon: HeartHandshake,
    href: "/settings/connections",
  },
];

const settingsItems: SettingsItem[] = [
  {
    id: "preferences",
    labelKey: "settings_preferences",
    icon: LibraryBig,
    href: "/settings/preferences",
    completionKey: "preferences",
  },
  {
    id: "account",
    labelKey: "settings_account",
    icon: Settings,
    href: "/settings/account",
    completionKey: "account",
  },
  {
    id: "public-info",
    labelKey: "settings_public_info",
    icon: SquareUser,
    href: "/settings/public-info",
    completionKey: "publicInfo",
  },
  {
    id: "notifications",
    labelKey: "settings_notifications",
    icon: Bell,
    href: "/settings/notifications",
  },
  {
    id: "archived",
    labelKey: "settings_archived",
    icon: Archive,
    href: "/settings/archived",
  },
];

function SettingsItemLink({ item, isIncomplete }: { item: SettingsItem; isIncomplete?: boolean }) {
  const t = useTranslations("app_product");
  const Icon = item.icon;
  const label = t(item.labelKey);
  return (
    <CustomLink
      href={item.href}
      className="flex items-center gap-2 py-4 px-3 hover:bg-light-blue transition-colors"
      aria-label={label}
    >
      <Icon className="size-4.5 text-light-gray shrink-0" />
      <span className="flex-1 text-base text-text-dark">{label}</span>
      {isIncomplete && <AlertCircle className="size-4 text-orange shrink-0" />}
      <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
    </CustomLink>
  );
}

function LanguageSwitchRow() {
  const t = useTranslations("app_product");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextLocale = languageOptions.find((l) => l.value !== locale);

  if (!nextLocale) return null;

  return (
    <div className="rounded bg-white overflow-hidden">
      <CustomLink
        locale={nextLocale.value}
        href={{ pathname, query: searchParams?.toString() }}
        scroll={false}
        className="flex items-center gap-2 py-4 px-3 hover:bg-light-blue transition-colors"
        aria-label={t("settings_language")}
      >
        <Globe className="size-4.5 text-light-gray shrink-0" />
        <span className="flex-1 text-base text-text-dark">{t("settings_language")}</span>
        <span className="text-sm text-text-dark/50">{nextLocale.label}</span>
        <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
      </CustomLink>
    </div>
  );
}

export const SettingsList = () => {
  const t = useTranslations("app_product");
  const { openLogoutDialog, isLoggingOut } = useLogoutDialog();
  const { data } = useSettingsCompletion();
  const { taskList, completedTasks, badgeGranted } = useOnboardingProgress();
  const hasEarlyUserBadge =
    badgeGranted || (taskList.length > 0 && completedTasks >= taskList.length);

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
          <span className="text-sm text-text-gray">{t("settings_completion_label")}</span>
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
            <p className="text-xs leading-4 text-text-gray">
              {t("settings_early_user_badge_done")}
            </p>
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

      {/* 語系切換 */}
      <LanguageSwitchRow />

      {/* 登出按鈕 */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 p-3 rounded bg-white hover:bg-red/10 transition-colors text-red disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("settings_logout")}
      >
        <LogOut className="size-4.5 shrink-0" />
        <span className="flex-1 text-base text-left">
          {isLoggingOut ? t("settings_logging_out") : t("settings_logout")}
        </span>
      </button>
    </div>
  );
};
