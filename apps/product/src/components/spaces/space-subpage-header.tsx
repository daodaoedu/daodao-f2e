"use client";

import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface SpaceSubpageHeaderProps {
  title: string;
  subtitle?: string | null;
  /** Extra content on the right side of the header (member stack, host tools). */
  actions?: ReactNode;
}

/** Sub-page header (FR-4.1): back to the space list plus the space name. */
export const SpaceSubpageHeader = ({ title, subtitle, actions }: SpaceSubpageHeaderProps) => {
  const t = useTranslations("space");
  return (
    <header className="mb-4 flex items-center gap-2">
      <Link
        href="/spaces"
        aria-label={t("back_to_spaces")}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-text-dark transition-colors hover:bg-[#F0F9F8]"
      >
        <ChevronLeft className="size-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-basic-600">{title}</h1>
        {subtitle && <p className="truncate text-[13px] text-text-dark/60">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
};
