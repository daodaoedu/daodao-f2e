"use client";

import {
  inviteLighthouseCohortMembers,
  pauseLighthouseJoining,
  removeLighthouseCohortMember,
  resendLighthouseCohortInvitation,
  rotateLighthouseJoinToken,
  useLighthouseCohort,
  useLighthouseCohortEnrollments,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { Link2Off, RefreshCw, Send, Upload, UserMinus } from "lucide-react";
import { useState } from "react";
import { JoinCode } from "./join-code";

interface CohortRosterProps {
  programId: number;
  cohortId: number;
}

type PreviewItem = {
  email: string;
  valid: boolean;
  reason: string | null;
  enrollmentId: number | null;
};

export function CohortRoster({ programId, cohortId }: CohortRosterProps) {
  const t = useTranslations("lighthouse");
  const cohortQuery = useLighthouseCohort(programId, cohortId);
  const enrollmentQuery = useLighthouseCohortEnrollments(programId, cohortId);
  const cohort = cohortQuery.data?.data;
  const enrollments = enrollmentQuery.data?.data;
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [busy, setBusy] = useState(false);

  async function previewInvitations(formData: FormData) {
    const emails = String(formData.get("emails") ?? "")
      .split(/[\n,]/)
      .map((email) => email.trim())
      .filter(Boolean);
    setBusy(true);
    const response = await inviteLighthouseCohortMembers(programId, cohortId, {
      emails: emails.length ? emails : undefined,
      csv: csv || undefined,
      preview: true,
    });
    setBusy(false);
    if (response.error || !response.data) {
      toast.error(t("invitation_preview_failed"));
      return;
    }
    setPreview(response.data.data.items);
  }

  async function sendInvitations() {
    const validEmails = preview.filter((item) => item.valid).map((item) => item.email);
    if (!validEmails.length) return;
    setBusy(true);
    const response = await inviteLighthouseCohortMembers(programId, cohortId, {
      emails: validEmails,
      preview: false,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("invitation_send_failed"));
      return;
    }
    await enrollmentQuery.mutate();
    setPreview([]);
    setCsv("");
    toast.success(t("invitation_sent"));
  }

  async function handleCsv(file?: File) {
    setCsv(file ? await file.text() : "");
    setPreview([]);
  }

  async function resend(enrollmentId: number) {
    const response = await resendLighthouseCohortInvitation(programId, cohortId, enrollmentId);
    response.error
      ? toast.error(t("invitation_send_failed"))
      : toast.success(t("invitation_resent"));
  }

  async function remove(enrollmentId: number) {
    if (!window.confirm(t("member_remove_confirm"))) return;
    const response = await removeLighthouseCohortMember(programId, cohortId, enrollmentId);
    if (response.error) {
      toast.error(t("member_remove_failed"));
      return;
    }
    await enrollmentQuery.mutate();
    toast.success(t("member_removed"));
  }

  async function rotateToken() {
    if (!window.confirm(t("join_link_rotate_confirm"))) return;
    const response = await rotateLighthouseJoinToken(programId, cohortId);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await cohortQuery.mutate();
    toast.success(t("join_link_rotated"));
  }

  async function pauseJoining() {
    if (!window.confirm(t("joining_pause_confirm"))) return;
    const response = await pauseLighthouseJoining(programId, cohortId);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await cohortQuery.mutate();
    toast.success(t("joining_paused"));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("roster_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {cohort?.displayName ?? t("roster_title")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("roster_description")}</p>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          action={previewInvitations}
          className="rounded-3xl border border-[#CDEBE8] bg-white p-6"
        >
          <h2 className="text-xl font-semibold">{t("invite_people")}</h2>
          <label htmlFor="invite-emails" className="mt-5 grid gap-2 text-sm font-medium">
            {t("email_list")}
            <Textarea
              id="invite-emails"
              name="emails"
              placeholder="one@example.com&#10;two@example.com"
            />
          </label>
          <label htmlFor="invite-csv" className="mt-4 grid gap-2 text-sm font-medium">
            {t("csv_upload")}
            <Input
              id="invite-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void handleCsv(event.target.files?.[0])}
            />
          </label>
          <p className="mt-3 text-xs leading-5 text-[#78928F]">{t("roster_legal_notice")}</p>
          <Button type="submit" className="mt-5" disabled={busy}>
            <Upload className="size-4" />
            {t("preview_list")}
          </Button>
        </form>

        <div className="rounded-3xl border border-[#CDEBE8] bg-[#F0FBF9] p-6">
          <h2 className="text-lg font-semibold">{t("join_governance")}</h2>
          {cohort?.joinToken ? (
            <JoinCode joinToken={cohort.joinToken} />
          ) : (
            <p className="mt-4 text-sm text-[#5A7B79]">{t("joining_is_paused")}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={rotateToken}>
              <RefreshCw className="size-4" />
              {t("reset_join_link")}
            </Button>
            {cohort?.joinToken && (
              <Button variant="ghost" size="sm" onClick={pauseJoining}>
                <Link2Off className="size-4" />
                {t("pause_joining")}
              </Button>
            )}
          </div>
        </div>
      </section>

      {preview.length > 0 && (
        <section className="mt-6 rounded-3xl border border-[#CDEBE8] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{t("preview_result")}</h2>
            <Button
              onClick={sendInvitations}
              disabled={busy || !preview.some((item) => item.valid)}
            >
              <Send className="size-4" />
              {t("send_invitations")}
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-[#DDEFED]">
            {preview.map((item) => (
              <li key={item.email} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span>{item.email}</span>
                <span className={item.valid ? "text-[#0D7773]" : "text-red-600"}>
                  {item.valid ? t("valid") : item.reason}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white">
        <div className="border-b border-[#DDEFED] px-6 py-5">
          <h2 className="text-xl font-semibold">{t("roster_title")}</h2>
        </div>
        {!enrollments?.length ? (
          <p className="px-6 py-12 text-center text-sm text-[#5A7B79]">{t("roster_empty")}</p>
        ) : (
          <ul className="divide-y divide-[#DDEFED]">
            {enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{enrollment.nickname || enrollment.email}</p>
                  <p className="mt-1 text-xs text-[#78928F]">
                    {enrollment.email} · {t(`enrollment_role_${enrollment.role}`)}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#EDF8F6] px-3 py-1 text-xs font-semibold text-[#0D7773]">
                  {t(`enrollment_status_${enrollment.status}`)}
                </span>
                {enrollment.status === "invited" && (
                  <Button size="sm" variant="outline" onClick={() => resend(enrollment.id)}>
                    <RefreshCw className="size-4" />
                    {t("resend")}
                  </Button>
                )}
                {enrollment.status === "joined" && enrollment.role === "member" && (
                  <Button size="sm" variant="ghost" onClick={() => remove(enrollment.id)}>
                    <UserMinus className="size-4" />
                    {t("remove")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
