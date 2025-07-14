import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

export const timeDuration = (date: string | Date = new Date()) => {
  const currentDate = new Date();
  const publishedDate = new Date(date);
  const diffDay = differenceInDays(currentDate, publishedDate);
  const diffHour = differenceInHours(currentDate, publishedDate);
  const diffMinute = differenceInMinutes(currentDate, publishedDate);
  if (diffDay > 0) {
    return `${diffDay} 天前`;
  }
  if (diffHour < 24 && diffHour > 0) {
    return `${diffHour} 小時前`;
  }
  if (diffMinute < 60 && diffMinute > 0) {
    return `${diffMinute} 分鐘前`;
  }
  return `剛剛`;
};
