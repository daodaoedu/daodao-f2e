"use client";

import { joinCohort, useCohortJoinInfo } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { ArrowUpRight, Users } from "lucide-react";
import { useState } from "react";

export function CohortJoinPage({ joinToken }: { joinToken: string }) {
  const t = useTranslations("cohort");
  const router = useRouter();
  const { requireAuth } = useAuth();
  const query = useCohortJoinInfo(joinToken);
  const info = query.data?.data;
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function join() {
    if (!consent) return;
    setBusy(true);
    const response = await joinCohort(joinToken);
    setBusy(false);
    if (response.error || !response.data) {
      toast.error(t("join_failed"));
      return;
    }
    router.push(`/cohorts/${response.data.data.cohortId}`);
  }
  if (query.isLoading)
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-[#5A7B79]">
        {t("loading")}
      </div>
    );
  if (!info)
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <h1 className="text-xl font-semibold">{t("link_invalid")}</h1>
      </div>
    );
  if (!info.canJoin)
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-3xl border border-[#CDEBE8] bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">{t(`unavailable_${info.unavailableReason}`)}</h1>
          <p className="mt-4 text-[#5A7B79]">{info.organization.bio || t("unavailable_copy")}</p>
          {info.organization.externalLink && (
            <a
              href={info.organization.externalLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1 rounded-full bg-[#0D3036] px-5 py-3 font-semibold text-white"
            >
              {t("see_next_cohort")}
              <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="rounded-3xl border border-[#CDEBE8] bg-white p-7 md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
          <Users className="size-5" />
        </span>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#0D7773]">
          {info.organization.name}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{info.displayName}</h1>
        <p className="mt-3 text-[#5A7B79]">{info.inviteMessage || t("join_default_message")}</p>
        <p className="mt-2 text-xs text-[#78928F]">
          {info.startDate.slice(0, 10)} — {info.endDate.slice(0, 10)}
        </p>
        <label className="mt-8 flex items-start gap-3 rounded-2xl bg-[#FFF6E8] p-4 text-sm leading-6">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 size-4 accent-[#0D7773]"
          />
          <span>{t("visibility_consent")}</span>
        </label>
        <Button
          className="mt-6 w-full"
          size="huge"
          disabled={!consent || busy}
          onClick={() => requireAuth(join, { redirectUrl: window.location.href, source: "app" })}
        >
          {t("agree_and_join")}
        </Button>
      </div>
    </div>
  );
}
