import { NotificationType, type NotificationTypeType } from "../constants/notification-type";
import { REACTION_CONFIG, type ReactionTypeType } from "../constants/reaction-type";
import type { INotificationApiItem } from "../hooks/useNotifications";

const BACKEND_TYPE_MAP: Record<string, NotificationTypeType> = {
  Reaction: NotificationType.reaction,
  Comment: NotificationType.comment,
  CommentReply: NotificationType.commentReply,
  Mention: NotificationType.mention,
  UserFollowed: NotificationType.followUser,
  PracticeFollowed: NotificationType.followPractice,
  Connect: NotificationType.connect,
  ConnectAccepted: NotificationType.agreeConnect,
  ConnectAgreed: NotificationType.connectAgree,
  ConnectRejected: NotificationType.connectRejected,
  BuddyRequest: NotificationType.buddyRequest,
  BuddyRequestFollower: NotificationType.buddyRequestFollower,
  BuddyAccepted: NotificationType.buddyAccepted,
  PracticeCreated: NotificationType.practiceCreated,
  PracticeFinished: NotificationType.updatePracticeFinish,
  PracticeCheckinActivity: NotificationType.updatePracticeCheckin,
  PartnerCheckinActivity: NotificationType.updatePracticeCheckin,
  PracticeUpdateActivity: NotificationType.updatePractice,
  PartnerUpdateActivity: NotificationType.updatePractice,
  CohortInvitation: NotificationType.cohortInvitation,
  CohortMemberRemoved: NotificationType.cohortMemberRemoved,
};

export function normalizeType(backendType: string): NotificationTypeType | string {
  return BACKEND_TYPE_MAP[backendType] ?? backendType;
}

function getReactionEmoji(reactionType: string | undefined): string {
  if (!reactionType) return "🙌";
  return REACTION_CONFIG[reactionType as ReactionTypeType]?.emoji ?? "🙌";
}

export function getNotificationText(
  item: INotificationApiItem,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const type = normalizeType(item.type);
  const name = item.actor.name;
  const count = item.aggregationCount ?? 1;
  const suffix = count > 1 ? t("and_others", { count: count - 1 }) : "";
  const practiceTitle = item.practiceTitle ?? "";

  switch (type) {
    case "WishLinked":
      return t("text_wish_linked", {
        title: item.entityTitle?.trim() || t("related_roadmap_item"),
      });
    case "RoadmapShipped":
      return t("text_roadmap_shipped", {
        title: item.entityTitle?.trim() || t("related_roadmap_item"),
      });
    case NotificationType.cohortInvitation:
    case NotificationType.cohortMemberRemoved: {
      const isInvitation = type === NotificationType.cohortInvitation;
      const title = item.cohortName?.trim();
      if (title) {
        return t(isInvitation ? "text_cohort_invitation" : "text_cohort_removed", { name, title });
      }
      if (item.message?.trim()) return item.message;
      return t(isInvitation ? "text_cohort_invitation_fallback" : "text_cohort_removed_fallback");
    }
    case NotificationType.reaction:
      return t("text_reaction", {
        name,
        suffix,
        title: practiceTitle,
        reaction: getReactionEmoji(item.reactionType),
      });
    case NotificationType.comment:
      return t("text_comment", { name, title: practiceTitle, content: item.content ?? "" });
    case NotificationType.commentReply:
      return t("text_comment_reply", { name, content: item.content ?? "" });
    case NotificationType.mention:
      return t("text_mention", { name, content: item.content ?? "" });
    case NotificationType.followUser:
      return t("text_follow_user", { name });
    case NotificationType.followPractice:
      return t("text_follow_practice", { name, title: practiceTitle });
    case NotificationType.connect:
      return t("text_connect", { name });
    case NotificationType.agreeConnect:
      return t("text_agree_connect", { name });
    case NotificationType.connectAgree:
      return t("text_connect_agree", { name });
    case NotificationType.connectRejected:
      return t("text_connect_rejected", { name });
    case NotificationType.updatePracticeCheckin:
      return t("text_check_in", {
        name,
        title: practiceTitle,
        content: item.content ? t("content_suffix", { content: item.content }) : "",
      });
    case NotificationType.updatePracticeFinish:
      return t("text_finish_practice", { name, title: practiceTitle });
    case NotificationType.practiceCreated:
      return t("text_practice_created", { name, title: practiceTitle });
    case NotificationType.updatePractice:
      return t("text_update_practice", { name, title: practiceTitle });
    case NotificationType.buddyRequest:
      return t("text_buddy_request", { name, title: practiceTitle });
    case NotificationType.buddyRequestFollower:
      return t("text_buddy_request_follower", { name, title: practiceTitle });
    case NotificationType.buddyAccepted:
      return t("text_buddy_accepted", { name });
    default:
      return item.message?.trim() || t("text_default", { name });
  }
}

export function getNotificationHref(item: INotificationApiItem): string | null {
  const type = normalizeType(item.type);
  if (type === NotificationType.cohortMemberRemoved) return null;
  const isRoadmap = type === "WishLinked" || type === "RoadmapShipped";
  if (type === NotificationType.cohortInvitation || isRoadmap) {
    if (!item.url) return null;
    try {
      const url = new URL(item.url);
      if (
        url.protocol !== "https:" ||
        !["app.daodao.so", "app-dev.daodao.so"].includes(url.hostname) ||
        url.port ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        return null;
      const allowedPath = isRoadmap
        ? /^\/(?:zh-TW\/|en\/)?roadmap$/.test(url.pathname)
        : /^\/(?:zh-TW\/|en\/)?cohorts\/join\/[A-Za-z0-9_-]+$/.test(url.pathname);
      return allowedPath ? url.href : null;
    } catch {
      return null;
    }
  }

  const practiceId = item.practiceId ?? (item.entityType === "checkin" ? undefined : item.entityId);

  switch (item.entityType) {
    case "practice":
    case "comment":
    case "checkin":
    case "buddy_request":
      if (practiceId && item.checkinId) {
        return `/practices/${practiceId}/check-ins/${item.checkinId}`;
      }
      return practiceId ? `/practices/${practiceId}` : null;
    case "user":
    case "connection":
      return item.actor.id ? `/users/${item.actor.id}` : null;
    default:
      return null;
  }
}
