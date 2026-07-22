"use client";

import {
  createLighthouseEncouragementDraft,
  sendLighthouseEncouragement,
  upsertReaction,
  useLighthouseCoachFeed,
  useLighthouseCohort,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { format } from "date-fns";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

interface CohortFeedProps {
  programId: number;
  cohortId: number;
}

function FeedItem({
  programId,
  cohortId,
  item,
}: {
  programId: number;
  cohortId: number;
  item: {
    id: number;
    practiceId: number;
    nickname: string | null;
    checkinDate: string;
    mood: string | null;
    note: string | null;
  };
}) {
  const t = useTranslations("lighthouse");
  const [draft, setDraft] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [busy, setBusy] = useState(false);
  async function react() {
    const response = await upsertReaction({
      targetType: "checkin",
      targetId: String(item.id),
      reactionType: "encourage",
    });
    response.error ? toast.error(t("save_failed")) : toast.success(t("reaction_sent"));
  }
  async function generateDraft() {
    setBusy(true);
    const response = await createLighthouseEncouragementDraft(programId, cohortId, item.id);
    setBusy(false);
    if (response.error || !response.data) {
      toast.error(t("draft_failed"));
      return;
    }
    setDraft(response.data.data.draft);
    setIsComposing(true);
  }
  async function submit() {
    if (!draft.trim()) return;
    setBusy(true);
    const response = await sendLighthouseEncouragement(programId, cohortId, item.id, draft.trim());
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    setDraft("");
    setIsComposing(false);
    toast.success(t("encouragement_sent"));
  }
  return (
    <article className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{item.nickname || t("learner")}</h2>
          <p className="mt-1 text-xs text-[#78928F]">
            {format(new Date(item.checkinDate), "yyyy/MM/dd")}
          </p>
        </div>
        {item.mood && (
          <span className="rounded-full bg-[#FFF6E8] px-3 py-1 text-xs text-[#72593C]">
            {item.mood}
          </span>
        )}
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#345E5B]">
        {item.note || t("checkin_without_note")}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={react}>
          <Heart className="size-4" />
          {t("quick_encouragement")}
        </Button>
        <Button size="sm" variant="ghost" onClick={generateDraft} disabled={busy}>
          <Sparkles className="size-4" />
          {t("ai_draft")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsComposing(true)} disabled={busy}>
          <MessageCircle className="size-4" />
          {t("write_comment")}
        </Button>
      </div>
      {isComposing && (
        <div className="mt-4 rounded-2xl bg-[#F0FBF9] p-4">
          <label htmlFor={`draft-${item.id}`} className="text-sm font-semibold">
            {draft ? t("editable_draft") : t("write_comment")}
          </label>
          <Textarea
            id={`draft-${item.id}`}
            className="mt-2 bg-white"
            value={draft}
            placeholder={t("comment_placeholder")}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={submit} disabled={busy || !draft.trim()}>
              <MessageCircle className="size-4" />
              {t("send_comment")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft("");
                setIsComposing(false);
              }}
              disabled={busy}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

export function CohortFeed({ programId, cohortId }: CohortFeedProps) {
  const t = useTranslations("lighthouse");
  const cohort = useLighthouseCohort(programId, cohortId).data?.data;
  const query = useLighthouseCoachFeed(programId, cohortId);
  const feed = query.data?.data;
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 md:px-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
          {t("feed_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {cohort?.displayName ?? t("cohort_nav_feed")}
        </h1>
        <p className="mt-3 text-[#5A7B79]">{t("feed_description")}</p>
      </header>
      <div className="mt-8 grid gap-4">
        {!query.isLoading && !feed?.items.length && (
          <p className="rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-14 text-center text-sm text-[#5A7B79]">
            {t("feed_empty")}
          </p>
        )}
        {feed?.items.map((item) => (
          <FeedItem key={item.id} programId={programId} cohortId={cohortId} item={item} />
        ))}
      </div>
    </div>
  );
}
