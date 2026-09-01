"use client";

import { useLighthouseParticipantCheckins } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { format, parseISO } from "date-fns";

interface CohortCheckinDrawerProps {
  programId: number;
  cohortId: number;
  person: {
    userId: number;
    nickname: string | null;
    practiceId: number;
    practiceTitle: string;
  } | null;
  onClose: () => void;
}

/** FR-TF-04 打卡紀錄抽屜：右側滑入、寬 min(420px, 92vw)、點遮罩關閉 */
export function CohortCheckinDrawer({
  programId,
  cohortId,
  person,
  onClose,
}: CohortCheckinDrawerProps) {
  const t = useTranslations("lighthouse");
  const query = useLighthouseParticipantCheckins(
    programId,
    cohortId,
    person?.userId,
    person?.practiceId
  );
  const data = query.data?.data;

  return (
    <Sheet open={person !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[min(420px,92vw)] overflow-y-auto bg-white p-0">
        <SheetHeader className="items-start border-b border-[#DDEFED] px-5 pt-5 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
            {t("checkin_records")}
          </p>
          <SheetTitle className="text-left text-xl font-semibold text-[#0D3036]">
            {person?.nickname || t("learner")}
          </SheetTitle>
          <SheetDescription className="text-xs text-[#5A7B79]">
            {data?.practice.title ?? person?.practiceTitle}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-4">
          {query.isLoading && <p className="text-sm text-[#78928F]">{t("loading")}</p>}
          {data && (
            <p className="text-xs text-[#78928F]">
              {t("checkin_records_count", { count: data.total })}
            </p>
          )}
          {data && data.items.length === 0 && (
            <p className="mt-3 rounded-2xl border border-dashed border-[#B9DCD8] px-4 py-8 text-center text-sm text-[#5A7B79]">
              {t("checkin_records_empty")}
            </p>
          )}
          <ul className="mt-3 grid gap-3">
            {data?.items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-[#DDEFED] bg-[#F9FDFC] p-4">
                <p className="font-mono text-xs text-[#0D7773]">
                  {format(parseISO(item.checkinDate), "yyyy/MM/dd")}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#0D3036]">
                  {item.note || t("checkin_without_note")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
