"use client";

import {
  inviteLighthouseCohortMembers,
  pauseLighthouseJoining,
  removeLighthouseCohortMember,
  resendLighthouseCohortInvitation,
  resumeLighthouseJoining,
  rotateLighthouseJoinToken,
  useLighthouseCohort,
  useLighthouseCohortEnrollments,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import { Copy, Link2, Link2Off, RefreshCw, Send, Upload, UserMinus } from "lucide-react";
import { useState } from "react";
import { CohortErrorState } from "./cohort-error-state";
import { JoinCode, useCopyJoinLink, useJoinUrl } from "./join-code";

interface CohortRosterProps {
  programId: number;
  cohortId: number;
}

/** FR-RS-03：預覽狀態——新邀請／已邀請／已加入／曾退出／格式錯誤各用不同顏色 */
type PreviewState = "new" | "invited" | "joined" | "rejoin" | "invalid";
type PreviewItem = {
  email: string;
  valid: boolean;
  reason: string | null;
  enrollmentId: number | null;
  state?: PreviewState;
};
const PREVIEW_STATE_STYLES: Record<PreviewState, string> = {
  new: "bg-[#EDF8F6] text-[#0D7773]",
  invited: "bg-[#FFF6E8] text-[#A95D00]",
  joined: "bg-[#F1F4F4] text-[#5A7B79]",
  rejoin: "bg-[#E7FAF7] text-[#0D5B59]",
  invalid: "bg-[#FDECEC] text-[#C03A3A]",
};
/** FR-RS-04：已加入綠底；待確認（已邀請）淺橘；退出／移除灰底 */
const ENROLLMENT_STATUS_STYLES: Record<"invited" | "joined" | "exited" | "removed", string> = {
  joined: "bg-[#EDF8F6] text-[#0D7773]",
  invited: "bg-[#FFF6E8] text-[#A95D00]",
  exited: "bg-[#F1F4F4] text-[#5A7B79]",
  removed: "bg-[#F1F4F4] text-[#5A7B79]",
};

const previewState = (item: PreviewItem): PreviewState =>
  item.state ?? (item.valid ? "new" : "invalid");

export function CohortRoster({ programId, cohortId }: CohortRosterProps) {
  const t = useTranslations("lighthouse");
  const { openWarningDialog } = useDialog();
  const cohortQuery = useLighthouseCohort(programId, cohortId);
  const enrollmentQuery = useLighthouseCohortEnrollments(programId, cohortId);
  const cohort = cohortQuery.data?.data;
  const enrollments = enrollmentQuery.data?.data;
  const joinUrl = useJoinUrl(cohort?.joinToken);
  const copyJoinLink = useCopyJoinLink(joinUrl);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [busy, setBusy] = useState(false);
  const joinOpen = Boolean(cohort?.joinToken) && !cohort?.joinPaused;

  async function confirm(title: string, message: string, actionLabel: string, danger = false) {
    const result = await openWarningDialog({
      title,
      message,
      buttons: [
        { label: t("cancel"), value: "cancel", variant: "outline" },
        { label: actionLabel, value: "ok", variant: danger ? "orange" : "default" },
      ],
    });
    return result.value === "ok";
  }

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
    try {
      const response = await resendLighthouseCohortInvitation(programId, cohortId, enrollmentId);
      if (response.error) {
        toast.error(t("invitation_send_failed"));
        return;
      }
      await enrollmentQuery.mutate();
      toast.success(t("invitation_resent"));
    } catch {
      toast.error(t("invitation_send_failed"));
    }
  }

  async function remove(enrollmentId: number) {
    if (!(await confirm(t("remove"), t("member_remove_confirm"), t("remove"), true))) return;
    const response = await removeLighthouseCohortMember(programId, cohortId, enrollmentId);
    if (response.error) {
      toast.error(t("member_remove_failed"));
      return;
    }
    await enrollmentQuery.mutate();
    toast.success(t("member_removed"));
  }

  async function rotateToken() {
    if (!(await confirm(t("reset_join_link"), t("join_link_rotate_confirm"), t("reset_join_link"))))
      return;
    const response = await rotateLighthouseJoinToken(programId, cohortId);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await cohortQuery.mutate();
    toast.success(t("join_link_rotated"));
  }

  async function pauseJoining() {
    if (!(await confirm(t("pause_joining"), t("joining_pause_confirm"), t("pause_joining"))))
      return;
    const response = await pauseLighthouseJoining(programId, cohortId);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await cohortQuery.mutate();
    toast.success(t("joining_paused"));
  }

  async function resumeJoining() {
    const response = await resumeLighthouseJoining(programId, cohortId);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await cohortQuery.mutate();
    toast.success(t("joining_resumed"));
  }

  if (cohortQuery.isLoading || enrollmentQuery.isLoading)
    return <p className="px-10 py-12 text-sm text-[#5A7B79]">{t("loading")}</p>;
  if (
    cohortQuery.error ||
    cohortQuery.validationError ||
    enrollmentQuery.error ||
    enrollmentQuery.validationError
  )
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => {
          void cohortQuery.mutate();
          void enrollmentQuery.mutate();
        }}
      />
    );

  const pendingCount = enrollments?.filter((item) => item.status === "invited").length ?? 0;
  const memberCount = enrollments?.filter((item) => item.status === "joined").length ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* FR-RS-01 邀請成員 */}
        <form
          action={previewInvitations}
          className="rounded-3xl border border-[#CDEBE8] bg-white p-6"
          aria-labelledby="roster-invite-title"
        >
          <h2 id="roster-invite-title" className="text-xl font-semibold">
            {t("invite_people")}
          </h2>
          <label htmlFor="invite-emails" className="mt-5 grid gap-2 text-sm font-medium">
            {t("email_list")}
            <Textarea
              id="invite-emails"
              name="emails"
              rows={4}
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
            <Upload className="size-4" aria-hidden="true" />
            {t("preview_list")}
          </Button>
        </form>

        {/* FR-RS-02 邀請連結 */}
        <section
          className="rounded-3xl border border-[#CDEBE8] bg-[#F0FBF9] p-6"
          aria-labelledby="roster-join-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="roster-join-title" className="text-lg font-semibold">
              {t("join_governance")}
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="border-[#CDEBE8] bg-white"
              onClick={copyJoinLink}
              disabled={!joinUrl || !joinOpen}
            >
              <Copy className="size-4" aria-hidden="true" />
              {t("copy_link")}
            </Button>
          </div>
          {joinOpen && cohort?.joinToken ? (
            <JoinCode joinToken={cohort.joinToken} hideCopyButton />
          ) : (
            <p className="mt-4 text-sm text-[#5A7B79]">{t("joining_is_paused")}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={rotateToken}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t("reset_join_link")}
            </Button>
            {joinOpen ? (
              <Button variant="ghost" size="sm" onClick={pauseJoining}>
                <Link2Off className="size-4" aria-hidden="true" />
                {t("pause_joining")}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={resumeJoining}>
                <Link2 className="size-4" aria-hidden="true" />
                {t("joining_resume")}
              </Button>
            )}
          </div>
        </section>
      </section>

      {/* FR-RS-03 預覽結果 */}
      {preview.length > 0 && (
        <section
          className="mt-6 rounded-3xl border border-[#CDEBE8] bg-white p-6"
          aria-labelledby="roster-preview-title"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="roster-preview-title" className="text-xl font-semibold">
              {t("preview_result")}
            </h2>
            <Button
              onClick={sendInvitations}
              disabled={busy || !preview.some((item) => item.valid)}
            >
              <Send className="size-4" aria-hidden="true" />
              {t("send_invitations")}
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-[#DDEFED]">
            {preview.map((item) => {
              const state = previewState(item);
              return (
                <li
                  key={item.email}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="truncate">{item.email}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      PREVIEW_STATE_STYLES[state]
                    )}
                    title={item.reason ?? undefined}
                  >
                    {t(`preview_state_${state}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* FR-RS-04 成員名單 */}
      <section
        className="mt-6 overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white"
        aria-labelledby="roster-list-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDEFED] px-6 py-5">
          <h2 id="roster-list-title" className="text-xl font-semibold">
            {t("roster_title")}
          </h2>
          <p className="text-xs text-[#78928F]">
            {pendingCount > 0
              ? t("roster_summary", { count: memberCount, pending: pendingCount })
              : t("roster_summary_no_pending", { count: memberCount })}
          </p>
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
                    {[
                      enrollment.email,
                      enrollment.joinedAt
                        ? t("joined_on", {
                            date: format(new Date(enrollment.joinedAt), "yyyy/MM/dd"),
                          })
                        : null,
                      enrollment.role !== "member" ? t(`enrollment_role_${enrollment.role}`) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                    ENROLLMENT_STATUS_STYLES[enrollment.status]
                  )}
                >
                  {t(`enrollment_status_${enrollment.status}`)}
                </span>
                {enrollment.status === "invited" && (
                  <Button size="sm" variant="outline" onClick={() => resend(enrollment.id)}>
                    <RefreshCw className="size-4" aria-hidden="true" />
                    {t("resend")}
                  </Button>
                )}
                {(enrollment.status === "joined" || enrollment.status === "invited") &&
                  enrollment.role === "member" && (
                    <Button size="sm" variant="ghost" onClick={() => remove(enrollment.id)}>
                      <UserMinus className="size-4" aria-hidden="true" />
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
