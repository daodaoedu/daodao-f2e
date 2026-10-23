"use client";

import type { FutureLetterType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { format, parseISO } from "date-fns";

type ReadableLetter = FutureLetterType & { sentAt?: string | null; openedAt?: string | null };

export function LetterDetailCard({ letter }: { letter: ReadableLetter }) {
  const t = useTranslations("future_letter");
  const sentAt = letter.sentAt ?? letter.createdAt;
  const deliveredAt = letter.deliveredAt ?? letter.deliverAt;

  return (
    <article data-testid="letter-detail-card" className="text-[#493D22]">
      <div className="flex flex-wrap items-center gap-2 pr-10">
        <span className="rounded-full bg-[#F3EBCF] px-3 py-1 text-[11px] font-medium text-[#796526]">
          {t("detail_read_badge")}
        </span>
        <span className="text-xs text-[#A28C58]">
          {format(parseISO(sentAt), "yyyy/MM/dd")}
          {deliveredAt && ` → ${format(parseISO(deliveredAt), "yyyy/MM/dd")}`}
        </span>
      </div>
      {letter.currentSelf && (
        <section className="mt-7">
          <h3 className="text-xs font-medium text-[#A47D29]">{t("detail_then_label")}</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-[1.9]">
            {letter.currentSelf}
          </p>
        </section>
      )}
      {letter.message && (
        <section className="mt-7">
          <h3 className="text-xs font-medium text-[#A47D29]">{t("detail_message_label")}</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-[1.9]">
            {letter.message}
          </p>
        </section>
      )}
      {letter.practice?.title && (
        <p className="mt-8 border-t border-[#E8DDB9] pt-4 text-sm text-[#796526]">
          {t("practice_snapshot_label")} · {letter.practice.title}
        </p>
      )}
    </article>
  );
}
