import Link from "next/link";
import Image from "@/shared/components/Image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Hot from "@/public/assets/icons/hot.svg";
import Group from "@/public/assets/icons/group.svg";
import View from "@/public/assets/icons/view.svg";
import Comment from "@/public/assets/icons/comment.svg";
import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";
import More from "@/public/assets/icons/more.svg";
import dayjs from "dayjs";
import { cn } from "@/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Props 需要對應真實資料
type CardProps = {
  id: number;
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
    title = "",
    content = "",
    coverImageUrl = "",
    tags = [],
    label = [],
    level = "初級",
    viewCount = "尚未計算",
    commentCount = 12,
  } = props;

  const isNewResource = dayjs(time).isBetween(
    dayjs().subtract(1, "month"),
    dayjs()
  );

  const labels = isNewResource ? ["近期新增", ...label] : label;

  return (
    <Link
      href={`/resource/${id}`}
      className="group flex flex-col gap-2 md:flex-row md:gap-4"
    >
      {/* Card Image */}
      <div className="relative md:basis-80 aspect-[320/241]">
        <div className="relative h-full overflow-hidden rounded-lg">
          <Image
            src={coverImageUrl}
            alt={title}
            borderRadius="0.5rem"
            height="100%"
            className="object-cover group-hover:scale-110 transition-transform"
            wrapperClassName="!block"
          />
        </div>

        {/* Card Image Label */}
        <div className=" absolute top-3 left-3 flex flex-wrap gap-2">
          {labels.map((_label) => {
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
      <section className="flex flex-col gap-2 md:w-[calc(100%-20rem)]">
        {/* Card Info */}
        <div className="flex justify-between items-center h-9">
          <div className="flex items-center body-md text-basic-500">
            <Avatar>
              <AvatarImage src={userAvatar ?? ""} />
              <AvatarFallback>
                <DefaultAvatar />
              </AvatarFallback>
            </Avatar>
            <div className="font-bold mr-1 ml-[0.5rem]">{userName}</div>
          </div>
        </div>

        <div className="heading-sm text-basic-black truncate">{title}</div>

        {/* Card Tags */}
        <div className="flex gap-1 flex-wrap">
          {tags.map((tag) => {
            return (
              <div
                key={tag}
                className={cn(
                  "px-3 py-0.5 text-primary-base flex items-center justify-center text-nowrap",
                  "rounded-2xl bg-white border border-solid border-primary-base"
                )}
              >
                <span className="font-bold">#</span>
                {tag}
              </div>
            );
          })}
        </div>

        <div className="body-lg line-clamp-2 md:line-clamp-3">{content}</div>

        {/* Card bottom */}
        <div className="mt-auto body-md flex gap-2 flex-col flex-wrap md:flex-row md:items-center md:justify-between">
          <div className="flex">
            <div className="flex mr-2 border-r border-solid border-basic-200">
              <Group />
              <div className="ml-2 mr-1">適合</div>
            </div>
            <span className="text-primary-base">{level}</span>
          </div>

          <div className="flex items-center justify-between md:justify-center gap-3 body-md">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-1">
                <View />
                <div>{viewCount}</div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Comment />
                <div>{commentCount}</div>
              </div>
              <div>{time ? dayjs(time).format("YYYY.MM.DD") : ""}</div>
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
