"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram.svg";
import LineSvg from "@daodao/assets/images/social-icons/line-filled.svg";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { MapPin } from "lucide-react";

interface SocialLink {
  platform: "line" | "facebook" | "instagram";
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
    switch (platform) {
      case "line":
        return <LineSvg className="size-6" />;
      case "facebook":
        return <FacebookSvg className="size-6" />;
      case "instagram":
        return <InstagramSvg className="size-6" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      {/* 頭像和基本資訊 */}
      <div className="flex items-start gap-4">
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
          {/* 個人簡介 */}
          {selfIntroduction && (
            <p className="text-xs text-text-dark mb-3">{selfIntroduction}</p>
          )}

          {/* 社群媒體連結 */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <Button
                  key={link.platform}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="size-8"
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
        </div>
      </div>
    </div>
  );
}
