import Link from 'next/link';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

type AnnouncementItem = {
  id: string;
  author: string;
  content: string;
  title: string;
  tag: string;
  times: string
};

const ReadOnlyMarkdownEditor = ({ value }: { value: string }) => (
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

const Tag = ({ tag }: { tag: string }) => (
  <div className="flex gap-2">
    <div
      key={tag}
      className="rounded-[13px] bg-primary-lightest px-2.5 py-[3px] text-xs text-basic-400"
    >
      {tag}
    </div>
  </div>
);

const AnnouncementList = ({ items }: { items: AnnouncementItem[] }) => (
  <div className="my-6 flex flex-col gap-3">
    {items.map(({
      id, tag, times, title,
    }) => (
      <Link
        href={`/learning-marathon/announcements/${id}`}
        key={id}
        className="flex flex-col gap-3 rounded-[10px] bg-white p-6 text-start shadow-md shadow-basic-black/10"
      >
        <h4 className="body-sm font-normal text-basic-400">{title}</h4>
        <div className="flex flex-wrap justify-between">
          <div className="md:w-full">
            <Tag tag={tag} />
          </div>
          <p className="body-sm text-basic-300">{times}</p>
        </div>
      </Link>
    ))}
  </div>
);

const AnnouncementDetail = ({ item }: { item: AnnouncementItem }) => {
  const {
    author, content, tag, times, title,
  } = item;

  return (
    <div className="h-fit bg-white p-6">
      <Tag tag={tag} />

      <h1 className="p-6 text-4xl font-semibold text-basic-500">{title}</h1>

      <p className="body-sm text-basic-300">{[times, author].join(' ・ ')}</p>

      <ReadOnlyMarkdownEditor value={content} />
    </div>
  );
};

export { AnnouncementDetail, AnnouncementList };
