import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Eye,
  EllipsisVertical,
  LockKeyholeOpen,
  LockKeyhole,
} from 'lucide-react';
import { CustomLink } from '@/shared/ui/custom-link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { cn } from '@/shared/lib/cn';

interface PostCardProps {
  className?: string;
  children: React.ReactNode;
}

function PostCard({ className, children }: PostCardProps) {
  return (
    <div className={cn('bg-basic-white rounded-2xl p-3 md:p-10', className)}>
      {children}
    </div>
  );
}

interface BasePostCardHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  date?: string;
  viewCount?: number;
  isLocked?: boolean;
  dropdownItems?: {
    key: string;
    children: React.ReactNode;
    className?: string;
  }[];
}

type PostCardHeaderProps = BasePostCardHeaderProps &
  (
    | { isEditable: true; onTitleChange?: (title: string) => void }
    | { isEditable?: false; onTitleChange?: never }
  );

function PostCardHeader({
  title,
  subtitle,
  tag,
  date,
  viewCount,
  isLocked,
  isEditable,
  dropdownItems,
  onTitleChange,
}: PostCardHeaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const prevTitleRef = useRef(title);
  const [maxWidth, setMaxWidth] = useState(0);
  const [titleWidth, setTitleWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const wrapperWidth = wrapperRef.current?.clientWidth ?? 0;
      const actionsWidth = wrapperRef.current?.children[1].clientWidth ?? 0;

      setMaxWidth(
        wrapperWidth > actionsWidth
          ? wrapperWidth - actionsWidth - 12
          : wrapperWidth
      );
      setTitleWidth(titleRef.current?.clientWidth ?? 0);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (prevTitleRef.current !== title) {
      setTitleWidth(titleRef.current?.clientWidth ?? 0);
      prevTitleRef.current = title;
    }
  }, [title]);

  return (
    <header
      ref={wrapperRef}
      className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center"
    >
      <div
        className="flex items-center gap-4"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {tag && (
          <div className="body-sm whitespace-nowrap rounded-full bg-primary-base px-5 py-2 text-white">
            {tag}
          </div>
        )}
        <div className="body-md shrink overflow-hidden text-basic-500">
          <h2
            ref={titleRef}
            className={cn('truncate', isEditable && 'invisible absolute')}
            {...(isEditable && { 'aria-hidden': true })}
          >
            {title}
          </h2>
          {isEditable && (
            <input
              type="text"
              className="flex-1 outline-none"
              style={{
                width: `${Math.min(maxWidth, Math.max(titleWidth, 16))}px`,
              }}
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
            />
          )}
        </div>
        {subtitle && (
          <div className="body-md whitespace-nowrap text-primary-base">
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-basic-300 md:justify-start">
        {date && <time>{format(new Date(date), 'yyyy/MM/dd')}</time>}
        <div className="flex items-center gap-2">
          {typeof viewCount === 'number' && (
            <div className="flex items-center gap-0.5">
              <Eye className="size-5" />
              <div>{viewCount}</div>
            </div>
          )}
          {isLocked === false ? (
            <div className="flex items-center gap-0.5">
              <LockKeyholeOpen className="size-5" />
              <div className="hidden sm:block">公開</div>
            </div>
          ) : (
            isLocked && (
              <div className="flex items-center gap-0.5">
                <LockKeyhole className="size-5" />
                <div className="hidden sm:block">不公開</div>
              </div>
            )
          )}
          {Array.isArray(dropdownItems) && dropdownItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="-m-1 p-1">
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-20 -mr-2 mt-2">
                {dropdownItems.map((item) => (
                  <DropdownMenuItem
                    key={item.key}
                    className={cn('text-nowrap w-full', item.className)}
                    asChild
                  >
                    {item.children}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

interface PostCardFooterProps {
  onMoreClick?: () => void;
  detailLink?: string;
}

function PostCardFooter({ onMoreClick, detailLink }: PostCardFooterProps) {
  return (
    <footer className="flex items-center justify-between">
      {detailLink && (
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="-ml-2 gap-1 px-2 text-basic-300"
          onClick={onMoreClick}
        >
          <CustomLink href={detailLink}>
            更多
            <ArrowRight />
          </CustomLink>
        </Button>
      )}
      <div className="flex items-center gap-3 text-basic-black">
        <div className="flex items-center gap-0.5">
          <Shell className="size-5" />
          {/* <div>5</div> */}
        </div>
        <div className="flex items-center gap-0.5">
          <Comment className="size-5" />
          {/* <div>1</div> */}
        </div>
      </div>
    </footer>
  );
}

interface PostCardRewardProps {
  shellCount?: number;
  userName?: string;
}

function PostCardReward({ shellCount, userName }: PostCardRewardProps) {
  return (
    <div className="flex flex-col justify-between sm:flex-row sm:items-center">
      <Button
        variant="ghost"
        className="px-2"
        onClick={() => toast.error('感謝您的貝殼，但此功能尚未開放')}
      >
        <Shell className="size-5" />
        {shellCount}
      </Button>
      {userName && (
        <p className="body-sm pl-2 font-normal text-basic-400">
          給予一個或以上的貝殼，讓
          {' '}
          {userName}
          {' '}
          更有動力吧！
        </p>
      )}
    </div>
  );
}

PostCard.Header = PostCardHeader;
PostCard.Footer = PostCardFooter;
PostCard.Reward = PostCardReward;

export default PostCard;
