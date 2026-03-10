"use client";

import { ArrowRightOutlineSvg, TelescopeSvg } from "@daodao/assets";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Archive, HeartHandshake, LibraryBig, LogOut, MessagesSquare, Settings, SquareUser } from "lucide-react";
import { useLogoutDialog } from "@/hooks/use-logout-dialog";

type SettingsItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

const socialItems: SettingsItem[] = [
  {
    id: "interaction",
    label: "互動設定",
    icon: MessagesSquare,
    href: "/settings/interaction",
  },
  {
    id: "following",
    label: "關注設定",
    icon: TelescopeSvg,
    href: "/settings/following",
  },
  {
    id: "connections",
    label: "連結的夥伴",
    icon: HeartHandshake,
    href: "/settings/connections",
  },
];

const settingsItems: SettingsItem[] = [
  {
    id: "preferences",
    label: "領域偏好設定",
    icon: LibraryBig,
    href: "/settings/preferences",
  },
  {
    id: "account",
    label: "帳號設定",
    icon: Settings,
    href: "/settings/account",
  },
  {
    id: "public-info",
    label: "公開資訊設定",
    icon: SquareUser,
    href: "/settings/public-info",
  },
  {
    id: "archived",
    label: "已封存的內容",
    icon: Archive,
    href: "/settings/archived",
  },
];

function SettingsItemLink({ item }: { item: SettingsItem }) {
  const Icon = item.icon;
  return (
    <CustomLink
      href={item.href}
      className="flex items-center gap-2 py-4 px-3 hover:bg-light-blue transition-colors"
      aria-label={item.label}
    >
      <Icon className="size-4.5 text-light-gray shrink-0" />
      <span className="flex-1 text-base text-text-dark">{item.label}</span>
      <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
    </CustomLink>
  );
}

export const SettingsList = () => {
  const { openLogoutDialog, isLoggingOut } = useLogoutDialog();

  const handleLogout = async () => {
    await openLogoutDialog();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 所有設定項目 — 統一間距 */}
      <ul className="flex flex-col gap-2">
        {[...socialItems, ...settingsItems].map((item) => (
          <li key={item.id}>
            <div className="rounded bg-white overflow-hidden">
              <SettingsItemLink item={item} />
            </div>
          </li>
        ))}
      </ul>

      {/* 登出按鈕 */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 p-3 rounded bg-white hover:bg-red/10 transition-colors text-red disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="登出"
      >
        <LogOut className="size-4.5 shrink-0" />
        <span className="flex-1 text-base text-left">{isLoggingOut ? "登出中..." : "登出"}</span>
      </button>
    </div>
  );
};
