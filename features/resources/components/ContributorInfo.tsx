import { toast } from "sonner";
import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";

interface ContributorInfoProps {
  user: ResourceDetailResponseSchema["data"]["user"];
}

export default function ContributorInfo({ user }: ContributorInfoProps) {
  return (
    <div className="bg-primary-palest p-10 rounded-lg">
      <h2 className="mb-10 heading-md">關於分享者</h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex">
          <Avatar className="mt-1 mr-3 size-12">
            <AvatarImage src={user.photoURL || ""} />
            <AvatarFallback className="text-xl">
              <DefaultAvatar />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h2 className="body-md font-bold">{user.name}</h2>
              {user.educationStage && (
                <Badge className="body-sm ml-3 px-2 rounded" variant="gray">
                  {user.educationStage}
                </Badge>
              )}
            </div>
            <span className="body-sm">{user.roleList[0]}</span>
          </div>
        </div>

        <Button size="lg" onClick={() => toast.info("功能尚未開放")}>
          <Mail size={15} />
          聯繫分享者
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {user.tagList.map((tag) => (
              <Badge key={tag} variant="outline" className="text-primary">
                # {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 body-lg font-bold text-basic-500">簡介</h3>
          <p className="mb-2 text-basic-500">{user.selfIntroduction}</p>
          <Button type="button" variant="link" className="-mx-2 px-2" asChild>
            <Link href={`/partner/detail?id=${user._id}`}>了解更多</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
