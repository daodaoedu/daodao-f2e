import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";

interface ContributorInfoProps {
  resource: ResourceDetailResponseSchema;
}

export default function ContributorInfo({ resource }: ContributorInfoProps) {
  return (
    <div className="bg-primary-palest p-10 rounded-lg">
      <h2 className="mb-10 heading-md">關於分享者</h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex">
          <Avatar className="mt-1 mr-3 size-12">
            <AvatarImage src={resource.user.photoURL || ""} />
            <AvatarFallback className="text-xl">
              <DefaultAvatar />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h2 className="body-md font-bold">使用者名稱</h2>
              <Badge className="body-sm ml-3 px-2 rounded" variant="gray">
                身份
              </Badge>
            </div>
            <span className="body-sm">教育工作者</span>
          </div>
        </div>

        <Button size="lg">
          <Mail size={15} />
          聯繫分享者
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {["民主教育", "議事規則", "數理科學", "程式"].map((tag) => (
              <Badge key={tag} variant="outline" className="text-primary">
                # {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 body-lg font-bold text-basic-500">簡介</h3>
          <p className="mb-2 text-basic-500">
            個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介個人簡介
          </p>
          <Button type="button" variant="link" className="-mx-2 px-2" asChild>
            <Link href="/partner/detail?id=2ebb18d5-84da-4289-99d8-57a12a885115">
              了解更多
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
