import type { INotificationData } from "@/components/notifications/notification-item";
import { NotificationType } from "@/constants/notification-type";
import type { ReactionTypeType } from "@/constants/reaction-type";
import { REACTION_CONFIG } from "@/constants/reaction-type";
import type { NotificationApiItem } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/utils/format-time";
import { buildNotificationDeepLink } from "@/utils/notification-link";

const BACKEND_TYPE_MAP: Record<string, INotificationData["type"]> = {
  WishLinked: NotificationType.wishLinked,
  RoadmapShipped: NotificationType.roadmapShipped,
  CohortInvitation: NotificationType.cohortInvitation,
  CohortMemberRemoved: NotificationType.cohortMemberRemoved,
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
  FeedbackReplied: NotificationType.feedbackReplied,
};

function normalizeNotificationType(backendType: string): INotificationData["type"] {
  return (BACKEND_TYPE_MAP[backendType] ?? backendType) as INotificationData["type"];
}

function getReactionEmoji(reactionType: string | undefined): string | undefined {
  if (!reactionType) return undefined;
  return REACTION_CONFIG[reactionType as ReactionTypeType]?.emoji;
}

export function apiItemToDisplay(item: NotificationApiItem, locale: string): INotificationData {
  return {
    id: String(item.id),
    type: normalizeNotificationType(item.type),
    actor: {
      id: item.actor.id ? String(item.actor.id) : undefined,
      name: item.actor.name,
      photoURL: item.actor.photoURL,
      customId: item.actor.customId,
    },
    practice: item.practiceTitle
      ? { id: item.entityId ?? "", name: item.practiceTitle }
      : undefined,
    entityTitle: item.entityTitle,
    cohortName: item.cohortName,
    message: item.message,
    hasDestination: buildNotificationDeepLink(item) !== null,
    content: item.content,
    connectMessage: item.connectMessage,
    reaction: getReactionEmoji(item.reactionType),
    aggregationCount: item.aggregationCount,
    connectionRequestId:
      item.connectionRequestId != null ? String(item.connectionRequestId) : undefined,
    buddyRequestId: item.buddyRequestId,
    time: formatRelativeTime(item.createdAt, locale),
    isRead: item.isRead,
  };
}
