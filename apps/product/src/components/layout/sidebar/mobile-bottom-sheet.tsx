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
import { useCallback, useEffect, useRef } from "react";
import { LanguagePillToggle } from "./language-pill-toggle";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileBottomSheet({ isOpen, onClose }: MobileBottomSheetProps) {
  const t = useTranslations("app_product");
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const startY = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) startY.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touch && touch.clientY - startY.current > 80) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  const email = user?.email || "";

  const itemClass =
    "flex items-center gap-3 w-full px-5 py-3 text-[15px] text-text-dark hover:bg-[#F0F9F8] transition-colors text-left";

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label={t("account_menu")}
    >
      <div
        className="absolute inset-0 bg-[rgba(15,48,54,0.35)]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-[dd-sheet-in_220ms_ease-out] pb-[env(safe-area-inset-bottom)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center py-3">
          <div className="w-9 h-1 rounded-full bg-[#D9E1E0]" />
        </div>

        {email && <div className="px-5 pb-2 text-[13px] text-light-gray truncate">{email}</div>}

        <nav>
          <CustomLink href="/settings" className={itemClass} onClick={onClose}>
            <Settings className="size-[18px] shrink-0 opacity-50" />
            {t("account_settings")}
          </CustomLink>

          <div className={cn(itemClass, "cursor-default")}>
            <LanguagePillToggle />
          </div>

          <CustomLink href="/settings/follow-hub" className={itemClass} onClick={onClose}>
            <HeartHandshake className="size-[18px] shrink-0 opacity-50" />
            {t("account_follow_hub")}
          </CustomLink>

          <a
            href="https://app.daodao.so/roadmap"
            className={itemClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapIcon className="size-[18px] shrink-0 opacity-50" />
            {t("account_roadmap_suggestion")}
            <ExternalLink className="size-3.5 ml-auto opacity-40" />
          </a>

          <CustomLink href="/settings/bug-report" className={itemClass} onClick={onClose}>
            <Bug className="size-[18px] shrink-0 opacity-50" />
            {t("account_bug_report")}
          </CustomLink>

          <CustomLink href="/settings/archived" className={itemClass} onClick={onClose}>
            <Archive className="size-[18px] shrink-0 opacity-50" />
            {t("account_archived")}
          </CustomLink>
        </nav>

        <div className="border-t border-[#EEF3F3] mx-3">
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              onClose();
              logout();
            }}
          >
            <LogOut className="size-[18px] shrink-0 opacity-50" />
            {t("account_logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
