"use client";

import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import GithubSvg from "@daodao/assets/images/social-icons/github.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import { followTarget, unfollowTarget, sendConnectionRequest, useCurrentUser, useFollowStatus } from "@daodao/api";
import { useIsMobile } from "@daodao/shared";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import MarkdownRenderer from "@daodao/ui/components/markdown-renderer";
import { toast } from "@daodao/ui/components/sonner";
import { Globe, MapPin, Users } from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
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
  website?: string | null;
  github?: string | null;
}

/**
 * 社群媒體平台顯示順序
 */
const SOCIAL_PLATFORM_ORDER: SocialPlatformType[] = [
  SocialPlatform.website,
  SocialPlatform.github,
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
  SocialPlatform.website,
  SocialPlatform.github,
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
    [SocialPlatform.website]: "個人網站",
    [SocialPlatform.github]: "GitHub",
  };
  return displayNames[platform] || platform;
};

const getSocialIcon = (platform: SocialPlatformType) => {
  const platformMap: Partial<
    Record<SocialPlatformType, React.ComponentType<{ className?: string }>>
  > = {
    [SocialPlatform.website]: Globe,
    [SocialPlatform.github]: GithubSvg,
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
  personalSlogan?: string;
  connectionsCount?: number;
  followersCount?: number;
  hideConnectionsCount?: boolean;
  recentPracticeCount?: number;
  commonCirclesCount?: number | null;
  isOwnProfile?: boolean;
  isAuthenticated?: boolean;
  targetUserId?: string;
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
  personalSlogan,
  connectionsCount,
  followersCount,
  hideConnectionsCount,
  recentPracticeCount,
  commonCirclesCount,
  isOwnProfile = false,
  isAuthenticated = false,
  targetUserId,
}: UserInfoCardProps) {
  const isMobile = useIsMobile();
  const [followLoading, setFollowLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const { openInfoDialog } = useDialog();
  const intentRef = useRef("");

  // 用 client-side hook 判斷登入狀態（server-side cookie 無法自動帶入）
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.data?.id ?? null;
  const clientIsAuthenticated = currentUserId !== null;
  const clientIsOwnProfile = targetUserId != null && currentUserId === targetUserId;

  // 查詢是否已關注（僅在已登入且非自己頁面時查詢）
  const { data: followStatusData } = useFollowStatus(
    "user",
    clientIsAuthenticated && !clientIsOwnProfile ? targetUserId : undefined
  );
  const currentIsFollowing = isFollowing ?? followStatusData?.data?.isFollowing ?? false;

  // 複製文字到剪貼簿的處理函數
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已複製到剪貼簿");
    } catch {
      toast.error("複製失敗");
    }
  }, []);

  const handleFollow = useCallback(async () => {
    if (!targetUserId) return;
    setFollowLoading(true);
    try {
      if (currentIsFollowing) {
        await unfollowTarget("user", targetUserId);
        setIsFollowing(false);
        toast.success("已取消關注");
      } else {
        await followTarget({ targetType: "user", targetId: targetUserId });
        setIsFollowing(true);
        toast.success("已關注");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setFollowLoading(false);
    }
  }, [targetUserId, currentIsFollowing]);

  const handleConnect = useCallback(async () => {
    if (!targetUserId) return;

    intentRef.current = "";
    const result = await openInfoDialog({
      title: "請求連結",
      content: (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">填寫連結原因，讓對方更了解你的請求動機。</p>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
            rows={3}
            maxLength={50}
            placeholder="請簡短說明連結原因（最多 50 字）"
            onChange={(e) => { intentRef.current = e.target.value; }}
          />
        </div>
      ),
      buttons: [
        { label: "取消", value: "cancel", variant: "outline" },
        { label: "送出", value: "confirm", variant: "default" },
      ],
    });

    if (result.value !== "confirm") return;

    setConnectLoading(true);
    try {
      await sendConnectionRequest({
        receiverExternalId: targetUserId,
        intent: intentRef.current.trim() || undefined,
      });
      toast.success("已送出連結請求");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "請求失敗");
    } finally {
      setConnectLoading(false);
    }
  }, [targetUserId, openInfoDialog]);

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

  // 是否顯示 Connect/Follow 按鈕（用 client-side hook 判斷，避免 SSR cookie 問題）
  const showConnectionButtons = clientIsAuthenticated && !clientIsOwnProfile;

  const moreContent = (
    <>
      {/* About Me - 使用 MarkdownRenderer 渲染，未填寫時隱藏 */}
      {selfIntroduction && (
        <MarkdownRenderer
          source={selfIntroduction}
          className="text-xs text-text-dark mb-4 md:mb-3 prose prose-xs max-w-none"
        />
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
            {/* Headline (personalSlogan) - 未填寫時不顯示 */}
            {personalSlogan && (
              <p className="text-sm text-text-dark mb-1">{personalSlogan}</p>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4.5 text-text-dark" />
                <p className="text-xs text-text-dark">{location}</p>
              </div>
            )}
          </div>

          {/* Connections & Followers 數量 */}
          {(connectionsCount !== undefined || followersCount !== undefined) && (
            <div className="flex items-center gap-4 mb-3 text-xs text-text-dark">
              {connectionsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  <span>
                    <span className="font-medium">
                      {hideConnectionsCount ? "—" : connectionsCount}
                    </span>{" "}
                    Connections
                  </span>
                </div>
              )}
              {followersCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span>
                    <span className="font-medium">{followersCount}</span> Followers
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 近 7 天實踐次數 */}
          {recentPracticeCount !== undefined && (
            <p className="text-xs text-text-dark mb-3">
              近 7 天{" "}
              <span className="font-medium">{recentPracticeCount}</span>{" "}
              次實踐
            </p>
          )}

          {/* 共同 Circle 數量 - 僅在已登入且非自己的頁面，且 commonCirclesCount > 0 */}
          {isAuthenticated && !isOwnProfile && commonCirclesCount != null && commonCirclesCount > 0 && (
            <p className="text-xs text-text-dark mb-3">
              {commonCirclesCount} 個共同 Circle
            </p>
          )}

          {/* 編輯個人檔案按鈕 - 自己的頁面 */}
          {isOwnProfile && (
            <div className="mb-3">
              <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                <CustomLink href="/settings/public-info" prefetch={false}>
                  編輯個人檔案
                </CustomLink>
              </Button>
            </div>
          )}

          {!isMobile && moreContent}
        </div>
      </div>
      {isMobile && <div className="mt-4">{moreContent}</div>}

      {/* 關注 / 請求連結 按鈕 - 已登入且非自己的頁面 */}
      {showConnectionButtons && (
        <div className="flex gap-3 mt-5">
          <Button
            variant={currentIsFollowing ? "outline" : "default"}
            className={`flex-1 h-12 text-base rounded-full ${currentIsFollowing ? "bg-primary-lightest border-primary-lighter text-primary-base hover:bg-primary-lightest" : ""}`}
            onClick={handleFollow}
            disabled={followLoading}
          >
            {currentIsFollowing ? "取消關注" : "+ 關注"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-base rounded-full border-primary-base text-primary-base hover:bg-primary-base hover:text-white"
            onClick={handleConnect}
            disabled={connectLoading}
          >
            請求連結
          </Button>
        </div>
      )}
    </div>
  );
}
