"use client";

import { useLighthouseParticipantCheckins, useLighthouseParticipantMessages } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Button } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { format, parseISO } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type CohortFocusDetailTarget = {
  userId: number;
  nickname: string | null;
  practiceId: number;
  practiceTitle: string;
  checkinId?: number;
};

interface CohortFocusDetailDrawerProps {
  programId: number;
  cohortId: number;
  target: CohortFocusDetailTarget | null;
  onClose: () => void;
  onCompose: (target: CohortFocusDetailTarget) => void;
}

export function CohortFocusDetailDrawer({
  programId,
  cohortId,
  target,
  onClose,
  onCompose,
}: CohortFocusDetailDrawerProps) {
  const t = useTranslations("lighthouse");
  const checkinsQuery = useLighthouseParticipantCheckins(
    programId,
    cohortId,
    target?.userId,
    target?.practiceId
  );
  const messagesQuery = useLighthouseParticipantMessages(programId, cohortId, target?.userId);
  const checkins = checkinsQuery.data?.data;
  const messages = messagesQuery.data?.data;
  const practiceMessages =
    messages?.items.filter((item) => item.practiceId === target?.practiceId) ?? [];
  const name = target?.nickname || t("learner");
  const latestCheckinId = checkins?.items[0]?.id;
  const [selectedCheckinId, setSelectedCheckinId] = useState<number | null>(
    target?.checkinId ?? null
  );
  const selectedCheckin = checkins?.items.find((item) => item.id === selectedCheckinId);
  type MessageItem = NonNullable<typeof messages>["items"][number];
  const commentsByCheckin = new Map<number, MessageItem[]>();
  for (const item of practiceMessages) {
    if (item.checkinId === null || item.checkinId === undefined) continue;
    const comments = commentsByCheckin.get(item.checkinId) ?? [];
    comments.push(item);
    commentsByCheckin.set(item.checkinId, comments);
  }
  const renderComment = (item: MessageItem) => (
    <article
      key={`${item.source}-${item.id}`}
      className={`rounded-xl p-3 ${
        item.source === "lighthouse" ? "border-l-4 border-[#16B9B3] bg-[#EAF7F5]" : "bg-white"
      }`}
    >
      <p className="font-mono text-[11px] text-[#0D7773]">
        {[
          item.sentAt && format(parseISO(item.sentAt), "yyyy/MM/dd"),
          item.senderNickname,
          item.checkinId !== null && item.checkinId !== undefined
            ? t("comment_target_checkin")
            : item.source === "practice"
              ? t("comment_source_practice")
              : item.source === "checkin"
                ? t("comment_source_checkin")
                : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#0D3036]">{item.body}</p>
    </article>
  );
  const checkinIds = new Set(checkins?.items.map((item) => item.id) ?? []);
  const standaloneComments = practiceMessages.filter(
    (item) =>
      item.checkinId === null || item.checkinId === undefined || !checkinIds.has(item.checkinId)
  );
  const timeline = [
    ...(checkins?.items ?? []).map((item) => ({
      kind: "checkin" as const,
      timestamp: parseISO(item.checkinDate),
      item,
    })),
    ...standaloneComments.map((item) => ({
      kind: "comment" as const,
      timestamp: item.sentAt ? parseISO(item.sentAt) : new Date(0),
      item,
    })),
  ].sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime());

  useEffect(() => {
    setSelectedCheckinId(target?.checkinId ?? null);
  }, [target]);

  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-[min(560px,94vw)] flex-col overflow-y-auto bg-white p-0"
      >
        <SheetHeader className="items-start border-b border-[#DDEFED] px-5 pt-5 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
            {t("focus_detail_title")}
          </p>
          <SheetTitle className="text-left text-xl font-semibold text-[#0D3036]">{name}</SheetTitle>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <SheetDescription className="text-xs text-[#5A7B79]">
              {checkins?.practice.title ?? target?.practiceTitle}
            </SheetDescription>
            {checkins?.practice.externalId && latestCheckinId && (
              <Link
                href={`/practices/${checkins.practice.externalId}/check-ins/${latestCheckinId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-center text-xs font-semibold text-[#0D7773] underline underline-offset-4 hover:text-[#0D5B59]"
              >
                {t("checkin_open_for_comment")}
              </Link>
            )}
          </div>
        </SheetHeader>

        <section
          aria-label={t("focus_detail_title")}
          className="min-h-0 flex-1 overflow-y-auto px-5 pt-4"
        >
          {(checkinsQuery.isLoading || messagesQuery.isLoading) && (
            <p className="mb-3 text-sm text-[#78928F]">{t("loading")}</p>
          )}
          {!checkinsQuery.isLoading &&
            !checkins &&
            (checkinsQuery.error || checkinsQuery.validationError) && (
              <p
                role="alert"
                className="mb-3 rounded-2xl border border-dashed border-[#F2C9C9] px-4 py-4 text-center text-sm text-[#A33A3A]"
              >
                {t("checkin_records_load_failed")}
              </p>
            )}
          {!messagesQuery.isLoading &&
            !messages &&
            (messagesQuery.error || messagesQuery.validationError) && (
              <p
                role="alert"
                className="mb-3 rounded-2xl border border-dashed border-[#F2C9C9] px-4 py-4 text-center text-sm text-[#A33A3A]"
              >
                {t("load_failed")}
              </p>
            )}
          {!checkinsQuery.isLoading &&
            !messagesQuery.isLoading &&
            checkins?.items.length === 0 &&
            messages?.items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[#B9DCD8] px-4 py-8 text-center text-sm text-[#5A7B79]">
                {t("checkin_records_empty")}
              </p>
            )}
          <ul className="grid gap-3 pb-4">
            {timeline.map((entry) =>
              entry.kind === "checkin" ? (
                <li
                  key={`checkin-${entry.item.id}`}
                  className="rounded-2xl border border-[#DDEFED] bg-[#F9FDFC] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs text-[#0D7773]">
                      {format(parseISO(entry.item.checkinDate), "yyyy/MM/dd")}
                    </p>
                    <Checkbox
                      checked={selectedCheckinId === entry.item.id}
                      onCheckedChange={(checked) =>
                        setSelectedCheckinId(checked === true ? entry.item.id : null)
                      }
                      aria-label={t("checkin_select_for_comment", {
                        date: format(parseISO(entry.item.checkinDate), "yyyy/MM/dd"),
                      })}
                      className="size-4 rounded-[5px] border-[#B9DCD8] data-[state=checked]:border-[#0D7773] data-[state=checked]:bg-[#0D7773]"
                    />
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#0D3036]">
                    {entry.item.note ? entry.item.note : t("checkin_without_note")}
                  </p>
                  {(commentsByCheckin.get(entry.item.id)?.length ?? 0) > 0 && (
                    <div className="mt-3 grid gap-2 border-l-2 border-[#CDEBE8] pl-3">
                      <p className="text-[11px] font-medium text-[#5A7B79]">
                        {t("checkin_comments_heading")}
                      </p>
                      {commentsByCheckin.get(entry.item.id)?.map(renderComment)}
                    </div>
                  )}
                </li>
              ) : (
                <li
                  key={`comment-${entry.item.source}-${entry.item.id}`}
                  className="rounded-2xl border border-[#DDEFED] bg-[#F9FDFC] p-4"
                >
                  {renderComment(entry.item)}
                </li>
              )
            )}
          </ul>
        </section>

        <div className="mt-auto border-t border-[#DDEFED] p-5">
          <Button
            type="button"
            className="w-full rounded-full"
            disabled={!target}
            onClick={() =>
              target &&
              onCompose({
                ...target,
                checkinId: selectedCheckinId ?? undefined,
              })
            }
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {selectedCheckinId
              ? selectedCheckin
                ? t("focus_comment_selected_checkin", {
                    date: format(parseISO(selectedCheckin.checkinDate), "yyyy/MM/dd"),
                  })
                : t("focus_comment_selected_checkin_generic")
              : t("focus_comment_without_checkin")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
