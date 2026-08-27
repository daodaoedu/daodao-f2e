"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { cn } from "@daodao/ui/lib/utils";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const AddTaskFAB = () => {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles?.includes("admin") ?? false;

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

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

  return (
    <div ref={menuRef} className="fixed bottom-[60px] right-[60px] z-40 hidden md:block">
      {isOpen && (
        <div
          className="absolute bottom-[72px] right-0 min-w-[250px] rounded-[20px] bg-white p-2 shadow-[0_16px_40px_rgba(15,48,54,0.18)]"
          role="menu"
        >
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
            role="menuitem"
            onClick={() => { setIsOpen(false); router.push("/practices/create"); }}
          >
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-logo-cyan/10">
              <svg className="size-[18px] text-logo-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-text-dark">{t("fab_create_practice")}</p>
              <p className="text-xs text-text-dark/40">{t("fab_practice_subtitle")}</p>
            </div>
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
            role="menuitem"
            onClick={() => { setIsOpen(false); router.push("/manage"); }}
          >
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#FFA10B]/10">
              <svg className="size-[18px] text-[#FFA10B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-text-dark">{t("fab_create_activity")}</p>
              <p className="text-xs text-text-dark/40">{t("fab_activity_subtitle")}</p>
            </div>
          </button>

          {isAdmin && (
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
              role="menuitem"
              onClick={() => { setIsOpen(false); }}
            >
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-logo-cyan/5">
                <svg className="size-[18px] text-logo-cyan/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
              </span>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-semibold text-text-dark">{t("fab_create_challenge")}</p>
                  <p className="text-xs text-text-dark/40">{t("fab_challenge_subtitle")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-logo-cyan/10 px-2 py-0.5 text-[10px] font-medium text-logo-cyan">
                  {t("fab_team_badge")}
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex size-[60px] items-center justify-center rounded-full text-white shadow-lg transition-all duration-200",
          isOpen
            ? "bg-text-dark/80 rotate-0"
            : "bg-logo-cyan hover:bg-logo-cyan/90"
        )}
        aria-label={t("fab_add_task")}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="size-6" /> : <Plus className="size-6" />}
      </button>
    </div>
  );
};
