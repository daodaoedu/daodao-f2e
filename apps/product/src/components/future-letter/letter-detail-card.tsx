"use client";

import type { FutureLetterType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { DialogClose } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { format, parseISO } from "date-fns";

type ReadableLetter = FutureLetterType & { sentAt?: string | null; openedAt?: string | null };

export function LetterDetailCard({ letter }: { letter: ReadableLetter }) {
  const t = useTranslations("future_letter");
  const sentAt = letter.sentAt ?? letter.createdAt;
  const deliveredAt = letter.deliveredAt ?? letter.deliverAt;

  return (
    <article data-testid="letter-detail-card" className="text-[#3F3A1E]">
      <div className="flex min-h-[30px] items-center gap-[10px]">
        <span className="rounded-full bg-[#EFE7C8] px-3 py-[3px] text-[11px] font-medium leading-[normal] text-[#6E6430]">
          {t("detail_read_badge")}
        </span>
        <span className="text-xs leading-[14px] text-[#8A7A2E]">
          {format(parseISO(sentAt), "yyyy/MM/dd")}
          {deliveredAt && ` → ${format(parseISO(deliveredAt), "yyyy/MM/dd")}`}
        </span>
        <DialogClose
          className="ml-auto flex h-[30px] w-[30px] items-center justify-center text-[20px] font-normal leading-[normal] text-[#A79432] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A79432]"
          aria-label={t("detail_close")}
        >
          <span aria-hidden="true" className="text-[20px] font-normal leading-[normal]">
            ×
          </span>
        </DialogClose>
      </div>
      {letter.currentSelf && (
        <section className="mt-5">
          <h3 className="text-xs font-medium leading-[17.5px] text-[#A87A22]">
            {t("detail_then_label")}
          </h3>
          <p className="mt-[6px] whitespace-pre-wrap break-words text-[15px] leading-[1.9]">
            {letter.currentSelf}
          </p>
        </section>
      )}
      {letter.message && (
        <section className="mt-[22px]">
          <h3 className="text-xs font-medium leading-[17.5px] text-[#A87A22]">
            {t("detail_message_label")}
          </h3>
          <p className="mt-[6px] whitespace-pre-wrap break-words text-[15px] leading-[1.9]">
            {letter.message}
          </p>
        </section>
      )}
      {letter.practice?.title && (
        <p className="mt-[26px] border-t border-[#EFE3B4] pt-4 text-[13px] leading-[18.5px] text-[#7C7440]">
          {t("practice_snapshot_label")} · {letter.practice.title}
        </p>
      )}
    </article>
  );
}
