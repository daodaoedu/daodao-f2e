import { Mail } from "lucide-react";
import { toast } from "sonner";
import { getUserProfileBasePath } from "@/entities/user";
import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";
import type { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CustomLink } from "@/shared/ui/custom-link";

interface ContributorInfoProps {
  user: ResourceDetailResponseSchema["data"]["user"];
}

export default function ContributorInfo({ user }: ContributorInfoProps) {
  return (
    <div className="rounded-lg bg-primary-palest p-10">
      <h2 className="heading-md mb-10">關於分享者</h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex">
          <Avatar className="mr-3 mt-1 size-12">
            <AvatarImage src={user.photoURL || ""} />
            <AvatarFallback className="text-xl">
              <DefaultAvatar />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h2 className="body-md font-bold">{user.name}</h2>
              {user.educationStage && (
                <Badge className="body-sm ml-3 rounded px-2" variant="gray">
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
        <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {user.tagList.map((tag) => (
              <Badge key={tag} variant="outline" className="text-primary">
                # {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="body-lg mb-2 font-bold text-basic-500">簡介</h3>
          <p className="mb-2 text-basic-500">{user.selfIntroduction}</p>
          <Button type="button" variant="link" className="-mx-2 px-2" asChild>
            <CustomLink href={getUserProfileBasePath(user)}>了解更多</CustomLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
