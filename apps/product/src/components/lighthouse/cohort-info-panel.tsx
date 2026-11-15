"use client";

import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { CalendarDays, ExternalLink, Globe, Lock, MapPin, Video } from "lucide-react";

interface CohortInfo {
  timezone: string;
  tagline: string | null;
  interactionModes: string[];
  meetingUrl: string | null;
  location: string | null;
  sessions: {
    id: number;
    sessionDate: string;
    startTime: string | null;
    endTime: string | null;
  }[];
  feeType: string;
  feeAmount: number | null;
  signupMethod: string;
  externalSignupUrl: string | null;
  isPrivate: boolean;
}

export function CohortInfoPanel({ cohort }: { cohort: CohortInfo }) {
  const t = useTranslations("lighthouse");
  const modeLabels: Record<string, string> = {
    sync: t("cohort_interaction_mode_sync"),
    async: t("cohort_interaction_mode_async"),
    physical: t("cohort_interaction_mode_physical"),
  };

  return (
    <section
      id="cohort-information"
      className="mt-4 rounded-3xl border border-[#CDEBE8] bg-white p-5 md:p-6"
      aria-label={t("cohort_info_title")}
    >
      {cohort.tagline && <p className="mb-4 text-sm italic text-[#456B68]">{cohort.tagline}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cohort.interactionModes.length > 0 && (
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-xs font-medium text-[#78928F]">
                {t("cohort_info_interaction_modes")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cohort.interactionModes.map((mode) => (
                  <span
                    key={mode}
                    className="rounded-full bg-[#E7FAF7] px-2.5 py-1 text-xs font-medium text-[#0D5B59]"
                  >
                    {modeLabels[mode] ?? mode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {cohort.location && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-[#78928F]">{t("cohort_info_location")}</p>
              <p className="mt-0.5 text-sm text-[#0D3036]">{cohort.location}</p>
            </div>
          </div>
        )}
        {cohort.meetingUrl && (
          <div className="flex items-start gap-3">
            <Video className="mt-0.5 size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-[#78928F]">{t("cohort_info_meeting_url")}</p>
              <CustomLink
                href={cohort.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-sm text-[#0D7773] hover:underline"
              >
                {(() => {
                  try {
                    return new URL(cohort.meetingUrl).hostname;
                  } catch {
                    return cohort.meetingUrl;
                  }
                })()}
                <ExternalLink className="size-3" aria-hidden="true" />
              </CustomLink>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-sm font-medium text-[#0D7773]" aria-hidden="true">
            $
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="text-xs font-medium text-[#78928F]">{t("cohort_info_fee")}</p>
            <p className="text-sm text-[#0D3036]">
              {cohort.feeType === "paid"
                ? t("cohort_info_fee_paid", { amount: cohort.feeAmount ?? 0 })
                : t("cohort_info_fee_free")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ExternalLink className="mt-0.5 size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="text-xs font-medium text-[#78928F]">{t("cohort_info_signup_method")}</p>
            <p className="text-sm text-[#0D3036]">
              {cohort.signupMethod === "external"
                ? t("cohort_info_signup_external")
                : t("cohort_info_signup_island_form")}
            </p>
            {cohort.signupMethod === "external" && cohort.externalSignupUrl && (
              <CustomLink
                href={cohort.externalSignupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#0D7773] hover:underline"
              >
                {cohort.externalSignupUrl}
              </CustomLink>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          {cohort.isPrivate ? (
            <Lock className="mt-0.5 size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
          ) : (
            <Globe className="mt-0.5 size-4 shrink-0 text-[#0D7773]" aria-hidden="true" />
          )}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="text-xs font-medium text-[#78928F]">{t("cohort_info_privacy")}</p>
            <p className="text-sm text-[#0D3036]">
              {cohort.isPrivate ? t("cohort_info_private") : t("cohort_info_public_activity")}
            </p>
          </div>
        </div>
      </div>
      {cohort.sessions.length > 0 && (
        <div className="mt-4 border-t border-[#DDEFED] pt-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[#0D7773]" aria-hidden="true" />
            <p className="text-xs font-medium text-[#78928F]">{t("cohort_info_sessions")}</p>
            <span className="text-xs text-[#456B68]">({cohort.timezone})</span>
          </div>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {cohort.sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-[#DDEFED] px-3 py-2 text-sm text-[#0D3036]"
              >
                {session.sessionDate.slice(0, 10).replaceAll("-", "/")}
                {(session.startTime || session.endTime) && (
                  <span className="ml-2 text-[#78928F]">
                    {session.startTime ?? ""}
                    {session.startTime && session.endTime ? "–" : ""}
                    {session.endTime ?? ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
