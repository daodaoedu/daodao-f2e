"use client";

import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { ChevronRight } from "lucide-react";

export function ExploreRow() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex items-center gap-2 text-[13px] text-text-dark/65 mb-5">
      <ExploreLink href="/challenges" label={t("explore_challenge")} />
      <span className="text-text-dark/20">·</span>
      <ExploreLink href="/activities" label={t("explore_activity")} />
    </div>
  );
}

function ExploreLink({ href, label }: { href: string; label: string }) {
  return (
    <CustomLink
      href={href}
      className="inline-flex items-center gap-1 hover:text-text-dark transition-colors group"
    >
      <svg
        aria-hidden="true"
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
      <span>{label}</span>
      <span className="relative inline-flex size-[6px]">
        <span className="absolute inset-0 rounded-full bg-[#FFA10B] animate-breathe-amber" />
        <span className="absolute inset-px rounded-full bg-[#FFA10B]" />
      </span>
      <ChevronRight className="size-3 opacity-40 group-hover:opacity-70 transition-opacity" />
    </CustomLink>
  );
}
