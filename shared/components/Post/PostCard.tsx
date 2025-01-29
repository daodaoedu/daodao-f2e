import { AiOutlineEye, AiOutlineMore } from 'react-icons/ai';
import { MdLockOpen, MdLockOutline } from 'react-icons/md';
import dayjs from 'dayjs';

import Button from '@/shared/components/Button';
import Shell from '@/public/assets/icons/shell.svg';
import Comment from '@/public/assets/icons/comment.svg';
import { cn } from '@/utils/cn';

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

interface PostCardHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  date?: string;
  viewCount?: number;
  isLocked?: boolean;
}

function PostCardHeader({
  title,
  subtitle,
  tag,
  date,
  viewCount,
  isLocked,
}: PostCardHeaderProps) {
  return (
    <header className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        {tag && (
          <div className="px-5 py-2 body-sm bg-primary-base rounded-full text-white whitespace-nowrap">
            {tag}
          </div>
        )}
        <div className="body-md text-basic-500">{title}</div>
        {subtitle && (
          <div className="body-md text-primary-base whitespace-nowrap">
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between md:justify-start gap-2 text-basic-300">
        {date && <time>{dayjs(date).format('YYYY/MM/DD')}</time>}
        <div className="flex items-center gap-2">
          {typeof viewCount === 'number' && (
            <div className="flex items-center gap-0.5">
              <AiOutlineEye className="size-5" />
              <div>{viewCount}</div>
            </div>
          )}
          {isLocked === false ? (
            <div className="flex items-center gap-0.5">
              <MdLockOpen className="size-5" />
              <div className="hidden sm:block">公開</div>
            </div>
          ) : (
            isLocked && (
              <div className="flex items-center gap-0.5">
                <MdLockOutline className="size-5" />
                <div className="hidden sm:block">不公開</div>
              </div>
            )
          )}
          <Button className="p-0">
            <AiOutlineMore className="size-5" />
          </Button>
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
      <Button
        as="link"
        href={detailLink}
        size="sm"
        className="gap-1 px-2 -ml-2 text-basic-300"
        suffixIcon="FaArrowRight"
        onClick={onMoreClick}
      >
        更多
      </Button>
      <div className="flex items-center gap-3 text-basic-black">
        <div className="flex items-center gap-0.5">
          <Shell className="size-5" />
          <div>5</div>
        </div>
        <div className="flex items-center gap-0.5">
          <Comment className="size-5" />
          <div>1</div>
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <Button prefixIcon="Shell" className="px-2">
        {shellCount}
      </Button>
      {userName && (
        <p className="pl-2 body-sm font-normal text-basic-400">
          給予一個或以上的貝殼，讓 {userName} 更有動力吧！
        </p>
      )}
    </div>
  );
}

PostCard.Header = PostCardHeader;
PostCard.Footer = PostCardFooter;
PostCard.Reward = PostCardReward;

export default PostCard;
