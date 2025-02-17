import DefaultAvatarIcon from "@/public/assets/icons/default-avatar.svg";
import StarIcon from "@/public/assets/icons/star.svg";
import ShareIcon from "@/public/assets/icons/share.svg";

type ReflectionCardProps = {
  userName?: string;
  userAvatar?: string;
  stars?: number;
  content?: string;
  buttonContent?: string;
};

export const ReflectionCard = (props: ReflectionCardProps) => {
  const {
    userName = "小許",
    userAvatar = <DefaultAvatarIcon className="scale-[1.5] origin-top-left" />,
    stars = 4,
    content = "學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得學習心得",
    buttonContent = " 自然語言處理 Naturalewqeqwe",
  } = props;

  return (
    <div className="min-w-[17.625rem] bg-white rounded-[0.75rem] p-[1.25rem] flex flex-col gap-[0.75rem] md:p-[1.5rem] md:gap-[1rem]">
      <div className="flex gap-[0.5rem]">
        <div className="w-[3rem] h-[3rem]">{userAvatar}</div>

        <div className="flex flex-col gap-[0.25rem]">
          <div className="text-[1.125rem] leading-[1.6875rem] font-bold">
            {userName}
          </div>
          <div className="h-[1rem] flex gap-[0.25rem]">
            {[...Array(5)].map((_, idx) => (
              <StarIcon
                key={idx}
                color={stars >= idx + 1 ? "#FF9526" : "#DBDBDB"}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full line-clamp-3 text-[1.25rem] leading-[1.875rem] md:text-[1.125rem] md:leading-[1.6875rem]">
        {content}
      </div>
      <button className="flex items-center justify-center gap-[0.3125rem] h-[2.5rem] text-[1.125rem] leading-[1.6875rem] border border-primary-base rounded-full">
        <ShareIcon />
        <span className="max-w-[11.375rem] truncate">{buttonContent}</span>
      </button>
    </div>
  );
};
