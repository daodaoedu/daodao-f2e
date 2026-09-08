"use client";

import { useAuth, useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { LanguagePillToggle } from "./language-pill-toggle";

interface AccountMenuProps {
  isCollapsed: boolean;
}

export function AccountMenu({ isCollapsed }: AccountMenuProps) {
  const t = useTranslations("app_product");
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase();
  const email = user?.email || "";

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const itemClass =
    "flex items-center gap-2 w-full px-[18px] py-[9px] text-sm text-text-dark hover:bg-[#F0F9F8] transition-colors text-left";

  return (
    <div ref={menuRef} className="relative mt-auto">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-2 transition-all duration-200 hover:bg-[#F0F9F8] rounded-lg",
          isCollapsed && "justify-center px-0"
        )}
        aria-label={t("account_menu")}
        aria-expanded={isOpen}
      >
        <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-logo-cyan text-white text-[13px] font-semibold">
          {initial}
        </span>
        {!isCollapsed && <span className="text-sm font-medium truncate">{displayName}</span>}
      </button>

      {isOpen && (
        <div
          className="absolute bottom-[calc(100%+8px)] left-[10px] min-w-[196px] bg-white border border-[#E4EAE9] rounded-2xl shadow-[0_14px_34px_rgba(15,48,54,0.16)] overflow-hidden animate-[dd-menu-in_140ms_ease-out]"
          role="menu"
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
        </div>
      )}
    </div>
  );
}
