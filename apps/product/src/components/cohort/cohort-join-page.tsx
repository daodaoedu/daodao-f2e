"use client";

import { joinCohort, useCohortJoinInfo } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { ArrowUpRight, Users } from "lucide-react";
import { useState } from "react";
import { resolveJoinConsentCopy } from "@/utils/cohort-join-consent";
import { resolveJoinUnavailableCopy } from "@/utils/cohort-join-unavailable";

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
      // 頁面開著期間場次可能已截止或暫停：重新取加入資訊，畫面改顯示不可加入的原因（daodao#281）
      void query.mutate();
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
  if (!info.canJoin) {
    const copy = resolveJoinUnavailableCopy(info);
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-3xl border border-[#CDEBE8] bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">{t(copy?.titleKey ?? "unavailable_null")}</h1>
          {/* 依原因補一行說明：截止顯示截止日、其餘成立的原因逐行列出、單純暫停提示改用邀請信（daodao#281） */}
          {copy?.showDeadline && (
            <p className="mt-2 text-sm text-[#78928F]">
              {t("unavailable_expired_deadline", {
                date: (info.joinDeadline ?? info.endDate).slice(0, 10),
              })}
            </p>
          )}
          {copy?.alsoKeys.map((key) => (
            <p key={key} className="mt-2 text-sm text-[#78928F]">
              {t(key)}
            </p>
          ))}
          {copy?.showPausedCopy && (
            <p className="mt-2 text-sm text-[#78928F]">{t("unavailable_paused_copy")}</p>
          )}
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
  }
  const consentCopy = resolveJoinConsentCopy(info.privacy);
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
          <span>{t(consentCopy.consentKey)}</span>
        </label>
        {consentCopy.pendingNoticeKey && (
          <p className="mt-3 text-xs leading-5 text-[#78928F]">{t(consentCopy.pendingNoticeKey)}</p>
        )}
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
