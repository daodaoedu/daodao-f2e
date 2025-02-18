import Link from 'next/link';
import MarkdownEditor from '@/shared/components/MarkdownEditor';

type AnnouncementItem = {
  id: string;
  author: string;
  content: string;
  title: string;
  tags: string[];
  times: string;
};

const ReadOnlyMarkdownEditor = ({ value }: { value: string }) => {
  return (
    <div className="prose max-w-none">
      <MarkdownEditor
        readOnly
        value={value}
        className=""
        hasHeadings={false}
        placeholder=""
        rootClassName=""
        editorClassName=""
        onChange={() => {}}
      />
    </div>
  );
};

const TagList = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex gap-2">
      {tags.map((tag: string) => (
        <div
          key={tag}
          className="px-2.5 py-[3px] text-xs text-basic-400 bg-primary-lightest rounded-[13px]"
        >
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
          <h4 className="text-basic-400 body-sm font-normal">{title}</h4>
          <div className="flex justify-between flex-wrap">
            <div className="md:w-full">
              <TagList tags={tags} />
            </div>
            <p className="text-basic-300 body-sm">{times}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const AnnouncementDetail = ({ item }: { item: AnnouncementItem }) => {
  const { author, content, tags, times, title } = item;

  return (
    <div className="bg-white h-fit p-6 border-4 border-black">
      <TagList tags={tags} />

      <h1 className="text-4xl text-basic-500 font-semibold p-6">{title}</h1>

      <p className="text-basic-300 body-sm">{[times, author].join(' ・ ')}</p>

      <ReadOnlyMarkdownEditor value={content} />
    </div>
  );
};

export { AnnouncementDetail, AnnouncementList };
