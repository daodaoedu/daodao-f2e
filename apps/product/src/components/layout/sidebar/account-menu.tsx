"use client";

import { useAuth, useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { cn } from "@daodao/ui/lib/utils";
import {
  Archive,
  Bug,
  ExternalLink,
  HeartHandshake,
  LogOut,
  Map as MapIcon,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { LanguagePillToggle } from "./language-pill-toggle";

interface AccountMenuProps {
  isCollapsed: boolean;
}

export function AccountMenu({ isCollapsed }: AccountMenuProps) {
  const t = useTranslations("app_product");
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase();
  const email = user?.email || "";

  const itemClass =
    "flex items-center gap-2 w-full px-[18px] py-[9px] text-sm text-text-dark hover:bg-[#F0F9F8] transition-colors text-left";

  // 選單必須走 Portal：desktop sidebar 為了收合動畫是 overflow-hidden，
  // 渲染在 sidebar 內的 absolute 浮層會被裁掉右半（daodao#214）
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "mt-auto flex items-center gap-2 w-full px-4 py-2 transition-all duration-200 hover:bg-[#F0F9F8] rounded-lg",
            isCollapsed && "justify-center px-0"
          )}
          aria-label={t("account_menu")}
          aria-haspopup="menu"
        >
          <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-logo-cyan text-white text-[13px] font-semibold">
            {initial}
          </span>
          {!isCollapsed && <span className="text-sm font-medium truncate">{displayName}</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        alignOffset={10}
        role="menu"
        className="w-auto min-w-[196px] p-0 bg-white border-[#E4EAE9] rounded-2xl shadow-[0_14px_34px_rgba(15,48,54,0.16)] overflow-hidden"
      >
        {email && (
          <div className="px-[18px] py-[9px] text-[13px] text-light-gray border-b border-[#EEF3F3] truncate">
            {email}
          </div>
        )}
        <nav className="py-1">
          <CustomLink
            href="/settings"
            className={itemClass}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="size-4 shrink-0 opacity-50" />
            {t("account_settings")}
          </CustomLink>

          <div className={cn(itemClass, "cursor-default")}>
            <LanguagePillToggle />
          </div>

          <CustomLink
            href="/settings/follow-hub"
            className={itemClass}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <HeartHandshake className="size-4 shrink-0 opacity-50" />
            {t("account_follow_hub")}
          </CustomLink>

          <a
            href="https://app.daodao.so/roadmap"
            className={itemClass}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapIcon className="size-4 shrink-0 opacity-50" />
            {t("account_roadmap_suggestion")}
            <ExternalLink className="size-3.5 ml-auto opacity-40" />
          </a>

          <CustomLink
            href="/settings/bug-report"
            className={itemClass}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <Bug className="size-4 shrink-0 opacity-50" />
            {t("account_bug_report")}
          </CustomLink>

          <CustomLink
            href="/settings/archived"
            className={itemClass}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <Archive className="size-4 shrink-0 opacity-50" />
            {t("account_archived")}
          </CustomLink>
        </nav>
        <div className="border-t border-[#EEF3F3]">
          <button type="button" className={itemClass} role="menuitem" onClick={() => logout()}>
            <LogOut className="size-4 shrink-0 opacity-50" />
            {t("account_logout")}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
