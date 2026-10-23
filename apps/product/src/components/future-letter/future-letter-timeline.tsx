"use client";

import {
  deleteFutureLetter,
  type FutureLetterType,
  openFutureLetter,
  useAllMyFutureLetters,
  useAllMyTimeline,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useRouter, useSearchParams } from "@daodao/i18n/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { format, parseISO } from "date-fns";
import { Mail, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLetterDetailScrollKey, isFootprintTimelineSettled } from "./future-letter-utils";
import { LetterDetailCard } from "./letter-detail-card";
import { buildFootprintTimeline } from "./timeline-model";
import { VerticalTimeline } from "./vertical-timeline";

type LifecycleLetter = FutureLetterType & { sentAt?: string | null; openedAt?: string | null };

interface FutureLetterTimelineProps {
  onWriteLetter: () => void;
  isWriteLetterDisabled?: boolean;
  refreshToken?: number;
  draft?: FutureLetterType | null;
}

export function FutureLetterTimeline({
  onWriteLetter,
  isWriteLetterDisabled = false,
  refreshToken = 0,
  draft,
}: FutureLetterTimelineProps) {
  const t = useTranslations("future_letter");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openWarningDialog } = useDialog();
  const deepLinkedLetterId = searchParams.get("futureLetterId");
  const focusDate = searchParams.get("focusDate");
  const [pendingRouteTarget, setPendingRouteTarget] = useState<string | null | undefined>(
    undefined
  );
  const [isMutating, setIsMutating] = useState(false);
  const [openedLetter, setOpenedLetter] = useState<LifecycleLetter | null>(null);
  const autoOpenAttemptedRef = useRef<string | null>(null);
  const lastRefreshTokenRef = useRef(0);
  const timelineQuery = useAllMyTimeline();
  const lettersQuery = useAllMyFutureLetters();
  const timelineEntries = useMemo(
    () => timelineQuery.data?.flatMap((page) => page.data) ?? [],
    [timelineQuery.data]
  );
  const letters = useMemo(
    () => (lettersQuery.data?.flatMap((page) => page.data) ?? []) as LifecycleLetter[],
    [lettersQuery.data]
  );
  const { futureLetters, pastGroups } = useMemo(
    () => buildFootprintTimeline(timelineEntries, letters, new Date()),
    [letters, timelineEntries]
  );
  const selectedLetterId =
    pendingRouteTarget === undefined ? deepLinkedLetterId : pendingRouteTarget;
  const selectedLetter = letters.find((letter) => letter.id === selectedLetterId);
  const detailLetter = openedLetter?.id === selectedLetter?.id ? openedLetter : selectedLetter;
  const isLoading = timelineQuery.isLoading || lettersQuery.isLoading;
  const hasError = Boolean(timelineQuery.error || lettersQuery.error);
  const scheduledLetter = selectedLetter?.status === "scheduled" ? selectedLetter : undefined;
  const detailScrollKey = getLetterDetailScrollKey(
    scheduledLetter,
    isFootprintTimelineSettled({
      isLoading,
      hasError,
      timelineHasMore: Boolean(timelineQuery.data?.at(-1)?.pagination.hasMore),
      lettersHasMore: Boolean(lettersQuery.data?.at(-1)?.pagination.hasNext),
    })
  );
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailScrollKey) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    detailRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [detailScrollKey]);

  const refresh = useCallback(
    async () => Promise.all([lettersQuery.mutate(), timelineQuery.mutate()]),
    [lettersQuery.mutate, timelineQuery.mutate]
  );

  useEffect(() => {
    if (refreshToken > lastRefreshTokenRef.current) {
      lastRefreshTokenRef.current = refreshToken;
      void refresh();
    }
  }, [refresh, refreshToken]);

  useEffect(() => {
    if (pendingRouteTarget === deepLinkedLetterId) setPendingRouteTarget(undefined);
  }, [deepLinkedLetterId, pendingRouteTarget]);

  const handleLetterClick = (letterId: string, date: string) => {
    setPendingRouteTarget(letterId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("futureLetterId", letterId);
    params.set("focusDate", date.slice(0, 10));
    router.replace(`/me/footprints?${params.toString()}`, { scroll: false });
  };

  const handleOpen = useCallback(
    async (letter: LifecycleLetter) => {
      if (isMutating) return;
      setIsMutating(true);
      try {
        const response = await openFutureLetter(letter.id);
        if (response.error) {
          toast.error(t("letter_open_failed"));
          return;
        }
        if (response.data?.data) setOpenedLetter(response.data.data);
        await refresh();
      } catch (error) {
        console.error("Failed to open future letter", error);
        toast.error(t("letter_open_failed"));
      } finally {
        setIsMutating(false);
      }
    },
    [isMutating, refresh, t]
  );

  useEffect(() => {
    if (
      isMutating ||
      selectedLetter?.status !== "delivered" ||
      selectedLetter.openedAt ||
      autoOpenAttemptedRef.current === selectedLetter.id
    ) {
      return;
    }
    autoOpenAttemptedRef.current = selectedLetter.id;
    void handleOpen(selectedLetter);
  }, [selectedLetter, isMutating, handleOpen]);

  const closeLetterDetail = () => {
    autoOpenAttemptedRef.current = null;
    setOpenedLetter(null);
    setPendingRouteTarget(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("futureLetterId");
    router.replace(`/me/footprints?${params.toString()}`, { scroll: false });
  };

  const handleDelete = async (letter: LifecycleLetter) => {
    const scheduled = letter.status === "scheduled";
    const result = await openWarningDialog({
      title: t(scheduled ? "delete_scheduled_title" : "delete_delivered_title"),
      message: t(scheduled ? "delete_scheduled_message" : "delete_delivered_message"),
      strict: true,
      buttons: [
        { label: t("delete_cancel"), value: "cancel", variant: "orange" },
        { label: t("delete_permanently"), value: "delete", variant: "outline" },
      ],
    });
    if (result.value !== "delete") return;
    setIsMutating(true);
    try {
      const response = await deleteFutureLetter(letter.id);
      if (response.error) {
        toast.error(t("letter_delete_failed"));
        return;
      }
      if (letter.id === deepLinkedLetterId) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("futureLetterId");
        setPendingRouteTarget(null);
        router.replace(`/me/footprints?${params.toString()}`, { scroll: false });
      }
      toast.success(t("letter_deleted"));
      await refresh();
    } catch (error) {
      console.error("Failed to delete future letter", error);
      toast.error(t("letter_delete_failed"));
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <section className="space-y-6">
      {isLoading && (
        <p className="py-8 text-center text-sm text-text-secondary">{t("timeline_loading")}</p>
      )}
      {hasError && <p className="py-8 text-center text-sm text-red">{t("timeline_error")}</p>}
      {!isLoading && !hasError && (
        <VerticalTimeline
          futureLetters={futureLetters}
          pastGroups={pastGroups}
          onWriteLetter={onWriteLetter}
          isWriteLetterDisabled={isWriteLetterDisabled}
          onLetterClick={handleLetterClick}
          onDeleteLetter={(letterId) => {
            const letter = letters.find((item) => item.id === letterId);
            if (letter) void handleDelete(letter);
          }}
          focusLetterId={deepLinkedLetterId ?? undefined}
          focusDate={focusDate ?? undefined}
          draft={draft}
        />
      )}

      {selectedLetter?.status === "scheduled" && (
        <div
          ref={detailRef}
          className="scroll-mt-24 mx-auto max-w-md rounded-2xl border border-dashed border-[#E4B84D] bg-[#FFFDF5] p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-text-dark">{t("sealed_title")}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {t("sealed_description", {
                  date: selectedLetter.deliverAt
                    ? format(parseISO(selectedLetter.deliverAt), "yyyy/MM/dd")
                    : "",
                })}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("letter_actions")}
              disabled={isMutating}
              onClick={() => handleDelete(selectedLetter)}
              className="text-red hover:text-red"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={selectedLetter?.status === "delivered"}
        onOpenChange={(open) => {
          if (!open) closeLetterDetail();
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[#0D303680]"
          className="max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[560px] overflow-hidden rounded-[24px] border border-[#E8D99E] bg-[#FFFDF2] p-0 shadow-[0_24px_70px_rgba(53,48,25,0.2)] sm:max-w-[560px]"
        >
          <DialogTitle className="sr-only">{t("detail_title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("unopened_description")}</DialogDescription>
          <DialogClose
            className="absolute right-6 top-6 z-10 rounded-full p-1 text-[#9D812C] transition-colors hover:bg-[#F3EBCF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9D812C]"
            aria-label={t("detail_close")}
          >
            <X className="size-5" />
          </DialogClose>
          <div className="max-h-[calc(100dvh-32px)] overflow-y-auto px-8 pb-8 pt-8 sm:max-h-[min(78vh,660px)]">
            {detailLetter?.openedAt ? (
              <LetterDetailCard letter={detailLetter} />
            ) : (
              <div className="py-10 text-center">
                <Mail className="mx-auto size-8 text-[#A47D29]" />
                <h3 className="mt-3 font-medium text-[#493D22]">{t("unopened_title")}</h3>
                <p className="mt-2 text-sm text-[#796B4F]">{t("unopened_description")}</p>
                <Button
                  disabled={isMutating || !selectedLetter}
                  onClick={() => selectedLetter && void handleOpen(selectedLetter)}
                  className="mt-5 rounded-full bg-[#F3EBCF] text-[#493D22] hover:bg-[#EDE0B6]"
                >
                  {isMutating ? t("detail_opening") : t("action_open_letter")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
