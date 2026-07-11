import FacebookSvg from "@daodao/assets/images/social-icons/facebook-filled.svg";
import GithubSvg from "@daodao/assets/images/social-icons/github.svg";
import InstagramSvg from "@daodao/assets/images/social-icons/instagram-filled.svg";
import LinkedInSvg from "@daodao/assets/images/social-icons/linkedin-filled.svg";
import ThreadsSvg from "@daodao/assets/images/social-icons/threads-filled.svg";
import { Globe, MapPin, Pencil, Users } from "@tamagui/lucide-icons";
import { Linking, Pressable } from "react-native";
import { Avatar, Card, Text, XStack, YStack } from "tamagui";
import { colors } from "@/generated/design-tokens";
import { useMobileTranslation } from "@/i18n";
import type { IContactList } from "@/types/user";

// ── Social link helpers ──

type SocialPlatformType =
  | "line"
  | "facebook"
  | "instagram"
  | "threads"
  | "linkedin"
  | "github"
  | "website"
  | "discord";

const SOCIAL_DISPLAY_ORDER: SocialPlatformType[] = [
  "website",
  "github",
  "threads",
  "facebook",
  "instagram",
  "linkedin",
  "line",
  "discord",
];

const PLATFORMS_WITH_ICON: SocialPlatformType[] = [
  "website",
  "github",
  "facebook",
  "instagram",
  "threads",
  "linkedin",
];

// 平台顯示名（用於無障礙標籤與無圖示連結的文字）。品牌名為專有名詞，各語系一致。
// website 的顯示名 mobile i18n 目前無對應 key，暫用合理 fallback（見報告）。
function getPlatformDisplayName(platform: SocialPlatformType): string {
  switch (platform) {
    case "line":
      return "LINE";
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "threads":
      return "Threads";
    case "linkedin":
      return "LinkedIn";
    case "github":
      return "GitHub";
    case "discord":
      return "Discord";
    case "website":
      return "個人網站";
    default:
      return platform;
  }
}

// 圖示尺寸對齊 web（size-8 = 32px）。顏色由各 SVG 內建（品牌色徽章），與 web 一致，
// 故不需傳 color prop。
const SOCIAL_ICON_SIZE = 32;

function getSocialIcon(platform: SocialPlatformType) {
  switch (platform) {
    case "facebook":
      return <FacebookSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "instagram":
      return <InstagramSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "threads":
      return <ThreadsSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "linkedin":
      return <LinkedInSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "github":
      return <GithubSvg width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} />;
    case "website":
      // website 無品牌徽章，比照 web 用 Globe（lucide）呈現，顏色走中性文字色
      return <Globe size={SOCIAL_ICON_SIZE} color={colors.text.dark} />;
    default:
      return null;
  }
}

// ── Component ──

interface UserInfoCardProps {
  name: string | null;
  customId?: string | null;
  location?: string | null;
  selfIntroduction?: string | null;
  photoURL?: string | null;
  personalSlogan?: string | null;
  contactList?: IContactList | null;
  followersCount?: number;
  connectionsCount?: number;
  hideConnectionsCount?: boolean;
  recentPracticeCount?: number;
  editable?: boolean;
  onEdit?: () => void;
}

export function UserInfoCard({
  name,
  customId,
  location,
  selfIntroduction,
  photoURL,
  personalSlogan,
  contactList,
  followersCount,
  connectionsCount,
  hideConnectionsCount,
  recentPracticeCount,
  editable = false,
  onEdit,
}: UserInfoCardProps) {
  const t = useMobileTranslation("mobile.profile");
  const tp = useMobileTranslation("mobile.userProfile");
  const tEdit = useMobileTranslation("mobile.publicInfoSettings");
  const displayName = name || t("unnamed_user");
  const showCounts = connectionsCount !== undefined || followersCount !== undefined;

  // 將 contactList 轉成有值的 social links 陣列
  const socialLinks = contactList
    ? SOCIAL_DISPLAY_ORDER.filter((p) => {
        const val = contactList[p as keyof IContactList];
        return val != null && val !== "";
      }).map((p) => ({
        platform: p,
        value: contactList[p as keyof IContactList] as string,
        hasIcon: PLATFORMS_WITH_ICON.includes(p),
      }))
    : [];

  const linksWithIcon = socialLinks.filter((l) => l.hasIcon);
  const linksWithoutIcon = socialLinks.filter((l) => !l.hasIcon);

  return (
    <Card
      backgroundColor={colors.background.light}
      borderRadius={16}
      padding={24}
      marginBottom={24}
      borderWidth={1}
      borderColor={colors.border.light}
      elevate
      elevation={2}
    >
      {/* 編輯入口 — 自己的頁面 */}
      {editable && onEdit ? (
        <Pressable
          onPress={onEdit}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={tEdit("title")}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1,
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background.veryLightGray,
          }}
        >
          <Pencil size={18} color={colors.text.muted} />
        </Pressable>
      ) : null}

      {/* 頭像和基本資訊 */}
      <XStack gap={16} alignItems="center">
        <Avatar circular size={96}>
          {photoURL ? (
            <Avatar.Image source={{ uri: photoURL }} />
          ) : (
            <Avatar.Fallback
              backgroundColor={colors.background.veryLightGray}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={24} fontWeight="500" color={colors.text.dark}>
                {displayName.charAt(0)}
              </Text>
            </Avatar.Fallback>
          )}
        </Avatar>

        <YStack flex={1} gap={4}>
          <Text fontSize={22} fontWeight="500" color={colors.basic.black} numberOfLines={1}>
            {displayName}
          </Text>
          {customId ? (
            <Text fontSize={13} color={colors.text.muted} numberOfLines={1}>
              @{customId}
            </Text>
          ) : null}
          {personalSlogan ? (
            <Text fontSize={14} color={colors.text.dark} numberOfLines={2}>
              {personalSlogan}
            </Text>
          ) : null}
          {location ? (
            <XStack alignItems="center" gap={8}>
              <MapPin size={18} color={colors.logo.cyan} />
              <Text fontSize={12} color={colors.logo.cyan}>
                {location}
              </Text>
            </XStack>
          ) : null}

          {/* Connections & Followers 數量 */}
          {showCounts ? (
            <XStack alignItems="center" gap={16} marginTop={4}>
              {connectionsCount !== undefined ? (
                <XStack alignItems="center" gap={4}>
                  <Users size={14} color={colors.text.dark} />
                  <Text fontSize={12} color={colors.text.dark}>
                    <Text fontWeight="500">{hideConnectionsCount ? "—" : connectionsCount}</Text>{" "}
                    {tp("connections")}
                  </Text>
                </XStack>
              ) : null}
              {followersCount !== undefined ? (
                <Text fontSize={12} color={colors.text.dark}>
                  <Text fontWeight="500">{followersCount}</Text> {tp("followers")}
                </Text>
              ) : null}
            </XStack>
          ) : null}

          {/* 近 7 天實踐次數 */}
          {recentPracticeCount !== undefined ? (
            <Text fontSize={12} color={colors.text.dark} marginTop={4}>
              {tp("recent_practice_count", { count: recentPracticeCount })}
            </Text>
          ) : null}
        </YStack>
      </XStack>

      {/* 個人簡介 */}
      {selfIntroduction ? (
        <Text fontSize={12} color={colors.text.dark} marginTop={16}>
          {selfIntroduction}
        </Text>
      ) : null}

      {/* 社群媒體連結 — 有圖示的 */}
      {linksWithIcon.length > 0 && (
        <XStack gap={12} marginTop={16}>
          {linksWithIcon.map((link) => (
            <Pressable
              key={link.platform}
              onPress={() => Linking.openURL(link.value)}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel={getPlatformDisplayName(link.platform)}
            >
              {getSocialIcon(link.platform)}
            </Pressable>
          ))}
        </XStack>
      )}

      {/* 沒有圖示的連結（LINE, Discord 等） */}
      {linksWithoutIcon.length > 0 && (
        <YStack gap={8} marginTop={linksWithIcon.length > 0 ? 12 : 16}>
          {linksWithoutIcon.map((link) => (
            <XStack key={link.platform} alignItems="center" gap={8}>
              <Text fontSize={12} color={colors.text.dark} fontWeight="500">
                {getPlatformDisplayName(link.platform)}
              </Text>
              <Text fontSize={12} color={colors.text.muted}>
                {link.value}
              </Text>
            </XStack>
          ))}
        </YStack>
      )}
    </Card>
  );
}
