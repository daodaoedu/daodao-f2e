"use client";

import {
  sendLighthouseMessage,
  useLighthouseCohort,
  useLighthouseParticipantMessages,
  useMutate,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import {
  useLighthouseOrganization,
  useLighthouseOrganizationGuard,
} from "./lighthouse-organization-context";
import { LIGHTHOUSE_SCOPE } from "./lighthouse-scope";

type Person = {
  userId: number;
  nickname: string | null;
  practiceId: number;
  practiceTitle: string;
};
interface HistoryProps {
  programId: number;
  cohortId: number;
  person: Person | null;
  onClose: () => void;
}

/** FR-TF-05 留言紀錄 modal：「與 {名字} 的往來」 */
export function CohortMessageHistoryDialog({ programId, cohortId, person, onClose }: HistoryProps) {
  const t = useTranslations("lighthouse");
  const query = useLighthouseParticipantMessages(programId, cohortId, person?.userId);
  const data = query.data?.data;
  const name = person?.nickname || t("learner");

  return (
    <Dialog open={person !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn("w-[min(480px,92vw)] rounded-[28px] border-0 bg-white p-6", LIGHTHOUSE_SCOPE)}
      >
        <DialogHeader className="items-start text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
            {t("message_history_tab")}
          </p>
          <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
            {t("message_history_title", { name })}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("message_history_tab")}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto">
          {query.isLoading && <p className="text-sm text-[#78928F]">{t("loading")}</p>}
          {data && data.items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#B9DCD8] px-4 py-8 text-center text-sm text-[#5A7B79]">
              {t("message_history_empty")}
            </p>
          )}
          <ul className="grid gap-3">
            {data?.items.map((item) => (
              <li
                key={`${item.source}-${item.id}`}
                className={`rounded-2xl border p-4 ${
                  item.source === "lighthouse"
                    ? "border-[#B9E5E1] bg-[#EAF7F5]"
                    : "border-[#DDEFED] bg-[#F9FDFC]"
                }`}
              >
                <p className="font-mono text-xs text-[#0D7773]">
                  {[
                    item.sentAt && format(parseISO(item.sentAt), "yyyy/MM/dd"),
                    item.senderNickname,
                    item.checkinId !== null && item.checkinId !== undefined
                      ? t("comment_target_checkin")
                      : item.source === "practice"
                        ? t("comment_source_practice")
                        : item.source === "checkin"
                          ? t("comment_source_checkin")
                          : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#0D3036]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ComposeProps {
  programId: number;
  cohortId: number;
  target: (Person & { checkinId?: number }) | null;
  onClose: () => void;
  onSent: () => void;
}

/** FR-TF-06 留言撰寫 modal：「給 {名字}」，留言目標選擇與送出 */
export function CohortMessageComposeDialog({
  programId,
  cohortId,
  target,
  onClose,
  onSent,
}: ComposeProps) {
  const t = useTranslations("lighthouse");
  const { organization } = useLighthouseOrganization();
  const cohort = useLighthouseCohort(programId, cohortId);
  const cohortName = cohort.data?.data.displayName;
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const mutate = useMutate();
  useLighthouseOrganizationGuard(Boolean(target && body), busy);
  const name = target?.nickname || t("learner");
  // 每次開啟清空上次內容；留言目標由打卡抽屜的選取狀態帶入
  useEffect(() => {
    if (target) {
      setBody("");
    }
  }, [target]);

  async function send() {
    if (!target || !body.trim() || !organization || !cohortName) return;
    setBusy(true);
    const response = await sendLighthouseMessage(programId, cohortId, target.userId, {
      body: body.trim(),
      practiceId: target.practiceId,
      checkinId: target.checkinId,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("message_send_failed"));
      return;
    }
    toast.success(t("message_sent"));
    void mutate([
      "/api/v1/lighthouse/programs/{programId}/cohorts/{cohortId}/participants/{userId}/messages",
      { params: { path: { programId, cohortId, userId: target.userId } } },
    ]);
    onSent();
    onClose();
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !busy && !open && onClose()}>
      <DialogContent
        className={cn("w-[min(480px,92vw)] rounded-[28px] border-0 bg-white p-6", LIGHTHOUSE_SCOPE)}
      >
        <DialogHeader className="items-start text-left">
          <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
            {t("message_compose_title", { name })}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-[#5A7B79]">
            {t("operation_destination", {
              organization: organization?.name ?? "",
              cohort: cohortName ?? "",
            })}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          className="mt-3 min-h-[120px]"
          placeholder={t("message_placeholder")}
          aria-label={t("message_placeholder")}
          disabled={busy}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <DialogFooter className="mt-2">
          <Button
            type="button"
            className="rounded-full bg-[#16B9B3] text-white hover:bg-[#12a39e]"
            onClick={() => void send()}
            disabled={busy || !body.trim() || !organization || !cohortName}
          >
            {t("message_send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
