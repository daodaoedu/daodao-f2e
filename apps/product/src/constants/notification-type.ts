export const NotificationType = {
  reaction: "reaction",
  comment: "comment",
  followUser: "follow-user",
  followPractice: "follow-practice",
  connect: "connect",
  agreeConnect: "agree-connect",
  connectAgree: "connect-agree",
  connectRejected: "connect-rejected",
  updatePracticeCheckin: "update-practice-checkin",
  updatePracticeFinish: "update-practice-finish",
  practiceCreated: "practice-created",
} as const;

export type NotificationTypeType = (typeof NotificationType)[keyof typeof NotificationType];
