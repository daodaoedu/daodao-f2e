import Image from '@/shared/components/Image';

import Hot from '@/public/assets/icons/hot.svg';
import Group from '@/public/assets/icons/group.svg';
import View from '@/public/assets/icons/view.svg';
import Comment from '@/public/assets/icons/comment.svg';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import More from '@/public/assets/icons/more.svg';
import dayjs from 'dayjs';

// Props 需要對應真實資料
type CardProps = {
  time?: string;
  userName?: string;
  userAvatar?: string | null;
  title?: string;
  content?: string;
  coverImageUrl?: string;
  tags?: string[]; // tags 要確認 types
  label?: string[]; //! 左上角熱門 label 如果拓展可能要用 mapping
  level?: string;
  viewCount?: string;
  commentCount?: number;
};

export default function ResourceCard(props: CardProps) {
  const {
    userName = '小許',
    userAvatar = <DefaultAvatar />,
    time = '2024.12.10',
    title = '自然語言處理 Natural Language Progress',
    content = '資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹',
    coverImageUrl = '',
    tags = ['1', '2', '3'],
    label = ['最新'],
    level = '初級',
    viewCount = '尚未計算',
    commentCount = 12,
  } = props;

  return (
    <section className="md:flex md:gap-4">
      {/* Card Image */}
      <div className="relative md:basis-80 aspect-[320/241]">
        <Image
          src={coverImageUrl}
          alt={title}
          borderRadius="0.5rem"
          height="100%"
          className="object-cover"
          wrapperClassName="!block"
        />

        {/* Card Image Label */}
        <div className=" absolute top-3 left-3 flex flex-wrap gap-2">
          {label.map((_label) => {
            return (
              <div
                key={_label}
                className="bg-tips text-base leading-[1.5rem] text-white rounded-lg h-8 flex items-center gap-1 px-1"
              >
                <Hot />
                {_label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Content */}
      <section className="flex flex-col gap-2 w-[calc(100%-20rem)]">
        {/* Card Info */}
        <div className="flex justify-between items-center h-9">
          <div className="flex items-center body-md text-basic-500">
            <div>{userAvatar}</div>
            <div className="font-bold mr-1 ml-[0.5rem]">{userName}</div>
          </div>
        </div>

        <div className="heading-md text-basic-black truncate">
          {title}
        </div>

        {/* Card Tags */}
        <div className="flex gap-1">
          {tags.map((tag) => {
            return (
              <div
                key={tag}
                className="px-3 py-0.5 text-primary-base flex items-center justify-center rounded-2xl bg-white border border-solid border-primary-base"
              >
                <span className="font-bold">#</span>
                {tag}
              </div>
            );
          })}
        </div>

        <div className="body-lg line-clamp-2 md:line-clamp-3">{content}</div>

        {/* Card bottom */}
        <div className="mt-auto body-md flex items-center justify-between">
          <div className="flex">
            <div
              className="flex mr-2"
              style={{ borderRight: '1px solid #DBDBDB' }}
            >
              <Group />
              <div className="ml-2 mr-1">適合</div>
            </div>
            <span className="text-primary-base">{level}</span>
          </div>

          <div className="flex items-center justify-center gap-3 body-md">
            <div className="flex items-center justify-center gap-1">
              <View />
              <div>{viewCount}</div>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Comment />
              <div>{commentCount}</div>
            </div>
            <div>{time ? dayjs(time).format('YYYY.MM.DD') : ''}</div>
            <More />
          </div>
        </div>
      </section>
    </section>
  );
}
