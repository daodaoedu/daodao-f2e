"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Archive, LibraryBig, Settings, SquareUser } from "lucide-react";

type SettingsItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

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

export const SettingsList = () => {
  return (
    <ul className="flex flex-col gap-2">
      {settingsItems.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <CustomLink
              href={item.href}
              className="flex items-center gap-2 p-3 rounded bg-white hover:bg-light-blue transition-colors"
              aria-label={item.label}
            >
              <Icon className="size-4.5 text-light-gray shrink-0" />
              <span className="flex-1 text-base text-text-dark">{item.label}</span>
              <ArrowRightOutlineSvg className="size-4.5 text-bg-dark shrink-0" />
            </CustomLink>
          </li>
        );
      })}
    </ul>
  );
};
