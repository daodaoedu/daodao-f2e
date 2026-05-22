import type { FeedReasonType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { CalendarCheck, Rss, ThumbsUp } from "lucide-react";

interface FeedLabelProps {
  feedReason: FeedReasonType;
  userName?: string;
  practiceTitle?: string;
  latestActorName?: string;
}

export function FeedLabel({
  feedReason,
  userName,
  practiceTitle,
  latestActorName,
}: FeedLabelProps) {
  const t = useTranslations("app_product");

  if (feedReason === "new_practice") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <ThumbsUp className="size-3.5 shrink-0" />
        <span>{t("showcase_feed_new_practice", { userName: userName ?? t("showcase_someone") })}</span>
      </div>
    );
  }

  if (feedReason === "new_release") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <Rss className="size-3.5 shrink-0" />
        <span>{t("showcase_latest_published")}</span>
      </div>
    );
  }

  if (feedReason === "checked_in") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <CalendarCheck className="size-3.5 shrink-0" />
        <span>
          {t("showcase_feed_checked_in", {
            userName: userName ?? t("showcase_someone"),
            practiceTitle: practiceTitle ?? t("showcase_fallback_practice"),
          })}
        </span>
      </div>
    );
  }

  if (feedReason === "cheered") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-dark/60 mt-4 mb-4 px-1">
        <ThumbsUp className="size-3.5 shrink-0" />
        <span>
          {t("showcase_feed_cheered", { actorName: latestActorName ?? t("showcase_someone") })}
        </span>
      </div>
    );
  }

  return null;
}
