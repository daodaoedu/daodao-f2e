"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram-filled.svg";
import LineSvg from "@daodao/assets/images/social-icons/line-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { MapPin } from "lucide-react";

interface SocialLink {
  platform: "line" | "facebook" | "instagram" | "threads" | "linkedin";
  url: string;
}

interface UserInfoCardProps {
  name: string;
  location?: string;
  selfIntroduction?: string;
  photoURL?: string;
  socialLinks?: SocialLink[];
}

/**
 * 用戶個人資訊卡片組件
 */
export function UserInfoCard({
  name,
  location,
  selfIntroduction,
  photoURL,
  socialLinks = [],
}: UserInfoCardProps) {
  const getSocialIcon = (platform: SocialLink["platform"]) => {
    const platformMap = {
      line: LineSvg,
      facebook: FacebookSvg,
      instagram: InstagramSvg,
      threads: ThreadsSvg,
      linkedin: LinkedInSvg,
    };
    const Icon = platformMap[platform];
    return <Icon className="size-8 md:size-4" />;
  };

  const moreContent = (
    <>
      {/* 個人簡介 */}
      {selfIntroduction && (
        <p className="text-xs text-text-dark mb-4 md:mb-3">{selfIntroduction}</p>
      )}

      {/* 社群媒體連結 */}
      {socialLinks.length > 0 && (
        <div className="flex items-center gap-3 md:gap-2">
          {socialLinks.map((link) => (
            <Button
              key={link.platform}
              variant="ghost"
              size="icon"
              asChild
              className="size-8 md:size-4"
              aria-label={`前往 ${link.platform}`}
            >
              <CustomLink
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getSocialIcon(link.platform)}
              </CustomLink>
            </Button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      {/* 頭像和基本資訊 */}
      <div className="flex items-center md:items-start gap-4">
        <Avatar className="size-24 shrink-0">
          <AvatarImage
            src={photoURL}
            alt={name}
            className="bg-very-light-gray"
          />
          <AvatarFallback className="bg-very-light-gray text-text-dark text-xl">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-3">
            <h2 className="text-[22px] font-medium mb-1 text-bg-dark truncate">
              {name}
            </h2>
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4.5 text-text-dark" />
                <p className="text-xs text-text-dark">{location}</p>
              </div>
            )}
          </div>
          <div className="hidden md:block">{moreContent}</div>
        </div>
      </div>
      <div className="mt-4 md:hidden">{moreContent}</div>
    </div>
  );
}
