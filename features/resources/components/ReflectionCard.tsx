import DefaultAvatarIcon from '@/public/assets/icons/default-avatar.svg';
import StarIcon from '@/public/assets/icons/star.svg';
import ShareIcon from '@/public/assets/icons/share.svg';
import { cn } from '@/shared/lib/cn';

type ReflectionCardProps = {
  className?: string;
  userName?: string;
  userAvatar?: string;
  stars?: number;
  content?: string;
  buttonContent?: string;
};

export default function ReflectionCard(props: ReflectionCardProps) {
  const {
    className,
    userName = '小許',
    userAvatar = <DefaultAvatarIcon className="origin-top-left scale-150" />,
    stars = 4,
    content = '學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得',
    buttonContent = ' 自然語言處理 Naturalewqeqwe',
  } = props;

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 flex flex-col gap-3 md:p-6 md:gap-4',
        className
      )}
    >
      <div className="flex gap-2">
        <div className="size-12">{userAvatar}</div>

        <div className="flex flex-col gap-1">
          <div className="text-[1.125rem] font-bold leading-[1.6875rem]">
            {userName}
          </div>
          <div className="flex h-4 gap-1">
            {[1, 2, 3, 4, 5].map((unused, idx) => (
              <StarIcon
                key={unused}
                color={stars >= idx + 1 ? '#FF9526' : '#DBDBDB'}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="line-clamp-3 w-full text-[1.25rem] leading-[1.875rem] md:text-[1.125rem] md:leading-[1.6875rem]">
        {content}
      </div>
      <button
        type="button"
        className="flex h-10 items-center justify-center gap-[0.3125rem] rounded-full border border-primary-base text-[1.125rem] leading-[1.6875rem]"
      >
        <ShareIcon />
        <span className="max-w-[11.375rem] truncate">{buttonContent}</span>
      </button>
    </div>
  );
}
