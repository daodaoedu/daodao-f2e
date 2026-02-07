"use client";

import { DefaultAvatarSvg } from "@daodao/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Mail } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  photoURL?: string | null;
  educationStage?: string | null;
  roleList?: string[];
  tagList?: string[];
  selfIntroduction?: string | null;
}

interface ContributorInfoProps {
  user: UserInfo;
}

function getUserProfileBasePath(user: UserInfo): string {
  return `/user/${user.id}`;
}

export function ContributorInfo({ user }: ContributorInfoProps) {
  return (
    <div className="rounded-lg bg-primary-palest p-10">
      <h2 className="heading-md mb-10">關於分享者</h2>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex">
          <Avatar className="mr-3 mt-1 size-12">
            {user.photoURL && <AvatarImage src={user.photoURL} />}
            <AvatarFallback className="text-xl">
              <DefaultAvatarSvg />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h2 className="body-md font-bold">{user.name}</h2>
              {user.educationStage && (
                <Badge className="body-sm ml-3 rounded px-2" variant="secondary">
                  {user.educationStage}
                </Badge>
              )}
            </div>
            {user.roleList && user.roleList.length > 0 && (
              <span className="body-sm">{user.roleList[0]}</span>
            )}
          </div>
        </div>

        <Button size="default" onClick={() => alert("功能尚未開放")}>
          <Mail size={15} />
          聯繫分享者
        </Button>
      </div>

      <div className="flex-1">
        {user.tagList && user.tagList.length > 0 && (
          <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {user.tagList.map((tag) => (
                <Badge key={tag} variant="outline-logo" className="text-primary">
                  # {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {user.selfIntroduction && (
          <div>
            <h3 className="body-lg mb-2 font-bold text-basic-500">簡介</h3>
            <p className="mb-2 text-basic-500">{user.selfIntroduction}</p>
            <Button type="button" variant="link" className="-mx-2 px-2" asChild>
              <CustomLink href={getUserProfileBasePath(user)}>了解更多</CustomLink>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
