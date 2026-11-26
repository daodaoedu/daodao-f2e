"use client";

import { useLighthouseFocus } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@daodao/ui/components/popover";
import { format, isAfter, parseISO } from "date-fns";
import { Info, MessageCircle } from "lucide-react";
import { useState } from "react";
import { CohortErrorState } from "./cohort-error-state";
import {
  CohortFocusDetailDrawer,
  type CohortFocusDetailTarget,
} from "./cohort-focus-detail-drawer";
import { CohortMessageComposeDialog } from "./cohort-message-dialogs";

interface CohortFocusProps {
  programId: number;
  cohortId: number;
}

type Person = {
  userId: number;
  nickname: string | null;
  practiceId: number;
  practiceTitle: string;
};
type FocusReason = { label: string; detail: string };
type FocusRow = Person & {
  messageCount: number;
  reasons: FocusReason[];
  celebration?: { checkinId?: number; occurredAt: string };
};
const day = (value: string): string => format(parseISO(value), "yyyy/MM/dd");

/** FRD 3.5 今日焦點：以參與者 × 實踐整合打卡焦點與留言操作 */
export function CohortFocus({ programId, cohortId }: CohortFocusProps) {
  const t = useTranslations("lighthouse");
  const [detail, setDetail] = useState<CohortFocusDetailTarget | null>(null);
  const [compose, setCompose] = useState<CohortFocusDetailTarget | null>(null);
  const query = useLighthouseFocus(programId, cohortId);
  const data = query.data?.data;

  if (query.isLoading) return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (query.error || query.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void query.mutate()}
      />
    );

  const rowsByPractice = new Map<string, FocusRow>();
  const getFocusRow = (person: Person, messageCount: number): FocusRow => {
    const key = `${person.userId}-${person.practiceId}`;
    let row = rowsByPractice.get(key);
    if (!row) {
      row = { ...person, messageCount, reasons: [] };
      rowsByPractice.set(key, row);
    }
    return row;
  };

  for (const item of data?.needsEncouragement ?? []) {
    const row = getFocusRow(item, item.messageCount);
    row.reasons.push({
      label: t("focus_reason_inactive"),
      detail: t("focus_reason_inactive_detail", {
        days: t("days_count", { count: item.interruptedDays }),
        date: day(item.lastCheckinDate),
      }),
    });
  }

  for (const item of data?.celebrations ?? []) {
    // Inactivity takes priority over an old first-check-in milestone.
    if (
      data?.needsEncouragement.some(
        (inactive) => inactive.practiceId === item.practiceId && inactive.userId === item.userId
      )
    )
      continue;
    const row = getFocusRow(item, item.messageCount);
    row.reasons.push({
      label: item.momentDescription,
      detail: t("first_checkin_date_label", { date: day(item.firstCheckinAt) }),
    });
    if (
      !row.celebration ||
      isAfter(parseISO(item.occurredAt), parseISO(row.celebration.occurredAt))
    ) {
      row.celebration = { checkinId: item.checkinId, occurredAt: item.occurredAt };
    }
  }
  const focusRows = Array.from(rowsByPractice.values());

  const name = (person: { nickname: string | null }) => person.nickname || t("learner");
  const commentCell = (person: Person, count: number, checkinId?: number) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative size-9 rounded-full border-[#CDEBE8] bg-[#F0FBF9] text-[#0D7773]"
      aria-label={t("focus_detail_open", { name: name(person) })}
      title={t("focus_detail_open", { name: name(person) })}
      onClick={() => setDetail({ ...person, checkinId })}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#0D3036] px-1 text-[10px] leading-4 text-white">
          {count}
        </span>
      )}
    </Button>
  );
  const practiceCell = (person: Person) => (
    <span className="text-sm font-medium text-[#0D7773]">{person.practiceTitle}</span>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10">
      <section className="mt-5 rounded-3xl border border-[#CDEBE8] bg-white p-4 md:p-6">
        <div className="mb-3 flex justify-end">
          <FocusCriteriaInfo
            label={t("focus_criteria_label")}
            content={`${t("focus_criteria_inactive_heading")}\n${t("focus_criteria_inactive")}\n\n${t("focus_criteria_milestone_heading")}\n${t("focus_criteria_milestone")}`}
          />
        </div>
        {!focusRows.length ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs text-[#78928F]">
                  <th
                    scope="col"
                    className="sticky left-0 z-30 bg-white px-3 py-1 font-medium shadow-[4px_0_6px_-5px_rgba(13,48,54,0.45)]"
                  >
                    {t("col_participant")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_practice")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_focus_reason")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_focus_comments")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {focusRows.map((row) => {
                  return (
                    <tr
                      key={`${row.userId}-${row.practiceId}`}
                      className="bg-white shadow-[0_0_0_1px_#DDEFED]"
                    >
                      <td className="sticky left-0 z-20 rounded-l-2xl bg-white px-3 py-3 font-semibold shadow-[4px_0_6px_-5px_rgba(13,48,54,0.45)]">
                        {name(row)}
                      </td>
                      <td className="px-3 py-3">{practiceCell(row)}</td>
                      <td className="px-3 py-3 text-[#0D5B59]">
                        <div className="flex flex-col gap-2">
                          {row.reasons.map((reason, index) => (
                            <div key={`${reason.label}-${index}`} className="flex flex-col gap-0.5">
                              <span className="font-medium">{reason.label}</span>
                              <span className="font-mono text-xs text-[#456B68]">
                                {reason.detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="rounded-r-2xl px-3 py-3">
                        {commentCell(row, row.messageCount, row.celebration?.checkinId)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CohortFocusDetailDrawer
        programId={programId}
        cohortId={cohortId}
        target={detail}
        onClose={() => setDetail(null)}
        onCompose={setCompose}
      />
      <CohortMessageComposeDialog
        programId={programId}
        cohortId={cohortId}
        target={compose}
        onClose={() => setCompose(null)}
        onSent={() => void query.mutate()}
      />
    </div>
  );
}

function FocusCriteriaInfo({ label, content }: { label: string; content: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full text-[#0D7773] hover:bg-[#EAF7F5]"
          aria-label={label}
        >
          <Info className="size-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        className="w-80 max-w-[calc(100vw-2rem)] rounded-lg border-[#CDEBE8] bg-[#0D3036] px-3 py-2 text-xs leading-relaxed whitespace-pre-line text-white shadow-md"
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}

function EmptyState() {
  const t = useTranslations("lighthouse");
  return (
    <p className="rounded-2xl border border-dashed border-[#B9DCD8] px-6 py-12 text-center text-sm text-[#5A7B79]">
      {t("focus_empty")}
    </p>
  );
}
