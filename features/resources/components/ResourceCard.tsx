import Link from 'next/link';
import { Image } from '@/components/ui/image';
import { format, isWithinInterval, subMonths } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Hot from '@/public/assets/icons/hot.svg';
import Group from '@/public/assets/icons/group.svg';
import View from '@/public/assets/icons/view.svg';
import Comment from '@/public/assets/icons/comment.svg';
import DefaultAvatar from '@/public/assets/icons/default-avatar.svg';
import More from '@/public/assets/icons/more.svg';
import { cn } from '@/utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { targetAudienceTypeMap } from '../constants';

export function ResourceCardSkeleton() {
  return (
    <div className="group flex flex-col gap-2 rounded-lg transition-[transform,box-shadow] hover:scale-[1.01] hover:shadow-lg md:flex-row md:gap-4">
      <div className="relative aspect-[320/241] md:basis-80">
        <div className="relative h-full overflow-hidden rounded-lg p-2">
          <Skeleton className="size-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 md:w-[calc(100%-20rem)]">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6" />
        <Skeleton className="h-6" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

type CardProps = {
  id: string;
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
    id,
    userName,
    userAvatar,
    time,
    title = '',
    content = '',
    coverImageUrl = '',
    tags = [],
    label = [],
    level = '初級',
    viewCount = '尚未計算',
    commentCount = 12,
  } = props;

  const isNewResource = time ? isWithinInterval(new Date(time), {
    start: subMonths(new Date(), 1),
    end: new Date(),
  }) : false;

  const labels = isNewResource ? ['近期新增', ...label] : label;

  return (
    <Link
      href={`/resource/${id}`}
      className="group flex flex-col gap-2 rounded-lg transition-[transform,box-shadow] hover:scale-[1.01] hover:shadow-lg md:flex-row md:gap-4"
    >
      {/* Card Image */}
      <div className="relative aspect-[320/241] md:basis-80">
        <div className="relative h-full overflow-hidden rounded-lg p-2">
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Card Image Label */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {labels.map((_label) => (
            <div
              key={_label}
              className="flex h-8 items-center gap-1 rounded-lg bg-tips px-1 text-base leading-6 text-white"
            >
              <Hot />
              {_label}
            </div>
          ))}
        </div>
      </div>

      {/* Card Content */}
      <section className="flex flex-col gap-2 p-2 md:w-[calc(100%-20rem)]">
        {/* Card Info */}
        <div className="flex h-9 items-center justify-between">
          <div className="body-md flex items-center text-basic-500">
            <Avatar>
              <AvatarImage src={userAvatar ?? ''} />
              <AvatarFallback>
                <DefaultAvatar />
              </AvatarFallback>
            </Avatar>
            <div className="ml-2 mr-1 font-bold">{userName}</div>
          </div>
        </div>

        <div className="heading-sm truncate text-basic-black group-hover:text-primary-base">
          {title}
        </div>

        {/* Card Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <div
              key={tag}
              className={cn(
                'px-3 py-0.5 text-primary-base flex items-center justify-center text-nowrap',
                'rounded-2xl bg-white border border-solid border-primary-base'
              )}
            >
              <span className="font-bold">#</span>
              {tag}
            </div>
          ))}
        </div>

        <div className="body-lg line-clamp-2 md:line-clamp-3">{content}</div>

        {/* Card bottom */}
        <div className="body-md mt-auto flex flex-col flex-wrap gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex">
            <div className="mr-2 flex border-r border-solid border-basic-200">
              <Group />
              <div className="ml-2 mr-1">適合</div>
            </div>
            <span className="text-primary-base">
              {targetAudienceTypeMap.get(level) ?? level}
            </span>
          </div>

          <div className="body-md flex items-center justify-between gap-3 md:justify-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-1">
                <View />
                <div>{viewCount}</div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Comment />
                <div>{commentCount}</div>
              </div>
              <div>{time ? format(time, 'yyyy/MM/dd') : ''}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <More />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link
                    href="https://forms.gle/NkVbDWC3eXk4P4gv7"
                    target="_blank"
                    className="block p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    檢舉
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>
    </Link>
  );
}
