"use client";

import { type MyBugReport, useMyBugReports } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Inbox, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  areaLabelKey,
  reportIdFromSearch,
  safeLinkHref,
  statusLabelKey,
} from "./my-bug-reports-view";

const statusBadgeClass: Record<MyBugReport["status"], string> = {
  pending: "bg-[#FFF4E5] text-[#B25E09]",
  replied: "bg-logo-cyan/10 text-logo-cyan",
  closed: "bg-[#F0F3F3] text-light-gray",
};

function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function ReportCard({ report, highlighted }: { report: MyBugReport; highlighted: boolean }) {
  const t = useTranslations("app_product");
  const locale = useLocale();
  const areaKey = areaLabelKey(report.area);
  const linkHref = safeLinkHref(report.link);

  return (
    <article
      id={`bug-report-${report.id}`}
      className={cn(
        "rounded-xl border bg-white p-4 flex flex-col gap-3 scroll-mt-20",
        highlighted ? "border-logo-cyan ring-2 ring-logo-cyan/20" : "border-[#E4EAE9]"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={cn("rounded-full px-2.5 py-0.5 font-medium", statusBadgeClass[report.status])}
        >
          {t(statusLabelKey(report.status))}
        </span>
        {areaKey && (
          <span className="rounded-full border border-[#E4EAE9] px-2.5 py-0.5 text-text-dark">
            {t(areaKey)}
          </span>
        )}
        <time dateTime={report.createdAt} className="text-light-gray">
          {formatDateTime(report.createdAt, locale)}
        </time>
      </div>

      <p className="whitespace-pre-wrap break-words text-sm text-text-dark">{report.content}</p>

      {report.link && (
        <p className="text-sm break-all">
          <span className="text-light-gray">{t("bug_mine_link")}</span>
          {linkHref ? (
            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-logo-cyan underline underline-offset-2"
            >
              {report.link}
            </a>
          ) : (
            <span className="text-text-dark">{report.link}</span>
          )}
        </p>
      )}

      {report.screenshots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {report.screenshots.map((url, index) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block size-20 overflow-hidden rounded-lg border border-[#E4EAE9]"
            >
              <img
                src={url}
                alt={t("bug_mine_screenshot_alt", { index: index + 1 })}
                loading="lazy"
                className="size-full object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <div className="border-t border-[#E4EAE9] pt-3">
        <p className="text-xs font-medium text-light-gray mb-2">{t("bug_mine_replies_title")}</p>
        {report.replies.length === 0 ? (
          <p className="text-sm text-light-gray">{t("bug_mine_no_reply")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {report.replies.map((reply) => (
              <li key={reply.id} className="rounded-lg bg-[#F5F8F8] px-3 py-2">
                <p className="whitespace-pre-wrap break-words text-sm text-text-dark">
                  {reply.content}
                </p>
                <time dateTime={reply.createdAt} className="mt-1 block text-xs text-light-gray">
                  {formatDateTime(reply.createdAt, locale)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function MyBugReports() {
  const t = useTranslations("app_product");
  const searchParams = useSearchParams();
  const highlightId = reportIdFromSearch(searchParams.get("report"));
  const { data, isLoading, error, mutate } = useMyBugReports();
  const items = data?.data?.items ?? [];
  const scrolledId = useRef<number | null>(null);

  const highlightVisible = highlightId !== null && items.some((item) => item.id === highlightId);
  useEffect(() => {
    if (!highlightVisible || scrolledId.current === highlightId) return;
    scrolledId.current = highlightId;
    document.getElementById(`bug-report-${highlightId}`)?.scrollIntoView({ block: "start" });
  }, [highlightVisible, highlightId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-light-gray">
        <Loader2 className="size-4 animate-spin" />
        {t("bug_mine_loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-text-dark">{t("bug_mine_load_failed")}</p>
        <Button variant="outline" onClick={() => mutate()}>
          {t("bug_mine_retry")}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Inbox className="size-10 text-[#9FB5B8]" />
        <p className="text-sm text-light-gray">{t("bug_mine_empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((report) => (
        <ReportCard key={report.id} report={report} highlighted={report.id === highlightId} />
      ))}
    </div>
  );
}
