/** 活動卡一律先進詳情頁；已加入者由詳情頁 CTA「已加入」前往 /cohorts/{id}。 */
export const resolveActivityCardHref = (activity: { id: number; isJoined: boolean }): string =>
  `/activities/${activity.id}`;
