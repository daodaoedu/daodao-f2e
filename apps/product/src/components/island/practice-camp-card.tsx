"use client";

import { type IslandPracticeType, usePracticeCheckIns } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { format } from "date-fns";
import { BookOpenText, ChevronDown, ChevronUp, Flame, Home, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { type ApiMoodType, MOOD_OPTIONS, mapApiMoodToMoodType } from "@/constants/mood";

/**
 * 島上實踐營火札記：
 * 保留 3D 場景的完整視野，只在底部顯示選取實踐的摘要。
 */

interface PracticeCampCardProps {
  /** null = 關閉 */
  practiceId: string | null;
  practices: IslandPracticeType[];
  onClose: () => void;
}

const RECENT_CHECKINS_LIMIT = 5;
const CHECKIN_SKELETON_KEYS = ["first", "second", "third"] as const;

function CampCardContent({
  practice,
  expanded,
  prefersReducedMotion,
  onToggleExpanded,
  onClose,
}: {
  practice: IslandPracticeType;
  expanded: boolean;
  prefersReducedMotion: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("island");
  const { data, isLoading } = usePracticeCheckIns(practice.id, {
    limit: RECENT_CHECKINS_LIMIT,
  });
  const checkins = data?.data ?? [];
  const latestCheckin = checkins[0];
  const moodType = latestCheckin
    ? mapApiMoodToMoodType(latestCheckin.mood as ApiMoodType | undefined)
    : null;
  const MoodIcon = moodType
    ? MOOD_OPTIONS.find((option) => option.id === moodType)?.emoji
    : undefined;

  return (
    <>
      <div
        className="absolute inset-x-6 top-0 h-1 rounded-b-full"
        style={{ backgroundColor: practice.themeColor ?? "#16B9B3" }}
      />

      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <div className="relative mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8FAF9] sm:mt-0">
          <BookOpenText className="size-5 text-logo-cyan" />
          <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-white">
            {practice.status === "active" ? (
              <Flame className="size-3.5 text-logo-orange" />
            ) : (
              <Home className="size-3.5 text-primary" />
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-logo-cyan uppercase">
              {t("camp_journal_label")}
            </p>
            <span className="text-xs text-text-dark/45">·</span>
            <p className="text-xs font-medium text-text-dark/65">
              {practice.status === "active" ? t("status_active") : t("status_completed")}
            </p>
          </div>
          <h2
            id="practice-camp-card-title"
            className="mt-1 truncate text-base font-semibold text-text-dark sm:text-lg"
          >
            {practice.title}
          </h2>
          <p className="mt-0.5 text-xs text-text-dark/60">
            {t("drawer_checkin_count", { count: practice.checkinCount })}
          </p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 border-l border-dashed border-logo-cyan/25 pl-4 md:block">
        {isLoading && <div className="h-11 animate-pulse rounded-xl bg-[#E8FAF9]" />}
        {!isLoading && !latestCheckin && (
          <p className="text-sm text-text-dark/55">{t("drawer_no_checkins")}</p>
        )}
        {!isLoading && latestCheckin && (
          <div className="flex items-start gap-2.5">
            {MoodIcon && <MoodIcon className="mt-0.5 size-5 shrink-0" />}
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-dark/55">
                {t("camp_latest_checkin")} · {format(new Date(latestCheckin.checkinDate), "MM/dd")}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-text-dark">
                {latestCheckin.note || t("camp_checkin_without_note")}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        <Button
          variant="orange"
          size="sm"
          aria-expanded={expanded}
          aria-controls="practice-camp-card-details"
          onClick={onToggleExpanded}
        >
          {expanded ? t("camp_collapse_details") : t("camp_expand_details")}
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 bg-white/70 text-text-dark/60 hover:bg-white hover:text-text-dark"
          aria-label={t("camp_card_close")}
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="practice-camp-card-details"
            initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2, ease: "easeOut" }}
            className="basis-full overflow-hidden border-t border-dashed border-logo-cyan/25"
          >
            <div className="max-h-[38dvh] overflow-y-auto pt-3">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-text-dark/55 uppercase">
                {t("drawer_recent_checkins")}
              </h3>
              {isLoading && (
                <div className="space-y-2">
                  {CHECKIN_SKELETON_KEYS.map((key) => (
                    <div key={key} className="h-12 animate-pulse rounded-xl bg-[#E8FAF9]" />
                  ))}
                </div>
              )}
              {!isLoading && checkins.length === 0 && (
                <p className="text-sm text-text-dark/55">{t("drawer_no_checkins")}</p>
              )}
              {!isLoading && checkins.length > 0 && (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {checkins.map((checkin) => {
                    const checkinMoodType = mapApiMoodToMoodType(
                      checkin.mood as ApiMoodType | undefined
                    );
                    const CheckinMoodIcon = checkinMoodType
                      ? MOOD_OPTIONS.find((option) => option.id === checkinMoodType)?.emoji
                      : undefined;
                    return (
                      <li
                        key={checkin.id}
                        className="flex min-w-0 items-start gap-2.5 rounded-xl bg-[#E8FAF9]/75 px-3 py-2.5"
                      >
                        <span className="shrink-0 text-xs font-medium text-text-dark/55">
                          {format(new Date(checkin.checkinDate), "MM/dd")}
                        </span>
                        {CheckinMoodIcon && <CheckinMoodIcon className="size-5 shrink-0" />}
                        <p className="line-clamp-2 min-w-0 text-sm text-text-dark">
                          {checkin.note || t("camp_checkin_without_note")}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PracticeCampCard({ practiceId, practices, onClose }: PracticeCampCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const practice = practiceId ? (practices.find((item) => item.id === practiceId) ?? null) : null;

  useEffect(() => {
    if (!practice) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, practice]);

  return (
    <AnimatePresence>
      {practice && (
        <motion.aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="practice-camp-card-title"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.24, ease: "easeOut" }}
          layout={!prefersReducedMotion}
          className="pointer-events-auto absolute right-3 bottom-3 left-3 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-3 overflow-hidden rounded-[1.4rem] border border-white/80 bg-white/88 px-4 py-4 shadow-[0_18px_60px_rgba(38,70,83,0.24)] backdrop-blur-xl sm:right-5 sm:bottom-5 sm:left-5 sm:gap-5 sm:px-5"
        >
          <CampCardContent
            practice={practice}
            expanded={expanded}
            prefersReducedMotion={Boolean(prefersReducedMotion)}
            onToggleExpanded={() => setExpanded((current) => !current)}
            onClose={onClose}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
