'use client';

import Link from 'next/link';
import MarkdownRenderer from '@/shared/ui/markdown-renderer';
import { Badge } from '@/shared/ui/badge';
import { AnnouncementItemType } from '../model';

interface AnnouncementListProps {
  items: AnnouncementItemType[];
}

export const AnnouncementList = ({ items }: AnnouncementListProps) => (
  <div className="flex flex-col gap-3 py-6">
    {items.map(({ id, tag, times, title }) => (
      <Link
        href={`/learning-marathons/2025S1/announcements/${id}`}
        key={id}
        className="flex flex-col gap-3 rounded-[10px] bg-white p-6 text-start shadow-md shadow-basic-black/10"
      >
        <h4 className="body-sm font-normal text-basic-400">{title}</h4>
        <div className="flex flex-wrap justify-between">
          <div className="md:w-full">
            <Badge>{tag}</Badge>
          </div>
          <p className="body-sm text-basic-300">{times}</p>
        </div>
      </Link>
    ))}
  </div>
);

interface AnnouncementDetailProps {
  item: AnnouncementItemType;
}

export const AnnouncementDetail = ({ item }: AnnouncementDetailProps) => {
  const { author, content, tag, times, title } = item;

  return (
    <div className="h-fit bg-white p-6">
      <Badge>{tag}</Badge>

      <h1 className="p-6 text-4xl font-semibold text-basic-500">{title}</h1>

      <p className="body-sm text-basic-300">{[times, author].join(' ・ ')}</p>

      <MarkdownRenderer source={content} />
    </div>
  );
};
