"use client";

import { Link } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface CohortParticipantNavProps {
  backHref: string;
  backLabel: string;
  navLabel: string;
  participantName?: string;
  /** 1-based position of the participant being viewed */
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
  previousLabel: string;
  nextLabel: string;
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Pinned top bar for coaches reviewing a cohort: shows whose practice is open,
 * the position in the list, and previous/next controls (also ← / → keys).
 */
export const CohortParticipantNav = ({
  backHref,
  backLabel,
  navLabel,
  participantName,
  current,
  total,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  previousLabel,
  nextLabel,
}: CohortParticipantNavProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowLeft" && !previousDisabled) {
        onPrevious();
      } else if (event.key === "ArrowRight" && !nextDisabled) {
        onNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPrevious, onNext, previousDisabled, nextDisabled]);

  return (
    // The page wrapper is an overflow container, so `sticky` would never engage; use fixed + spacer.
    <nav aria-label={navLabel} className="h-14">
      <div className="fixed inset-x-0 top-0 z-50 h-14 border-b border-[#E4EAE9] bg-gray-100/95 backdrop-blur">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center gap-2 px-2 md:px-8">
          <div className="flex min-w-0 flex-1 justify-start">
            <Link
              href={backHref}
              aria-label={backLabel}
              className="flex h-10 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-[#0D7773] hover:bg-[#E4EAE9]"
            >
              <ArrowLeft aria-hidden="true" className="size-5 shrink-0" />
              <span className="hidden truncate sm:inline">{backLabel}</span>
            </Link>
          </div>

          <div className="flex min-w-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 text-[#0D7773] hover:bg-[#E4EAE9]"
              onClick={onPrevious}
              disabled={previousDisabled}
              aria-label={previousLabel}
              title={previousLabel}
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </Button>
            <div className="flex min-w-0 items-baseline gap-2 px-1" aria-live="polite">
              {participantName && (
                <span className="truncate text-sm font-semibold text-text-dark">
                  {participantName}
                </span>
              )}
              <span className="shrink-0 text-xs tabular-nums text-[#6B8789]">
                {current} / {total}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 text-[#0D7773] hover:bg-[#E4EAE9]"
              onClick={onNext}
              disabled={nextDisabled}
              aria-label={nextLabel}
              title={nextLabel}
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </Button>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </nav>
  );
};
