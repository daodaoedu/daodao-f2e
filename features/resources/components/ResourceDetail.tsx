import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Share2, Globe, Ellipsis } from "lucide-react";
import { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import GroupSvg from "@/public/assets/icons/group.svg";
import BoxSvg from "@/public/assets/icons/box.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useDialog } from "@/contexts/Dialog";
import FacebookSvg from "@/public/assets/socials-logos/facebook.svg";
import LineSvg from "@/public/assets/socials-logos/line.svg";
import LinkedInSvg from "@/public/assets/socials-logos/linkedin.svg";
import ShareWindowsSvg from "@/public/assets/socials-logos/share_windows.svg";
import ThreadsSvg from "@/public/assets/socials-logos/threads.svg";
import XSvg from "@/public/assets/socials-logos/x.svg";
import getShareAPI from "@/utils/getShareAPI";
// import VideoSvg from "@/public/assets/icons/video.svg";
import { resourceTypeMap, targetAudienceTypeMap } from "../constants";

interface ResourceDetailProps {
  resource: ResourceDetailResponseSchema["data"];
}

export default function ResourceDetail({ resource }: ResourceDetailProps) {
  const { openDialog } = useDialog();
  const { asPath } = useRouter();

  const shareAPI = getShareAPI({
    title: `我要分享「${resource.name}」資源`,
    text: `我要分享「${resource.name}」資源`,
    url: asPath,
    hashtag: "#島島阿學",
  });

  const handleShare = () => {
    openDialog({
      title: "分享資源",
      content: (
        <div className="mb-4 flex justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={shareAPI.facebookShare}
          >
            <FacebookSvg className="text-[#1877F2]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={shareAPI.threadsShare}
          >
            <ThreadsSvg className="text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={shareAPI.linkedinShare}
          >
            <LinkedInSvg className="text-[#0A66C2]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={shareAPI.xShare}
          >
            <XSvg className="text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={shareAPI.lineShare}
          >
            <LineSvg className="text-[#00B900]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={shareAPI.nativeShare}
          >
            <ShareWindowsSvg />
          </Button>
        </div>
      ),
    });
  };

  return (
    <div className="p-10 bg-white shadow-md rounded-xl mt-4 mb-11 flex flex-col md:mb-12 md:flex-row gap-8">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h1 className="heading-lg font-bold mb-4">{resource.name}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-primary">
                # {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium flex items-center gap-2">
                <GroupSvg />
                適合
              </span>
              <Separator orientation="vertical" />
              <span className="text-primary">
                {targetAudienceTypeMap.get(resource.level) ?? resource.level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium flex items-center gap-2">
                <BoxSvg />
                資源類型
              </span>
              <Separator orientation="vertical" />
              <span className="text-primary">
                {resourceTypeMap.get(resource.type) ?? resource.type}
              </span>
            </div>
            {/* 待之後使用 Youtube API 取得影片時長 */}
            {/* <div className="flex items-center gap-2">
              <span className="font-medium flex items-center gap-2">
                <VideoSvg />
                影片時長
              </span>
              <Separator orientation="vertical" />
              <span className="text-basic-400">{resource.videoUrl}</span>
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button size="lg" asChild>
            <Link href={resource.url} target="_blank">
              <Globe size={16} />
              查看資源
            </Link>
          </Button>
          <Button size="lg" onClick={handleShare}>
            <Share2 size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="icon">
                <Ellipsis size={16} />
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

      <div className="relative md:basis-80 aspect-[320/241] rounded-lg overflow-hidden">
        <Image
          src={resource.imageUrl ?? ""}
          alt={resource.name}
          className="object-cover"
          fill
          priority
        />
      </div>
    </div>
  );
}
