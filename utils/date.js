import dayjs from 'dayjs';

export const timeDuration = (publishedAt = dayjs()) => {
  const currentDate = dayjs();
  const publishedDate = dayjs(publishedAt);
  const diffDay = currentDate.diff(publishedDate, 'day');
  const diffHour = currentDate.diff(publishedDate, 'hour');
  const diffMinute = currentDate.diff(publishedDate, 'minute');
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

export const getResourceTitle = (properties) => {
  const texts = (properties?.['資源名稱']?.title ?? [])
    .filter((item) => item?.type === 'text')
    .map((item) => item?.plain_text);

  return texts.join('');
};
