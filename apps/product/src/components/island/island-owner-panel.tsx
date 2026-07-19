"use client";

import type { IslandDataType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { ArrowRight, Flame, MapPinned, Sprout, TentTree, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo } from "react";

interface IslandOwnerPanelProps {
  islandData: IslandDataType;
  open: boolean;
  onClose: () => void;
  onViewProfile: () => void;
}

export function IslandOwnerPanel({
  islandData,
  open,
  onClose,
  onViewProfile,
}: IslandOwnerPanelProps) {
  const t = useTranslations("island");
  const prefersReducedMotion = useReducedMotion();
  const ownerName = islandData.profile.name ?? t("routes_unknown_island");
  const activePractices = useMemo(
    () => islandData.practices.filter((practice) => practice.status === "active"),
    [islandData.practices]
  );
  const completedPracticeCount = islandData.practices.length - activePractices.length;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="island-owner-panel-title"
          aria-describedby="island-owner-panel-description"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.24, ease: "easeOut" }}
          className="pointer-events-auto absolute right-3 bottom-3 left-3 z-40 mx-auto max-h-[72dvh] max-w-4xl overflow-y-auto rounded-[1.4rem] border border-white/80 bg-white/92 shadow-[0_18px_60px_rgba(38,70,83,0.24)] backdrop-blur-xl sm:right-5 sm:bottom-5 sm:left-5"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-very-light-gray bg-white/94 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div>
              <h2 id="island-owner-panel-title" className="text-base font-medium text-bg-dark">
                {t("owner_sheet_title")}
              </h2>
              <p id="island-owner-panel-description" className="sr-only">
                {t("owner_sheet_description", { name: ownerName })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 bg-white/70 text-text-dark/60 hover:bg-white hover:text-text-dark"
              aria-label={t("owner_close_info")}
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,1.2fr)]">
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 shrink-0 border-2 border-white shadow-sm sm:size-20">
                  <AvatarImage src={islandData.profile.photoURL ?? undefined} alt={ownerName} />
                  <AvatarFallback className="bg-[#E8FAF9] text-lg font-medium text-logo-cyan">
                    {ownerName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-medium text-bg-dark sm:text-2xl">
                    {ownerName}
                  </h3>
                  {islandData.profile.customId && (
                    <p className="truncate text-sm text-text-dark/60">
                      @{islandData.profile.customId}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="very-light-blue" size="sm">
                      {t(`owner_relation_${islandData.viewerRelation}`)}
                    </Badge>
                    {islandData.personaType && (
                      <Badge variant="outline-logo" size="sm">
                        {t("owner_persona", { type: islandData.personaType.toUpperCase() })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 border-y border-very-light-gray py-4">
                <div className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
                  <TentTree className="size-5 text-logo-cyan" />
                  <strong className="text-lg font-medium text-bg-dark">
                    {activePractices.length}
                  </strong>
                  <span className="text-xs text-text-dark/65">{t("owner_active_practices")}</span>
                </div>
                <div className="flex min-w-0 flex-col items-center gap-1 border-x border-very-light-gray px-2 text-center">
                  <Sprout className="size-5 text-[#4C9364]" />
                  <strong className="text-lg font-medium text-bg-dark">
                    {completedPracticeCount}
                  </strong>
                  <span className="text-xs text-text-dark/65">
                    {t("owner_completed_practices")}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
                  <Flame className="size-5 text-orange" />
                  <strong className="text-lg font-medium text-bg-dark">
                    {islandData.recentCheckinCount}
                  </strong>
                  <span className="text-xs text-text-dark/65">{t("owner_recent_checkins")}</span>
                </div>
              </div>

              <Button className="mt-5 w-full sm:w-auto" onClick={onViewProfile}>
                {t("owner_view_profile")}
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <section className="min-w-0 lg:border-l lg:border-very-light-gray lg:pl-5">
              <div className="mb-2 flex items-center gap-2">
                <MapPinned className="size-4 text-logo-cyan" />
                <h3 className="text-sm font-medium text-bg-dark">{t("owner_practices_title")}</h3>
              </div>
              {islandData.practices.length > 0 ? (
                <ul className="grid max-h-[28dvh] gap-x-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1">
                  {islandData.practices.map((practice) => (
                    <li
                      key={practice.id}
                      className="flex min-w-0 items-center justify-between gap-3 border-b border-very-light-gray py-3"
                    >
                      <p className="min-w-0 truncate text-sm text-text-dark">{practice.title}</p>
                      <Badge
                        variant={practice.status === "active" ? "outline-logo" : "gray"}
                        size="sm"
                        className="shrink-0"
                      >
                        {t(`status_${practice.status}`)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-3 text-sm text-text-dark/60">{t("owner_no_practices")}</p>
              )}
            </section>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
