"use client";

import { useAuth, useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const menuItemClass =
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
          className="absolute bottom-[calc(100%+8px)] left-[10px] min-w-[196px] bg-white border border-[#E4EAE9] rounded-2xl shadow-[0_14px_34px_rgba(15,48,54,0.16)] overflow-hidden"
          role="menu"
        >
          {email && (
            <div className="px-[18px] py-[9px] text-[13px] text-light-gray border-b border-[#EEF3F3] truncate">
              {email}
            </div>
          )}
          <nav>
            <a href="/settings" className={menuItemClass} role="menuitem">
              {t("account_settings")}
            </a>
            <button type="button" className={menuItemClass} role="menuitem" disabled>
              {t("account_language")}
            </button>
            <button type="button" className={menuItemClass} role="menuitem" disabled>
              {t("account_feedback")}
            </button>
            <a
              href="/roadmap"
              className={menuItemClass}
              role="menuitem"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("account_roadmap")}
              <svg
                className="size-3.5 ml-auto opacity-40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button type="button" className={menuItemClass} role="menuitem" disabled>
              {t("account_bug_report")}
            </button>
          </nav>
          <div className="border-t border-[#EEF3F3]">
            <button
              type="button"
              className={menuItemClass}
              role="menuitem"
              onClick={() => logout()}
            >
              {t("account_logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
