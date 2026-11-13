"use client";

import { DefaultAvatarSvg } from "@daodao/assets";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { format, isValid, parseISO } from "date-fns";
import { enUS, zhTW } from "date-fns/locale";
import type { ReactNode } from "react";

type PreviewSession = {
  sessionDate: string;
  startTime: string;
  endTime: string;
};

export type ActivityPreviewData = {
  displayName: string;
  tagline: string;
  startDate: string;
  endDate: string;
  timezone: string;
  interactionModes: string[];
  sessions: PreviewSession[];
  location: string;
  feeType: "free" | "paid";
  feeAmount: string;
  capacity: string;
  templateCount: number;
  programName: string;
  programDescription: string;
  organizationName: string;
  organizationBio: string;
  hostName: string;
};

function formatDate(value: string, locale: string, pattern: string): string {
  if (!value) return "";
  const parsed = parseISO(value);
  return isValid(parsed)
    ? format(parsed, pattern, { locale: locale.startsWith("en") ? enUS : zhTW })
    : value;
}

function formatTime(value: string): string {
  return value.includes("T") ? formatDate(value, "en", "HH:mm") : value.slice(0, 5);
}

function PreviewIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const InteractionIcon = () => (
  <PreviewIcon>
    <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3" />
  </PreviewIcon>
);

const PeriodIcon = () => (
  <PreviewIcon>
    <path d="M8 2v4M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </PreviewIcon>
);

const SessionsIcon = () => (
  <PreviewIcon>
    <path d="M12.925 3.047a9 9 0 0 1 7.616 6.11" />
    <path d="M13 22a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2" />
    <path d="M3 12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2" />
    <path d="M3.889 15.9a9 9 0 0 0 5.247 4.632" />
    <circle cx="17" cy="14" r="2" />
    <circle cx="7" cy="4" r="2" />
  </PreviewIcon>
);

const LocationIcon = () => (
  <PreviewIcon>
    <path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </PreviewIcon>
);

const FeeIcon = () => (
  <PreviewIcon>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </PreviewIcon>
);

const PracticeIcon = () => (
  <PreviewIcon>
    <path d="m13 7 4.3 4.3" />
    <path d="m8 6 2-2" />
    <path d="m18 16 2-2" />
    <path d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8L2 21.4a.5.5 0 0 0 .6.6L7 20.7a2 2 0 0 0 .8-.5z" />
    <path d="m15 5 4 4" />
    <path d="m7 13 4 4" />
  </PreviewIcon>
);

const HostIcon = () => (
  <PreviewIcon>
    <circle cx="9" cy="7" r="3.5" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="m19 3 .9 2.1L22 6l-2.1.9L19 9l-.9-2.1L16 6l2.1-.9L19 3Z" />
  </PreviewIcon>
);

export function ActivityPagePreview({ preview }: { preview: ActivityPreviewData }) {
  const t = useTranslations("lighthouse");
  const detailT = useTranslations("explore_activities");
  const locale = useLocale();
  const tagline = preview.tagline || preview.programDescription;

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-8 pb-12 sm:px-6">
      <section className="flex flex-col gap-3" aria-labelledby="activity-preview-title">
        <h1
          id="activity-preview-title"
          className="m-0 text-2xl font-bold leading-[1.35] text-[#0D3036]"
        >
          {preview.displayName || t("cohort_preview_untitled")}
        </h1>
        {tagline && <p className="m-0 text-sm leading-[1.65] text-[#295E5C]">{tagline}</p>}
      </section>

      <div className="grid items-start gap-6 min-[761px]:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section
            className="flex flex-col gap-5 rounded-2xl border border-[#DCEBEA] bg-white p-5"
            aria-label={t("cohort_preview_activity_details")}
          >
            <div className="flex flex-col gap-5">
              <DetailRow icon={<InteractionIcon />} label={detailT("detail_mode_label")}>
                <div className="flex flex-wrap gap-1.5">
                  {preview.interactionModes.map((mode) => (
                    <span
                      key={mode}
                      className="inline-flex min-h-6 items-center rounded-full bg-[#F5FFFD] px-2 py-0.5 text-xs leading-[18px] text-[#295E5C]"
                    >
                      {detailT(`detail_mode_${mode}`)}
                    </span>
                  ))}
                </div>
              </DetailRow>

              <DetailRow icon={<PeriodIcon />} label={t("cohort_preview_period")} showLabel>
                <span className="text-sm leading-[1.5] text-[#0D3036]">
                  {formatDate(preview.startDate, locale, "yyyy/MM/dd")}
                  {preview.endDate && ` – ${formatDate(preview.endDate, locale, "yyyy/MM/dd")}`}
                </span>
              </DetailRow>

              {preview.sessions.length > 0 && (
                <DetailRow
                  icon={<SessionsIcon />}
                  label={detailT("detail_sessions_label")}
                  showLabel
                >
                  <div className="flex flex-col gap-1.5">
                    {preview.sessions.map((session, index) => (
                      <div
                        key={`${session.sessionDate}-${index}`}
                        className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm leading-[1.5] text-[#0D3036]"
                      >
                        <span>{formatDate(session.sessionDate, locale, "yyyy/MM/dd · EEEE")}</span>
                        {(session.startTime || session.endTime) && (
                          <span className="text-[#456B68]">
                            {formatTime(session.startTime)}
                            {session.endTime && ` – ${formatTime(session.endTime)}`}
                            <span className="ml-1 text-xs text-[#295E5C]/65">
                              {preview.timezone}
                            </span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailRow>
              )}

              <DetailRow icon={<LocationIcon />} label={detailT("detail_location_label")}>
                <span className="text-sm leading-[1.5] text-[#0D3036]">
                  {preview.location || "N/A"}
                </span>
              </DetailRow>

              <DetailRow icon={<FeeIcon />} label={detailT("detail_fee_label")}>
                <span className="text-sm leading-[1.5] text-[#0D3036]">
                  {preview.feeType === "paid"
                    ? detailT("detail_fee_paid", { amount: preview.feeAmount || "0" })
                    : detailT("detail_fee_free")}
                </span>
              </DetailRow>

              <DetailRow icon={<PracticeIcon />} label={t("cohort_preview_practice_label")}>
                <span className="text-sm leading-[1.5] text-[#0D3036]">
                  {preview.templateCount > 0
                    ? t("cohort_preview_practice_count", { count: preview.templateCount })
                    : "N/A"}
                </span>
              </DetailRow>
            </div>
          </section>

          <div className="w-full">
            <Button
              disabled
              title={t("cohort_preview_join_disabled")}
              className="min-h-10 w-full rounded-full bg-[#16B9B3] px-4 py-2 text-sm font-bold leading-5 text-white hover:bg-[#16B9B3]"
            >
              {t("cohort_preview_join_button")}
            </Button>
          </div>

          {(preview.programName || preview.programDescription) && (
            <section className="flex flex-col gap-3" aria-labelledby="program-preview-title">
              <h2
                id="program-preview-title"
                className="m-0 text-base font-bold leading-6 text-[#0D3036]"
              >
                {t("cohort_preview_program_about")}
              </h2>
              {preview.programName && (
                <p className="m-0 text-sm font-bold leading-[1.5] text-[#0D3036]">
                  {preview.programName}
                </p>
              )}
              {preview.programDescription && (
                <p className="m-0 text-[13px] leading-[1.7] text-[#295E5C]">
                  {preview.programDescription}
                </p>
              )}
            </section>
          )}
        </div>

        <aside
          className="flex min-w-0 flex-col gap-4"
          aria-label={t("cohort_preview_activity_intro")}
        >
          <section className="flex flex-col gap-3 rounded-2xl border border-[#DCEBEA] bg-white p-5">
            <h2 className="m-0 flex items-center gap-1.5 text-base font-bold leading-6 text-[#0D3036]">
              <span className="[&>svg]:size-4 [&>svg]:stroke-[1.6]">
                <HostIcon />
              </span>
              {detailT("detail_host_label")}
            </h2>
            <div className="flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#F1F8F7]">
                <DefaultAvatarSvg className="size-6 rounded-full" />
              </span>
              <span className="text-sm font-medium leading-[21px] text-[#0D3036]">
                {preview.hostName || preview.organizationName || "—"}
              </span>
            </div>
          </section>

          {(preview.organizationName || preview.organizationBio) && (
            <section className="flex flex-col gap-2" aria-label={t("cohort_preview_organization")}>
              {preview.organizationName && (
                <p className="m-0 text-sm font-medium leading-[21px] text-[#0D3036]">
                  {preview.organizationName}
                </p>
              )}
              {preview.organizationBio && (
                <p className="m-0 text-sm leading-[1.6] text-[#295E5C]/70">
                  {preview.organizationBio}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

function DetailRow({
  icon,
  label,
  children,
  showLabel = false,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  showLabel?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex min-h-[21px] w-[18px] shrink-0 items-center justify-center text-[#295E5C]/65 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.6]">
        {icon}
      </span>
      <div className="detail-value min-w-0 text-sm leading-[1.5] text-[#0D3036]">
        <span
          className={
            showLabel
              ? "detail-caption mb-0.5 block text-[11px] leading-4 text-[#789092]"
              : "sr-only"
          }
        >
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}
