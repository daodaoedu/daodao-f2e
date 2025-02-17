import Link from 'next/link';
import Image from '@/shared/components/Image';

type AnnouncementItem = {
  id: string;
  author: string;
  contents: [string, number][];
  coverImageUrl: string;
  title: string;
  tags: string[];
  times: string;
};

const TagList = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex gap-2">
      {tags.map((tag: string) => (
        <div className="px-2.5 py-[3px] text-xs text-basic-400 bg-primary-lightest rounded-[13px]">
          {tag}
        </div>
      ))}
    </div>
  );
};

const AnnouncementList = ({ items }: { items: AnnouncementItem[] }) => {
  return (
    <div className="flex flex-col gap-3 my-6">
      {items.map(({ id, tags, times, title }) => (
        <Link
          href={`/learning-marathon/announcements/${id}`}
          key={id}
          className="text-start p-6 bg-white shadow-md shadow-basic-black/10 rounded-[10px] flex flex-col gap-3"
        >
          <h4 className="text-basic-400 body-sm font-normal">
            {`${id} - ${title}`}
          </h4>
          <div className="flex justify-between">
            <TagList tags={tags} />
            <p className="text-basic-300 body-sm">{times}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const AnnouncementDetail = ({ item }: { item: AnnouncementItem }) => {
  const { author, contents, coverImageUrl, tags, times, title } = item;

  return (
    <div className="bg-white h-fit p-6">
      <TagList tags={tags} />

      <h1 className="text-4xl text-basic-500 font-semibold p-6">{title}</h1>

      <p className="text-basic-300 body-sm">{[times, author].join(' ・ ')}</p>

      <Image src={coverImageUrl} alt="cover" />

      {contents.map(([content, index]: [string, number]) => (
        <p key={index} className="text-basic-500 body-sm p-2">
          {content}
        </p>
      ))}
    </div>
  );
};

export { AnnouncementDetail, AnnouncementList };
