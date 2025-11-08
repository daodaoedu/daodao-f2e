import { CustomLink } from '@/shared/ui/custom-link';
import React from 'react';
import { usePathname } from '@/shared/i18n/navigation';
import { Share2, Globe, Ellipsis } from 'lucide-react';
import { ResourceDetailResponseSchema } from '@/services/resources/core/schema';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Image } from '@/shared/ui/image';
import GroupSvg from '@/public/assets/icons/group.svg';
import BoxSvg from '@/public/assets/icons/box.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import { useDialog } from '@/contexts/Dialog';
import FacebookSvg from '@/public/assets/social-icons/facebook.svg';
import LineSvg from '@/public/assets/social-icons/line.svg';
import LinkedInSvg from '@/public/assets/social-icons/linkedin.svg';
import ShareWindowsSvg from '@/public/assets/social-icons/share_windows.svg';
import ThreadsSvg from '@/public/assets/social-icons/threads.svg';
import XSvg from '@/public/assets/social-icons/x.svg';
import { getShareAPI } from '@/shared/lib/share';
// import VideoSvg from "@/public/assets/icons/video.svg";
import { resourceTypeMap, targetAudienceTypeMap } from '../constants';

interface ResourceDetailProps {
  resource: ResourceDetailResponseSchema['data'];
}

export default function ResourceDetail({ resource }: ResourceDetailProps) {
  const { openDialog } = useDialog();
  const pathname = usePathname();

  const shareAPI = getShareAPI({
    title: `我要分享「${resource.name}」資源`,
    text: `我要分享「${resource.name}」資源`,
    url: pathname || '',
    hashtag: '#島島阿學',
  });

  const handleShare = () => {
    openDialog({
      title: '分享資源',
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
    <div className="mb-11 mt-4 flex flex-col gap-8 rounded-xl bg-white p-10 shadow-md md:mb-12 md:flex-row">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h1 className="heading-lg mb-4 font-bold">{resource.name}</h1>

          <div className="mb-4 flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-primary">
                #
                {' '}
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 font-medium">
                <GroupSvg />
                適合
              </span>
              <Separator orientation="vertical" />
              <span className="text-primary">
                {targetAudienceTypeMap.get(resource.level) ?? resource.level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 font-medium">
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
            <CustomLink href={resource.url} target="_blank">
              <Globe size={16} />
              查看資源
            </CustomLink>
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

      <div className="relative aspect-[320/241] overflow-hidden rounded-lg md:basis-80">
        <Image
          src={resource.imageUrl ?? ''}
          alt={resource.name}
          className="object-cover"
          fill
          priority
        />
      </div>
    </div>
  );
}
