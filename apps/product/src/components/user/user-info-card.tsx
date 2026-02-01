"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import { useIsMobile } from "@daodao/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { MapPin } from "lucide-react";
import { useCallback } from "react";
import {
  SocialPlatform,
  type SocialPlatform as SocialPlatformType,
} from "@/constants/social-platform";

/**
 * 社群媒體連結物件
 */
export interface ISocialLinks {
  line?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  threads?: string | null;
  linkedin?: string | null;
  discord?: string | null;
}

/**
 * 社群媒體平台顯示順序
 */
const SOCIAL_PLATFORM_ORDER: SocialPlatformType[] = [
  SocialPlatform.threads,
  SocialPlatform.facebook,
  SocialPlatform.instagram,
  SocialPlatform.linkedin,
  SocialPlatform.line,
  SocialPlatform.discord,
];

/**
 * 有圖示的社群媒體平台
 */
const PLATFORMS_WITH_ICON: SocialPlatformType[] = [
  SocialPlatform.facebook,
  SocialPlatform.instagram,
  SocialPlatform.threads,
  SocialPlatform.linkedin,
];

/**
 * 取得平台顯示名稱
 */
const getPlatformDisplayName = (platform: SocialPlatformType): string => {
  const displayNames: Record<SocialPlatformType, string> = {
    [SocialPlatform.line]: "LINE",
    [SocialPlatform.facebook]: "Facebook",
    [SocialPlatform.instagram]: "Instagram",
    [SocialPlatform.threads]: "Threads",
    [SocialPlatform.linkedin]: "LinkedIn",
    [SocialPlatform.discord]: "Discord",
  };
  return displayNames[platform] || platform;
};

const getSocialIcon = (platform: SocialPlatformType) => {
  const platformMap: Partial<Record<SocialPlatformType, typeof FacebookSvg>> = {
    [SocialPlatform.facebook]: FacebookSvg,
    [SocialPlatform.instagram]: InstagramSvg,
    [SocialPlatform.threads]: ThreadsSvg,
    [SocialPlatform.linkedin]: LinkedInSvg,
  };
  const Icon = platformMap[platform];
  if (!Icon) return null;
  return <Icon className="size-8 md:size-4" />;
};

interface UserInfoCardProps {
  name: string;
  location?: string;
  selfIntroduction?: string;
  photoURL?: string;
  socialLinks?: ISocialLinks;
}

/**
 * 用戶個人資訊卡片組件
 */
export function UserInfoCard({
  name,
  location,
  selfIntroduction,
  photoURL,
  socialLinks,
}: UserInfoCardProps) {
  const isMobile = useIsMobile();
  // 複製文字到剪貼簿的處理函數
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已複製到剪貼簿");
    } catch {
      toast.error("複製失敗");
    }
  }, []);

  // 按照定義的順序將物件轉換為陣列並分離有圖示和沒有圖示的連結
  const socialLinksArray = socialLinks
    ? SOCIAL_PLATFORM_ORDER.map((platform) => ({
        platform,
        value: socialLinks[platform],
      }))
        .filter((item): item is { platform: SocialPlatformType; value: string } =>
          Boolean(item.value)
        )
        .map(({ platform, value }) => ({ platform, value }))
    : [];

  const linksWithIcon = socialLinksArray.filter(({ platform }) =>
    PLATFORMS_WITH_ICON.includes(platform)
  );
  const linksWithoutIcon = socialLinksArray.filter(
    ({ platform }) => !PLATFORMS_WITH_ICON.includes(platform)
  );

  const hasSocialLinks = linksWithIcon.length > 0 || linksWithoutIcon.length > 0;

  const moreContent = (
    <>
      {/* 個人簡介 */}
      {selfIntroduction && (
        <p className="text-xs text-text-dark mb-4 md:mb-3">{selfIntroduction}</p>
      )}

      {/* 社群媒體連結 */}
      {hasSocialLinks && (
        <div className="space-y-3 md:space-y-2">
          {/* 有圖示的連結 - 橫向排列 */}
          {linksWithIcon.length > 0 && (
            <div className="flex items-center gap-3 md:gap-2">
              {linksWithIcon.map(({ platform, value }) => {
                const icon = getSocialIcon(platform);
                if (!icon || !value) return null;
                return (
                  <Button
                    key={platform}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="size-8 md:size-4"
                    aria-label={`前往 ${getPlatformDisplayName(platform)}`}
                  >
                    <CustomLink
                      href={value}
                      prefetch={false}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {icon}
                    </CustomLink>
                  </Button>
                );
              })}
            </div>
          )}

          {/* 沒有圖示的連結 - 垂直排列 */}
          {linksWithoutIcon.length > 0 && (
            <div className="flex flex-col gap-2">
              {linksWithoutIcon.map(({ platform, value }) => {
                const platformName = getPlatformDisplayName(platform);
                if (!value) return null;

                return (
                  <div key={platform} className="flex items-center gap-2 text-xs text-text-dark">
                    <p className="border-r border-text-dark pr-2">{platformName}</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-text-dark"
                      animation="none"
                      onClick={() => handleCopy(value)}
                    >
                      {value}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      {/* 頭像和基本資訊 */}
      <div className="flex items-center md:items-start gap-4">
        <Avatar className="size-24 shrink-0">
          <AvatarImage src={photoURL} alt={name} className="bg-very-light-gray" />
          <AvatarFallback className="bg-very-light-gray text-text-dark text-xl">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-3">
            <h2 className="text-[22px] font-medium mb-1 text-bg-dark truncate">{name}</h2>
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4.5 text-text-dark" />
                <p className="text-xs text-text-dark">{location}</p>
              </div>
            )}
          </div>
          {!isMobile && moreContent}
        </div>
      </div>
      {isMobile && <div className="mt-4">{moreContent}</div>}
    </div>
  );
}
