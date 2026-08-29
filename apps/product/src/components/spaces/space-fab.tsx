"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { CalendarRange, Plus, User, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type SpaceCreateKind = "practice" | "course" | "challenge";

interface SpaceFabProps {
  isAdmin: boolean;
  onSelect: (kind: SpaceCreateKind) => void;
}

/**
 * Floating "+ 新增" button with the create menu (FRD 3.3): 建立主題實踐、
 * 建立活動課程, plus the admin-only 共同挑戰 item (FR-F3). The menu closes on
 * outside click and ESC (FR-F4).
 */
export const SpaceFab = ({ isAdmin, onSelect }: SpaceFabProps) => {
  const t = useTranslations("space");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const select = (kind: SpaceCreateKind) => {
    close();
    onSelect(kind);
  };

  const items = [
    {
      kind: "practice" as const,
      label: t("fab_practice"),
      hint: t("fab_practice_hint"),
      icon: <User className="size-[17px] text-text-dark/70" />,
      iconBg: "bg-primary-base/14",
    },
    {
      kind: "course" as const,
      label: t("fab_course"),
      hint: t("fab_course_hint"),
      icon: <Users className="size-[17px] text-text-dark/70" />,
      iconBg: "bg-logo-orange/16",
    },
  ];

  return (
    <div ref={containerRef} className="fixed bottom-20 right-5 z-40 md:bottom-15 md:right-15">
      {open && (
        <div
          role="menu"
          aria-label={t("fab_menu_label")}
          className="absolute bottom-[72px] right-0 flex min-w-[236px] flex-col gap-0.5 rounded-[20px] border border-[#E4EAE9] bg-white p-2 shadow-[0_16px_40px_rgba(15,48,54,0.18)]"
        >
          {items.map((item) => (
            <button
              key={item.kind}
              type="button"
              role="menuitem"
              onClick={() => select(item.kind)}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
            >
              <span
                className={cn(
                  "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full",
                  item.iconBg
                )}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text-dark">{item.label}</span>
                <span className="mt-0.5 block text-xs text-text-dark/50">{item.hint}</span>
              </span>
            </button>
          ))}
          {isAdmin && (
            <>
              <div className="mx-3 my-1.5 h-px bg-[#EEF3F3]" />
              <button
                type="button"
                role="menuitem"
                onClick={() => select("challenge")}
                className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
              >
                <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-primary-lightest">
                  <CalendarRange className="size-[17px] text-text-dark/70" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-dark">
                    {t("fab_challenge")}
                    <span className="ml-1.5 rounded-full bg-primary-base/12 px-1.5 py-px text-[11px] font-medium text-primary-base">
                      {t("fab_challenge_team")}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-text-dark/50">
                    {t("fab_challenge_hint")}
                  </span>
                </span>
              </button>
            </>
          )}
        </div>
      )}
      <Button
        variant="default"
        size="icon"
        aria-label={t("fab_add")}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="size-15"
      >
        <Plus
          className={cn(
            "size-6 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open && "rotate-45"
          )}
        />
      </Button>
    </div>
  );
};
