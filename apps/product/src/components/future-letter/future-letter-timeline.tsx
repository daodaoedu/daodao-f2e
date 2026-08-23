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
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { format, parseISO } from "date-fns";
import { Mail, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HorizontalTimeline } from "./horizontal-timeline";
import { LetterDetailCard } from "./letter-detail-card";
import { buildTimelineCoordinates, type TimelineCoordinate } from "./timeline-model";

type LifecycleLetter = FutureLetterType & { sentAt?: string | null; openedAt?: string | null };

interface FutureLetterTimelineProps {
  onWriteLetter: () => void;
  isWriteLetterDisabled?: boolean;
  refreshToken?: number;
}

export function FutureLetterTimeline({
  onWriteLetter,
  isWriteLetterDisabled = false,
  refreshToken = 0,
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
  const coordinates = useMemo(
    () => buildTimelineCoordinates(timelineEntries, letters, new Date()),
    [letters, timelineEntries]
  );
  const selectedLetter =
    pendingRouteTarget === undefined
      ? letters.find((letter) => letter.id === deepLinkedLetterId)
      : undefined;
  const focusId = deepLinkedLetterId
    ? `letter-${deepLinkedLetterId}`
    : focusDate
      ? coordinates.find((node) => node.date.startsWith(focusDate))?.id
      : undefined;

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

  const handleNodeClick = (node: TimelineCoordinate) => {
    if (!node.letterId) return;
    setPendingRouteTarget(node.letterId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("futureLetterId", node.letterId);
    params.set("focusDate", node.date.slice(0, 10));
    router.replace(`/me/footprints?${params.toString()}`, { scroll: false });
  };

  const handleOpen = async () => {
    if (!selectedLetter || isMutating) return;
    setIsMutating(true);
    try {
      const response = await openFutureLetter(selectedLetter.id);
      if (response.error) {
        toast.error(t("letter_open_failed"));
        return;
      }
      await refresh();
    } catch (error) {
      console.error("Failed to open future letter", error);
      toast.error(t("letter_open_failed"));
    } finally {
      setIsMutating(false);
    }
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
      const params = new URLSearchParams(searchParams.toString());
      params.delete("futureLetterId");
      setPendingRouteTarget(null);
      router.replace(`/me/footprints?${params.toString()}`, { scroll: false });
      toast.success(t("letter_deleted"));
      await refresh();
    } catch (error) {
      console.error("Failed to delete future letter", error);
      toast.error(t("letter_delete_failed"));
    } finally {
      setIsMutating(false);
    }
  };

  const isLoading = timelineQuery.isLoading || lettersQuery.isLoading;
  const hasError = Boolean(timelineQuery.error || lettersQuery.error);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text-dark">{t("section_title")}</h2>
          <p className="text-sm text-text-secondary">{t("timeline_quiet_description")}</p>
        </div>
        <Button
          onClick={onWriteLetter}
          disabled={isWriteLetterDisabled}
          variant="outline"
          className="rounded-full border-logo-cyan text-logo-cyan hover:bg-[#E7FAF7] hover:text-logo-cyan"
        >
          <Mail className="size-4" />
          {t("cta_button")}
        </Button>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-text-secondary">{t("timeline_loading")}</p>
      )}
      {hasError && <p className="py-8 text-center text-sm text-red">{t("timeline_error")}</p>}
      {!isLoading && !hasError && (
        <div className="rounded-3xl border border-border bg-white py-3">
          <HorizontalTimeline
            coordinates={coordinates}
            focusId={focusId}
            onNodeClick={handleNodeClick}
          />
        </div>
      )}

      {selectedLetter?.status === "scheduled" && (
        <div className="rounded-2xl border border-dashed border-[#E4B84D] bg-[#FFFDF5] p-5">
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

      {selectedLetter?.status === "delivered" && !selectedLetter.openedAt && (
        <div className="rounded-2xl border border-logo-cyan/30 bg-[#F4FBFA] p-6 text-center">
          <Mail className="mx-auto size-8 text-logo-cyan" />
          <h3 className="mt-3 font-bold text-text-dark">{t("unopened_title")}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t("unopened_description")}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button
              disabled={isMutating}
              onClick={handleOpen}
              className="rounded-full bg-logo-cyan text-white hover:bg-logo-cyan/90"
            >
              {t("action_open_letter")}
            </Button>
            <Button
              disabled={isMutating}
              variant="outline"
              onClick={() => handleDelete(selectedLetter)}
              className="rounded-full text-red"
            >
              {t("action_delete")}
            </Button>
          </div>
        </div>
      )}

      {selectedLetter?.status === "delivered" && selectedLetter.openedAt && (
        <div className="space-y-3">
          <LetterDetailCard letter={selectedLetter} />
          <div className="flex justify-end">
            <Button
              disabled={isMutating}
              variant="ghost"
              onClick={() => handleDelete(selectedLetter)}
              className="text-red hover:text-red"
            >
              <Trash2 className="size-4" />
              {t("delete_permanently")}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
