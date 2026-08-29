"use client";

import {
  type LighthouseFocusCelebrationType,
  type LighthouseFocusEncouragementType,
  type LighthouseMessageCategory,
  useLighthouseFocus,
  useLighthouseOrganizations,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@daodao/ui/components/animate-ui/components/base/tooltip";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { Info, MessageCircle, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { CohortCheckinDrawer } from "./cohort-checkin-drawer";
import { CohortErrorState } from "./cohort-error-state";
import { CohortMessageComposeDialog, CohortMessageHistoryDialog } from "./cohort-message-dialogs";

interface CohortFocusProps {
  programId: number;
  cohortId: number;
}

type Tab = "encourage" | "celebrate";
type Person = {
  userId: number;
  nickname: string | null;
  practiceId: number;
  practiceTitle: string;
};
const day = (value: string): string => format(parseISO(value), "yyyy/MM/dd");

/** FRD 3.5 今日焦點：鼓勵／慶祝兩張表，實踐欄開抽屜、訊息紀錄與送出訊息開 modal */
export function CohortFocus({ programId, cohortId }: CohortFocusProps) {
  const t = useTranslations("lighthouse");
  const [tab, setTab] = useState<Tab>("encourage");
  const [drawer, setDrawer] = useState<Person | null>(null);
  const [history, setHistory] = useState<Person | null>(null);
  const [compose, setCompose] = useState<(Person & { category: LighthouseMessageCategory }) | null>(
    null
  );
  const query = useLighthouseFocus(programId, cohortId);
  const { organizations } = useLighthouseOrganizations();
  const organizationId = organizations?.[0]?.id;
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

  const name = (person: { nickname: string | null }) => person.nickname || t("learner");
  const practiceHeader = (
    <span className="inline-flex items-center gap-1">
      {t("col_practice")}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 rounded-full hover:bg-transparent"
              aria-label={t("practice_column_hint")}
            >
              <Info className="size-3.5" aria-hidden="true" />
            </Button>
          }
        />
        <TooltipPanel
          side="top"
          className="max-w-[240px] rounded-lg bg-[#0D3036] px-3 py-2 text-xs text-white"
        >
          {t("practice_column_hint")}
        </TooltipPanel>
      </Tooltip>
    </span>
  );
  const messageCell = (person: Person, count: number) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 rounded-full border-[#CDEBE8] px-3 text-xs"
      aria-label={t("message_history_open", { name: name(person) })}
      onClick={() => setHistory(person)}
    >
      <MessageSquareText className="size-3.5" aria-hidden="true" />
      {count > 0 ? count : t("messages_none")}
    </Button>
  );
  const sendCell = (person: Person, category: LighthouseMessageCategory) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9 rounded-full border-[#CDEBE8] bg-[#F0FBF9] text-[#0D7773]"
      aria-label={t("message_open_compose", { name: name(person) })}
      title={t("message_open_compose", { name: name(person) })}
      onClick={() => setCompose({ ...person, category })}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
    </Button>
  );
  const practiceCell = (person: Person) => (
    <Button
      type="button"
      variant="link"
      className="h-auto px-0 text-sm font-medium text-[#0D7773]"
      aria-label={t("open_checkin_records", { name: name(person) })}
      onClick={() => setDrawer(person)}
    >
      {person.practiceTitle}
    </Button>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10">
      <p className="text-[#5A7B79]">{t("focus_description")}</p>

      {/* FR-TF-01 子頁籤 */}
      <div
        className="mt-6 flex gap-2 rounded-full bg-[#E7FAF7] p-1.5"
        role="tablist"
        aria-label={t("cohort_nav_focus")}
      >
        {(["encourage", "celebrate"] as const).map((key) => {
          const count =
            key === "encourage" ? data?.needsEncouragement.length : data?.celebrations.length;
          const active = tab === key;
          return (
            <Button
              key={key}
              type="button"
              role="tab"
              id={`focus-tab-${key}`}
              aria-selected={active}
              aria-controls={`focus-panel-${key}`}
              data-chip={active ? "true" : undefined}
              variant="ghost"
              onClick={() => setTab(key)}
              className={cn(
                "h-10 flex-1 rounded-full text-sm font-semibold text-[#456B68] hover:bg-transparent hover:text-[#0D3036]",
                active && "bg-[#0D3036] text-white hover:bg-[#0D3036] hover:text-white"
              )}
            >
              {t(`focus_tab_${key}`)} · {count ?? 0}
            </Button>
          );
        })}
      </div>

      {/* FR-TF-02 鼓勵 */}
      <section
        id="focus-panel-encourage"
        role="tabpanel"
        aria-labelledby="focus-tab-encourage"
        hidden={tab !== "encourage"}
        className="mt-5 rounded-3xl border border-[#CDEBE8] bg-white p-4 md:p-6"
      >
        {!data?.needsEncouragement.length ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs text-[#78928F]">
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_participant")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {practiceHeader}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_last_checkin")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_days_since")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_messages")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_send_encouragement")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.needsEncouragement.map((item: LighthouseFocusEncouragementType) => (
                  <tr
                    key={`${item.userId}-${item.practiceId}`}
                    className="bg-white shadow-[0_0_0_1px_#DDEFED]"
                  >
                    <td className="rounded-l-2xl px-3 py-3 font-semibold">{name(item)}</td>
                    <td className="px-3 py-3">{practiceCell(item)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[#456B68]">
                      {day(item.lastCheckinDate)}
                    </td>
                    {/* TP-AG-03：純天數、中性橘色，不用警示色 */}
                    <td className="px-3 py-3 font-semibold text-[#A95D00]">
                      {t("days_count", { count: item.interruptedDays })}
                    </td>
                    <td className="px-3 py-3">{messageCell(item, item.messageCount)}</td>
                    <td className="rounded-r-2xl px-3 py-3">{sendCell(item, "encourage")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* FR-TF-03 慶祝 */}
      <section
        id="focus-panel-celebrate"
        role="tabpanel"
        aria-labelledby="focus-tab-celebrate"
        hidden={tab !== "celebrate"}
        className="mt-5 rounded-3xl border border-[#CDEBE8] bg-white p-4 md:p-6"
      >
        {!data?.celebrations.length ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[840px] w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs text-[#78928F]">
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_participant")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {practiceHeader}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_first_checkin")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_moment")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_messages")}
                  </th>
                  <th scope="col" className="px-3 py-1 font-medium">
                    {t("col_send_message")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.celebrations.map((item: LighthouseFocusCelebrationType) => (
                  <tr
                    key={`${item.userId}-${item.practiceId}-${item.moment}`}
                    className="bg-white shadow-[0_0_0_1px_#DDEFED]"
                  >
                    <td className="rounded-l-2xl px-3 py-3 font-semibold">{name(item)}</td>
                    <td className="px-3 py-3">{practiceCell(item)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[#456B68]">
                      {day(item.firstCheckinAt)}
                    </td>
                    <td className="px-3 py-3 text-[#0D5B59]">{item.momentDescription}</td>
                    <td className="px-3 py-3">{messageCell(item, item.messageCount)}</td>
                    <td className="rounded-r-2xl px-3 py-3">{sendCell(item, "celebrate")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CohortCheckinDrawer
        programId={programId}
        cohortId={cohortId}
        person={drawer}
        onClose={() => setDrawer(null)}
      />
      <CohortMessageHistoryDialog
        programId={programId}
        cohortId={cohortId}
        person={history}
        onClose={() => setHistory(null)}
      />
      <CohortMessageComposeDialog
        programId={programId}
        cohortId={cohortId}
        organizationId={organizationId}
        target={compose}
        onClose={() => setCompose(null)}
        onSent={() => void query.mutate()}
      />
    </div>
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
