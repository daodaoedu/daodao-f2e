"use client";

import { format, isWithinInterval, subMonths } from "date-fns";
import {
  CommentSvg,
  DefaultAvatarSvg,
  DocSvg,
  GroupSvg,
  HotSvg,
  MoreSvg,
  ViewSvg,
} from "@daodao/assets";
import { cn } from "@daodao/ui/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Image } from "@daodao/ui/components/image";
import { targetAudienceTypeMap } from "@/constants/resource";

export function ResourceCardSkeleton() {
  return (
    <div className="group flex flex-col gap-2 rounded-lg transition-[transform,box-shadow] hover:scale-[1.01] hover:shadow-lg md:flex-row md:gap-4">
      <div className="relative aspect-[320/241] md:basis-80">
        <div className="relative h-full overflow-hidden rounded-lg p-2">
          <div className="size-full animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 md:w-[calc(100%-20rem)]">
        <div className="size-8 animate-pulse rounded-full bg-gray-200" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-6 animate-pulse rounded bg-gray-200" />
        <div className="h-6 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

type ResourceCardProps = {
  id: string;
  time?: string;
  userName?: string;
  userAvatar?: string | null;
  title?: string;
  content?: string;
  coverImageUrl?: string;
  tags?: string[];
  label?: string[];
  level?: string;
  viewCount?: string;
  commentCount?: number;
};

export function ResourceCard(props: ResourceCardProps) {
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

  const isNewResource = time
    ? isWithinInterval(new Date(time), {
        start: subMonths(new Date(), 1),
        end: new Date(),
      })
    : false;

  const labels = isNewResource ? ["近期新增", ...label] : label;

  return (
    <CustomLink
      href={`/resource/${id}`}
      className="group flex flex-col gap-2 rounded-lg transition-[transform,box-shadow] hover:scale-[1.01] hover:shadow-lg md:flex-row md:gap-4"
    >
      {/* Card Image */}
      <div className="relative aspect-[320/241] md:basis-80">
        <div className="relative h-full overflow-hidden rounded-lg p-2">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt={title} fill className="rounded-lg object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center rounded-lg bg-gradient-to-br from-primary-palest to-primary-pale">
              <DocSvg className="size-16 text-primary-base" />
            </div>
          )}
        </div>

        {/* Card Image Label */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {labels.map((_label) => (
            <div
              key={_label}
              className="flex h-8 items-center gap-1 rounded-lg bg-tips px-1 text-base leading-6 text-white"
            >
              <HotSvg />
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
              {userAvatar && <AvatarImage src={userAvatar} />}
              <AvatarFallback>
                <DefaultAvatarSvg />
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
                "px-3 py-0.5 text-primary-base flex items-center justify-center text-nowrap",
                "rounded-2xl bg-white border border-solid border-primary-base"
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
              <GroupSvg />
              <div className="ml-2 mr-1">適合</div>
            </div>
            <span className="text-primary-base">{targetAudienceTypeMap.get(level) ?? level}</span>
          </div>

          <div className="body-md flex items-center justify-between gap-3 md:justify-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-1">
                <ViewSvg />
                <div>{viewCount}</div>
              </div>
              <div className="flex items-center justify-center gap-1">
                <CommentSvg />
                <div>{commentCount}</div>
              </div>
              <div>{time ? format(time, "yyyy/MM/dd") : ""}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreSvg />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <CustomLink
                    href="https://forms.gle/NkVbDWC3eXk4P4gv7"
                    target="_blank"
                    className="block p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    檢舉
                  </CustomLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>
    </CustomLink>
  );
}
