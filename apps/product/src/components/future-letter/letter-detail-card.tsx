"use client";

import type { FutureLetterType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { format, parseISO } from "date-fns";
import { Mail } from "lucide-react";

type ReadableLetter = FutureLetterType & { sentAt?: string | null; openedAt?: string | null };

export function LetterDetailCard({ letter }: { letter: ReadableLetter }) {
  const t = useTranslations("future_letter");
  const sentAt = letter.sentAt ?? letter.createdAt;
  const deliveredAt = letter.deliveredAt ?? letter.deliverAt;

  return (
    <article
      data-testid="letter-detail-card"
      className="rounded-2xl border border-border bg-white p-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#E7FAF7]">
          <Mail className="size-5 text-logo-cyan" />
        </span>
        <div>
          <h3 className="font-bold text-text-dark">{t("detail_title")}</h3>
          <p className="text-xs text-text-secondary">
            {t("detail_dates", {
              sent: format(parseISO(sentAt), "yyyy/MM/dd"),
              delivered: deliveredAt ? format(parseISO(deliveredAt), "yyyy/MM/dd") : "",
            })}
          </p>
        </div>
      </div>
      {letter.currentSelf && (
        <section className="mt-5">
          <h4 className="text-sm font-bold text-text-dark">{t("field_current_self")}</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {letter.currentSelf}
          </p>
        </section>
      )}
      {letter.message && (
        <section className="mt-5 rounded-xl bg-[#FFF9E6] p-4">
          <h4 className="text-sm font-bold text-text-dark">{t("detail_message_label")}</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-dark">
            {letter.message}
          </p>
        </section>
      )}
      {letter.practice?.title && (
        <div className="mt-5 border-t border-border pt-4 text-sm">
          <span className="text-text-secondary">{t("practice_snapshot_label")}</span>
          <span className="ml-2 font-medium text-text-dark">{letter.practice.title}</span>
        </div>
      )}
    </article>
  );
}
