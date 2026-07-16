export const NotificationType = {
  reaction: "reaction",
  comment: "comment",
  commentReply: "comment-reply",
  mention: "mention",
  followUser: "follow-user",
  followPractice: "follow-practice",
  connect: "connect",
  agreeConnect: "agree-connect",
  connectAgree: "connect-agree",
  connectRejected: "connect-rejected",
  updatePracticeCheckin: "update-practice-checkin",
  updatePractice: "update-practice",
  updatePracticeFinish: "update-practice-finish",
  practiceCreated: "practice-created",
  buddyRequest: "buddy-request",
  buddyRequestFollower: "buddy-request-follower",
  buddyAccepted: "buddy-accepted",
} as const;

export type NotificationTypeType = (typeof NotificationType)[keyof typeof NotificationType];
