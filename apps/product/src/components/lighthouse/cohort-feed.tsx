"use client";

import type { IShowcaseCheckIn } from "@daodao/api";
import {
  createLighthouseEncouragementDraft,
  sendLighthouseEncouragement,
  useLighthouseCoachFeed,
  useLighthouseCohort,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Empty, EmptyDescription } from "@daodao/ui/components/empty";
import { Spinner } from "@daodao/ui/components/spinner";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { CheckInShowcaseCard } from "@/components/showcase/CheckInShowcaseCard";
import { CohortErrorState } from "./cohort-error-state";

interface CohortFeedProps {
  programId: number;
  cohortId: number;
}

function CoachFeedItem({
  programId,
  cohortId,
  item,
}: {
  programId: number;
  cohortId: number;
  item: {
    id: string;
    checkinDate: string;
    mood: string | null;
    note: string | null;
    tags: string[];
    imageUrls: string[];
    createdAt: string;
    practice: { id: string; title: string };
    user?: {
      id: string;
      name: string;
      photoUrl: string | null;
      customId: string | null;
    };
    commentCount: number;
    commentPreview: {
      id: string;
      content: string;
      createdAt: string;
      user?: {
        id: string;
        name: string;
        photoUrl: string | null;
        customId: string | null;
      };
    }[];
  };
}) {
  const t = useTranslations("lighthouse");
  const [draft, setDraft] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function generateDraft() {
    setBusy(true);
    const response = await createLighthouseEncouragementDraft(
      programId,
      cohortId,
      Number(item.id),
    );
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
    const response = await sendLighthouseEncouragement(
      programId,
      cohortId,
      Number(item.id),
      draft.trim(),
    );
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    setDraft("");
    setIsComposing(false);
    toast.success(t("encouragement_sent"));
  }

  const showcaseProps: IShowcaseCheckIn = {
    id: item.id,
    checkin_date: item.checkinDate,
    mood: item.mood as IShowcaseCheckIn["mood"],
    note: item.note,
    tags: item.tags,
    image_urls: item.imageUrls,
    created_at: item.createdAt,
    practice: item.practice,
    user: item.user
      ? {
          id: item.user.id,
          name: item.user.name,
          photo_url: item.user.photoUrl,
          custom_id: item.user.customId,
        }
      : undefined,
    comment_count: item.commentCount,
    comment_preview: item.commentPreview.map((c) => ({
      id: c.id,
      content: c.content,
      created_at: c.createdAt,
      user: c.user
        ? {
            id: c.user.id,
            name: c.user.name,
            photo_url: c.user.photoUrl,
            custom_id: c.user.customId,
          }
        : undefined,
    })),
  };

  const coachFooter = (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={generateDraft}
          disabled={busy}
        >
          <Sparkles className="size-4" />
          {t("ai_draft")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsComposing(true)}
          disabled={busy}
        >
          <MessageCircle className="size-4" />
          {t("write_comment")}
        </Button>
      </div>

      {isComposing && (
        <div className="mt-3 rounded-xl bg-primary-palest p-4">
          <label
            htmlFor={`draft-${item.id}`}
            className="text-sm font-semibold text-text-dark"
          >
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
            <Button
              size="sm"
              onClick={submit}
              disabled={busy || !draft.trim()}
            >
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
    </>
  );

  return <CheckInShowcaseCard {...showcaseProps} footer={coachFooter} />;
}

export function CohortFeed({ programId, cohortId }: CohortFeedProps) {
  const t = useTranslations("lighthouse");
  const cohort = useLighthouseCohort(programId, cohortId).data?.data;
  const query = useLighthouseCoachFeed(programId, cohortId);
  const feed = query.data?.data;

  if (query.isLoading)
    return (
      <div className="flex items-center justify-center px-10 py-12">
        <Spinner className="size-6" />
      </div>
    );
  if (query.error || query.validationError)
    return (
      <CohortErrorState
        message={t("load_failed")}
        retryLabel={t("retry")}
        onRetry={() => void query.mutate()}
      />
    );

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:px-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-logo-cyan">
          {t("feed_eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-bg-dark">
          {cohort?.displayName ?? t("cohort_nav_feed")}
        </h1>
        <p className="mt-3 text-sm text-basic-400">{t("feed_description")}</p>
      </header>
      <div className="mt-8 grid gap-5">
        {!feed?.items.length && (
          <Empty>
            <EmptyDescription>{t("feed_empty")}</EmptyDescription>
          </Empty>
        )}
        {feed?.items.map((item) => (
          <CoachFeedItem
            key={item.id}
            programId={programId}
            cohortId={cohortId}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}
