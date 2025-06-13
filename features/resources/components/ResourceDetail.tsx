import React from "react";
import Image from "next/image";
import { Share2, Globe, Ellipsis } from "lucide-react";
import { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Separator } from "@/components/atoms/separator";
import GroupSvg from "@/public/assets/icons/group.svg";
import BoxSvg from "@/public/assets/icons/box.svg";
import VideoSvg from "@/public/assets/icons/video.svg";

interface ResourceDetailProps {
  resource: ResourceDetailResponseSchema;
}

export default function ResourceDetail({ resource }: ResourceDetailProps) {
  return (
    <div className="p-10 bg-white shadow-md rounded-xl mt-4 mb-11 flex flex-col md:mb-12 md:flex-row gap-8">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h1 className="heading-lg font-bold mb-4">{resource.resourceName}</h1>

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
              <span className="text-primary">{resource.targetAudience}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium flex items-center gap-2">
                <BoxSvg />
                資源類型
              </span>
              <Separator orientation="vertical" />
              <span className="text-primary">{resource.resourceType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium flex items-center gap-2">
                <VideoSvg />
                影片時長
              </span>
              <Separator orientation="vertical" />
              <span className="text-basic-400">08 小時 24 分</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button size="lg">
            <Globe size={16} />
            查看資源
          </Button>
          <Button size="lg">
            <Share2 size={16} />
          </Button>
          <Button variant="light" size="icon">
            <Ellipsis size={16} />
          </Button>
        </div>
      </div>

      <div className="relative md:basis-80 aspect-[320/241] rounded-lg overflow-hidden">
        <Image
          src={resource.resourceImgUrl ?? ""}
          alt={resource.resourceName}
          className="object-cover"
          fill
          priority
        />
      </div>
    </div>
  );
}
