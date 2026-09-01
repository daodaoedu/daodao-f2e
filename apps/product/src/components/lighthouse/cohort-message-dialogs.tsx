"use client";

import {
  createLighthouseMessageTemplate,
  deleteLighthouseMessageTemplate,
  type LighthouseMessageCategory,
  sendLighthouseMessage,
  useLighthouseMessageTemplates,
  useLighthouseParticipantMessages,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Person = {
  userId: number;
  nickname: string | null;
  practiceId: number;
  practiceTitle: string;
};
const NO_TEMPLATE = "__none__";

interface HistoryProps {
  programId: number;
  cohortId: number;
  person: Person | null;
  onClose: () => void;
}

/** FR-TF-05 訊息紀錄 modal：「與 {名字} 的往來」 */
export function CohortMessageHistoryDialog({ programId, cohortId, person, onClose }: HistoryProps) {
  const t = useTranslations("lighthouse");
  const query = useLighthouseParticipantMessages(programId, cohortId, person?.userId);
  const data = query.data?.data;
  const name = person?.nickname || t("learner");

  return (
    <Dialog open={person !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(480px,92vw)] rounded-[28px] border-0 bg-white p-6">
        <DialogHeader className="items-start text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0D7773]">
            {t("col_messages")}
          </p>
          <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
            {t("message_history_title", { name })}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("col_messages")}</DialogDescription>
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
              <li key={item.id} className="rounded-2xl border border-[#DDEFED] bg-[#F9FDFC] p-4">
                <p className="font-mono text-xs text-[#0D7773]">
                  {format(parseISO(item.sentAt), "yyyy/MM/dd")} ·{" "}
                  {t(`message_category_${item.category}`)}
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
  organizationId?: number;
  target: (Person & { category: LighthouseMessageCategory }) | null;
  onClose: () => void;
  onSent: () => void;
}

/** FR-TF-06 訊息撰寫 modal：「給 {名字}」，類別 pill、範本下拉、存成／刪除範本、送出 */
export function CohortMessageComposeDialog({
  programId,
  cohortId,
  organizationId,
  target,
  onClose,
  onSent,
}: ComposeProps) {
  const t = useTranslations("lighthouse");
  const [category, setCategory] = useState<LighthouseMessageCategory>("encourage");
  const [templateId, setTemplateId] = useState<string>(NO_TEMPLATE);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const templatesQuery = useLighthouseMessageTemplates(organizationId, category);
  const templates = templatesQuery.templates ?? [];
  const name = target?.nickname || t("learner");

  // 每次開啟依來源表格帶入類別，並清空上次內容
  useEffect(() => {
    if (target) {
      setCategory(target.category);
      setTemplateId(NO_TEMPLATE);
      setBody("");
    }
  }, [target]);

  function pickTemplate(value: string) {
    setTemplateId(value);
    const template = templates.find((item) => String(item.id) === value);
    if (template) setBody(template.body);
  }

  async function saveTemplate() {
    if (!organizationId || !body.trim()) return;
    setBusy(true);
    const response = await createLighthouseMessageTemplate(organizationId, {
      category,
      title: body.trim().slice(0, 30),
      body: body.trim(),
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("message_template_save_failed"));
      return;
    }
    await templatesQuery.mutate();
    setTemplateId(String(response.data.data.id));
    toast.success(t("message_template_saved"));
  }

  async function removeTemplate() {
    if (!organizationId || templateId === NO_TEMPLATE) return;
    setBusy(true);
    const response = await deleteLighthouseMessageTemplate(organizationId, Number(templateId));
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await templatesQuery.mutate();
    setTemplateId(NO_TEMPLATE);
    toast.success(t("message_template_deleted"));
  }

  async function send() {
    if (!target || !body.trim()) return;
    setBusy(true);
    const response = await sendLighthouseMessage(programId, cohortId, target.userId, {
      category,
      body: body.trim(),
      practiceId: target.practiceId,
      templateId: templateId === NO_TEMPLATE ? null : Number(templateId),
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("message_send_failed"));
      return;
    }
    toast.success(t("message_sent"));
    onSent();
    onClose();
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(480px,92vw)] rounded-[28px] border-0 bg-white p-6">
        <DialogHeader className="items-start text-left">
          <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
            {t("message_compose_title", { name })}
          </DialogTitle>
          <DialogDescription className="sr-only">{t("message_templates")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[#78928F]">{t("message_templates")}</span>
          <div
            className="flex gap-1 rounded-full bg-[#E7FAF7] p-1"
            role="radiogroup"
            aria-label={t("message_templates")}
          >
            {(["encourage", "celebrate"] as const).map((key) => (
              <Button
                key={key}
                type="button"
                role="radio"
                aria-checked={category === key}
                variant="ghost"
                size="sm"
                data-chip={category === key ? "true" : undefined}
                onClick={() => {
                  setCategory(key);
                  setTemplateId(NO_TEMPLATE);
                }}
                className={cn(
                  "h-7 rounded-full px-3 text-xs text-[#456B68] hover:bg-transparent",
                  category === key && "bg-[#0D3036] text-white hover:bg-[#0D3036] hover:text-white"
                )}
              >
                {t(`message_category_${key}`)}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={templateId} onValueChange={pickTemplate}>
            <SelectTrigger
              className="h-9 min-w-[200px] flex-1 text-sm"
              aria-label={t("message_template_select")}
            >
              <SelectValue placeholder={t("message_template_select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TEMPLATE}>{t("message_template_select")}</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={String(template.id)}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-[#CDEBE8]"
            onClick={saveTemplate}
            disabled={busy || !body.trim() || !organizationId}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {t("message_template_save")}
          </Button>
          {templateId !== NO_TEMPLATE && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-[#C03A3A]"
              onClick={removeTemplate}
              disabled={busy}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {t("message_template_delete")}
            </Button>
          )}
        </div>
        <Textarea
          className="mt-3 min-h-[120px]"
          placeholder={t("message_placeholder")}
          aria-label={t("message_placeholder")}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={onClose}
            disabled={busy}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="rounded-full bg-[#16B9B3] text-white hover:bg-[#12a39e]"
            onClick={send}
            disabled={busy || !body.trim()}
          >
            {t("message_send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
